import { requestAPI } from "./api_request"

export interface Dataset {
  id: string; // Resource name of dataset
  displayName: string;
  description: string;
  createTime: Date;
  exampleCount: number;
  metadata: any;
}

export interface Datasets {
  datasets: Dataset[];
}

export class DatasetService {

  async listDatasets(): Promise<Dataset[]> {
    try {
      let data = (await requestAPI<Datasets>('v1/datasets')).datasets;
      for (let i = 0; i < data.length; ++i)  {
        data[i].createTime = new Date(data[i].createTime);
      }
      console.log(data);
      return data;
    } catch (err) {
      throw err;
    }
  };
}
