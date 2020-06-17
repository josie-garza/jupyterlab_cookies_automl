import { LinearProgress } from '@material-ui/core';
import * as csstips from 'csstips';
import * as React from 'react';
import { stylesheet } from 'typestyle';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import MaterialTable from 'material-table';
import { DatasetService, TableSpec, Dataset } from '../service/dataset';
import { style, ColumnType } from './shared/list_resources_table';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie } from 'recharts';


interface Props {
    dataset: Dataset;
}

interface State {
    hasLoaded: boolean;
    isLoading: boolean;
    tableSpecs: TableSpec[];
}

const localStyles = stylesheet({
    header: {
        borderBottom: 'var(--jp-border-width) solid var(--jp-border-color2)',
        fontSize: '14px',
        letterSpacing: '1px',
        margin: 0,
        padding: '8px 12px 8px 24px',
    },
    panel: {
        backgroundColor: 'white',
        height: '100%',
        ...csstips.vertical,
    },
    list: {
        margin: 0,
        overflowY: 'scroll',
        padding: 0,
        ...csstips.flex,
    },
    root: {
        flexGrow: 1,
        padding: '16px',
    },
    paper: {
        padding: '16px',
        textAlign: 'left',
        fontSize: 'var(--jp-ui-font-size1)',
    },
});


export class GridComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasLoaded: false,
            isLoading: false,
            tableSpecs: [],
        };
    }

    async componentDidMount() {
        this.getTableDetails();
    }

    render() {
        const { isLoading, tableSpecs } = this.state;
        const columns = [
            {
                title: 'Column name',
                field: 'displayName',
                type: 'string',
            },
            {
                title: 'Data Type',
                field: 'dataType',
                type: 'string',
            },
            {
                title: 'Nullable',
                field: 'nullable',
                type: ColumnType.Boolean,
            },
            {
                title: 'Missing Values (%)',
                field: 'nullValueCount',
                type: 'string',
            },
            {
                title: 'Invalid Values',
                field: 'invalidValueCount',
                type: ColumnType.Numeric,
            },
            {
                title: 'Distinct Value Count',
                field: 'distinctValueCount',
                type: ColumnType.Numeric,
            },
        ]

        return (
            <div className={localStyles.panel}>
                <header className={localStyles.header}>{this.props.dataset.displayName}</header>
                {isLoading ? (
                    <LinearProgress />
                ) : (tableSpecs.length == 0 ? (
                    <p className={localStyles.paper}>Dataset is empty. Please import data.</p>
                ) : (
                        <ul className={localStyles.list}>
                            {tableSpecs.map(tableSpec => (
                                <div key={tableSpec.id} className={localStyles.root}>
                                    <Grid container spacing={3} direction="column">
                                        <Grid item xs={6}>
                                            <Paper square={true} elevation={3} className={localStyles.paper}>
                                                <b>Summary</b>
                                                <p>Total Columns: {tableSpec.columnCount}</p>
                                                <p>Total Rows:  {tableSpec.rowCount}</p>
                                                <BarChart
                                                    width={500}
                                                    height={90}
                                                    data={tableSpec.chartSummary}
                                                    layout="vertical"
                                                    margin={{
                                                        top: 5, right: 30, left: 20, bottom: 5,
                                                    }}
                                                >
                                                    <YAxis type="category" dataKey="name" />
                                                    <XAxis type="number"/>
                                                    <Tooltip />
                                                    <Bar dataKey="amount" fill="#3366CC" />
                                                </BarChart>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Paper square={true} elevation={3} className={localStyles.paper}>
                                                <MaterialTable
                                                    columns={
                                                        columns.map((col: any) => {
                                                            return {
                                                                field: col.field,
                                                                title: col.title,
                                                                type: col.type,
                                                                // width: col.title == 'p' ? 45 : undefined,
                                                                cellStyle: style.tableCell,
                                                                headerStyle: style.headerCell,
                                                            };
                                                        })}
                                                    data={tableSpec.columnSpecs}
                                                    options={{
                                                        showTitle: false,
                                                        search: false,
                                                        sorting: true,
                                                        padding: 'dense',
                                                        toolbar: false,
                                                        paging: false,
                                                        rowStyle: style.tableRow,
                                                    }}
                                                    style={style.table}
                                                    isLoading={this.state.isLoading}
                                                    detailPanel={rowData => {
                                                        if (rowData.dataType === 'Numeric') {
                                                            const chartInfo = tableSpec.columnSpecs.filter(columnSpec => columnSpec.id == rowData.id)[0].chartInfo
                                                            return (
                                                                <div>
                                                                    <p>Mean: {chartInfo[0]}</p>
                                                                    <p>Standard Deviation: {chartInfo[1]}</p>
                                                                    <BarChart
                                                                        width={500}
                                                                        height={300}
                                                                        data={chartInfo[2]}
                                                                        margin={{
                                                                            top: 5, right: 30, left: 20, bottom: 5,
                                                                        }}
                                                                    >
                                                                        <XAxis dataKey="name" />
                                                                        <YAxis />
                                                                        <Tooltip />
                                                                        <Bar dataKey="amount" fill="#3366CC" />
                                                                    </BarChart>
                                                                </div>)
                                                        }
                                                        else if (rowData.dataType === 'Categorical') {
                                                            const chartInfo = tableSpec.columnSpecs.filter(columnSpec => columnSpec.id == rowData.id)[0].chartInfo
                                                            return (
                                                                <div>
                                                                    <PieChart width={400} height={400}>
                                                                        <Pie dataKey="amount" isAnimationActive={false} data={chartInfo} cx={200} cy={200} outerRadius={80} fill="#3366CC" label />
                                                                        <Tooltip />
                                                                    </PieChart>
                                                                </div>)
                                                        }
                                                    }}
                                                    onRowClick={(event, rowData, togglePanel) => togglePanel()}
                                                />
                                            </Paper>
                                        </Grid>
                                    </Grid>
                                </div>
                            ))}
                        </ul>
                    ))}
            </div>
        );
    }

    private async getTableDetails() {
        try {
            this.setState({ isLoading: true });
            const tableSpecs = await DatasetService.listTableSpecs(this.props.dataset.id);
            this.setState({ hasLoaded: true, tableSpecs: tableSpecs });
        } catch (err) {
            console.warn('Error retrieving table details', err);
        } finally {
            this.setState({ isLoading: false });
        }
    }
}