import { expect, test } from 'vitest';

import { version } from '../src/index.ts';

test('version reads the package version', () => {
  expect(version()).toBe('0.0.0');
});
