import { requestAPI } from "./api_request"

export interface Dataset {
  id: string; // Resource name of dataset
  displayName: string;
  description: string;
  createTime: number;
  exampleCount: number;
  metadata: any;
}

export interface ColumnSpec {
  id: string;
  dataType: string;
  displayName: string;
}

export interface TableSpec {
  id: string;
  rowCount: number;
  validRowCount: number;
  columnCount: number;
  columnSpecs: ColumnSpec[];
}

export interface TableInfo {
  tableSpecs: TableSpec[];
}

export interface Datasets {
  datasets: Dataset[];
}

export class DatasetService {

  async listDatasets(num_items: number): Promise<Datasets> {
    try {
      let data = await (await requestAPI<Datasets>('v1/datasets'));
      return data;
    } catch (err) {
      throw err;
    }
  };

  async listTableSpecs(datasetId: string): Promise<TableSpec[]> {
    try {
      const body = {
        'datasetId': datasetId,
      }
      const requestInit: RequestInit = {
        body: JSON.stringify(body),
        method: "POST",
      };
      let data = (await requestAPI<TableInfo>('v1/tableInfo', requestInit)).tableSpecs;
      return data;
    } catch (err) {
      throw err;
    }
  };
}
