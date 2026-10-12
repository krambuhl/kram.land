import styles from './styles.module.css';

export interface ImmersiveOptions {
  part: 'image' | 'text' | 'frame' | 'art';
}

export function immersive({ part }: ImmersiveOptions) {
  return styles[part];
}
