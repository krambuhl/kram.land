import { schema } from './schema.ts';

export default schema.defineTokens({
  space: {
    x0: { value: '0px' },
    x2: { value: '2px' },
    x4: { value: '4px' },
    x6: { value: '6px' },
    x8: { value: '8px' },
    x12: { value: '12px' },
    x16: { value: '16px' },
    x20: { value: '20px' },
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
  radius: {
    none: { value: '0px' },
    sm: { value: '0.25rem' },
    md: { value: '0.5rem' },
    lg: { value: '1rem' },
    pill: { value: '9999px' },
  },
  heading: {
    family: {
      value: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
    },
    weight: { value: 700 },
    lineHeight: { value: 1.4 },
    letterSpacing: { value: '0px' },
    size: {
      xs: { value: '1rem' },
      sm: { value: '1.1rem' },
      md: { value: '1.2rem' },
      lg: { value: '1.35rem' },
      xl: { value: '1.5rem' },
    },
  },
  body: {
    family: {
      value: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
    },
    weight: { value: 400 },
    lineHeight: { value: 1.5 },
    letterSpacing: { value: '0px' },
    size: {
      xs: { value: '0.75rem' },
      sm: { value: '0.875rem' },
      md: { value: '1rem' },
      lg: { value: '1.15rem' },
      xl: { value: '1.3rem' },
    },
  },
  data: {
    family: {
      value: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
    },
    weight: { value: 500 },
    lineHeight: { value: 1.5 },
    letterSpacing: { value: '0px' },
    size: {
      xs: { value: '0.75rem' },
      sm: { value: '0.875rem' },
      md: { value: '1rem' },
      lg: { value: '1.15rem' },
      xl: { value: '1.3rem' },
    },
  },
  page: { value: '#ffffff', dark: '#040404' },
  base: {
    surface: {
      default: { value: '#f3f3f3', dark: '#121212' },
      hover: { value: '#e5e5e5', dark: '#1a1a1a' },
      pressed: { value: '#d9d9d9', dark: '#242424' },
    },
    surfaceAlt: {
      default: { value: '#e5e5e5', dark: '#1a1a1a' },
      hover: { value: '#d9d9d9', dark: '#242424' },
      pressed: { value: '#c4c4c4', dark: '#2e2e2e' },
    },
    regular: {
      default: { value: '#040404', dark: '#ffffff' },
      hover: { value: '#030303', dark: '#ffffff' },
      pressed: { value: '#020202', dark: '#ffffff' },
    },
    muted: {
      default: { value: '#666666', dark: '#999999' },
      hover: { value: '#595959', dark: '#a6a6a6' },
      pressed: { value: '#4d4d4d', dark: '#b3b3b3' },
    },
    action: {
      default: { value: '#1d4ed8', dark: '#93c5fd' },
      hover: { value: '#1e40af', dark: '#bfdbfe' },
      pressed: { value: '#1e3a8a', dark: '#dbeafe' },
    },
    critical: {
      default: { value: '#b91c1c', dark: '#fca5a5' },
      hover: { value: '#991b1b', dark: '#fecaca' },
      pressed: { value: '#7f1d1d', dark: '#fee2e2' },
    },
    warning: {
      default: { value: '#a16207', dark: '#fcd34d' },
      hover: { value: '#854d0e', dark: '#fde68a' },
      pressed: { value: '#713f12', dark: '#fef3c7' },
    },
    success: {
      default: { value: '#15803d', dark: '#86efac' },
      hover: { value: '#166534', dark: '#bbf7d0' },
      pressed: { value: '#14532d', dark: '#dcfce7' },
    },
  },
  inverted: {
    surface: {
      default: { value: '#121212', dark: '#f3f3f3' },
      hover: { value: '#1a1a1a', dark: '#e5e5e5' },
      pressed: { value: '#242424', dark: '#d9d9d9' },
    },
    surfaceAlt: {
      default: { value: '#1a1a1a', dark: '#e5e5e5' },
      hover: { value: '#242424', dark: '#d9d9d9' },
      pressed: { value: '#2e2e2e', dark: '#c4c4c4' },
    },
    regular: {
      default: { value: '#ffffff', dark: '#040404' },
      hover: { value: '#ffffff', dark: '#030303' },
      pressed: { value: '#ffffff', dark: '#020202' },
    },
    muted: {
      default: { value: '#999999', dark: '#666666' },
      hover: { value: '#a6a6a6', dark: '#595959' },
      pressed: { value: '#b3b3b3', dark: '#4d4d4d' },
    },
    action: {
      default: { value: '#93c5fd', dark: '#1d4ed8' },
      hover: { value: '#bfdbfe', dark: '#1e40af' },
      pressed: { value: '#dbeafe', dark: '#1e3a8a' },
    },
    critical: {
      default: { value: '#fca5a5', dark: '#b91c1c' },
      hover: { value: '#fecaca', dark: '#991b1b' },
      pressed: { value: '#fee2e2', dark: '#7f1d1d' },
    },
    warning: {
      default: { value: '#fcd34d', dark: '#a16207' },
      hover: { value: '#fde68a', dark: '#854d0e' },
      pressed: { value: '#fef3c7', dark: '#713f12' },
    },
    success: {
      default: { value: '#86efac', dark: '#15803d' },
      hover: { value: '#bbf7d0', dark: '#166534' },
      pressed: { value: '#dcfce7', dark: '#14532d' },
    },
  },
  critical: {
    surface: {
      default: { value: '#fef2f2', dark: '#2a0a0a' },
      hover: { value: '#fee2e2', dark: '#3a1010' },
      pressed: { value: '#fecaca', dark: '#4a1515' },
    },
    surfaceAlt: {
      default: { value: '#fee2e2', dark: '#3a1010' },
      hover: { value: '#fecaca', dark: '#4a1515' },
      pressed: { value: '#fca5a5', dark: '#5a1a1a' },
    },
    regular: {
      default: { value: '#7f1d1d', dark: '#fee2e2' },
      hover: { value: '#6b1818', dark: '#fef2f2' },
      pressed: { value: '#571414', dark: '#ffffff' },
    },
    muted: {
      default: { value: '#b91c1c', dark: '#fca5a5' },
      hover: { value: '#991b1b', dark: '#fecaca' },
      pressed: { value: '#7f1d1d', dark: '#fee2e2' },
    },
    action: {
      default: { value: '#991b1b', dark: '#fecaca' },
      hover: { value: '#7f1d1d', dark: '#fee2e2' },
      pressed: { value: '#651616', dark: '#fef2f2' },
    },
  },
  warning: {
    surface: {
      default: { value: '#fffbeb', dark: '#2a1f05' },
      hover: { value: '#fef3c7', dark: '#3a2a08' },
      pressed: { value: '#fde68a', dark: '#4a350b' },
    },
    surfaceAlt: {
      default: { value: '#fef3c7', dark: '#3a2a08' },
      hover: { value: '#fde68a', dark: '#4a350b' },
      pressed: { value: '#fcd34d', dark: '#5a400e' },
    },
    regular: {
      default: { value: '#713f12', dark: '#fef3c7' },
      hover: { value: '#5f350f', dark: '#fffbeb' },
      pressed: { value: '#4d2b0c', dark: '#ffffff' },
    },
    muted: {
      default: { value: '#a16207', dark: '#fcd34d' },
      hover: { value: '#854d0e', dark: '#fde68a' },
      pressed: { value: '#713f12', dark: '#fef3c7' },
    },
    action: {
      default: { value: '#854d0e', dark: '#fde68a' },
      hover: { value: '#713f12', dark: '#fef3c7' },
      pressed: { value: '#5a320e', dark: '#fffbeb' },
    },
  },
  success: {
    surface: {
      default: { value: '#f0fdf4', dark: '#052e16' },
      hover: { value: '#dcfce7', dark: '#0a3a1e' },
      pressed: { value: '#bbf7d0', dark: '#0f4526' },
    },
    surfaceAlt: {
      default: { value: '#dcfce7', dark: '#0a3a1e' },
      hover: { value: '#bbf7d0', dark: '#0f4526' },
      pressed: { value: '#86efac', dark: '#14532d' },
    },
    regular: {
      default: { value: '#14532d', dark: '#dcfce7' },
      hover: { value: '#104526', dark: '#f0fdf4' },
      pressed: { value: '#0c371e', dark: '#ffffff' },
    },
    muted: {
      default: { value: '#15803d', dark: '#86efac' },
      hover: { value: '#166534', dark: '#bbf7d0' },
      pressed: { value: '#14532d', dark: '#dcfce7' },
    },
    action: {
      default: { value: '#166534', dark: '#bbf7d0' },
      hover: { value: '#14532d', dark: '#dcfce7' },
      pressed: { value: '#0f3f22', dark: '#f0fdf4' },
    },
  },
});
