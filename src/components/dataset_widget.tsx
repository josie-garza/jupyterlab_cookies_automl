import { ReactWidget, UseSignal } from '@jupyterlab/apputils';
import * as React from 'react';
import { Signal } from '@phosphor/signaling';
import {Dataset} from "../service/dataset"

interface Props {
  isVisible: boolean;
  dataset_id: string;
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
    } catch (err) {
      console.warn('Unexpected error', err);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const isFirstLoad =
      !(this.state.hasLoaded || prevProps.isVisible) && this.props.isVisible;
    if (isFirstLoad) {
      this.loadDataset();
    }
  }

  render() {
    return (
      <div>
        {this.props.dataset_id}
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
  private datasetId: string;
  private visibleSignal = new Signal<DatasetWidget, boolean>(this);

  constructor(dataset: Dataset) {
    super();
    this.title.label = dataset.displayName;
    this.title.caption = 'AutoML Project';
    this.title.closable = true;
    this.title.iconClass = 'jp-Icon jp-Icon-20 jp-AutoMLIcon';
    this.datasetId = dataset.id;
  }

  onAfterHide() {
    this.visibleSignal.emit(false);
  }

  onAfterShow() {
    this.visibleSignal.emit(true);
  }

  render() {
    return (
      <UseSignal signal={this.visibleSignal}>
        {(_, isVisible) => (
          <DatasetPanel
            isVisible={isVisible}
            dataset_id={this.datasetId}
          />
        )}
      </UseSignal>
    );
  }
}
