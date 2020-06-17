import unittest
from unittest.mock import Mock, MagicMock, patch

from jupyterlab_automl import handlers

from google.cloud.automl_v1beta1.types import (
    Dataset,
    Timestamp,
    Model,
    DataType,
    TableSpec,
    ColumnSpec,
    TablesDatasetMetadata,
    ImageClassificationDatasetMetadata
)


class TestAutoMLExtension(unittest.TestCase):
    def testListDatasets(self):
        metadata = ImageClassificationDatasetMetadata(
            classification_type=1
        )
        time = Timestamp(seconds=0, nanos=0)
        gcp_datasets = [
            Dataset(
                display_name="dummy_dataset1",
                name="dummy_dataset1",
                create_time=time,
                example_count=9999,
                description="dummy_description",
                image_classification_dataset_metadata=metadata
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
                    "metadata": {
                        "classification_type": 1,
                    },
                    "datasetType": "image_classification",
                },
            ]
        }
        got = handlers.get_datasets(mock_client, mock_parent)
        self.assertEqual(wanted, got)

    def testListModels(self):
        time = Timestamp(seconds=0, nanos=0)
        gcp_models = [
            Model(
                display_name="dummy_model1",
                name="dummy_model1",
                update_time=time,
                dataset_id="dummy_dataset1",
                deployment_state=2,
            ),
            Model(
                display_name="dummy_model2",
                name="dummy_model2",
                update_time=time,
                dataset_id="dummy_dataset2",
                deployment_state=1,
            ),
        ]

        mock_client = Mock()
        mock_parent = Mock()
        mock_client.list_models = MagicMock(return_value=gcp_models)

        wanted = {
            "models": [
                {
                    "id": "dummy_model1",
                    "displayName": "dummy_model1",
                    "updateTime": 0,
                    "datasetId": "dummy_dataset1",
                    "deploymentState": 2,
                    "metadata": "",
                },
                {
                    "id": "dummy_model2",
                    "displayName": "dummy_model2",
                    "updateTime": 0,
                    "datasetId": "dummy_dataset2",
                    "deploymentState": 1,
                    "metadata": "",
                },
            ]
        }

        got = handlers.get_models(mock_client, mock_parent)
        self.assertEqual(wanted, got)

    def testListTableSpecs(self):
        dummy_type = DataType(type_code=3)
        dummy_type = DataType(type_code=10)
        gcp_column_specs = [
            ColumnSpec(
                name="dummy_column1", data_type=dummy_type, display_name="column1",
            ),
            ColumnSpec(
                name="dummy_column2", data_type=dummy_type, display_name="column2",
            ),
        ]
        gcp_table_specs = [
            TableSpec(
                name="dummy_table1", row_count=3, valid_row_count=4, column_count=2,
            ),
        ]

        mock_client = Mock()
        mock_client.list_table_specs = MagicMock(return_value=gcp_table_specs)
        mock_client.list_column_specs = MagicMock(return_value=gcp_column_specs)

        wanted_column = [
            {"id": "dummy_column1", "dataType": "Numeric", "displayName": "column1",},
            {"id": "dummy_column2", "dataType": "Categorical", "displayName": "column2",},
        ]

        wanted_table = {
            "tableSpecs": [
                {
                    "id": "dummy_table1",
                    "rowCount": 3,
                    "validRowCount": 4,
                    "columnCount": 2,
                    "columnSpecs": wanted_column,
                },
            ]
        }

        got_column = handlers.get_column_specs(mock_client, gcp_table_specs[0])
        print("wanted")
        print(wanted_column)
        print("got")
        print(got_column)
        self.assertEqual(wanted_column, got_column)
        got_table = handlers.get_table_specs(mock_client, "datasetId")
        self.assertEqual(wanted_table, got_table)


if __name__ == "__main__":
    unittest.main()
