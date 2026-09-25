import type { Modes, TokenLeaf, TokenTree, TokenValue } from './config.ts';

export interface Token {
  path: string;
  segments: string[];
  value: TokenValue;
  modes: Record<string, TokenValue>;
}

export function isLeaf(node: unknown): node is TokenLeaf<Modes> {
  return typeof node === 'object' && node !== null && 'value' in node;
}

// Walks the tree in source order and returns one entry per leaf. A leaf is any
// object with a value key; every other key on it is a mode override.
export function flatten(tree: TokenTree<Modes>, parent: string[] = []): Token[] {
  const out: Token[] = [];
  for (const [key, node] of Object.entries(tree)) {
    const segments = [...parent, key];
    if (isLeaf(node)) {
      const { value, ...modes } = node;
      out.push({ path: segments.join('.'), segments, value, modes: modes as Record<string, TokenValue> });
    } else {
      out.push(...flatten(node, segments));
    }
  }
  return out;
}
