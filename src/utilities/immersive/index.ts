import styles from './styles.module.css';

export interface ImmersiveOptions {
  part: 'image' | 'text' | 'art';
}

export function immersive({ part }: ImmersiveOptions) {
  return styles[part];
}
