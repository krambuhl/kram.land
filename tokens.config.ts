import { defineConfig } from 'token-jet';

// The site's tokens. Spacing and widths are px; type sizes are rem so text
// follows the browser's font-size setting. Colour tokens carry a dark value.
export default defineConfig({
  modes: {
    dark: '(prefers-color-scheme: dark)',
  },
  tokens: {
    space: {
      $group: { type: 'dimension' },
      x0: { value: '0px' },
      x4: { value: '4px' },
      x8: { value: '8px' },
      x12: { value: '12px' },
      x16: { value: '16px' },
      x24: { value: '24px' },
      x32: { value: '32px' },
      x48: { value: '48px' },
      x64: { value: '64px' },
      x80: { value: '80px' },
      x96: { value: '96px' },
      x128: { value: '128px' },
    },
    size: {
      $group: { type: 'dimension' },
      x192: { value: '192px' },
      x256: { value: '256px' },
      x384: { value: '384px' },
      x512: { value: '512px' },
      x640: { value: '640px' },
      x768: { value: '768px' },
      x896: { value: '896px' },
      x1024: { value: '1024px' },
      x1152: { value: '1152px' },
      x1280: { value: '1280px' },
      x1408: { value: '1408px' },
      x1536: { value: '1536px' },
      x1664: { value: '1664px' },
      x1792: { value: '1792px' },
      x1920: { value: '1920px' },
    },
    font: {
      family: {
        $group: { type: 'fontFamily' },
        base: {
          value: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
        },
        header: { value: '{font.family.base}' },
        body: { value: '{font.family.base}' },
        data: { value: '{font.family.base}' },
      },
      size: {
        $group: { type: 'dimension' },
        base: { value: '1rem' },
        header: {
          xl: { value: '1.5rem' },
          lg: { value: '1.35rem' },
          md: { value: '1.2rem' },
          sm: { value: '1.1rem' },
          xs: { value: '1rem' },
        },
        body: {
          xl: { value: '1.3rem' },
          lg: { value: '1.15rem' },
          md: { value: '1rem' },
          sm: { value: '0.875rem' },
          xs: { value: '0.75rem' },
        },
        data: {
          xl: { value: '1.3rem' },
          lg: { value: '1.15rem' },
          md: { value: '1rem' },
          sm: { value: '0.875rem' },
          xs: { value: '0.75rem' },
        },
      },
      weight: {
        $group: { type: 'fontWeight' },
        header: { value: 700 },
        body: { value: 400 },
        data: { value: 500 },
      },
    },
    lineHeight: {
      $group: { type: 'number' },
      header: { value: 1.4 },
      body: { value: 1.5 },
      data: { value: 1.5 },
    },
    radius: {
      $group: { type: 'dimension' },
      container: { value: '3rem' },
      lg: { value: '1rem' },
      md: { value: '0.5rem' },
      sm: { value: '0.25rem' },
    },
    bg: {
      $group: { type: 'color' },
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
      $group: { type: 'color' },
      regular: {
        default: { value: '#000000', dark: '#ffffff' },
        hover: { value: '#111111', dark: '#e0e0e0' },
        pressed: { value: '#222222', dark: '#d0d0d0' },
      },
      muted: {
        default: { value: '#666666', dark: '#999999' },
        hover: { value: '#777777', dark: '#888888' },
        pressed: { value: '#888888', dark: '#777777' },
      },
    },
  },
  types: {
    color: ['bg.**', 'content.**'],
  },
});
