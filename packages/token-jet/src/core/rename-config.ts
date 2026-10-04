// Renames a token's key. The file is TypeScript, so the edit is textual:
// renameConfigKey walks parent keys from defineTokens( to the leaf, and
// renameSchemaKey renames the key in the schema shape when it appears exactly
// once.

const IDENT = /^[A-Za-z_$][\w$]*$/;

function keyPattern(key: string): string {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return IDENT.test(key) ? `(?:${escaped}|'${escaped}'|"${escaped}")` : `(?:'${escaped}'|"${escaped}"|${escaped})`;
}

function keyLiteral(key: string): string {
  return IDENT.test(key) ? key : `'${key}'`;
}

// Finds the object-literal key for the last path segment by walking the
// parent keys in order, each opening a brace, then rewrites the key.
export function renameConfigKey(text: string, from: string, to: string, anchor = 'defineTokens('): string {
  const fromSegments = from.split('.');
  const toSegments = to.split('.');
  if (
    fromSegments.length !== toSegments.length ||
    fromSegments.slice(0, -1).join('.') !== toSegments.slice(0, -1).join('.')
  ) {
    throw new Error(`rename can only change the last segment: "${from}" to "${to}" changes the group.`);
  }
  const oldKey = fromSegments[fromSegments.length - 1];
  const newKey = toSegments[toSegments.length - 1];

  // Walk to the parent object by matching each ancestor key followed by `: {`.
  let cursor = text.indexOf(anchor);
  if (cursor < 0) throw new Error(`Could not find ${anchor} in the config.`);
  for (const segment of fromSegments.slice(0, -1)) {
    const re = new RegExp(`${keyPattern(segment)}\\s*:\\s*\\{`, 'g');
    re.lastIndex = cursor;
    const m = re.exec(text);
    if (m === null) throw new Error(`Could not find "${segment}" on the way to "${from}" in the config.`);
    cursor = m.index + m[0].length;
  }
  const keyRe = new RegExp(`([\\s{,]\\s*)${keyPattern(oldKey)}(\\s*:)`, 'g');
  keyRe.lastIndex = cursor;
  const m = keyRe.exec(text);
  if (m === null) throw new Error(`Could not find "${from}" in the config.`);
  const renamedKey = `${text.slice(0, m.index)}${m[1]}${keyLiteral(newKey)}${m[2]}${text.slice(m.index + m[0].length)}`;

  // Other tokens may reference the renamed one as `{from}`; those references
  // move with it, or the config would stop loading.
  const refRe = new RegExp(`\\{${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}`, 'g');
  return renamedKey.replace(refRe, `{${to}}`);
}

// Renames a key in a schema's shape, where it is an object key or a quoted
// string. A key can repeat across groups or come from a helper, so the rename
// only goes ahead when the key appears exactly once; otherwise it reports the count.
export function renameSchemaKey(text: string, from: string, to: string): { text: string } | { occurrences: number } {
  const oldKey = from.split('.').at(-1) ?? from;
  const newKey = to.split('.').at(-1) ?? to;
  const escaped = oldKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const asKey = IDENT.test(oldKey) ? `(?<=[\\s{,])${escaped}(?=\\s*:)` : '(?!)';
  const occurrence = new RegExp(`${asKey}|'${escaped}'|"${escaped}"`, 'g');
  const matches = [...text.matchAll(occurrence)];
  if (matches.length !== 1) return { occurrences: matches.length };
  const [match] = matches;
  const replacement = match[0].startsWith("'") || match[0].startsWith('"') ? `'${newKey}'` : keyLiteral(newKey);
  return { text: `${text.slice(0, match.index)}${replacement}${text.slice(match.index + match[0].length)}` };
}
