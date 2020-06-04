import { requestAPI } from "./api_request"

export interface Dataset {
  id: string; // Resource name of dataset
  displayName: string;
  description: string;
  createTime: number;
  exampleCount: number;
  metadata: any;
}

export interface Datasets {
  datasets: Dataset[];
}

export class ListDatasetsService {

  async listDatasets(num_items: number): Promise<Datasets> {
    try {
      let data = await requestAPI<Datasets>('v1/list');
      console.log(data);
      return data;
    } catch (err) {
      throw err;
    }
  };
}
