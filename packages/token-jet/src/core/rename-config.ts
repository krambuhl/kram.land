// Renames a token's key in tokens.config.ts text. The config is TypeScript,
// so the edit is textual: the last segment of the path is a key in an object
// literal, and the rename changes that key where it sits at the path's depth.
// The caller re-loads the result and refuses to write if it does not parse
// to the expected token, which guards the edit without a parser.

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
export function renameConfigKey(text: string, from: string, to: string): string {
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
  let cursor = text.indexOf('tokens:');
  if (cursor < 0) throw new Error('Could not find the tokens block in the config.');
  for (const segment of fromSegments.slice(0, -1)) {
    const re = new RegExp(`${keyPattern(segment)}\\s*:\\s*\\{`, 'g');
    re.lastIndex = cursor;
    const m = re.exec(text);
    if (m === null) throw new Error(`Could not find "${segment}" on the way to "${from}" in the config.`);
    cursor = m.index + m[0].length;
  }
  const keyRe = new RegExp(`(\\n\\s*)${keyPattern(oldKey)}(\\s*:)`, 'g');
  keyRe.lastIndex = cursor;
  const m = keyRe.exec(text);
  if (m === null) throw new Error(`Could not find "${from}" in the config.`);
  const renamedKey = `${text.slice(0, m.index)}${m[1]}${keyLiteral(newKey)}${m[2]}${text.slice(m.index + m[0].length)}`;

  // Other tokens may reference the renamed one as `{from}`; those references
  // move with it, or the config would stop loading.
  const refRe = new RegExp(`\\{${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}`, 'g');
  return renamedKey.replace(refRe, `{${to}}`);
}
