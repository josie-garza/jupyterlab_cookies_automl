import { requestAPI } from "./api_request"

export interface Dataset {
  id: string; // Resource name of dataset
  displayName: string;
  description: string;
  createTime: Date;
  exampleCount: number;
  metadata: any;
  datasetType: string;
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

export abstract class DatasetService {

  static async listDatasets(): Promise<Dataset[]> {
    try {
      let data = (await requestAPI<Datasets>('v1/datasets')).datasets;
      for (let i = 0; i < data.length; ++i) {
        data[i].createTime = new Date(data[i].createTime);
      }
      return data;
    } catch (err) {
      throw err;
    }
  };

  static async listTableSpecs(datasetId: string): Promise<TableSpec[]> {
    try {
      const query = '?datasetId=' + datasetId;
      let data = (await requestAPI<TableInfo>('v1/tableInfo' + query)).tableSpecs;
      return data;
    } catch (err) {
      throw err;
    }
  };
}
