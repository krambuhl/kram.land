import { defineSchema, pattern, slots } from 'token-jet';

// basic patterns:
const spacing = pattern({ type: 'dimension', tags: ['spacing'], preview: 'gap' });
const sizing = pattern({ type: 'dimension', tags: ['sizing'], preview: 'bar' });
const radius = pattern({ type: 'dimension', tags: ['border-radius'], preview: 'corner' });
const fontFamily = pattern({ type: 'fontFamily', tags: ['font-family'], preview: 'text' });
const fontWeight = pattern({ type: 'fontWeight', tags: ['font-weight'], preview: 'text' });
const fontSize = pattern({ type: 'dimension', tags: ['font-size'], preview: 'text' });
const lineHeight = pattern({ type: 'number', tags: ['line-height'], preview: 'paragraph' });
const letterSpacing = pattern({ type: 'dimension', tags: ['letter-spacing'] });
const color = <const Tags extends readonly string[]>(...tags: Tags) =>
  pattern({ type: 'color', tags: ['color', ...tags], preview: 'swatch', modes: ['dark'] });

// compound patterns:
const typeBundle = <const Size extends string>(sizes: readonly Size[]) => ({
  family: fontFamily,
  weight: fontWeight,
  lineHeight: lineHeight,
  letterSpacing: letterSpacing,
  size: slots(sizes, fontSize),
});

// stateful colors
const statefulColor = <const Tag extends string>(...tags: Tag[]) => ({
  default: color('state-default', ...tags),
  hover: color('state-hover', ...tags),
  pressed: color('state-pressed', ...tags),
});

const surfaceColors = slots(['surface', 'surfaceAlt'], statefulColor('surface'));
const contentColors = slots(['regular', 'muted', 'action'], statefulColor('content'));
const intentContentColors = slots(['critical', 'warning', 'success'], statefulColor('content', 'intent'));

const neutralContexts = {
  base: { ...surfaceColors, ...contentColors, ...intentContentColors },
  inverted: { ...surfaceColors, ...contentColors, ...intentContentColors },
};
const intentContexts = {
  critical: { ...surfaceColors, ...contentColors },
  warning: { ...surfaceColors, ...contentColors },
  success: { ...surfaceColors, ...contentColors },
};

export const schema = defineSchema({
  modes: {
    dark: '(prefers-color-scheme: dark)',
  },
  shape: {
    // dimensions
    space: slots(
      ['x0', 'x2', 'x4', 'x6', 'x8', 'x12', 'x16', 'x20', 'x24', 'x32', 'x48', 'x64', 'x80', 'x96', 'x128'],
      spacing
    ),
    size: slots(
      [
        'x192',
        'x256',
        'x384',
        'x512',
        'x640',
        'x768',
        'x896',
        'x1024',
        'x1152',
        'x1280',
        'x1408',
        'x1536',
        'x1664',
        'x1792',
        'x1920',
      ],
      sizing
    ),
    radius: slots(['none', 'sm', 'md', 'lg', 'pill'], radius),

    // typography
    heading: typeBundle(['xs', 'sm', 'md', 'lg', 'xl']),
    body: typeBundle(['xs', 'sm', 'md', 'lg', 'xl']),
    data: typeBundle(['xs', 'sm', 'md', 'lg', 'xl']),

    // colors
    page: color(),
    ...neutralContexts,
    ...intentContexts,
  },
});
