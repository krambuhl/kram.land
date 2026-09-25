#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { DEFAULT_OUT_DIR, generateFiles, writeFiles } from './core/generate.ts';
import { loadConfigFile, loadTokens } from './core/load.ts';
import { renameConfigKey } from './core/rename-config.ts';
import { findUsages, renameUsages } from './core/usage.ts';
import { version } from './version.ts';

const COMMANDS = ['generate', 'check', 'usage', 'rename'] as const;

function usageText(): string {
  return [
    'token-jet <command>',
    '',
    '  generate [--out <dir>]        write tokens.css, types.ts and index.ts',
    '  check                         print the contrast ratio of every pair in every mode',
    '  usage <files...>              list every token() call by path',
    '  rename <from> <to> <files...> rename a token in the files, and in the config unless <to> exists',
    '  --version',
  ].join('\n');
}

function readFiles(names: readonly string[]) {
  return names.map((file) => ({ file, text: readFileSync(resolve(file), 'utf8') }));
}

async function generate(args: readonly string[]): Promise<string> {
  const outFlag = args.indexOf('--out');
  const outDir = outFlag >= 0 ? args[outFlag + 1] : DEFAULT_OUT_DIR;
  if (outDir === undefined) throw new Error('--out needs a directory.');
  const { config } = await loadConfigFile(process.cwd());
  const written = writeFiles(resolve(outDir), generateFiles(loadTokens(config)));
  return `wrote ${written.length} files to ${relative(process.cwd(), resolve(outDir))}`;
}

async function check(): Promise<string> {
  const { config } = await loadConfigFile(process.cwd());
  const { contrast } = loadTokens(config);
  if (contrast.length === 0) return 'no contrast pairs in the config';
  const lines = contrast.map((r) =>
    r.error !== undefined
      ? `${r.foreground} on ${r.background} in ${r.mode}: ${r.error}`
      : `${r.foreground} on ${r.background} in ${r.mode}: ${r.ratio} ${r.pass ? 'ok' : `below ${config.contrast?.minimum}`}`
  );
  if (contrast.some((r) => !r.pass)) throw new Error(lines.join('\n'));
  return lines.join('\n');
}

async function usage(files: readonly string[]): Promise<string> {
  if (files.length === 0) throw new Error('usage needs at least one file.');
  const { config } = await loadConfigFile(process.cwd());
  const { tokens } = loadTokens(config);
  const deprecated = new Map(tokens.filter((t) => t.deprecated !== undefined).map((t) => [t.path, t.deprecated]));
  const found = findUsages(readFiles(files));
  const byPath = Map.groupBy(found, (u) => u.path);
  const lines: string[] = [];
  for (const [path, uses] of [...byPath].sort(([a], [b]) => a.localeCompare(b))) {
    const flag = deprecated.has(path)
      ? `  deprecated${typeof deprecated.get(path) === 'string' ? `: ${deprecated.get(path)}` : ''}`
      : '';
    lines.push(`${path}  ${uses.length}${flag}`);
    for (const u of uses) lines.push(`  ${u.file}:${u.line}:${u.column}`);
  }
  return lines.join('\n');
}

async function rename(args: readonly string[]): Promise<string> {
  const [from, to, ...files] = args;
  if (from === undefined || to === undefined) throw new Error('rename needs <from> <to>.');
  const { file: configFile, config } = await loadConfigFile(process.cwd());
  const { tokens } = loadTokens(config);
  if (!tokens.some((t) => t.path === from)) throw new Error(`Token "${from}" does not exist.`);
  const toExists = tokens.some((t) => t.path === to);

  const renamed = renameUsages(readFiles(files), from, to);
  if (!toExists) writeFileSync(configFile, renameConfigKey(readFileSync(configFile, 'utf8'), from, to));
  for (const f of renamed) if (f.changed) writeFileSync(resolve(f.file), f.text);
  const changed = renamed.filter((f) => f.changed).length;
  return toExists
    ? `renamed ${from} to ${to} in ${changed} files; ${to} is already in the config, so ${from} is left for you to delete`
    : `renamed ${from} to ${to} in the config and ${changed} files`;
}

async function main(argv: readonly string[]): Promise<void> {
  const [command, ...rest] = argv;
  if (command === '--version') {
    console.log(version());
    return;
  }
  switch (command) {
    case 'generate':
      console.log(await generate(rest));
      return;
    case 'check':
      console.log(await check());
      return;
    case 'usage':
      console.log(await usage(rest));
      return;
    case 'rename':
      console.log(await rename(rest));
      return;
    default:
      throw new Error(`Unknown command "${command ?? ''}". Commands: ${COMMANDS.join(', ')}.\n\n${usageText()}`);
  }
}

main(process.argv.slice(2)).catch((error: unknown) => {
  console.error(`token-jet: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
