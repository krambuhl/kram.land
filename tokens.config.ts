export const modes = {
  dark: '(prefers-color-scheme: dark)',
};

export const tokens = {
  space: {
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
      pressed: { value: '#222222', dark: '#d0d0d0' },
    },
    muted: {
      default: { value: '#666666', dark: '#999999' },
      hover: { value: '#777777', dark: '#888888' },
      pressed: { value: '#888888', dark: '#777777' },
    },
  },
};

export const types = {
  color: ['bg.*', 'content.*'],
  defaultColor: '*.default',
};

// we can build
// `token-cli generate-tokens` to generate from the tokens.config.ts file

// like the token type generation
// @/generated-tokens/types.ts
//
// export type SpaceX0 = 'var(--space-x0)'
// export type SpaceX4 = 'var(--space-x4)'
// export type SpaceX8 = 'var(--space-x8)'
// export type SpaceX12 = 'var(--space-x12)'
// ...
// export type SpaceToken = SpaceX0 | SpaceX4 | SpaceX8 | SpaceX12 | ...
// export type BgPage = BgPageDefault | BgPageHover | BgPagePressed
// export type BgBase = BgBaseDefault | BgBaseHover | BgBasePressed
// export type BgElevated = BgElevatedDefault | BgElevatedHover | BgElevatedPressed
// export type ContentRegular = ContentRegularDefault | ContentRegularHover | ContentRegularPressed
// export type ContentMuted = ContentMutedDefault | ContentMutedHover | ContentMutedPressed
// ...
// export type ColorToken = BgPage | BgBase | BgElevated | ContentRegular | ContentMuted
// export type DefaultColorToken = BgPageDefault | BgBaseDefault | BgElevatedDefault | ContentRegularDefault | ContentMutedDefault

// like the token generation
// @/generated-tokens/tokens.css
//
// :root {
//     --space-x0: 0px;
//     --space-x4: 4px;
//     --space-x8: 8px;
//     --space-x12: 12px;
//     ...
// }

// to inject tokens into the application
// global.css
// @import '@/generated-tokens/tokens.css';

// in css modules we can use the tokens like this:
// where `token` is a postcss function that returns the css variable reference
//
//  .root {
//     padding: token('space.x16'); // var(--space-x16)
//     width: token('size.x192'); // var(--size-x192)
//     height: token('size.x192'); // var(--size-x192)
//     background-color: token('bg.page'); // var(--bg-page)
//     color: token('content.regular'); // var(--content-regular)
// }

// in javascript we can use the tokens like this:
// where tokens is an object with css variable references as values
//
// import { tokens } from '@/generated-tokens';
//
// token('space.x16'); // var(--space-x16)
// token('size.x192'); // var(--size-x192)
// token('bg.page'); // var(--bg-page)
// token('content.regular'); // var(--content-regular)
