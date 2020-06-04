import { withStyles } from '@material-ui/core';
import { Check, Close, Refresh } from '@material-ui/icons';
import * as csstips from 'csstips';
import * as React from 'react';
import { stylesheet } from 'typestyle';

import { Dataset } from '../service/list_datasets';
//import { COLORS, css } from '../styles';

interface Props {
  dataset: Dataset;
}

const localStyles = stylesheet({
  item: {
    alignItems: 'center',
    borderBottom: 'var(--jp-border-width) solid var(--jp-border-color2)',
    listStyle: 'none',
    height: '40px',
    paddingRight: '8px',
    ...csstips.horizontal,
  },
  details: {
    alignItems: 'center',
    paddingLeft: '4px',
    ...csstips.horizontal,
    ...csstips.flex,
  },
  wordTime: {
    color: 'var(--jp-content-font-color2)',
    fontSize: '9px',
    textAlign: 'right',
    ...csstips.flex,
  },
  viewLink: {
    backgroundImage: 'var(--jp-icon-notebook)',
    backgroundRepeat: 'no-repeat',
    marginLeft: '5px',
    padding: '0 6px',
    textDecoration: 'none',
  },
  icon: {
    padding: '0 0 0 5px',
  }
});

const GreenCheck = withStyles({
  root: {
    color: 'green',
    fontSize: '16px',
  },
})(Check);

// tslint:disable-next-line:enforce-name-casing
const RedClose = withStyles({
  root: {
    color: 'red',
    fontSize: '16px',
  },
})(Close);

// tslint:disable-next-line:enforce-name-casing
const GrayPending = withStyles({
  root: {
    color: 'base',
    fontSize: '16px',
  },
})(Refresh);

export class ListWordItem extends React.Component<Props, {}> {
  render() {
    const { dataset } = this.props;
    const create_time = new Date(dataset.createTime);
    return (
      <li className={localStyles.item}>
        <div className={localStyles.icon}>{this.getIconForWord(dataset)}</div>
        <div className={localStyles.details}>
          <a className="{css.link}" href="#">
            {dataset.displayName}
          </a>
          <span className={localStyles.wordTime}>
            {create_time.toLocaleString()}
          </span>
        </div>
        <div>
          <a
            className={localStyles.viewLink}
            href="#"
            title="View Word"
          >
            &nbsp;
          </a>
        </div>
      </li>
    );
  }

  private getIconForWord(word: Dataset): JSX.Element {
    const regex_green = /^[A-K]/g;
    const regex_red = /^[S-Z]/g;
    if (word.displayName.match(regex_green)) {
      return <GreenCheck />;
    } else if (word.displayName.match(regex_red)) {
      return <RedClose />;
    }
    return <GrayPending />;
  }
}
