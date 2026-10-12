import styles from './styles.module.css';

export interface SecretOptions {
  part: 'root' | 'image' | 'text' | 'art' | 'scrim';
}

export function secret({ part }: SecretOptions) {
  return styles[part];
}
