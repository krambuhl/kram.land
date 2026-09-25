import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Mode, resolveMode } from './index';
import type { ModeValue } from './index';

describe('resolveMode', () => {
  const absolute: ModeValue[] = ['light', 'dark', 'auto'];

  it.each(absolute)('%s ignores its parent', (value) => {
    for (const parent of ['light', 'dark', 'auto', 'inverted'] as const) {
      expect(resolveMode(value, parent)).toBe(value);
    }
  });

  it.each([
    ['light', 'dark'],
    ['dark', 'light'],
    ['auto', 'inverted'],
    ['inverted', 'auto'],
  ] as const)('inverted under %s is %s', (parent, expected) => {
    expect(resolveMode('inverted', parent)).toBe(expected);
  });
});

describe('Mode', () => {
  it('renders the resolved mode and provides it to nested modes', () => {
    const html = renderToStaticMarkup(
      <Mode value="dark">
        <Mode value="inverted">
          <Mode value="inverted">
            <Mode value="auto">
              <Mode value="inverted">x</Mode>
            </Mode>
          </Mode>
        </Mode>
      </Mode>
    );
    expect(html).toBe(
      '<div data-mode="dark"><div data-mode="light"><div data-mode="dark"><div data-mode="auto"><div data-mode="inverted">x</div></div></div></div></div>'
    );
  });

  it('treats the root as auto', () => {
    expect(renderToStaticMarkup(<Mode value="inverted">x</Mode>)).toBe('<div data-mode="inverted">x</div>');
  });
});
