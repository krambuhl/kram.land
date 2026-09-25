export interface SourceFile {
  file: string;
  text: string;
}

export interface Usage {
  file: string;
  path: string;
  line: number;
  column: number;
}

export interface RenamedFile extends SourceFile {
  changed: boolean;
}

// A token() call with a string literal argument. The literal-only rule means
// this is the whole grammar, so one pattern serves css, ts, tsx and astro.
// `\b` keeps `tokenize(` from matching. A call-shaped string such as
// "token('a.b')" inside quotes also matches: this is a text scan, not a parse,
// and such a string counts as a use rather than being missed.
const CALL = /\btoken\(\s*(['"])([^'"\n]+)\1\s*\)/g;

function position(text: string, index: number): { line: number; column: number } {
  let line = 1;
  let lineStart = 0;
  for (let i = 0; i < index; i++) {
    if (text.charCodeAt(i) === 10) {
      line++;
      lineStart = i + 1;
    }
  }
  return { line, column: index - lineStart + 1 };
}

export function findUsages(files: readonly SourceFile[]): Usage[] {
  const out: Usage[] = [];
  for (const { file, text } of files) {
    for (const match of text.matchAll(CALL)) {
      const pathIndex = match.index + match[0].indexOf(match[2]);
      out.push({ file, path: match[2], ...position(text, pathIndex) });
    }
  }
  return out;
}

// Rewrites token('from') to token('to') in every file, keeping each call's
// quote style. Only an exact path matches, never a prefix.
export function renameUsages(files: readonly SourceFile[], from: string, to: string): RenamedFile[] {
  return files.map(({ file, text }) => {
    const next = text.replace(CALL, (whole, quote: string, path: string) =>
      path === from ? `token(${quote}${to}${quote})` : whole
    );
    return { file, text: next, changed: next !== text };
  });
}
