import type { Config, Modes } from './config.ts';
import type { Token } from './flatten.ts';
import { isLeaf } from './flatten.ts';

const RESERVED = new Set(['value']);

// Checks what the types cannot: no token or group is named after a reserved
// key, every mode key on a leaf exists in modes, and no group is empty.
export function validate(config: Config<Modes>, tokens: readonly Token[]): void {
  const modeNames = new Set(Object.keys(config.modes));
  const reserved = new Set([...RESERVED, ...modeNames]);

  // Reserved names are checked on the raw tree. A group named `value` would
  // make its parent look like a leaf to flatten(), hiding the mistake.
  checkTree(config.tokens, [], reserved);

  for (const token of tokens) {
    for (const mode of Object.keys(token.modes)) {
      if (!modeNames.has(mode)) {
        throw new Error(`Token "${token.path}" has a value for mode "${mode}", which is not in modes.`);
      }
    }
  }
}

function checkTree(tree: object, parent: string[], reserved: ReadonlySet<string>): void {
  const entries = Object.entries(tree);
  if (entries.length === 0) {
    throw new Error(`Group "${parent.join('.')}" has no tokens.`);
  }
  for (const [key, node] of entries) {
    if (typeof node !== 'object' || node === null) continue;
    const path = [...parent, key];
    // A child that is itself an object is a token or a group, and neither may
    // take a reserved name. A reserved key holding a primitive is a mode value.
    if (reserved.has(key)) {
      throw new Error(`"${path.join('.')}" uses the reserved name "${key}".`);
    }
    if (isLeaf(node)) {
      // A leaf whose value is an object is really a group named `value`.
      if (typeof node.value === 'object') {
        throw new Error(`"${path.join('.')}.value" uses the reserved name "value".`);
      }
      continue;
    }
    checkTree(node, path, reserved);
  }
}
