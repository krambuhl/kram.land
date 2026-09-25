import type { DtcgNode } from './dtcg.ts';
import { fromDtcg } from './dtcg-import.ts';
import { flatten } from './flatten.ts';
import type { Token } from './flatten.ts';
import { inferType } from './metadata.ts';

export interface DiffFinding {
  path: string;
  kind: 'missing' | 'extra' | 'changed';
  mode?: string;
  ours?: string;
  theirs?: string;
}

function comparable(token: Token, value: unknown): string | undefined {
  if (value === undefined) return undefined;
  const text = String(value);
  return inferType(token) === 'color' ? text.toLowerCase() : text;
}

// Compares two DTCG files by token path. Both sides are read back to config
// form first, so hex case and component rounding in a Figma export do not
// count as differences.
export function diffDtcg(ours: DtcgNode, theirs: DtcgNode): DiffFinding[] {
  const mine = new Map(flatten(fromDtcg(ours).tokens).map((t) => [t.path, t]));
  const other = new Map(flatten(fromDtcg(theirs).tokens).map((t) => [t.path, t]));
  const findings: DiffFinding[] = [];

  for (const path of mine.keys()) if (!other.has(path)) findings.push({ path, kind: 'missing' });
  for (const path of other.keys()) if (!mine.has(path)) findings.push({ path, kind: 'extra' });

  for (const [path, a] of mine) {
    const b = other.get(path);
    if (b === undefined) continue;
    const modes = [...new Set([...Object.keys(a.modes), ...Object.keys(b.modes)])];
    for (const mode of ['base', ...modes]) {
      const left = mode === 'base' ? a.value : a.modes[mode];
      const right = mode === 'base' ? b.value : b.modes[mode];
      if (comparable(a, left) === comparable(a, right)) continue;
      findings.push({
        path,
        kind: 'changed',
        mode,
        ours: left === undefined ? undefined : String(left),
        theirs: right === undefined ? undefined : String(right),
      });
    }
  }
  return findings;
}

export function formatDiff(findings: readonly DiffFinding[]): string[] {
  return findings.map((f) => {
    switch (f.kind) {
      case 'missing':
        return `${f.path}: missing from the export`;
      case 'extra':
        return `${f.path}: in the export only`;
      case 'changed':
        return `${f.path} in ${f.mode}: ${f.ours ?? 'no value'} here, ${f.theirs === undefined ? 'no value' : f.theirs} in the export`;
    }
  });
}
