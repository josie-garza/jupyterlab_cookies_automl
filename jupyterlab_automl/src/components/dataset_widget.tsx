import { ReactWidget } from '@jupyterlab/apputils';
import * as React from 'react';
import { Dataset } from '../service/dataset';
import { GridComponent } from './dataset_grid';

interface Props {
  dataset: Dataset;
}

interface State {
  hasLoaded: boolean;
  isLoading: boolean;
}

export class DatasetPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasLoaded: false,
      isLoading: false,
    };
  }

  render() {
    return <GridComponent id={this.props.dataset.id} />;
  }
}

/** Widget to be registered in the left-side panel. */
export class DatasetWidget extends ReactWidget {
  id = 'dataset-widget';

  constructor(private readonly datasetMeta: Dataset) {
    super();
    this.title.label = datasetMeta.displayName;
    this.title.caption = 'AutoML Dataset';
    this.title.closable = true;
    this.title.iconClass =
      'jp-Icon jp-Icon-20 jp-AutoMLIcon-' + datasetMeta.datasetType;
  }

  render() {
    return <DatasetPanel dataset={this.datasetMeta}></DatasetPanel>;
  }
}
