import { describe, expect, test } from 'vitest';

import { toDtcg } from '../src/core/dtcg.ts';
import { diffDtcg, formatDiff } from '../src/core/dtcg-diff.ts';
import type { DtcgNode } from '../src/core/dtcg.ts';
import { loadTokens } from '../src/core/load.ts';
import config from './fixtures/emit.config.ts';

const ours = toDtcg(loadTokens(config));

function edited(edit: (file: DtcgNode) => void): DtcgNode {
  const copy = JSON.parse(JSON.stringify(ours)) as DtcgNode;
  edit(copy);
  return copy;
}

describe('diffDtcg', () => {
  test('an identical export has no findings', () => {
    expect(
      diffDtcg(
        ours,
        edited(() => {})
      )
    ).toEqual([]);
  });

  test('reports a token missing from theirs, one extra in theirs, and a changed value, all at once', () => {
    const theirs = edited((file) => {
      const space = file.space as Record<string, unknown>;
      delete space.x4;
      space.x24 = { $value: { value: 24, unit: 'px' } };
      const gray = file.gray as Record<string, Record<string, unknown>>;
      gray[900].$value = { colorSpace: 'srgb', components: [0, 0, 0], hex: '#000000' };
    });
    expect(diffDtcg(ours, theirs)).toEqual([
      { path: 'space.x4', kind: 'missing' },
      { path: 'space.x24', kind: 'extra' },
      { path: 'gray.900', kind: 'changed', mode: 'base', ours: '#171717', theirs: '#000000' },
    ]);
  });

  test('a mode value that differs is reported with its mode', () => {
    const theirs = edited((file) => {
      const bg = file.bg as Record<string, Record<string, unknown>>;
      bg.card.$extensions = {
        'token-jet': {
          modes: {
            dark: { colorSpace: 'srgb', components: [0, 0, 0], hex: '#000000' },
            contrast: { colorSpace: 'srgb', components: [0, 0, 0], hex: '#000000' },
          },
        },
      };
    });
    expect(diffDtcg(ours, theirs)).toEqual([
      { path: 'bg.card', kind: 'changed', mode: 'dark', ours: '#1a1a1a', theirs: '#000000' },
    ]);
  });

  test('a mode value present on one side only is a change', () => {
    const theirs = edited((file) => {
      const bg = file.bg as Record<string, Record<string, unknown>>;
      delete bg.page.$extensions;
    });
    expect(diffDtcg(ours, theirs)).toEqual([
      { path: 'bg.page', kind: 'changed', mode: 'dark', ours: '{gray.900}', theirs: undefined },
    ]);
  });

  test('values are compared as the config would write them, so hex case and component rounding do not matter', () => {
    const theirs = edited((file) => {
      const gray = file.gray as Record<string, Record<string, unknown>>;
      gray[50].$value = { colorSpace: 'srgb', components: [0.98039, 0.98039, 0.98039], hex: '#FAFAFA' };
    });
    expect(diffDtcg(ours, theirs)).toEqual([]);
  });
});

describe('formatDiff', () => {
  test('one line per finding', () => {
    const lines = formatDiff([
      { path: 'space.x4', kind: 'missing' },
      { path: 'space.x24', kind: 'extra' },
      { path: 'gray.900', kind: 'changed', mode: 'base', ours: '#171717', theirs: '#000000' },
      { path: 'bg.page', kind: 'changed', mode: 'dark', ours: '{gray.900}', theirs: undefined },
    ]);
    expect(lines).toEqual([
      'space.x4: missing from the export',
      'space.x24: in the export only',
      'gray.900 in base: #171717 here, #000000 in the export',
      'bg.page in dark: {gray.900} here, no value in the export',
    ]);
  });
});
