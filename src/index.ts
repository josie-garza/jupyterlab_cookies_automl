// Ensure styles are loaded by webpack
import '../style/index.css';

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  ICommandPalette
} from '@jupyterlab/apputils';

import { AutoMLWidget } from './components/automl_widget';
import { DatasetService } from './service/dataset';
import { ModelService } from './service/model';
import { DatasetWidget } from './components/dataset_widget';
import { WidgetManager } from './widget_manager'

async function activate(
  app: JupyterFrontEnd,
  palette: ICommandPalette
) {
  const modelService = new ModelService();
  const datasetService = new DatasetService();
  const manager = new WidgetManager(DatasetWidget, app);
  const context = {app: app, manager: manager};
  const listWidget = new AutoMLWidget(context, datasetService, modelService);
  listWidget.addClass('jp-AutoMLIcon');
  app.shell.add(listWidget, 'left', { rank: 100 });
  // Add an application command
  const command: string = 'automl:open';
  app.commands.addCommand(command, {
    label: 'Test open tab',
    execute: () => {
      let dataset = { id: "abc", displayName: "abc", createTime: 123, exampleCount: 2, description: "", metadata: {} };
      manager.launchWidgetForId(dataset.id, dataset);
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
