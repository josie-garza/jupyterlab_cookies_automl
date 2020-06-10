import { ReactWidget, UseSignal } from '@jupyterlab/apputils';
import {
    JupyterFrontEnd
} from '@jupyterlab/application';
import { LinearProgress } from '@material-ui/core';
import { Signal } from '@phosphor/signaling';
import * as csstips from 'csstips';
import * as React from 'react';
import { stylesheet } from 'typestyle';
import Paper from '@material-ui/core/Paper';
import Grid, { GridSpacing } from '@material-ui/core/Grid';
import { DatasetService, TableSpec } from '../service/dataset';
import { WidgetManager } from '../widget_manager'

export interface Context {
    app: JupyterFrontEnd,
    manager: WidgetManager
}

interface Props {
    datasetsService: DatasetService;
    isVisible: boolean;
    id: string;
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
        //color: COLORS.base,
        height: '100%',
        //...BASE_FONT,
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
        try {
        } catch (err) {
            console.warn('Unexpected error', err);
        }
    }

    componentDidUpdate(prevProps: Props) {
        const isFirstLoad =
            !(this.state.hasLoaded || prevProps.isVisible) && this.props.isVisible;
        if (isFirstLoad) {
            this.getTableDetails();
        }
    }

    render() {
        const { isLoading, tableSpecs } = this.state;

        return (
            <div className={localStyles.panel}>
                <header className={localStyles.header}>{this.props.id}</header>
                {isLoading ? (
                    <LinearProgress />
                ) : (
                        <ul className={localStyles.list}>
                            {tableSpecs.map(tableSpec => (
                                <div key={tableSpec.id} className={localStyles.root}>
                                    <Grid container spacing={Number(24) as GridSpacing}>
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
                        </ul>
                    )}
            </div>
        );
    }

    private async getTableDetails() {
        try {
            this.setState({ isLoading: true });
            const tableSpecs = await this.props.datasetsService.listTableSpecs(this.props.id);
            this.setState({ hasLoaded: true, tableSpecs: tableSpecs });
        } catch (err) {
            console.warn('Error retrieving table details', err);
        } finally {
            this.setState({ isLoading: false });
        }
    }
}

/** Widget to be registered in the left-side panel. */
export class DatasetGrid extends ReactWidget {
    id = 'tabledetails';
    private visibleSignal = new Signal<DatasetGrid, boolean>(this);

    constructor(private datasetId: string, private readonly datasetService: DatasetService) {
        super();
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
                    <GridComponent
                        isVisible={isVisible}
                        id={this.datasetId}
                        datasetsService={this.datasetService}
                    />
                )}
            </UseSignal>
        );
    }
}
