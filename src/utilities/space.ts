import type {
  SizeX0,
  SizeX4,
  SizeX8,
  SizeX12,
  SizeX16,
  SizeX24,
  SizeX32,
  SizeX48,
  SizeX64,
  SizeX80,
  SizeX96,
  SizeX128,
} from 'generated/tokens';

// The spacing subset of the size scale, shared by the utilities that take a
// gap or a padding. A width-sized token is not spacing.
export type SpaceToken =
  SizeX0 | SizeX4 | SizeX8 | SizeX12 | SizeX16 | SizeX24 | SizeX32 | SizeX48 | SizeX64 | SizeX80 | SizeX96 | SizeX128;
