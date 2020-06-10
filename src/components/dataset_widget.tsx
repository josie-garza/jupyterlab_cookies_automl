import { ReactWidget } from '@jupyterlab/apputils';
import * as React from 'react';
import {Dataset} from "../service/dataset"

interface Props {
  dataset: Dataset;
}

interface State {
  hasLoaded: boolean;
  isLoading: boolean;
  data: any;
}

export class DatasetPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasLoaded: false,
      isLoading: false,
      data: null,
    };
  }

  async componentDidMount() {
    try {
      this.loadDataset();
    } catch (err) {
      console.warn('Unexpected error', err);
    }
  }

  render() {
    return (
      <div>
        {this.props.dataset.id}
      </div>
    );
  }

  private async loadDataset() {
    try {
      this.setState({ isLoading: true });
      const datasets = await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(datasets);
      this.setState({ hasLoaded: true, data: {} });
    } catch (err) {
      console.warn('Error retrieving dataset', err);
    } finally {
      this.setState({ isLoading: false });
    }
  }
}

/** Widget to be registered in the left-side panel. */
export class DatasetWidget extends ReactWidget {
  id = 'dataset-widget';

  constructor(private readonly datasetMeta: Dataset) {
    super();
    this.title.label = datasetMeta.displayName;
    this.title.caption = 'AutoML Project';
    this.title.closable = true;
    this.title.iconClass = 'jp-Icon jp-Icon-20 jp-AutoMLIcon';
  }

  render() {
    return (
      <DatasetPanel dataset={this.datasetMeta}></DatasetPanel>
    );
  }
}
