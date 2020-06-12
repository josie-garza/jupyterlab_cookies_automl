import { ReactWidget } from '@jupyterlab/apputils';
import * as React from 'react';
import { Dataset } from "../service/dataset"
import {GridComponent} from "../components/dataset_grid"
import { Toolbar, Tabs, Tab, Box } from '@material-ui/core';

interface Props {
  dataset: Dataset;
}

interface TabProps {
  value: number;
  index: number;
  message: string;
}

interface State {
  hasLoaded: boolean;
  isLoading: boolean;
  data: any;
  tabState: number;
}

export class TabPanel extends React.Component<TabProps> {
  constructor(props: TabProps) {
    super(props);
  }

  render() {
    return (
      <div hidden={this.props.value !== this.props.index}>
        <Box p={3}>
          {this.props.message}
        </Box>
      </div>
    );
  }
}


export class DatasetPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasLoaded: false,
      isLoading: false,
      data: null,
      tabState: 0,
    };
  }

  render() {
    const { tabState } = this.state;
    return (
      <Box>
      <Toolbar variant='dense'>
        <Tabs value={tabState} onChange={(_event, newValue) => this.setState({ tabState: newValue })}>
          <Tab label="Train"></Tab>
          <Tab label="Models"></Tab>
          <Tab label="Evaluate"></Tab>
          <Tab label="Test"></Tab>
        </Tabs>
      </Toolbar>
      <GridComponent dataset={this.props.dataset} value={tabState} index={0}/>
      <TabPanel value={tabState} index={1} message="Models" />
      <TabPanel value={tabState} index={2} message="Evaluate" />
      <TabPanel value={tabState} index={3} message="Test" />
      </Box>
    );
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
