"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListWordsService = void 0;
const services_1 = require("@jupyterlab/services");
const coreutils_1 = require("@jupyterlab/coreutils");
class ListWordsService {
    listWords(num_items) {
        return new Promise((resolve, reject) => {
            let serverSettings = services_1.ServerConnection.makeSettings();
            const requestUrl = coreutils_1.URLExt.join(serverSettings.baseUrl, 'cookies/v1/list');
            console.log("request URL " + requestUrl);
            services_1.ServerConnection.makeRequest(requestUrl, {}, serverSettings).then((response) => {
                response.json().then((content) => {
                    console.log(content);
                    if (content.error) {
                        console.error(content.error);
                        reject(content.error);
                        return [];
                    }
                    resolve({
                        words: content.words.map((w) => {
                            return {
                                id: w.id,
                                word: w.name,
                            };
                        })
                    });
                });
            });
        });
    }
}
exports.ListWordsService = ListWordsService;
