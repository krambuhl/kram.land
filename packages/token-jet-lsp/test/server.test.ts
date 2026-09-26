import { spawn } from 'node:child_process';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { afterAll, beforeAll, describe, expect, test } from 'vitest';

const server = join(import.meta.dirname, '../src/server.ts');
const fixture = readFileSync(join(import.meta.dirname, 'fixtures/tokens.config.ts'), 'utf8');

interface Message {
  id?: number;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: { message: string };
}

class Client {
  private buffer = Buffer.alloc(0);
  private nextId = 1;
  private waiters: ((m: Message) => boolean)[] = [];
  readonly received: Message[] = [];
  private readonly child: ChildProcessWithoutNullStreams;

  constructor(child: ChildProcessWithoutNullStreams) {
    this.child = child;
    child.stdout.on('data', (chunk: Buffer) => {
      this.buffer = Buffer.concat([this.buffer, chunk]);
      for (;;) {
        const headerEnd = this.buffer.indexOf('\r\n\r\n');
        if (headerEnd < 0) return;
        const header = this.buffer.subarray(0, headerEnd).toString();
        const length = Number(/Content-Length: (\d+)/.exec(header)?.[1]);
        const start = headerEnd + 4;
        if (this.buffer.length < start + length) return;
        const message = JSON.parse(this.buffer.subarray(start, start + length).toString()) as Message;
        this.buffer = this.buffer.subarray(start + length);
        this.received.push(message);
        this.waiters = this.waiters.filter((w) => !w(message));
      }
    });
  }

  send(body: object): void {
    const text = JSON.stringify({ jsonrpc: '2.0', ...body });
    this.child.stdin.write(`Content-Length: ${Buffer.byteLength(text)}\r\n\r\n${text}`);
  }

  request(method: string, params: unknown): Promise<Message> {
    const id = this.nextId++;
    const reply = this.wait((m) => m.id === id);
    this.send({ id, method, params });
    return reply;
  }

  notify(method: string, params: unknown): void {
    this.send({ method, params });
  }

  wait(match: (m: Message) => boolean, ms = 5000): Promise<Message> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`no message matched within ${ms}ms`)), ms);
      this.waiters.push((m) => {
        if (!match(m)) return false;
        clearTimeout(timer);
        resolve(m);
        return true;
      });
    });
  }
}

function project(): string {
  const dir = mkdtempSync(join(tmpdir(), 'token-jet-lsp-'));
  writeFileSync(join(dir, 'tokens.config.ts'), fixture);
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'fixture', type: 'module' }));
  mkdirSync(join(dir, 'node_modules'));
  symlinkSync(join(import.meta.dirname, '../../token-jet'), join(dir, 'node_modules/token-jet'));
  return dir;
}

interface Diagnostic {
  range: { start: { line: number; character: number }; end: { line: number; character: number } };
  severity: number;
  message: string;
  data?: { replacement?: string };
}

const uri = 'file:///a.css';
const text =
  ".a {\n  gap: token('space.x17');\n  color: token('content.regular');\n  background: token('bg.page');\n}\n";

