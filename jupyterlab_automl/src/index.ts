// Ensure styles are loaded by webpack
import '../style/index.css';

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';

import { AutoMLWidget } from './components/automl_widget';
import { DatasetWidget } from './components/dataset_widget';
import { WidgetManager } from './widget_manager';

async function activate(app: JupyterFrontEnd) {
  const manager = new WidgetManager(DatasetWidget, app);
  const context = { app: app, manager: manager };
  const listWidget = new AutoMLWidget(context);
  listWidget.addClass('jp-AutoMLIcon');
  app.shell.add(listWidget, 'left', { rank: 100 });

  const commandID = 'my-command';
  let toggled = false;

  app.commands.addCommand(commandID, {
    label: 'My Cool Command',
    isToggled: () => toggled,
    iconClass: 'some-css-icon-class',
    execute: () => {
      console.log(`Executed ${commandID}`);
      toggled = !toggled;
    },
  });

  app.contextMenu.addItem({
    command: commandID,
    selector: '.jp-ResourceTableRow',
  });
}

/**
 * The JupyterLab plugin.
 */
const AutoMLPlugin: JupyterFrontEndPlugin<void> = {
  id: 'automl:automl',
  requires: [],
  activate: activate,
  autoStart: true,
};

/**
 * Export the plugin as default.
 */
export default [AutoMLPlugin];
