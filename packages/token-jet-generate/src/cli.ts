#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { loadConfigFile, loadTokens, writeFiles } from 'token-jet';

import { defineGenerate, generate } from './index.ts';
import type { Entry, GenerateConfig } from './index.ts';

const CONFIG_FILE = 'generate.config.ts';
const SCHEMA_GENERATE_FILE = 'tokens/generate.ts';
const DEFAULT_OUT_DIR = 'generated/classnames';

function isDefinedGenerate(value: unknown): value is { entries: Record<string, Entry> } {
  return typeof value === 'object' && value !== null && 'schema' in value && 'entries' in value;
}

async function loadGenerateConfig(dir: string): Promise<GenerateConfig> {
  const legacy = resolve(dir, CONFIG_FILE);
  const file = existsSync(legacy) ? legacy : resolve(dir, SCHEMA_GENERATE_FILE);
  if (!existsSync(file)) throw new Error(`No ${CONFIG_FILE} or ${SCHEMA_GENERATE_FILE} found in ${dir}.`);
  const url = `${pathToFileURL(file).href}?v=${Date.now()}`;
  const module = (await import(url)) as { default?: unknown };
  if (module.default === undefined) {
    throw new Error(`${relative(dir, file)} must export the config as its default export.`);
  }
  if (isDefinedGenerate(module.default)) return defineGenerate(module.default.entries);
  return module.default as GenerateConfig;
}

async function main(argv: readonly string[]): Promise<void> {
  const outFlag = argv.indexOf('--out');
  const outDir = outFlag >= 0 ? argv[outFlag + 1] : DEFAULT_OUT_DIR;
  if (outDir === undefined) throw new Error('--out needs a directory.');
  const cwd = process.cwd();
  const { config } = await loadConfigFile(cwd);
  const files = generate(await loadGenerateConfig(cwd), loadTokens(config));
  const written = writeFiles(resolve(outDir), files);
  console.log(`wrote ${written.length} files to ${outDir}`);
}

main(process.argv.slice(2)).catch((error: unknown) => {
  console.error(`token-jet-generate: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
