import { emitManifest, matchGlob } from 'token-jet';
import type { ManifestToken, OutputFile, ResolvedTokens, Union } from 'token-jet';

export type { ManifestToken, OutputFile, ResolvedTokens, Union } from 'token-jet';
export { cssModuleClass } from './templates/css-module-class.ts';
export type { CssModuleClassOptions } from './templates/css-module-class.ts';
export { storyPerToken } from './templates/story-per-token.ts';
export type { StoryPerTokenOptions } from './templates/story-per-token.ts';
export { tsRecord } from './templates/ts-record.ts';
export type { TsRecordOptions } from './templates/ts-record.ts';

export interface EntryContext {
  // The entry's key in the config. Output files are named from it.
  name: string;
  select: string;
  // The union the selection came from, when select named one.
  union?: Union;
  // Module specifier of the generated tokens, as written into each file's
  // import, so it is resolved from the output directory.
  tokens: string;
  resolved: ResolvedTokens;
}

export interface Template<Fragment = unknown> {
  fragment(token: ManifestToken, context: EntryContext): Fragment;
  aggregate(fragments: Fragment[], context: EntryContext): OutputFile[];
}

export interface Entry<Fragment = unknown> {
  select: string;
  template: Template<Fragment>;
}

export interface GenerateOptions {
  tokens?: string;
}

export interface GenerateConfig {
  entries: Record<string, Entry>;
  tokens: string;
}

export const DEFAULT_TOKENS_SPECIFIER = './tokens';

export function defineGenerate(entries: Record<string, Entry>, options: GenerateOptions = {}): GenerateConfig {
  return { entries, tokens: options.tokens ?? DEFAULT_TOKENS_SPECIFIER };
}

// A select is a union name, from a group or the types block, or a glob over
// token paths. An unknown name throws, listing every union name.
export function selectTokens(select: string, resolved: ResolvedTokens): { tokens: ManifestToken[]; union?: Union } {
  const all = emitManifest(resolved).tokens;
  const byPath = new Map(all.map((t) => [t.path, t]));
  const pick = (paths: readonly string[]) =>
    paths.map((p) => {
      const token = byPath.get(p);
      if (token === undefined) throw new Error(`Token "${p}" does not exist.`);
      return token;
    });
  if (select.includes('.') || select.includes('*')) {
    return {
      tokens: pick(
        matchGlob(
          select,
          all.map((t) => t.path)
        )
      ),
    };
  }
  const union = resolved.unions.find((u) => u.name === select);
  if (union === undefined) {
    const names = resolved.unions.map((u) => u.name).join(', ');
    throw new Error(`No union named "${select}". The unions are: ${names}.`);
  }
  return { tokens: pick(union.paths), union };
}

// Runs every entry: select, map each token through the template, aggregate.
// Two entries writing the same path is an error, since one would win silently.
export function generate(config: GenerateConfig, resolved: ResolvedTokens): OutputFile[] {
  const files: OutputFile[] = [];
  const owners = new Map<string, string>();
  for (const [name, entry] of Object.entries(config.entries)) {
    const { tokens, union } = selectTokens(entry.select, resolved);
    const context: EntryContext = {
      name,
      select: entry.select,
      tokens: config.tokens,
      resolved,
      ...(union && { union }),
    };
    const fragments = tokens.map((t) => entry.template.fragment(t, context));
    for (const file of entry.template.aggregate(fragments, context)) {
      const owner = owners.get(file.path);
      if (owner !== undefined) {
        throw new Error(`Entries "${owner}" and "${name}" both write ${file.path}.`);
      }
      owners.set(file.path, name);
      files.push(file);
    }
  }
  return files;
}
