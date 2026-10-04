#!/usr/bin/env node
import { existsSync, watch } from 'node:fs';
import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadConfigFile, loadTokens } from 'token-jet';
import type { ResolvedTokens } from 'token-jet';
import { TextDocument } from 'vscode-languageserver-textdocument';
import {
  CodeActionKind,
  CompletionItemKind,
  CompletionItemTag,
  DiagnosticSeverity,
  DiagnosticTag,
  TextDocumentSyncKind,
  TextDocuments,
  createConnection,
} from 'vscode-languageserver/node.js';
import type { CodeAction, CompletionItem, Diagnostic } from 'vscode-languageserver/node.js';

import { callAt, complete, diagnose, hover } from './analyze.ts';

const SOURCE = 'token-jet';

const connection = createConnection(process.stdin, process.stdout);
const documents = new TextDocuments(TextDocument);

let root = process.cwd();
let resolved: ResolvedTokens | undefined;
let loadError: string | undefined;
let configFile: string | undefined;
let watchPath: string | undefined;
let loading: Promise<void> = Promise.resolve();

function validate(document: TextDocument): void {
  let diagnostics: Diagnostic[];
  // Still loading: load() validates every open document when it finishes.
  if (resolved === undefined && loadError === undefined) return;
  if (resolved === undefined) {
    const range = { start: document.positionAt(0), end: document.positionAt(0) };
    const name = configFile === undefined ? 'The token config' : relative(root, configFile);
    const message = `${name} failed to load: ${loadError ?? 'unknown error'}`;
    diagnostics = [{ range, severity: DiagnosticSeverity.Error, message, source: SOURCE }];
  } else {
    diagnostics = diagnose(document.getText(), resolved).map((f) => ({
      range: { start: document.positionAt(f.call.start), end: document.positionAt(f.call.end) },
      severity: f.severity === 'error' ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning,
      message: f.message,
      source: SOURCE,
      ...(f.severity === 'warning' && { tags: [DiagnosticTag.Deprecated] }),
      ...(f.replacement !== undefined && { data: { replacement: f.replacement } }),
    }));
  }
  void connection.sendDiagnostics({ uri: document.uri, diagnostics });
}

// Loads the token config from the workspace root and re-checks every open
// document. A failed load is reported as a diagnostic on each one instead of crashing the server.
async function load(): Promise<void> {
  try {
    const { file, watch: watched, config } = await loadConfigFile(root);
    configFile = file;
    watchPath = watched;
    resolved = loadTokens(config);
    loadError = undefined;
  } catch (error) {
    resolved = undefined;
    loadError = error instanceof Error ? error.message : String(error);
  }
  for (const document of documents.all()) validate(document);
}

// An editor writes a file in more than one step, so the reload waits for
// the writes to settle.
function watchConfig(path: string): void {
  if (!existsSync(path)) return;
  let timer: NodeJS.Timeout | undefined;
  watch(path, () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      loading = load();
    }, 200);
  });
}

connection.onInitialize((params) => {
  const folder = params.workspaceFolders?.[0]?.uri ?? params.rootUri ?? undefined;
  if (folder !== undefined) root = fileURLToPath(folder);
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: { triggerCharacters: ["'", '"', '.'] },
      hoverProvider: true,
      codeActionProvider: { codeActionKinds: [CodeActionKind.QuickFix] },
    },
  };
});

connection.onInitialized(() => {
  loading = load();
  void loading.then(() => {
    if (watchPath !== undefined) watchConfig(watchPath);
  });
});

documents.onDidChangeContent((change) => {
  validate(change.document);
});

connection.onCompletion(async (params): Promise<CompletionItem[] | null> => {
  await loading;
  const document = documents.get(params.textDocument.uri);
  if (document === undefined || resolved === undefined) return null;
  const call = callAt(document.getText(), document.offsetAt(params.position));
  if (call === undefined) return null;
  const range = { start: document.positionAt(call.start), end: document.positionAt(call.end) };
  // Editors sort by sortText as a string, so the zero-padded index keeps the
  // config's order instead of the label's (space.x4 before space.x16).
  const items = complete(resolved);
  const width = String(items.length).length;
  return items.map((item, index) => ({
    label: item.label,
    kind: CompletionItemKind.Value,
    detail: item.detail,
    sortText: String(index).padStart(width, '0'),
    ...(item.documentation !== undefined && { documentation: item.documentation }),
    ...(item.deprecated && { tags: [CompletionItemTag.Deprecated] }),
    filterText: item.label,
    textEdit: { range, newText: item.label },
  }));
});

connection.onHover(async (params) => {
  await loading;
  const document = documents.get(params.textDocument.uri);
  if (document === undefined || resolved === undefined) return null;
  const call = callAt(document.getText(), document.offsetAt(params.position));
  if (call === undefined) return null;
  const value = hover(call.path, resolved);
  if (value === undefined) return null;
  return {
    contents: { kind: 'markdown', value },
    range: { start: document.positionAt(call.start), end: document.positionAt(call.end) },
  };
});

connection.onCodeAction((params): CodeAction[] => {
  const actions: CodeAction[] = [];
  for (const diagnostic of params.context.diagnostics) {
    const replacement = (diagnostic.data as { replacement?: string } | undefined)?.replacement;
    if (diagnostic.source !== SOURCE || replacement === undefined) continue;
    actions.push({
      title: `Replace with "${replacement}"`,
      kind: CodeActionKind.QuickFix,
      isPreferred: true,
      diagnostics: [diagnostic],
      edit: { changes: { [params.textDocument.uri]: [{ range: diagnostic.range, newText: replacement }] } },
    });
  }
  return actions;
});

documents.listen(connection);
connection.listen();
