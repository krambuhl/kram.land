import { TOKEN_TYPES } from './config.ts';
import type { Modes, TokenType, TokenValue } from './config.ts';
import type { ContrastResult } from './contrast.ts';
import type { ResolvedTokens, Union } from './load.ts';
import { inferType } from './metadata.ts';
import { cssVariableName, cssVariableReference } from './names.ts';
import { resolveValue } from './references.ts';

export interface ManifestToken {
  path: string;
  variable: string;
  reference: string;
  type?: TokenType;
  value: TokenValue;
  modes: Record<string, TokenValue>;
  resolved: Record<string, TokenValue>;
  description?: string;
  deprecated?: boolean | string;
  inherits?: boolean;
}

export interface Manifest {
  $schema: string;
  version: 1;
  modes: Modes;
  tokens: ManifestToken[];
  unions: Union[];
  contrast?: { minimum: number; results: ContrastResult[] };
}

export const MANIFEST_SCHEMA_FILE = 'manifest.schema.json';

const tokenValue = { type: ['string', 'number'] };

// The manifest's JSON Schema, written beside it as manifest.schema.json so a
// reader can validate a file without token-jet.
export const MANIFEST_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'token-jet manifest',
  type: 'object',
  required: ['version', 'modes', 'tokens', 'unions'],
  additionalProperties: false,
  properties: {
    $schema: { type: 'string' },
    version: { const: 1 },
    modes: { type: 'object', additionalProperties: { type: 'string' } },
    tokens: {
      type: 'array',
      items: {
        type: 'object',
        required: ['path', 'variable', 'reference', 'value', 'modes', 'resolved'],
        additionalProperties: false,
        properties: {
          path: { type: 'string' },
          variable: { type: 'string', pattern: '^--' },
          reference: { type: 'string', pattern: '^var\\(--' },
          type: { enum: [...TOKEN_TYPES] },
          value: tokenValue,
          modes: { type: 'object', additionalProperties: tokenValue },
          resolved: { type: 'object', required: ['base'], additionalProperties: tokenValue },
          description: { type: 'string' },
          deprecated: { type: ['boolean', 'string'] },
          inherits: { type: 'boolean' },
        },
      },
    },
    unions: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'source', 'paths'],
        additionalProperties: false,
        properties: {
          name: { type: 'string' },
          source: { type: 'string' },
          paths: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    contrast: {
      type: 'object',
      required: ['minimum', 'results'],
      additionalProperties: false,
      properties: {
        minimum: { type: 'number' },
        results: {
          type: 'array',
          items: {
            type: 'object',
            required: ['foreground', 'background', 'mode', 'pass'],
            additionalProperties: false,
            properties: {
              foreground: { type: 'string' },
              background: { type: 'string' },
              mode: { type: 'string' },
              ratio: { type: 'number' },
              error: { type: 'string' },
              pass: { type: 'boolean' },
            },
          },
        },
      },
    },
  },
} as const;

// What a coding agent reads to pick a token instead of typing a raw value.
export function emitManifest(resolved: ResolvedTokens): Manifest {
  const { config, tokens, unions, contrast } = resolved;
  const modeNames = Object.keys(config.modes);
  return {
    $schema: `./${MANIFEST_SCHEMA_FILE}`,
    version: 1,
    modes: config.modes,
    tokens: tokens.map((token) => {
      const type = inferType(token);
      const resolvedValues: Record<string, TokenValue> = { base: resolveValue(token.path, tokens) };
      for (const mode of modeNames) {
        if (mode in token.modes) resolvedValues[mode] = resolveValue(token.path, tokens, mode);
      }
      return {
        path: token.path,
        variable: cssVariableName(token.path),
        reference: cssVariableReference(token.path),
        ...(type !== undefined && { type }),
        value: token.value,
        modes: token.modes,
        resolved: resolvedValues,
        ...(token.description !== undefined && { description: token.description }),
        ...(token.deprecated !== undefined && { deprecated: token.deprecated }),
        ...(token.inherits !== undefined && { inherits: token.inherits }),
      };
    }),
    unions,
    ...(config.contrast !== undefined && { contrast: { minimum: config.contrast.minimum, results: contrast } }),
  };
}
