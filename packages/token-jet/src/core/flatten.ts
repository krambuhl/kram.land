import { GROUP_KEY, METADATA_KEYS } from './config.ts';
import type { Modes, TokenLeaf, TokenTree, TokenType, TokenValue } from './config.ts';

export interface Token {
  path: string;
  segments: string[];
  value: TokenValue;
  modes: Record<string, TokenValue>;
  type?: TokenType;
  description?: string;
  deprecated?: boolean | string;
  // The type declared on the nearest enclosing group, if any.
  groupType?: TokenType;
}

const metadataKeys: ReadonlySet<string> = new Set(METADATA_KEYS);

export function isLeaf(node: unknown): node is TokenLeaf<Modes> {
  return typeof node === 'object' && node !== null && 'value' in node;
}

// Walks the tree in source order and returns one entry per leaf. A leaf is any
// object with a value key; on it, metadata keys are metadata and every other
// key is a mode override. A group's `$group.type` is inherited by the leaves below.
export function flatten(tree: TokenTree<Modes>, parent: string[] = [], groupType?: TokenType): Token[] {
  const out: Token[] = [];
  const ownType = tree.$group?.type ?? groupType;
  for (const [key, node] of Object.entries(tree)) {
    if (key === GROUP_KEY || typeof node !== 'object' || node === null) continue;
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
        ...(ownType !== undefined && { groupType: ownType }),
      });
    } else {
      out.push(...flatten(node as TokenTree<Modes>, segments, ownType));
    }
  }
  return out;
}