describe('token-jet-lsp over stdio', () => {
  let dir: string;
  let child: ChildProcessWithoutNullStreams;
  let client: Client;
  let diagnostics: Diagnostic[];

  beforeAll(async () => {
    dir = project();
    child = spawn(process.execPath, [server, '--stdio'], { stdio: 'pipe' });
    client = new Client(child);
    const init = await client.request('initialize', {
      processId: process.pid,
      rootUri: pathToFileURL(dir).href,
      capabilities: {},
    });
    expect((init.result as { capabilities: Record<string, unknown> }).capabilities).toMatchObject({
      completionProvider: { triggerCharacters: ["'", '"', '.'] },
      hoverProvider: true,
      codeActionProvider: { codeActionKinds: ['quickfix'] },
    });
    client.notify('initialized', {});
    const published = client.wait((m) => m.method === 'textDocument/publishDiagnostics');
    client.notify('textDocument/didOpen', { textDocument: { uri, languageId: 'css', version: 1, text } });
    diagnostics = ((await published).params as { diagnostics: Diagnostic[] }).diagnostics;
  });

  afterAll(() => {
    child.kill();
  });

  test('publishes an error for an unknown path and a warning for a deprecated one, ranged over the argument', () => {
    expect(diagnostics).toEqual([
      {
        range: { start: { line: 1, character: 14 }, end: { line: 1, character: 23 } },
        severity: 1,
        message: 'Token "space.x17" does not exist. Did you mean "space.x16"?',
        source: 'token-jet',
        data: { replacement: 'space.x16' },
      },
      {
        range: { start: { line: 2, character: 16 }, end: { line: 2, character: 31 } },
        severity: 2,
        message: 'Token "content.regular" is deprecated: use content.body.',
        source: 'token-jet',
        tags: [2],
        data: { replacement: 'content.body' },
      },
    ]);
  });

  test('completes inside the quotes with a text edit over the whole argument', async () => {
    const reply = await client.request('textDocument/completion', {
      textDocument: { uri },
      position: { line: 1, character: 16 },
    });
    const items = reply.result as { label: string; textEdit: { range: unknown; newText: string }; detail: string }[];
    const x16 = items.find((i) => i.label === 'space.x16');
    expect(x16).toMatchObject({
      label: 'space.x16',
      detail: '16px',
      textEdit: { range: { start: { line: 1, character: 14 }, end: { line: 1, character: 23 } }, newText: 'space.x16' },
    });
    expect(items.some((i) => i.label === 'content.body')).toBe(true);
  });

  test('gives no completion outside a call', async () => {
    const reply = await client.request('textDocument/completion', {
      textDocument: { uri },
      position: { line: 0, character: 1 },
    });
    expect(reply.result).toBeNull();
  });

  test('hovers a call with the value per mode', async () => {
    const reply = await client.request('textDocument/hover', {
      textDocument: { uri },
      position: { line: 3, character: 22 },
    });
    expect(reply.result).toMatchObject({
      contents: { kind: 'markdown', value: expect.stringContaining('dark: `{gray.900}` → `#171717`') as string },
      range: { start: { line: 3, character: 21 }, end: { line: 3, character: 28 } },
    });
  });

  test('offers a quick fix that replaces the path', async () => {
    const reply = await client.request('textDocument/codeAction', {
      textDocument: { uri },
      range: diagnostics[0].range,
      context: { diagnostics: [diagnostics[0]] },
    });
    expect(reply.result).toEqual([
      {
        title: 'Replace with "space.x16"',
        kind: 'quickfix',
        isPreferred: true,
        diagnostics: [diagnostics[0]],
        edit: { changes: { [uri]: [{ range: diagnostics[0].range, newText: 'space.x16' }] } },
      },
    ]);
  });

  test('re-checks open documents when the config changes', async () => {
    const republished = client.wait(
      (m) =>
        m.method === 'textDocument/publishDiagnostics' &&
        (m.params as { diagnostics: Diagnostic[] }).diagnostics.length === 1,
      8000
    );
    writeFileSync(
      join(dir, 'tokens.config.ts'),
      fixture.replace("x16: { value: '16px'", "x17: { value: '17px' },\n      x16: { value: '16px'")
    );
    const { diagnostics: after } = (await republished).params as { diagnostics: Diagnostic[] };
    expect(after[0].message).toContain('content.regular');
  });

  test('reports a config that fails to load on each open document', async () => {
    const republished = client.wait(
      (m) =>
        m.method === 'textDocument/publishDiagnostics' &&
        (m.params as { diagnostics: Diagnostic[] }).diagnostics[0]?.message.startsWith('tokens.config.ts failed'),
      8000
    );
    writeFileSync(join(dir, 'tokens.config.ts'), fixture.replace("dark: '{gray.900}'", "dark: '{gray.999}'"));
    const { diagnostics: after } = (await republished).params as { diagnostics: Diagnostic[] };
    expect(after).toHaveLength(1);
    expect(after[0].message).toMatch(/gray\.999/);
  });
});
