import { Box, Select, MenuItem, Toolbar, ListItem } from '@material-ui/core';
import MaterialTable from 'material-table'
import TableChartOutlinedIcon from '@material-ui/icons/TableChartOutlined';
import * as React from 'react';
import { Dataset, DatasetService } from '../service/dataset';
import { Context } from './automl_widget';
import { CSSProperties } from '@material-ui/core/styles/withStyles';

interface Props {
    width: number;
    height: number;
    context: Context;
    datasetsService: DatasetService;
}

interface State {
    hasLoaded: boolean;
    isLoading: boolean;
    datasets: Dataset[];
    showSearch: boolean;
}

const style: CSSProperties = {
    table: {
        borderRadius: 0,
        boxShadow: "none"
    },
    tableCell: {
        fontSize: "var(--jp-ui-font-size1)",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        overflow: "hidden",
        paddingTop: 2,
        paddingBottom: 2
    },
    headerCell: {
        fontSize: "var(--jp-ui-font-size1)",
        whiteSpace: "nowrap",
        paddingTop: 0,
        paddingBottom: 0,
        borderTop: "1px solid var(--jp-border-color1)"
    },
    tableRow: {
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    menuItem: {
        fontSize: "var(--jp-ui-font-size1)",
    }
}

export class ListResourcesPanel extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            hasLoaded: false,
            isLoading: false,
            datasets: [],
            showSearch: false,
        };
    }

    async componentDidMount() {
        try {
            this.getDatasets();
        } catch (err) {
            console.warn('Unexpected error', err);
        }
    }

    render() {
        const { isLoading, datasets } = this.state;
        // Temporary utility to simulate rendering 100 datasets
        const arr = [];
        for (let i = 0; i < 100; ++i) {
            arr.push(Object.assign({}, datasets[i % 3]));
            arr[i].id += i.toString();
        }
        return <>
            <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/icon?family=Material+Icons"
            />
            <Box height={1} width={1} bgcolor={"white"} borderRadius={0}>
                <Toolbar variant="dense">
                    <Select
                        style={{
                            fontSize: "var(--jp-ui-font-size0)",
                            fontWeight: 600,
                            textTransform: "uppercase"
                        }}
                        value={10}
                    >
                        <MenuItem style={style.menuItem} value={10}>Datasets</MenuItem>
                        <MenuItem style={style.menuItem} value={20}>Models</MenuItem>
                    </Select>
                </Toolbar>

                <MaterialTable
                    title="My Datasets"
                    columns={[
                        {
                            field: 'displayName',
                            title: 'Name',
                            render: rowData => (<ListItem dense style={{ padding: 0 }}>
                                <TableChartOutlinedIcon></TableChartOutlinedIcon>
                                <span style={{ textOverflow: "ellipsis" }}> {'\u00A0\u00A0' + rowData.displayName}</span>
                            </ListItem>),
                            cellStyle: style.tableCell,
                            headerStyle: style.headerCell,
                        },
                        {
                            title: 'Examples', field: 'exampleCount', type: 'numeric',
                            cellStyle: style.tableCell,
                            headerStyle: style.headerCell,
                            hidden: (this.props.width < 380)
                        },
                        {
                            title: 'Created at', field: 'createTime', type: 'datetime',
                            cellStyle: { ...(style.tableCell as object), textAlign: 'right' },
                            headerStyle: style.headerCell,
                            hidden: (this.props.width < 250)
                        }
                    ]}
                    data={arr}
                    options={{
                        showTitle: false,
                        tableLayout: "fixed",
                        pageSize: 20,
                        pageSizeOptions: [20],
                        search: this.state.showSearch,
                        sorting: true,
                        searchFieldStyle: { fontSize: "var(--jp-ui-font-size1)" },
                        searchFieldVariant: "outlined",
                        padding: "dense",
                        toolbar: false,
                        rowStyle: style.tableRow,
                        minBodyHeight: this.props.height - 100, //TODO Get this number programmatically
                        maxBodyHeight: this.props.height - 100
                    }}
                    actions={[
                        {
                            icon: 'add',
                            tooltip: 'Save User',
                            isFreeAction: true,
                            onClick: (event, rowData) => {
                                this.setState({ showSearch: !this.state.showSearch });
                            }
                        }
                    ]}
                    style={style.table}
                    isLoading={isLoading}
                    onRowClick={(_, rowData) => { this.props.context.manager.launchWidgetForId(rowData.id, rowData) }}
                />
            </Box>
        </>;
    }

    private async getDatasets() {
        try {
            this.setState({ isLoading: true });
            const datasets = await this.props.datasetsService.listDatasets();
            this.setState({ hasLoaded: true, datasets: datasets });
        } catch (err) {
            console.warn('Error retrieving datasets', err);
        } finally {
            this.setState({ isLoading: false });
        }
    }
}
