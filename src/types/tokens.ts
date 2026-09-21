import type { tokens } from '../tokens';

export type SizeToken = (typeof tokens.size)[keyof typeof tokens.size];
