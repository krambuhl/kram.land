import { emitManifest } from 'token-jet';
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
  tag: string;
  // The tag's union. The generated files are typed on it.
  union: Union;
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
  tag: string;
  template: Template<Fragment>;
}

export interface GenerateOptions {
  tokens?: string;
}

export interface GenerateConfig {
  entries: Record<string, Entry>;
  tokens: string;
}

export const DEFAULT_TOKENS_SPECIFIER = '../tokens';

export function defineGenerate(entries: Record<string, Entry>, options: GenerateOptions = {}): GenerateConfig {
  return { entries, tokens: options.tokens ?? DEFAULT_TOKENS_SPECIFIER };
}

export function tagTokens(tag: string, resolved: ResolvedTokens): { tokens: ManifestToken[]; union: Union } {
  const union = resolved.unions.find((u) => u.source === `tags.${tag}`);
  if (union === undefined) {
    const tags = resolved.unions.filter((u) => u.source.startsWith('tags.')).map((u) => u.source.slice(5));
    throw new Error(`No token has the tag "${tag}". The tags are: ${tags.join(', ') || 'none'}.`);
  }
  const byPath = new Map(emitManifest(resolved).tokens.map((t) => [t.path, t]));
  return { tokens: union.paths.map((p) => byPath.get(p) as ManifestToken), union };
}

// Runs every entry: select, map each token through the template, aggregate.
// Two entries writing the same path is an error, since one would win silently.
export function generate(config: GenerateConfig, resolved: ResolvedTokens): OutputFile[] {
  const files: OutputFile[] = [];
  const owners = new Map<string, string>();
  for (const [name, entry] of Object.entries(config.entries)) {
    const { tokens, union } = tagTokens(entry.tag, resolved);
    const context: EntryContext = { name, tag: entry.tag, tokens: config.tokens, resolved, union };
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
