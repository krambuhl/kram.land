#!/usr/bin/env node
import { existsSync, watch } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadConfigFile, loadTokens } from 'token-jet';
import type { ResolvedTokens } from 'token-jet';
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
import { TextDocument } from 'vscode-languageserver-textdocument';

import { callAt, complete, diagnose, hover } from './analyze.ts';

const CONFIG_FILE = 'tokens.config.ts';
const SOURCE = 'token-jet';

const connection = createConnection(process.stdin, process.stdout);
const documents = new TextDocuments(TextDocument);

let root = process.cwd();
let resolved: ResolvedTokens | undefined;
let loadError: string | undefined;

function validate(document: TextDocument): void {
  let diagnostics: Diagnostic[];
  if (resolved === undefined) {
    const range = { start: document.positionAt(0), end: document.positionAt(0) };
    const message = `${CONFIG_FILE} failed to load: ${loadError ?? 'unknown error'}`;
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

// Loads tokens.config.ts from the workspace root, then re-checks every open
// document. A failed load is reported as a diagnostic on each document
// rather than crashing the server, so a half-edited config shows up in place.
async function load(): Promise<void> {
  try {
    const { config } = await loadConfigFile(root);
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
function watchConfig(file: string): void {
  if (!existsSync(file)) return;
  let timer: NodeJS.Timeout | undefined;
  watch(file, () => {
    clearTimeout(timer);
    timer = setTimeout(() => void load(), 200);
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
  void load().then(() => watchConfig(join(root, CONFIG_FILE)));
});

documents.onDidChangeContent((change) => {
  validate(change.document);
});

connection.onCompletion((params): CompletionItem[] | null => {
  const document = documents.get(params.textDocument.uri);
  if (document === undefined || resolved === undefined) return null;
  const call = callAt(document.getText(), document.offsetAt(params.position));
  if (call === undefined) return null;
  const range = { start: document.positionAt(call.start), end: document.positionAt(call.end) };
  return complete(resolved).map((item) => ({
    label: item.label,
    kind: CompletionItemKind.Value,
    detail: item.detail,
    ...(item.documentation !== undefined && { documentation: item.documentation }),
    ...(item.deprecated && { tags: [CompletionItemTag.Deprecated] }),
    filterText: item.label,
    textEdit: { range, newText: item.label },
  }));
});

connection.onHover((params) => {
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
