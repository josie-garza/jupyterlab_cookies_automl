import unittest
from unittest.mock import Mock, MagicMock, patch

from jupyterlab_automl import handlers

from google.cloud import automl_v1
from google.cloud.automl_v1.types import Dataset, Timestamp


class TestAutoMLExtension(unittest.TestCase):
    def testListDatasets(self):
        time = Timestamp(seconds=0, nanos=0)
        gcp_datasets = [
            Dataset(
                display_name="dummy_dataset1",
                name="dummy_dataset1",
                create_time=time,
                example_count=9999,
                description="dummy_description",
            ),
            Dataset(
                display_name="dummy_dataset2",
                name="dummy_dataset2",
                create_time=time,
                example_count=1515,
                description="dummy_description",
            ),
        ]

        mock_client = Mock()
        mock_parent = Mock()
        mock_client.list_datasets = MagicMock(return_value=gcp_datasets)

        wanted = {
            "datasets": [
                {
                    "id": "dummy_dataset1",
                    "displayName": "dummy_dataset1",
                    "description": "dummy_description",
                    "createTime": 0,
                    "exampleCount": 9999,
                    "metadata": "",
                },
                {
                    "id": "dummy_dataset2",
                    "displayName": "dummy_dataset2",
                    "description": "dummy_description",
                    "createTime": 0,
                    "exampleCount": 1515,
                    "metadata": "",
                },
            ]
        }

        got = handlers.get_datasets(mock_parent, mock_client)
        self.assertEqual(wanted, got)


if __name__ == "__main__":
    unittest.main()
