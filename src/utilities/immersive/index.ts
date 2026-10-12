import styles from './styles.module.css';

export interface ImmersiveOptions {
  part: 'block' | 'image' | 'text' | 'art' | 'scrim';
}

export function immersive({ part }: ImmersiveOptions) {
  return styles[part];
}
