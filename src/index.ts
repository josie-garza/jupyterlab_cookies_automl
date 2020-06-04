// Ensure styles are loaded by webpack
import '../style/index.css';

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  ICommandPalette
} from '@jupyterlab/apputils';

import { ListWordsWidget } from './components/list_words_widget';
import { ListDatasetsService } from './service/list_datasets';
import { ShowDatasetWidget } from './components/show_dataset_widget';

async function activate(
  app: JupyterFrontEnd,
  palette: ICommandPalette
) {
  const listWordsService = new ListDatasetsService();
  const listWidget = new ListWordsWidget(listWordsService);
  listWidget.addClass('jp-AutoMLIcon');
  app.shell.add(listWidget, 'left', { rank: 100 });
  // Add an application command
  const command: string = 'automl:open';
  app.commands.addCommand(command, {
    label: 'Test open tab',
    execute: () => {
      let widget = new ShowDatasetWidget(
        { id: "abc", displayName: "abc", createTime: 123, exampleCount: 2, description: "", metadata: {} }
      );
      if (!widget.isAttached) {
        // Attach the widget to the main work area if it's not there
        app.shell.add(widget, 'main');
      }
      // Activate the widget
      app.shell.activateById(widget.id);
    }
  });
  const category = "AutoML";
  palette.addItem({ command, category });
}


/**
 * The JupyterLab plugin.
 */
const ListWordsPlugin: JupyterFrontEndPlugin<void> = {
  id: 'automl:automl',
  requires: [ICommandPalette],
  activate: activate,
  autoStart: true
};


/**
 * Export the plugin as default.
 */
export default [
  ListWordsPlugin,
];
