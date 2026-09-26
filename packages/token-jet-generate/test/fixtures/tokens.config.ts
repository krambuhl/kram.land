import { defineConfig } from 'token-jet';

// Enough shape to show every emit path: an untyped token, typed tokens, a
// mode token, a reference, a mode reference, a second non-scheme mode, and
// a token that opts out of inheritance.
export default defineConfig({
  modes: {
    dark: '(prefers-color-scheme: dark)',
    contrast: '(prefers-contrast: more)',
  },
  tokens: {
    space: {
      $group: { type: 'dimension' },
      x4: { value: '4px' },
      x16: { value: '16px', description: 'The default gap.' },
    },
    weight: { bold: { value: 700, type: 'fontWeight' } },
    family: { body: { value: 'Inter, sans-serif', type: 'fontFamily' } },
    ratio: { golden: { value: 1.618, type: 'number', inherits: false } },
    gray: {
      $group: { type: 'color' },
      50: { value: '#fafafa' },
      900: { value: '#171717' },
    },
    bg: {
      $group: { type: 'color' },
      page: { value: '{gray.50}', dark: '{gray.900}' },
      card: { value: '#ffffff', dark: '#1a1a1a', contrast: '#000000' },
    },
    content: {
      $group: { type: 'color' },
      regular: { value: '#111111', dark: '#eeeeee', deprecated: 'use content.body' },
      body: { value: '{content.regular}' },
    },
  },
  types: {
    color: ['gray.**', 'bg.**', 'content.**'],
    surface: 'bg.*',
  },
});
