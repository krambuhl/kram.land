import { describe, expect, test } from 'vitest';

import { emitJs } from '../src/core/emit-js.ts';
import { emitTypes } from '../src/core/emit-types.ts';
import { loadTokens } from '../src/core/load.ts';
import config from './fixtures/emit.config.ts';

const resolved = loadTokens(config);

describe('emitTypes', () => {
  const ts = emitTypes(resolved);

  test('matches the snapshot', async () => {
    await expect(ts).toMatchFileSnapshot('./__snapshots__/types.ts');
  });

  test('a leaf is its var() literal, a reference token included', () => {
    expect(ts).toContain("export type SpaceX16 = 'var(--space-x16)';");
    expect(ts).toContain("export type ContentBody = 'var(--content-body)';");
  });

  test('every group at every depth is a union ending in Token', () => {
    expect(ts).toContain('export type SpaceToken = SpaceX4 | SpaceX16;');
    expect(ts).toContain('export type BgToken = BgPage | BgCard;');
  });

  test('a types entry is a union, with a list pattern flattened', () => {
    expect(ts).toContain('export type SurfaceToken = BgPage | BgCard;');
    expect(ts).toMatch(
      /export type ColorToken = Gray50 \| Gray900 \| BgPage \| BgCard \| ContentRegular \| ContentBody;/
    );
  });

  test('AnyToken, TokenPath and TokenMap cover every leaf', () => {
    expect(ts).toMatch(/export type AnyToken = SpaceX4 \| SpaceX16 \| .* \| ContentBody;/);
    expect(ts).toContain("'space.x16' | ");
    expect(ts).toContain("  'space.x16': SpaceX16;");
    expect(ts).toContain("  'content.body': ContentBody;");
  });

  test('a description becomes a jsdoc comment above the alias', () => {
    expect(ts).toContain('/** The default gap. */\nexport type SpaceX16');
  });

  test('a deprecation becomes an @deprecated tag, with its message', () => {
    expect(ts).toContain('/** @deprecated use content.body */\nexport type ContentRegular');
  });
});

describe('emitJs', () => {
  test('exports token() over the generated path map', async () => {
    await expect(emitJs(resolved)).toMatchFileSnapshot('./__snapshots__/index.ts');
  });
});
