// The nearest path by edit distance, for "did you mean" messages. Shared by
// the postcss plugin and the language server so both suggest the same thing.
export function nearest(target: string, candidates: readonly string[]): string | undefined {
  let best: string | undefined;
  let bestDistance = Infinity;
  for (const candidate of candidates) {
    const d = distance(target, candidate);
    if (d < bestDistance) {
      bestDistance = d;
      best = candidate;
    }
  }
  // A suggestion further than half the target's length is noise.
  return bestDistance <= Math.max(2, target.length / 2) ? best : undefined;
}

function distance(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = temp;
    }
  }
  return prev[b.length];
}
