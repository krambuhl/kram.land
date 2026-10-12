import { defineSchema, pattern, schemaToConfig, slots } from 'token-jet';

// Enough shape to show every emit path: a mode token, a reference, a mode
// reference, a second non-scheme mode, an inherits: false token and tags that span groups.
const spacing = pattern({ type: 'dimension', tags: ['spacing'], preview: 'gap' });
const surface = pattern({ type: 'color', tags: ['color', 'surface'], modes: ['dark'] });
const surfaceContrast = pattern({ type: 'color', tags: ['color', 'surface'], modes: ['dark', 'contrast'] });
const color = pattern({ type: 'color', tags: ['color'] });
const colorDark = pattern({ type: 'color', tags: ['color'], modes: ['dark'] });

const schema = defineSchema({
  space: slots(['x4', 'x16'], spacing),
  weight: { bold: pattern({ type: 'fontWeight' }) },
  family: { body: pattern({ type: 'fontFamily' }) },
  ratio: { golden: pattern({ type: 'number' }) },
  gray: slots(['50', '900'], color),
  bg: { page: surface, card: surfaceContrast },
  content: { regular: colorDark, body: color },
});

export default schemaToConfig(
  schema.defineTokens({
    space: {
      x4: { value: '4px' },
      x16: { value: '16px', description: 'The default gap.' },
    },
    weight: { bold: { value: 700 } },
    family: { body: { value: 'Inter, sans-serif' } },
    ratio: { golden: { value: 1.618, inherits: false } },
    gray: {
      50: { value: '#fafafa' },
      900: { value: '#171717' },
    },
    bg: {
      page: { value: '{gray.50}', dark: '{gray.900}' },
      card: { value: '#ffffff', dark: '#1a1a1a', contrast: '#000000' },
    },
    content: {
      regular: { value: '#111111', dark: '#eeeeee', deprecated: 'use content.body' },
      body: { value: '{content.regular}' },
    },
  }),
  {
    modes: {
      dark: { media: '(prefers-color-scheme: dark)', scheme: true },
      contrast: { media: '(prefers-contrast: more)' },
    },
  }
);
