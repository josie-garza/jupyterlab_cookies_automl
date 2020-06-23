import * as React from 'react';
import { Dialog, Button } from '@material-ui/core';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import * as csstips from 'csstips';
import {
  BASE_FONT,
  COLORS,
  SubmitButton,
  TextInput,
  SelectInput,
  Option,
} from 'gcp-jupyterlab-shared';
import { RadioInput } from './shared/radio_input'
import { ActionBar } from './shared/action_bar'
import { stylesheet } from 'typestyle';


type SourceType =
  | 'computer'
  | 'bigquery'
  | 'gcs'
  | 'dataframe';

interface Props {
  onClose: any;
}

interface State {
  from: SourceType;
  params: any
}

const theme = createMuiTheme({
  overrides: {
    MuiButton: {
      root: {
        backgroundColor: COLORS.blue,
        borderRadius: '2px',
        lineHeight: 1.7,
        "&:hover": {
          backgroundColor: COLORS.blue,
        }
      },
      text: {
        padding: '1px 16px',
      },
      label: {
        textTransform: 'capitalize',
        color: COLORS.white,
      },
    }
  },
});

const localStyles = stylesheet({
  header: {
    ...BASE_FONT,
    fontWeight: 500,
    fontSize: '15px',
    margin: '16px 16px 0 16px',
    ...csstips.horizontal,
    ...csstips.center,
  },
  title: {
    ...BASE_FONT,
    fontWeight: 500,
    fontSize: '15px',
    marginBottom: '16px',
  },
  main: {
    backgroundColor: COLORS.white,
    color: COLORS.base,
    padding: '16px',
    width: '480px',
    ...BASE_FONT,
    ...csstips.vertical,
  },
  input: {
    display: 'none',
  },
});

const SOURCES: Option[] = [
  {
    value: 'computer',
    text: 'Upload files from your computer',
  },
  {
    value: 'bigquery',
    text: 'Import data from BigQuery',
  },
  {
    value: 'gcs',
    text: 'Import data from Google Cloud Storage',
  },
  {
    value: 'dataframe',
    text: 'Select dataframe from kernel',
  }
]

export class ImportData extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      from: 'computer',
      params: null,
    };
  }

  render() {
    return <Dialog open={true} onClose={this.props.onClose}>
      <header className={localStyles.header}>
        Import Data
      </header>
      <main className={localStyles.main}>
        <RadioInput value={this.state.from} options={SOURCES} onChange={(event) => {
          this.setState({ from: event.target.value as SourceType });
        }} />
        <div>{this.getDialogContent()}</div>
        <ActionBar
          onClick={this.props.onClose}
          closeLabel="Cancel"
        >
          <SubmitButton
            actionPending={false}
            onClick={this.props.onClose}
            text="Submit"
          />
        </ActionBar>
      </main>
    </Dialog >
  }

  private getDialogContent(): JSX.Element {
    const { from } = this.state;
    if (from === 'computer') {
      return (
        <div style={{ margin: '16px 0 16px 0' }}>
          <p className={localStyles.title}>Upload files from your computer</p>
          <input
            className={localStyles.input}
            id="button-file"
            multiple
            type="file"
            onChange={(event) => {
              this.setState({ params: event.target.files })
            }}
          />
          <label htmlFor="button-file">
            <ThemeProvider theme={theme}>
              <Button component="span">
                Select
              </Button>
            </ThemeProvider>
          </label>
        </div>
      );
    } else if (from === 'bigquery') {
      return (
        <div style={{ margin: '16px 0 16px 0' }}>
          <p className={localStyles.title}>Import data from BigQuery</p>
          <TextInput label='BigQuery URI' onChange={(event) => {
              this.setState({ params: event.target.value })
            }}/>
        </div>
      );
    } else if (from === 'gcs') {
      return (
        <div style={{ margin: '16px 0 16px 0' }}>
          <p className={localStyles.title}>Import data from Google Cloud Storage</p>
          <TextInput label='Google Cloud Storage URI' onChange={(event) => {
              this.setState({ params: event.target.value })
            }}/>
        </div>
      );
    } else if (from === 'dataframe') {
      return (
        <div style={{ margin: '16px 0 16px 0' }}>
          <p className={localStyles.title}>Select dataframe from kernel</p>
          <SelectInput />
        </div>
      );
    }
    return null;
  }
}