function pascal(segment: string): string {
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function cssVariableName(path: string): string {
  return `--${path.split('.').join('-')}`;
}

// What a token resolves to in css and typescript alike: the var() reference.
export function cssVariableReference(path: string): string {
  return `var(${cssVariableName(path)})`;
}

// A single token's type is its PascalCase path.
export function typeName(path: string): string {
  return path.split('.').map(pascal).join('');
}

// Any union of tokens, whether a group or an entry in the types block, ends in
// Token so the name says whether it is one value or a set.
export function unionName(path: string): string {
  return `${typeName(path)}Token`;
}

export interface NamedType {
  name: string;
  source: string;
}

export function checkTypeNameCollisions(types: readonly NamedType[]): void {
  const seen = new Map<string, string>();
  for (const { name, source } of types) {
    const prior = seen.get(name);
    if (prior !== undefined) {
      throw new Error(`Type name "${name}" is produced by both ${prior} and ${source}.`);
    }
    seen.set(name, source);
  }
}
