import { requestAPI } from "./api_request"

export interface Word {
  id: number;
  name: string;
}

export interface Words {
  words: Word[];
}


export interface DatasetListItem {
  // TODO
}

export interface DatasetList {
  // TODO
}

export class ListWordsService {

  async listWords(num_items: number): Promise<Words> {
    try {
      let data = await requestAPI<Words>('v1/list');
      console.log(data);
      return data;
    } catch (err) {
      throw err;
    }
  };
}
