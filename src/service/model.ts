import { requestAPI } from "./api_request"

export interface Model {
  id: string; // Resource name of dataset
  displayName: string;
  datasetId: string;
  updateTime: Date;
  deploymentState: string;
  metadata: any;
}

interface Models {
  models: Model[];
}

export class ModelService {

  async listModels(): Promise<Model[]> {
    try {
      let data = (await requestAPI<Models>('v1/models')).models;
      for (let i = 0; i < data.length; ++i)  {
        data[i].updateTime = new Date(data[i].updateTime);
      }
      console.log(data);
      return data;
    } catch (err) {
      throw err;
    }
  };
}
