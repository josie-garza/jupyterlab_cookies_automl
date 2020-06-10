import { CSSProperties } from '@material-ui/core/styles/withStyles';
import MaterialTable from 'material-table';
import * as React from 'react';


export enum ColumnType {
    Boolean = 'boolean',
    Time = 'time',
    Numeric = 'numeric',
    Date = 'date',
    DateTime = 'datetime',
    Currency = 'currency'
}

export interface ResourceColumn {
    field: string;
    title: string;
    type?: ColumnType;
    minShowWidth?: number;
    rightAlign?: boolean;
    render?: (rowData: any) => JSX.Element;
}

interface Props {
    width: number;
    height: number;
    data: any[];
    columns: ResourceColumn[];
    isLoading?: boolean;
    onRowClick?: (rowData: any) => void;
}

interface State {
}

const style: CSSProperties = {
    table: {
        borderRadius: 0,
        boxShadow: 'none'
    },
    tableCell: {
        fontSize: 'var(--jp-ui-font-size1)',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        paddingTop: 2,
        paddingBottom: 2
    },
    headerCell: {
        fontSize: 'var(--jp-ui-font-size1)',
        whiteSpace: 'nowrap',
        paddingTop: 0,
        paddingBottom: 0,
        borderTop: '1px solid var(--jp-border-color1)'
    },
    tableRow: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    }
}

export class ListResourcesTable extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
        };
    }

    async componentDidMount() {
    }

    render() {
        return (
            <MaterialTable
                columns={
                    this.props.columns.map((col: ResourceColumn) => {
                        return {
                            field: col.field,
                            title: col.title,
                            type: col.type,
                            render: col.render,
                            cellStyle: col.rightAlign ? { ...(style.tableCell as object), textAlign: 'right' } : style.tableCell,
                            headerStyle: style.headerCell,
                            hidden: (this.props.width < col.minShowWidth)
                        };
                    })}
                data={this.props.data}
                options={{
                    showTitle: false,
                    tableLayout: 'fixed',
                    pageSize: 20,
                    pageSizeOptions: [20],
                    search: false,
                    sorting: true,
                    searchFieldStyle: { fontSize: 'var(--jp-ui-font-size1)' },
                    searchFieldVariant: 'outlined',
                    padding: 'dense',
                    toolbar: false,
                    rowStyle: style.tableRow,
                    minBodyHeight: this.props.height, //TODO Get this number programmatically
                    maxBodyHeight: this.props.height
                }}
                actions={[
                    {
                        icon: 'add',
                        tooltip: 'Save User',
                        isFreeAction: true,
                        onClick: (event, rowData) => {
                        }
                    }
                ]}
                style={style.table}
                isLoading={this.props.isLoading}
                onRowClick={(_, rowData) => {
                    if (this.props.onRowClick) {
                        this.props.onRowClick(rowData)
                    }
                }}
            />
        );
    }
}
