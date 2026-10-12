import { defineCss } from '../../src/index.ts';

export default defineCss({
  modes: {
    dark: { media: '(prefers-color-scheme: dark)', scheme: true },
    contrast: { media: '(prefers-contrast: more)' },
  },
});
