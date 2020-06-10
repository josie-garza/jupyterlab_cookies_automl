import { ReactWidget, MainAreaWidget } from '@jupyterlab/apputils';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { DatasetService } from './service/dataset';
import { DatasetGrid } from './components/dataset_grid';

/**
* A class that manages dataset widget instances in the Main area
*/
export class WidgetManager {

  private widgets: { [id: string]: MainAreaWidget } = {};

  constructor(private widgetType: new (...args: any[]) => ReactWidget,
    private app: JupyterFrontEnd) { }

  launchWidgetForId(id: string, ...args: any[]) {
    // Get the widget associated with a dataset/resource id, or create one 
    // if it doesn't exist yet and activate it
    let widget = this.widgets[id];
    if (!widget || widget.isDisposed) {
      //const content = new this.widgetType(...args);
      const datasetService = new DatasetService();
      const content = new DatasetGrid(id, datasetService);
      console.log(this.widgetType)
      widget = new MainAreaWidget<DatasetGrid>({ content });
      widget.disposed.connect(() => {
        if (this.widgets[id] === widget) {
          delete this.widgets[id];
        }
      });
      this.widgets[id] = widget;
    }
    if (!widget.isAttached) {
      widget.title.label = id;
      this.app.shell.add(widget, 'main');
    }
    this.app.shell.activateById(widget.id);
  }
}