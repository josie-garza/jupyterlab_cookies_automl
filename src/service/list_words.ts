import {ServerConnection} from '@jupyterlab/services';
import {URLExt} from "@jupyterlab/coreutils";

export interface Word {
  id: number;
  word: string;
}

export interface Words {
  words: Word[];
}

export class ListWordsService {

  listWords(num_items: number): Promise<Words> {
    return new Promise((resolve, reject) => {
      let serverSettings = ServerConnection.makeSettings();
      const requestUrl = URLExt.join(
        serverSettings.baseUrl, 'cookies/v1/list');
      console.log("request URL " + requestUrl);
      ServerConnection.makeRequest(requestUrl, {}, serverSettings
      ).then((response) => {
        response.json().then((content) => {
          console.log(content)
          if (content.error) {
            console.error(content.error);
            reject(content.error);
            return [];
          }
          resolve({
            words: content.words.map((w: any) => {
              return {
                id: w.id,
                word: w.name,
              }
            })
          });
        });
      });
    });
  }
}
