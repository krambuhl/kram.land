import postcss from 'postcss';
import { describe, expect, test } from 'vitest';

import { responsivePostcss } from '../src/postcss.ts';
import type { Scale } from '../src/scale.ts';
import type { Usage } from '../src/scan.ts';

const scale: Scale = { names: ['base', 'sm', 'md'], widths: ['0px', '32rem', '48rem'] };
const css = '/project/src/card.module.css';

async function run(input: string, usages: Usage[]): Promise<string> {
  const plugin = responsivePostcss(() => ({ scale, usages: (file) => (file === css ? usages : []) }));
  return (await postcss([plugin]).process(input, { from: css })).css.replace(/\s+/g, ' ');
}

const use = (className: string, match: Usage['match']): Usage => ({ css, className, match, at: 'src/card.tsx:4' });

describe('responsivePostcss', () => {
  test('emits only the used variants, each rule that names the class, inside its query', async () => {
    const out = await run('.cn { gap: 1px; }\n.cn:hover > .other { color: red; }\n.cnx { gap: 2px; }', [
      use('cn', { matchMin: 'sm' }),
    ]);
    expect(out).toContain(
      '@media (width >= 32rem) {.cn--min-sm { gap: 1px; } .cn--min-sm:hover > .other { color: red; } }'
    );
    expect(out).not.toContain('cnx--');
    expect(out).not.toContain('max-');
  });

  test('a rule inside an at-rule keeps it, nested in the query', async () => {
    const out = await run('@supports (display: grid) { .cn { display: grid; } }', [use('cn', { matchOnly: 'sm' })]);
    expect(out).toContain(
      '@media (32rem <= width < 48rem) {@supports (display: grid) { .cn--only-sm { display: grid; } } }'
    );
  });

  test('a variant used twice is emitted once, and a full range needs no query', async () => {
    const out = await run('.cn { gap: 1px; }', [use('cn', { matchMin: 'base' }), use('cn', { matchMin: 'base' })]);
    expect(out.match(/cn--min-base/g)).toHaveLength(1);
    expect(out).not.toContain('@media');
  });

  test('an unknown class or breakpoint is an error at the call', async () => {
    await expect(run('.cn {}', [use('nope', { matchMin: 'sm' })])).rejects.toThrow('src/card.tsx:4: .nope is not in');
    await expect(run('.cn {}', [use('cn', { matchMin: 'xl' })])).rejects.toThrow(
      'src/card.tsx:4: "xl" is not a breakpoint'
    );
  });
});
