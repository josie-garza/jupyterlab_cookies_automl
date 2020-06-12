import { LinearProgress } from '@material-ui/core';
import * as React from 'react';
import { stylesheet } from 'typestyle';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { DatasetService, TableSpec, Dataset } from '../service/dataset';


interface Props {
    dataset: Dataset;
    value: number;
    index: number;
}

interface State {
    hasLoaded: boolean;
    isLoading: boolean;
    tableSpecs: TableSpec[];
}

const localStyles = stylesheet({
    header: {
        borderBottom: 'var(--jp-border-width) solid var(--jp-border-color2)',
        fontWeight: 600,
        fontSize: 'var(--jp-ui-font-size0, 11px)',
        letterSpacing: '1px',
        margin: 0,
        padding: '8px 12px',
        textTransform: 'uppercase',
    },
    panel: {
        backgroundColor: 'white',
        height: '100%',
    },
    list: {
        margin: 0,
        padding: 0,
    },
    root: {
        flexGrow: 1,
        padding: '16px',
    },
    paper: {
        padding: '16px',
        textAlign: 'center',
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

        return (
            <div hidden={this.props.value !== this.props.index} className={localStyles.panel} >
                <header className={localStyles.header}>{this.props.dataset.displayName}</header>
                {isLoading ? (
                    <LinearProgress />
                ) : (
                        <div className={localStyles.list}>
                            {tableSpecs.map(tableSpec => (
                                <div key={tableSpec.id} className={localStyles.root}>
                                    <Grid container spacing={5}>
                                        <Grid item xs={6}>
                                            <Paper className={localStyles.paper}><p>Summary</p><p>Total Columns: {tableSpec.columnCount}</p><p>Total Rows:  {tableSpec.rowCount}</p> </Paper>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Paper className={localStyles.paper}>Target Column</Paper>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Paper className={localStyles.paper}>Columns
                                                    {tableSpec.columnSpecs.map(column => {
                                                        return <p key={column.id}>{column.displayName}</p>
                                                    })}
                                            </Paper>
                                        </Grid>
                                    </Grid>
                                </div>
                            ))}
                        </div>
                    )}
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
