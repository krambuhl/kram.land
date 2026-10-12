import { describe, expect, test } from 'vitest';

import { scanSource } from '../src/scan.ts';

const root = '/project';
const file = '/project/src/card.tsx';
const header = `import styles from './card.module.css';\nimport { responsive } from 'responsive-css-modules';\n`;
const scan = (body: string) =>
  scanSource(file, `${header}${body}`, root).map(({ className, match, at }) => ({ className, match, at }));

describe('scanSource', () => {
  test('records each call on a wrapper with the module it wraps', () => {
    const usages = scanSource(file, `${header}const r = responsive(styles);\nr.cn({ matchMin: 'sm' });\n`, root);
    expect(usages).toEqual([
      { css: '/project/src/card.module.css', className: 'cn', match: { matchMin: 'sm' }, at: 'src/card.tsx:4' },
    ]);
  });

  test('reads arrays, ternaries, element access and an inline wrapper', () => {
    expect(
      scan(
        [
          'const r = responsive(styles);',
          "r.a({ matchOnly: ['sm', 'md'] });",
          "r['b-c']({ matchMax: wide ? 'md' : 'sm' });",
          "responsive(styles).d({ matchOnly: 'base' as const });",
        ].join('\n')
      ).map(({ className, match }) => [className, match])
    ).toEqual([
      ['a', { matchOnly: ['sm', 'md'] }],
      ['b-c', { matchMax: 'md' }],
      ['b-c', { matchMax: 'sm' }],
      ['d', { matchOnly: 'base' }],
    ]);
  });

  test('a value it cannot read is an error with the location', () => {
    expect(() => scan('const r = responsive(styles);\nr.cn({ matchMin: size });')).toThrow(
      'src/card.tsx:4: cn() needs one of matchMin, matchMax, matchOnly'
    );
    expect(() => scan("const r = responsive(styles);\nr.cn({ matchMin: 'sm', matchMax: 'lg' });")).toThrow(
      'src/card.tsx:4'
    );
  });

  test('wrapping anything but a css module import is an error', () => {
    expect(() => scan('const r = responsive(other);')).toThrow(
      'src/card.tsx:3: responsive() takes the default import of a .module.css file.'
    );
  });

  test('a file that does not import responsive is skipped', () => {
    expect(scanSource(file, "const r = { cn: () => '' };\nr.cn({ matchMin: size });", root)).toEqual([]);
  });
});
