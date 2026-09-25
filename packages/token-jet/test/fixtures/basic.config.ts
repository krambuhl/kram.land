import { defineConfig } from '../../src/index.ts';

export default defineConfig({
  modes: {
    dark: '(prefers-color-scheme: dark)',
  },
  tokens: {
    space: {
      x0: { value: '0px' },
      x4: { value: '4px' },
      x16: { value: '16px' },
    },
    bg: {
      page: {
        default: { value: '#ffffff', dark: '#040404' },
        hover: { value: '#f0f0f0', dark: '#1a1a1a' },
        pressed: { value: '#e0e0e0', dark: '#2a2a2a' },
      },
      base: {
        default: { value: '#f0f0f0', dark: '#1a1a1a' },
        hover: { value: '#e0e0e0', dark: '#2a2a2a' },
        pressed: { value: '#d0d0d0', dark: '#3a3a3a' },
      },
      elevated: {
        default: { value: '#ffffff', dark: '#2a2a2a' },
        hover: { value: '#f0f0f0', dark: '#3a3a3a' },
        pressed: { value: '#e0e0e0', dark: '#4a4a4a' },
      },
    },
    content: {
      regular: {
        default: { value: '#000000', dark: '#ffffff' },
        hover: { value: '#111111', dark: '#e0e0e0' },
      },
    },
  },
  types: {
    color: ['bg.**', 'content.**'],
    defaultColor: '**.default',
  },
});
