import { defineCss } from 'token-jet';

export default defineCss({
  modes: {
    dark: { media: '(prefers-color-scheme: dark)', scheme: true },
  },
});
