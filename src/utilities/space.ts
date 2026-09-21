import { tokens } from 'tokens';

const spaceKeys = ['x0', 'x4', 'x8', 'x12', 'x16', 'x24', 'x32', 'x48', 'x64', 'x80', 'x96', 'x128'] as const;

export type SpaceKey = (typeof spaceKeys)[number];
export type SpaceToken = (typeof tokens.size)[SpaceKey];

const keyByToken = Object.fromEntries(spaceKeys.map((key) => [tokens.size[key], key])) as Record<SpaceToken, SpaceKey>;

export function toSpaceKey(token: SpaceToken): SpaceKey {
  return keyByToken[token];
}
