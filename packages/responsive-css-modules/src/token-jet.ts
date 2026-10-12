import { loadConfigFile, loadTokens, resolveValue } from 'token-jet';
import type { ResolvedTokens } from 'token-jet';

import type { Breakpoint, BreakpointSource } from './scale.ts';

export interface TokenJetOptions {
  tag?: string;
}

export function breakpointsFromTokens(resolved: ResolvedTokens, tag = 'media-breakpoint'): Breakpoint[] {
  const tokens = resolved.tokens.filter((t) => t.tags?.includes(tag));
  if (tokens.length === 0) throw new Error(`No tokens carry the tag "${tag}", so there are no breakpoints.`);
  return tokens.map((t) => ({
    name: t.segments[t.segments.length - 1],
    width: String(resolveValue(t.path, resolved.tokens)),
  }));
}

export function fromTokenJet(options: TokenJetOptions = {}): BreakpointSource {
  return {
    watch: 'tokens',
    async load(root) {
      const { config } = await loadConfigFile(root);
      return breakpointsFromTokens(loadTokens(config), options.tag);
    },
  };
}
