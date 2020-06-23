import * as React from 'react';
import { Dialog, FormControl, RadioGroup, FormControlLabel, Radio, Button } from '@material-ui/core';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import * as csstips from 'csstips';
import {
  BASE_FONT,
  COLORS,
  SubmitButton,
  css,
  TextInput,
  SelectInput,
} from 'gcp-jupyterlab-shared';
import { stylesheet } from 'typestyle';

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
    },
    MuiRadio: {
      colorSecondary: {
        '&$checked': {
          color: COLORS.blue,
        }
      }
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
    ...csstips.flex,
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
  label: {
    textTransform: 'capitalize',
    color: COLORS.white,
  },
});

interface Props {
  onClose: any;
}

interface State {
  from: string;
  files: any
}

export class ImportData extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      from: 'computer',
      files: null,
    };
  }

  render() {
    return <Dialog open={true} onClose={this.props.onClose}>
      <header className={localStyles.header}>
        <span className={localStyles.title}>Import Data</span>
      </header>
      <main className={localStyles.main}>
        <ThemeProvider theme={theme}>
          <FormControl component="fieldset">
            <RadioGroup aria-label="gender" name="gender1" value={this.state.from} onChange={(event) => {
              this.setState({ from: event.target.value });
            }}>
              <FormControlLabel value="computer" control={<Radio />} label="Upload files from your computer" />
              <FormControlLabel value="bigquery" control={<Radio />} label="Import data from BigQuery" />
              <FormControlLabel value="gcs" control={<Radio />} label="Import data from GCS" />
              <FormControlLabel value="dataframe" control={<Radio />} label="Select dataframe from kernel" />
            </RadioGroup>
          </FormControl>
          <div>{this.getDialogContent()}</div>
          <div>
            <button
              type="button"
              className={css.button}
              onClick={this.props.onClose}
            >
              {'Close'}
            </button>
            <SubmitButton
              actionPending={false}
              onClick={_ => {
                console.log('submitting')
              }}
              text="Submit"
            />
          </div>
        </ThemeProvider>
      </main>
    </Dialog >
  }

  private getDialogContent(): JSX.Element {
    const { from } = this.state;
    if (from === 'computer') {
      return (
        <div>
          <p className={localStyles.title}>Upload files from your computer</p>
          <input
            className={localStyles.input}
            id="button-file"
            multiple
            type="file"
            onChange={(event) => {
              this.setState({ files: event.target.files })
            }}
          />
          <label htmlFor="button-file">
            <Button component="span" classes={{ label: localStyles.label }}>
              Select Files
            </Button>
          </label>
        </div>
      );
    } else if (from === 'bigquery') {
      return (
        <div>
          <p className={localStyles.title}>Import data from BigQuery</p>
          <TextInput label='BigQuery Project ID' />
        </div>
      );
    } else if (from === 'gcs') {
      return (
        <div>
          <p>Import data from GCS</p>
        </div>
      );
    } else if (from === 'dataframe') {
      return (
        <div>
          <p className={localStyles.title}>Select dataframe from kernel</p>
          <SelectInput />
        </div>
      );
    }
    return null;
  }
}