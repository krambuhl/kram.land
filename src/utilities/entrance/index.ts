import cx from 'classnames';

import styles from './styles.module.css';

export interface EntranceOptions {
  motion?: 'rise' | 'fade';
  order?: 'first' | 'second';
}

export function entrance({ motion = 'fade', order = 'first' }: EntranceOptions = {}) {
  return cx(styles.root, {
    [styles.rise]: motion === 'rise',
    [styles.second]: order === 'second',
  });
}
