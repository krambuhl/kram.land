import { describe, expect, test } from 'vitest';

import { cssVariableName, typeName, unionName, checkTypeNameCollisions } from '../src/core/names.ts';

describe('names', () => {
  test('a path becomes a css custom property name', () => {
    expect(cssVariableName('bg.page.default')).toBe('--bg-page-default');
    expect(cssVariableName('space.x16')).toBe('--space-x16');
  });

  test("a leaf's type is its PascalCase path", () => {
    expect(typeName('bg.page.default')).toBe('BgPageDefault');
    expect(typeName('space.x16')).toBe('SpaceX16');
    expect(typeName('content.regular.hover')).toBe('ContentRegularHover');
  });

  test('every union ends in Token', () => {
    expect(unionName('space')).toBe('SpaceToken');
    expect(unionName('bg.page')).toBe('BgPageToken');
    expect(unionName('color')).toBe('ColorToken');
  });

  test('two sources producing one name is an error naming both', () => {
    expect(() =>
      checkTypeNameCollisions([
        { name: 'ColorToken', source: 'tokens.color' },
        { name: 'ColorToken', source: 'types.color' },
      ])
    ).toThrow(/ColorToken.*tokens\.color.*types\.color/);
  });

  test('distinct names pass', () => {
    expect(() =>
      checkTypeNameCollisions([
        { name: 'BgToken', source: 'tokens.bg' },
        { name: 'ColorToken', source: 'types.color' },
      ])
    ).not.toThrow();
  });
});
