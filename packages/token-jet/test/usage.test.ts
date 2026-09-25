import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, test } from 'vitest';

import { findUsages, renameUsages } from '../src/core/usage.ts';

const dir = join(import.meta.dirname, 'fixtures/usage');
const read = (name: string) => readFileSync(join(dir, name), 'utf8');
const files = ['styles.module.css', 'component.tsx', 'page.astro', 'unrelated.ts'].map((name) => ({
  file: name,
  text: read(name),
}));

describe('findUsages', () => {
  const usages = findUsages(files);

  test('finds every token() call across css, tsx and astro', () => {
    const byFile = Object.groupBy(usages, (u) => u.file);
    expect(byFile['styles.module.css']?.map((u) => u.path)).toEqual([
      'space.x16',
      'content.regular.default',
      'space.x16',
      'space.x4',
    ]);
    expect(byFile['component.tsx']?.map((u) => u.path)).toEqual(['space.x16', 'content.muted.default']);
    expect(byFile['page.astro']?.map((u) => u.path)).toEqual(['space.x4', 'content.regular.default']);
  });

  test('does not match a different function with a similar name', () => {
    expect(usages.filter((u) => u.file === 'unrelated.ts')).toEqual([]);
  });

  test('reports line and column, 1-based', () => {
    const first = usages.find((u) => u.file === 'styles.module.css');
    expect(first).toMatchObject({ line: 2, column: 19 });
  });

  test('counts uses per path', () => {
    const counts = Object.fromEntries(
      Object.entries(Object.groupBy(usages, (u) => u.path)).map(([k, v]) => [k, v?.length])
    );
    expect(counts['space.x16']).toBe(3);
    expect(counts['content.muted.default']).toBe(1);
  });
});

describe('renameUsages', () => {
  test('rewrites every occurrence of one path and leaves others alone', () => {
    const out = renameUsages(files, 'space.x16', 'space.md');
    const css = out.find((f) => f.file === 'styles.module.css');
    expect(css?.text).toContain("token('space.md')");
    expect(css?.text).not.toContain("token('space.x16')");
    expect(css?.text).toContain("token('space.x4')");
    expect(css?.text).toContain("token('content.regular.default')");
    expect(css?.changed).toBe(true);
  });

  test("preserves each call's quote style", () => {
    const mixed = [{ file: 'a.css', text: `a: token("x.y"); b: token('x.y');` }];
    expect(renameUsages(mixed, 'x.y', 'x.z')[0]?.text).toBe(`a: token("x.z"); b: token('x.z');`);
  });

  test('a file with no occurrence is returned unchanged', () => {
    const out = renameUsages(files, 'content.muted.default', 'content.quiet');
    const css = out.find((f) => f.file === 'styles.module.css');
    expect(css?.changed).toBe(false);
    expect(css?.text).toBe(read('styles.module.css'));
  });

  test('does not rename a path that merely starts with the old one', () => {
    const out = renameUsages(
      [{ file: 'a.css', text: "a: token('space.x1'); b: token('space.x16');" }],
      'space.x1',
      'space.one'
    );
    expect(out[0]?.text).toBe("a: token('space.one'); b: token('space.x16');");
  });
});
