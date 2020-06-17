# Lint as: python3
"""Request handler classes for the extensions."""

import json
import tornado.gen as gen
import math

from collections import namedtuple, defaultdict
from notebook.base.handlers import APIHandler, app_log
from google.cloud import automl_v1beta1

import google.auth
from google.auth.exceptions import GoogleAuthError
from google.auth.transport.requests import Request

from jupyterlab_automl.version import VERSION

SCOPE = ("https://www.googleapis.com/auth/cloud-platform",)


class AuthProvider:
    """Provides default GCP authentication credential."""

    _instance = None

    def __init__(self):
        self._auth, self._project = google.auth.default(scopes=SCOPE)

    @property
    def project(self):
        return self._project

    def refresh(self):
        if not self._auth.valid:
            app_log.info("Refreshing Google Cloud Credential")
            try:
                self._auth.refresh(Request())
            except GoogleAuthError:
                msg = "Unable to refresh Google Cloud Credential"
                app_log.exception(msg)
                raise

    def get_header(self):
        return {"Authorization": "Bearer {}".format(self._auth.token)}

    @classmethod
    def get(cls):
        if not cls._instance:
            auth = AuthProvider()
            cls._instance = auth
        cls._instance.refresh()
        return cls._instance


def create_automl_client():
    return automl_v1beta1.AutoMlClient()


def create_automl_parent(client):
    return client.location_path(AuthProvider.get().project, "us-central1")


def get_column_specs(client, tableSpecId, rowCount):
    column_specs = []
    types = {
        0: "Unspecified",
        3: "Numeric",
        4: "Timestamp",
        6: "String",
        8: "Array",
        9: "Struct",
        10: "Categorical",
    }
    summary = defaultdict(int)
    for column_spec in client.list_column_specs(tableSpecId):
        chart_info = []
        if column_spec.data_type.type_code in types.keys():
            type_code = types[column_spec.data_type.type_code]
            if column_spec.data_type.type_code == 3:
                chart_data = []
                mean = column_spec.data_stats.float64_stats.mean
                standard_deviation = column_spec.data_stats.float64_stats.standard_deviation
                for bucket in column_spec.data_stats.float64_stats.histogram_buckets:
                    if bucket.min == float("-inf"):
                        label = "[" + str(bucket.min) + ", " + str(round(bucket.max)) + "]"
                    elif bucket.max == float("inf"):
                        label = "[" + str(round(bucket.min)) + ", " + str(bucket.max) + "]"
                    else: 
                        label = "[" + str(round(bucket.min)) + ", " + str(round(bucket.max)) + "]"
                    chart_data.append({"name": label, "amount": bucket.count})
                chart_info = [mean, standard_deviation, chart_data]
            elif column_spec.data_type.type_code == 10:
                for stat in column_spec.data_stats.category_stats.top_category_stats:
                    chart_info.append({"name":stat.value, "amount": stat.count})
        else:
            type_code = "Unrecognized"
        summary[type_code] += 1
        column_specs.append(
            {
                "id": column_spec.name,
                "dataType": type_code,
                "displayName": column_spec.display_name,
                "distinctValueCount": column_spec.data_stats.distinct_value_count,
                "invalidValueCount": rowCount - column_spec.data_stats.valid_value_count,
                "nullValueCount": str(column_spec.data_stats.null_value_count) + " (" + str(math.floor(column_spec.data_stats.null_value_count / rowCount * 100)) + "%)",
                "nullable": column_spec.data_type.nullable,
                "chartInfo": chart_info,
            }
        )
    chart_summary = []
    for key, val in summary.items():
        chart_summary.append({"name": key, "amount": val})
    return column_specs, chart_summary


def get_table_specs(client, datasetId):
    table_specs = []
    for table_spec in client.list_table_specs(datasetId):
        column_specs, chart_summary = get_column_specs(client, table_spec.name, table_spec.row_count)
        table_specs.append(
            {
                "id": table_spec.name,
                "rowCount": table_spec.row_count,
                "validRowCount": table_spec.valid_row_count,
                "columnCount": table_spec.column_count,
                "columnSpecs": column_specs,
                "chartSummary": chart_summary,
            }
        ) 
    return {
        "tableSpecs": table_specs
    }


def get_datasets(client, parent):
    datasets = []
    for dataset in client.list_datasets(parent):
        dataset_type = "other"
        metadata = ""
        if dataset.name.split("/")[-1][:3]=="TBL":
            dataset_type = "tables"
            metadata = {
                "primary_table_spec_id" : dataset.tables_dataset_metadata.primary_table_spec_id,
                "target_column_spec_id" : dataset.tables_dataset_metadata.target_column_spec_id,
                "weight_column_spec_id" : dataset.tables_dataset_metadata.weight_column_spec_id,
                "ml_use_column_spec_id" : dataset.tables_dataset_metadata.ml_use_column_spec_id,
                "stats_update_time" : dataset.tables_dataset_metadata.stats_update_time.ToMilliseconds(),
            }
        elif dataset.name.split("/")[-1][:3]=="ICN":
            dataset_type = "image_classification"
            metadata = {
                "classification_type" : dataset.image_classification_dataset_metadata.classification_type,
            }
        datasets.append({
                "id": dataset.name,
                "displayName": dataset.display_name,
                "description": dataset.description,
                "createTime": dataset.create_time.ToMilliseconds(),
                "exampleCount": dataset.example_count,
                "metadata": metadata,
                "datasetType": dataset_type,
        })
    return {
        "datasets": datasets
    }


def get_models(client, parent):
    models = client.list_models(parent)
    return {
        "models": [
            {
                "id": model.name,
                "displayName": model.display_name,
                "datasetId": model.dataset_id,
                "updateTime": model.update_time.ToMilliseconds(),
                "deploymentState": model.deployment_state,
                "metadata": "",
            }
            for model in models
        ]
    }


class ListDatasets(APIHandler):
    """Handles getting the datasets from GCP for the project."""

    automl_client = None
    parent = None

    @gen.coroutine
    def get(self, input=""):
        try:
            if not self.automl_client:
                self.automl_client = create_automl_client()

            if not self.parent:
                self.parent = create_automl_parent(self.automl_client)

            self.finish(json.dumps(get_datasets(self.automl_client, self.parent)))

        except Exception as e:
            app_log.exception(str(e))
            self.set_status(500, str(e))
            self.finish({"error": {"message": str(e)}})


class ListModels(APIHandler):
    """Handles getting the models from GCP for the project."""

    automl_client = None
    parent = None

    @gen.coroutine
    def get(self, input=""):
        try:
            if not self.automl_client:
                self.automl_client = create_automl_client()

            if not self.parent:
                self.parent = create_automl_parent(self.automl_client)

            self.finish(json.dumps(get_models(self.automl_client, self.parent)))

        except Exception as e:
            app_log.exception(str(e))
            self.set_status(500, str(e))
            self.finish({"error": {"message": str(e)}})


class ListTableInfo(APIHandler):
    """Handles getting the table info for the dataset."""

    automl_client = None

    @gen.coroutine
    def get(self, input=""):
        datasetId = self.get_argument("datasetId")
        try:
            if not self.automl_client:
                self.automl_client = create_automl_client()

            self.finish(json.dumps(get_table_specs(self.automl_client, datasetId)))

        except Exception as e:
            app_log.exception(str(e))
            self.set_status(500, str(e))
            self.finish({"error": {"message": str(e)}})