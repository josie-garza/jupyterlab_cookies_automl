# Lint as: python3
"""Request handler classes for the extensions."""

import base64
import json
import re
import tornado.gen as gen
import os
import random

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
    words = []
    i = 0
    for dataset in datasets:
        words.append({"id": i, "name": dataset.display_name})
        i += 1
    return {"words": words}


class ListHandler(APIHandler):
    """Handles requests for Dummy List of Items."""

    @gen.coroutine
    def get(self, input=""):
        try:
            client = automl_v1.AutoMlClient()
            parent = client.location_path(AuthProvider.get().project, "us-central1")
            self.finish(get_datasets(parent, client))
        except Exception as e:
            app_log.exception(str(e))
            self.set_status(500, str(e))
            self.finish({"error": {"message": str(e)}})

