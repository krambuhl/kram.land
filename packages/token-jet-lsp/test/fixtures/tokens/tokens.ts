import { defineSchema, pattern, slots } from 'token-jet';

const spacing = pattern({ type: 'dimension' });
const color = pattern({ type: 'color' });
const colorDark = pattern({ type: 'color', modes: ['dark'] });
const colorDarkContrast = pattern({ type: 'color', modes: ['dark', 'contrast'] });

const schema = defineSchema({
  space: slots(['x4', 'x16'], spacing),
  weight: { bold: pattern({ type: 'fontWeight' }) },
  family: { body: pattern({ type: 'fontFamily' }) },
  ratio: { golden: pattern({ type: 'number' }) },
  gray: slots(['50', '900'], color),
  bg: { page: colorDark, card: colorDarkContrast },
  content: { regular: colorDark, body: color },
});

export default schema.defineTokens({
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
});
