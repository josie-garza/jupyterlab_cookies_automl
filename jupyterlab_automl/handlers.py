# Lint as: python3
"""Request handler classes for the extensions."""

import json
import tornado.gen as gen
from datetime import datetime

from collections import namedtuple
from notebook.base.handlers import APIHandler, app_log
from google.cloud import automl_v1

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


def get_datasets(parent, client):
    datasets = client.list_datasets(parent)
    return {
        "datasets": [
            {
                "id": dataset.name,
                "displayName": dataset.display_name,
                "description": dataset.description,
                "createTime": dataset.create_time.ToMilliseconds(),
                "exampleCount": dataset.example_count,
                "metadata": "",
            }
            for dataset in datasets
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
                self.automl_client = automl_v1.AutoMlClient()

            if not self.parent:
                self.parent = self.automl_client.location_path(
                    AuthProvider.get().project, "us-central1"
                )

            self.finish(json.dumps(get_datasets(self.parent, self.automl_client)))

        except Exception as e:
            app_log.exception(str(e))
            self.set_status(500, str(e))
            self.finish({"error": {"message": str(e)}})
