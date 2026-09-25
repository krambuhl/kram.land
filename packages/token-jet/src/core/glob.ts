// Path patterns over dot-separated token paths. `*` matches exactly one
// segment and `**` matches any number, including none. Anything else is
// matched literally.
function globToRegExp(pattern: string): RegExp {
  const segment = '[^.]+';
  const parts = pattern.split('.').map((part) => {
    if (part === '**') return '**';
    if (part === '*') return segment;
    return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  });

  // Build left to right. A `**` absorbs the dot that would join it to the
  // next part, so that matching zero segments leaves no dangling dot.
  let source = '';
  let needDot = false;
  for (const part of parts) {
    if (part === '**') {
      // zero or more segments; each carries the dot that precedes it, or, at
      // the start of the pattern, the dot that follows it
      source += needDot ? `(?:\\.${segment})*` : `(?:${segment}\\.)*`;
      // when `**` started the pattern the next part must not add a dot
      needDot = needDot ? needDot : false;
      continue;
    }
    source += (needDot ? '\\.' : '') + part;
    needDot = true;
  }
  // `**` alone becomes `(?:seg\.)*`, which cannot match a full path; allow a
  // bare trailing segment in that case.
  if (parts.length === 1 && parts[0] === '**') source = `${segment}(?:\\.${segment})*`;
  return new RegExp(`^${source}$`);
}

export function matchGlob(pattern: string, paths: readonly string[]): string[] {
  const re = globToRegExp(pattern);
  const matched = paths.filter((path) => re.test(path));
  if (matched.length === 0) {
    throw new Error(`Pattern "${pattern}" matches no tokens.`);
  }
  return matched;
}
