import { Box, ListItem, MenuItem, Select, Toolbar } from '@material-ui/core';
import TableChartOutlinedIcon from '@material-ui/icons/TableChartOutlined';
import * as React from 'react';
import { Dataset, DatasetService } from '../service/dataset';
import { Model, ModelService } from '../service/model';
import { Context } from './automl_widget';
import { ListResourcesTable, ColumnType } from './list_resources_table'

interface Props {
    width: number;
    height: number;
    context: Context;
}

enum ResourceType {
    Model = "model",
    Dataset = "dataset"
}

interface State {
    hasLoaded: boolean;
    isLoading: boolean;
    datasets: Dataset[];
    models: Model[];
    resourceType: ResourceType;
    showSearch: boolean;
}

export class ListResourcesPanel extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            hasLoaded: false,
            isLoading: false,
            datasets: [],
            models: [],
            resourceType: ResourceType.Dataset,
            showSearch: false,
        };
    }

    async componentDidMount() {
        try {
            this.getModels();
            this.getDatasets();
        } catch (err) {
            console.warn('Unexpected error', err);
        }
    }

    render() {
        const { datasets } = this.state;
        // Temporary utility to simulate rendering 100 datasets
        const arr = [];
        for (let i = 0; i < 100; ++i) {
            arr.push(Object.assign({}, datasets[i % 3]));
            arr[i].id += i.toString();
        }
        return <>
            <link
                rel='stylesheet'
                href='https://fonts.googleapis.com/icon?family=Material+Icons'
            />
            <Box height={1} width={1} bgcolor={'white'} borderRadius={0}>
                <Toolbar variant='dense'>
                    <Select
                        style={{
                            fontSize: 'var(--jp-ui-font-size0)',
                            fontWeight: 600,
                            textTransform: 'uppercase'
                        }}
                        value={this.state.resourceType}
                        onChange={(event) => { this.setState({ resourceType: (event.target.value as ResourceType) }) }}
                    >
                        <MenuItem style={{ fontSize: 'var(--jp-ui-font-size1)' }} value={ResourceType.Dataset}>Datasets</MenuItem>
                        <MenuItem style={{ fontSize: 'var(--jp-ui-font-size1)' }} value={ResourceType.Model}>Models</MenuItem>
                    </Select>
                </Toolbar>


                {(this.state.resourceType == ResourceType.Dataset) ? (
                    <ListResourcesTable
                        columns={[
                            {
                                field: 'displayName',
                                title: 'Name',
                                render: rowData => (<ListItem dense style={{ padding: 0 }}>
                                    <TableChartOutlinedIcon></TableChartOutlinedIcon>
                                    <span style={{ textOverflow: 'ellipsis' }}> {'\u00A0\u00A0' + rowData.displayName}</span>
                                </ListItem>),
                            },
                            {
                                title: 'Examples', field: 'exampleCount', type: ColumnType.Numeric,
                                minShowWidth: 380
                            },
                            {
                                title: 'Created at', field: 'createTime', type: ColumnType.DateTime,
                                rightAlign: true,
                                minShowWidth: 250
                            }
                        ]}
                        data={datasets}
                        onRowClick={(rowData) => { this.props.context.manager.launchWidgetForId(rowData.id, rowData) }}
                        isLoading={this.state.isLoading}
                        height={this.props.height - 100}
                        width={this.props.width}
                    />
                ) : (
                        <ListResourcesTable
                            columns={[
                                {
                                    field: 'displayName',
                                    title: 'Name',
                                    render: rowData => (<ListItem dense style={{ padding: 0 }}>
                                        <TableChartOutlinedIcon></TableChartOutlinedIcon>
                                        <span style={{ textOverflow: 'ellipsis' }}> {'\u00A0\u00A0' + rowData.displayName}</span>
                                    </ListItem>),
                                },
                                {
                                    title: 'Dataset', field: 'datasetId',
                                    minShowWidth: 380
                                },
                                {
                                    title: 'Last updated', field: 'updateTime', type: ColumnType.DateTime,
                                    rightAlign: true,
                                    minShowWidth: 250
                                }
                            ]}
                            data={this.state.models}
                            //onRowClick={(rowData) => { this.props.context.manager.launchWidgetForId(rowData.id, rowData) }}
                            isLoading={this.state.isLoading}
                            height={this.props.height - 100}
                            width={this.props.width}
                        />
                    )}
            </Box>
        </>;
    }

    private async getDatasets() {
        try {
            this.setState({ isLoading: true });
            const datasets = await DatasetService.listDatasets();
            this.setState({ hasLoaded: true, datasets: datasets });
        } catch (err) {
            console.warn('Error retrieving datasets', err);
        } finally {
            this.setState({ isLoading: false });
        }
    }

    private async getModels() {
        try {
            this.setState({ isLoading: true });
            const models = await ModelService.listModels();
            this.setState({ hasLoaded: true, models: models });
        } catch (err) {
            console.warn('Error retrieving models', err);
        } finally {
            this.setState({ isLoading: false });
        }
    }
}
