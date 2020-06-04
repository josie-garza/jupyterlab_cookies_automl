// Ensure styles are loaded by webpack
import '../style/index.css';

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {ListWordsWidget} from './components/list_words_widget';
import {ListDatasetsService} from './service/list_datasets';


async function activate(
  app: JupyterFrontEnd,
) {
  const listWordsService = new ListDatasetsService();
  const listWidget = new ListWordsWidget(listWordsService);
  listWidget.addClass('jp-AutoMLIcon');
  app.shell.add(listWidget, 'left', {rank: 100});
}


/**
 * The JupyterLab plugin.
 */
const ListWordsPlugin: JupyterFrontEndPlugin<void> = {
  id: 'automl:automl',
  requires: [],
  activate: activate,
  autoStart: true
};


/**
 * Export the plugin as default.
 */
export default [
  ListWordsPlugin,
];
