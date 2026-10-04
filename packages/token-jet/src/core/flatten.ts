import { METADATA_KEYS } from './config.ts';
import type { Modes, Preview, TokenLeaf, TokenTree, TokenType, TokenValue } from './config.ts';

export interface Token {
  path: string;
  segments: string[];
  value: TokenValue;
  modes: Record<string, TokenValue>;
  type?: TokenType;
  description?: string;
  deprecated?: boolean | string;
  inherits?: boolean;
  tags?: readonly string[];
  preview?: Preview;
}

const metadataKeys: ReadonlySet<string> = new Set(METADATA_KEYS);

export function isLeaf(node: unknown): node is TokenLeaf<Modes> {
  return typeof node === 'object' && node !== null && 'value' in node;
}

// Walks the tree in source order and returns one entry per leaf. A leaf is any
// object with a value key; on it, metadata keys are metadata and every other
// key is a mode override.
export function flatten(tree: TokenTree<Modes>, parent: string[] = []): Token[] {
  const out: Token[] = [];
  for (const [key, node] of Object.entries(tree)) {
    if (typeof node !== 'object' || node === null) continue;
    const segments = [...parent, key];
    if (isLeaf(node)) {
      const modes: Record<string, TokenValue> = {};
      for (const [k, v] of Object.entries(node)) {
        if (k !== 'value' && !metadataKeys.has(k)) modes[k] = v as TokenValue;
      }
      out.push({
        path: segments.join('.'),
        segments,
        value: node.value,
        modes,
        ...(node.type !== undefined && { type: node.type }),
        ...(node.description !== undefined && { description: node.description }),
        ...(node.deprecated !== undefined && { deprecated: node.deprecated }),
        ...(node.inherits !== undefined && { inherits: node.inherits }),
        ...(node.tags !== undefined && { tags: node.tags }),
        ...(node.preview !== undefined && { preview: node.preview }),
      });
    } else {
      out.push(...flatten(node as TokenTree<Modes>, segments));
    }
  }
  return out;
}
