import type { Config, Modes } from '../src/core/config.ts';

export function config<const M extends Modes>(value: Config<M>): Config<M> {
  return value;
}
