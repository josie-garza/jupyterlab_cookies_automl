import { ReactWidget, UseSignal } from '@jupyterlab/apputils';
import { JupyterFrontEnd } from '@jupyterlab/application';
import * as React from 'react';
import { Signal } from '@lumino/signaling';
import { DatasetService } from '../service/dataset';
import { ModelService } from '../service/model';
import { WidgetManager } from '../widget_manager'
import { ListResourcesPanel } from './list_resources_panel';
import { Widget } from '@lumino/widgets';

export interface Context {
  app: JupyterFrontEnd,
  manager: WidgetManager
}

/** Widget to be registered in the left-side panel. */
export class AutoMLWidget extends ReactWidget {
  id = 'automl_widget';
  private resizeSignal = new Signal<AutoMLWidget, Widget.ResizeMessage>(this);

  constructor(private context: Context,
    private readonly datasetService: DatasetService,
    private readonly modelService: ModelService) {
    super();
    this.title.iconClass = 'jp-Icon jp-Icon-20 jp-AutoMLIcon';
    this.title.caption = 'My Datasets';
  }

  onResize(msg: Widget.ResizeMessage) {
    this.resizeSignal.emit(msg);
  }

  render() {
    return (
      <UseSignal signal={this.resizeSignal}>
        {(_, msg) => {
          const w = (msg) ? msg.width : 0;
          const h = (msg) ? msg.height : 0;
          return (
            <ListResourcesPanel
              width={w}
              height={h}
              context={this.context}
              datasetService={this.datasetService}
              modelService={this.modelService}
            />
          )
        }}
      </UseSignal>
    );
  }
}
