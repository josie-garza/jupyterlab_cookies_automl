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

from jupyterlab_cookies.version import VERSION

def get_datasets(parent, client):
  datasets = client.list_datasets(parent)
  words = []
  i = 0
  for dataset in datasets:
    words.append({
      'id': i,
      'name' : dataset.display_name
    })
    i += 1
  return {
    'words': words
  }

class ListHandler(APIHandler):
  """Handles requests for Dummy List of Items."""
  @gen.coroutine
  def get(self, input=''):
    try:
      client = automl_v1.AutoMlClient()
      parent = client.location_path('[PROJECT]', '[LOCATION]') # Fill in with your project and location
      self.finish(get_datasets(parent, client))

    except Exception as e:
      app_log.exception(str(e))
      self.set_status(500, str(e))
      self.finish({
        'error':{
          'message': str(e)
          }
        })
