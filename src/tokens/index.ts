export const tokens = {
  breakpoints: {
    xs: "min-width: 0rem",
    sm: "min-width: 32rem",
    md: "min-width: 48rem",
    lg: "min-width: 64rem",
    xl: "min-width: 80rem",
  },
  size: {
    x0: "var(--size-0)",
    x4: "var(--size-4)",
    x8: "var(--size-8)",
    x12: "var(--size-12)",
    x16: "var(--size-16)",
    x24: "var(--size-24)",
    x32: "var(--size-32)",
    x48: "var(--size-48)",
    x64: "var(--size-64)",
    x96: "var(--size-96)",
    x128: "var(--size-128)",
    x192: "var(--size-192)",
    x256: "var(--size-256)",
    x384: "var(--size-384)",
    x512: "var(--size-512)",
    x640: "var(--size-640)",
    x768: "var(--size-768)",
    x896: "var(--size-896)",
    x1024: "var(--size-1024)",
    x1152: "var(--size-1152)",
    x1280: "var(--size-1280)",
    x1408: "var(--size-1408)",
    x1536: "var(--size-1536)",
    x1664: "var(--size-1664)",
    x1792: "var(--size-1792)",
    x1920: "var(--size-1920)",
  },
  fontFamily: {
    heading: "var(--font-family-header)",
    body: "var(--font-family-body)",
    data: "var(--font-family-data)",
  },
  fontWeight: {
    heading: "var(--font-weight-header)",
    body: "var(--font-weight-body)",
    data: "var(--font-weight-data)",
  },
  lineHeight: {
    heading: "var(--line-height-header)",
    body: "var(--line-height-body)",
    data: "var(--line-height-data)",
  },
  fontSize: {
    heading: {
      sm: "var(--font-size-header-sm)",
      md: "var(--font-size-header-md)",
      lg: "var(--font-size-header-lg)",
    },
    body: {
      sm: "var(--font-size-body-sm)",
      md: "var(--font-size-body-md)",
      lg: "var(--font-size-body-lg)",
    },
    data: {
      sm: "var(--font-size-data-sm)",
      md: "var(--font-size-data-md)",
      lg: "var(--font-size-data-lg)",
    },
  },
  radius: {
    container: "var(--radius-container)",
    sm: "var(--radius-sm)",
    md: "var(--radius-md)",
    lg: "var(--radius-lg)",
  },
  bg: {
    base: "var(--bg-base)",
    alt: "var(--bg-alt)",
    elevated: "var(--bg-elevated)",
    inverted: "var(--bg-inverted)",
  },
  content: {
    default: "var(--content-default)",
    hover: "var(--content-hover)",
    pressed: "var(--content-pressed)",
  },
  action: {
    default: "var(--action-default)",
    hover: "var(--action-hover)",
    pressed: "var(--action-pressed)",
  },
  muted: {
    default: "var(--muted-default)",
    hover: "var(--muted-hover)",
    pressed: "var(--muted-pressed)",
  },
  inverted: {
    default: "var(--inverted-default)",
    hover: "var(--inverted-hover)",
    pressed: "var(--inverted-pressed)",
  },
} as const;
