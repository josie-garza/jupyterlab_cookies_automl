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

column_types = {
    0: "Unspecified",
    3: "Numeric",
    4: "Timestamp",
    6: "String",
    8: "Array",
    9: "Struct",
    10: "Categorical",
}

months = {
    1: "Jan",
    2: "Feb",
    3: "Mar",
    4: "Apr",
    5: "May",
    6: "Jun",
    7: "Jul",
    8: "Aug",
    9: "Sep",
    10: "Oct",
    11: "Nov",
    12: "Dec",
}

days = {
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat",
    7: "Sun",
}


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


def get_bucket_label(bucket):
    if bucket.min == float("-inf"):
        return "[" + str(bucket.min) + ", " + str(round(bucket.max)) + "]"
    elif bucket.max == float("inf"):
        return "[" + str(round(bucket.min)) + ", " + str(bucket.max) + "]"
    else:
        return "[" + str(round(bucket.min)) + ", " + str(round(bucket.max)) + "]"


def get_detail_panel(column_spec, count):
    chart_data = []
    if column_spec.data_type.type_code == 3:
        mean = round(column_spec.data_stats.float64_stats.mean, 2)
        standard_deviation = round(column_spec.data_stats.float64_stats.standard_deviation, 2)
        for bucket in column_spec.data_stats.float64_stats.histogram_buckets:
            chart_data.append(
                {"name": get_bucket_label(bucket), "Number of Instances": bucket.count}
            )
        return [chart_data, mean, standard_deviation]
    elif column_spec.data_type.type_code == 10:
        try:
            div = column_spec.data_stats.category_stats.top_category_stats[0].count / count
            rounded = round(div * 100, 3)
            most_common = column_spec.data_stats.category_stats.top_category_stats[0].value + " (" + str(rounded) + "%)"
        except:
            most_common = ""
        for stat in column_spec.data_stats.category_stats.top_category_stats:
            chart_data.append({"name": stat.value, "Number of Instances": stat.count})
        return[chart_data, most_common]
    elif column_spec.data_type.type_code == 4:
        month_chart = []
        day_chart = []
        time_chart = []
        for month, amount in dict(column_spec.data_stats.timestamp_stats.granular_stats['month_of_year'].buckets).items():
            month_chart.append({"name": months[month], "Number of Instances": amount})
        for day, amount in dict(column_spec.data_stats.timestamp_stats.granular_stats['day_of_week'].buckets).items():
            day_chart.append({"name": days[day], "Number of Instances": amount})
        for hour, amount in dict(column_spec.data_stats.timestamp_stats.granular_stats['hour_of_day'].buckets).items():
            time_chart.append({"name": str(hour) + ":00", "Number of Instances": amount})
        return [month_chart, day_chart, time_chart]
    else:
        return []


def get_column_specs(client, table_spec):
    column_specs = []
    type_summary = defaultdict(int)
    for column_spec in client.list_column_specs(table_spec.name):
        if column_spec.data_type.type_code in column_types.keys():
            type_code = column_types[column_spec.data_type.type_code]
        else:
            type_code = "Unrecognized"
        detail_panel = get_detail_panel(column_spec, table_spec.row_count - column_spec.data_stats.null_value_count)
        type_summary[type_code] += 1
        column_specs.append(
            {
                "id": column_spec.name,
                "dataType": type_code,
                "displayName": column_spec.display_name,
                "distinctValueCount": column_spec.data_stats.distinct_value_count,
                "invalidValueCount": table_spec.row_count
                - column_spec.data_stats.valid_value_count,
                "nullValueCount": str(column_spec.data_stats.null_value_count)
                + " ("
                + str(
                    math.floor(
                        column_spec.data_stats.null_value_count
                        / table_spec.row_count
                        * 100
                    )
                )
                + "%)",
                "nullable": column_spec.data_type.nullable,
                "detailPanel": detail_panel,
            }
        )
    columns_summary = []
    for key, val in type_summary.items():
        columns_summary.append({"name": key, "Number of Instances": val})
    return column_specs, columns_summary


def get_table_specs(client, datasetId):
    table_specs = []
    for table_spec in client.list_table_specs(datasetId):
        table_specs.append(
            {
                "id": table_spec.name,
                "rowCount": table_spec.row_count,
                "validRowCount": table_spec.valid_row_count,
                "columnCount": table_spec.column_count,
                "columnSpecs": get_column_specs(client, table_spec)[0],
                "chartSummary": get_column_specs(client, table_spec)[1],
            }
        )
    return {"tableSpecs": table_specs}


def get_dataset_metadata(dataset):
    if dataset.name.split("/")[-1][:3] == "TBL":
        dataset_type = "tables"
        metadata = {
            "primary_table_spec_id": dataset.tables_dataset_metadata.primary_table_spec_id,
            "target_column_spec_id": dataset.tables_dataset_metadata.target_column_spec_id,
            "weight_column_spec_id": dataset.tables_dataset_metadata.weight_column_spec_id,
            "ml_use_column_spec_id": dataset.tables_dataset_metadata.ml_use_column_spec_id,
            "stats_update_time": dataset.tables_dataset_metadata.stats_update_time.ToMilliseconds(),
        }
    elif dataset.name.split("/")[-1][:3] == "ICN":
        dataset_type = "image_classification"
        metadata = {
            "classification_type": dataset.image_classification_dataset_metadata.classification_type,
        }
    else:
        dataset_type = "other"
        metadata = ""
    return dataset_type, metadata


def get_datasets(client, parent):
    datasets = []
    for dataset in client.list_datasets(parent):
        dataset_type, metadata = get_dataset_metadata(dataset)
        datasets.append(
            {
                "id": dataset.name,
                "displayName": dataset.display_name,
                "description": dataset.description,
                "createTime": dataset.create_time.ToMilliseconds(),
                "exampleCount": dataset.example_count,
                "datasetType": dataset_type,
                "metadata": metadata,
            }
        )
    return {"datasets": datasets}


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
