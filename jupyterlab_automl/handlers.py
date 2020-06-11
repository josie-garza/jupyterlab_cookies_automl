# Lint as: python3
"""Request handler classes for the extensions."""

import json
import tornado.gen as gen

from collections import namedtuple
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


def get_column_specs(client, tableSpecId):
    column_specs = client.list_column_specs(tableSpecId)
    return [
        {
            "id": column_spec.name,
            "dataType": column_spec.data_type.type_code,
            "displayName": column_spec.display_name,
        }
        for column_spec in column_specs
    ]


def get_table_specs(client, datasetId):
    table_specs = client.list_table_specs(datasetId)
    return {
        "tableSpecs": [
            {
                "id": table_spec.name,
                "rowCount": table_spec.row_count,
                "validRowCount": table_spec.valid_row_count,
                "columnCount": table_spec.column_count,
                "columnSpecs": get_column_specs(client, table_spec.name),
            }
            for table_spec in table_specs
        ]
    }


def get_datasets(client, parent):
    datasets = []
    for dataset in client.list_datasets(parent):
        dataset_type = "other"
        metadata = ""
        if dataset.tables_dataset_metadata.primary_table_spec_id != "":
            dataset_type = "tables"
            metadata = {
                "primary_table_spec_id" : dataset.tables_dataset_metadata.primary_table_spec_id,
                "target_column_spec_id" : dataset.tables_dataset_metadata.target_column_spec_id,
                "weight_column_spec_id" : dataset.tables_dataset_metadata.weight_column_spec_id,
                "ml_use_column_spec_id" : dataset.tables_dataset_metadata.ml_use_column_spec_id,
                "stats_update_time" : dataset.tables_dataset_metadata.stats_update_time.ToMilliseconds(),
            }
        elif dataset.image_classification_dataset_metadata.classification_type != "":
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
