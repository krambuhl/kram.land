import type { Config } from '../../src/index.ts';

// Enough shape to show every emit path: an untyped token, typed tokens, a
// mode token, a reference, a mode reference, a second non-scheme mode, and
// a token that opts out of inheritance.
export default {
  modes: {
    dark: '(prefers-color-scheme: dark)',
    contrast: '(prefers-contrast: more)',
  },
  tokens: {
    space: {
      x4: { value: '4px', type: 'dimension', preview: 'gap' },
      x16: { value: '16px', description: 'The default gap.', type: 'dimension', preview: 'gap' },
    },
    weight: { bold: { value: 700, type: 'fontWeight' } },
    family: { body: { value: 'Inter, sans-serif', type: 'fontFamily' } },
    ratio: { golden: { value: 1.618, type: 'number', inherits: false } },
    gray: {
      50: { value: '#fafafa', type: 'color' },
      900: { value: '#171717', type: 'color' },
    },
    bg: {
      page: { value: '{gray.50}', dark: '{gray.900}', type: 'color' },
      card: { value: '#ffffff', dark: '#1a1a1a', contrast: '#000000', type: 'color' },
    },
    content: {
      regular: { value: '#111111', dark: '#eeeeee', deprecated: 'use content.body', type: 'color' },
      body: { value: '{content.regular}', type: 'color' },
    },
  },
} satisfies Config;
