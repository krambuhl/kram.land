import { existsSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

import ts from 'typescript';

import type { MatchOptions } from './index.ts';

export const PACKAGE = 'responsive-css-modules';
const OPTION_KEYS = ['matchMin', 'matchMax', 'matchOnly'] as const;
const SOURCE = /\.(?:ts|tsx)$/;

export function realPath(file: string): string {
  return existsSync(file) ? realpathSync(file) : file;
}

export interface Usage {
  css: string;
  className: string;
  match: MatchOptions;
  at: string;
}

function located(source: ts.SourceFile, node: ts.Node, root: string): string {
  const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
  return `${relative(root, source.fileName)}:${line + 1}`;
}

function unwrap(node: ts.Expression): ts.Expression {
  let current = node;
  while (ts.isParenthesizedExpression(current) || ts.isAsExpression(current) || ts.isSatisfiesExpression(current)) {
    current = current.expression;
  }
  return current;
}

function values(node: ts.Expression): (string | string[])[] | null {
  const value = unwrap(node);
  if (ts.isStringLiteralLike(value)) return [value.text];
  if (ts.isConditionalExpression(value)) {
    const whenTrue = values(value.whenTrue);
    const whenFalse = values(value.whenFalse);
    return whenTrue === null || whenFalse === null ? null : [...whenTrue, ...whenFalse];
  }
  if (ts.isArrayLiteralExpression(value)) {
    const items = value.elements.map((e) => unwrap(e as ts.Expression));
    if (!items.every((e) => ts.isStringLiteralLike(e))) return null;
    return [items.map((e) => (e as ts.StringLiteralLike).text)];
  }
  return null;
}

function matches(arg: ts.Expression | undefined): MatchOptions[] | null {
  if (arg === undefined) return null;
  const object = unwrap(arg);
  if (!ts.isObjectLiteralExpression(object) || object.properties.length !== 1) return null;
  const property = object.properties[0];
  if (!ts.isPropertyAssignment(property) || !ts.isIdentifier(property.name)) return null;
  const key = property.name.text;
  if (!(OPTION_KEYS as readonly string[]).includes(key)) return null;
  const options = values(property.initializer);
  if (options === null) return null;
  if (key === 'matchOnly') return options.map((option) => ({ matchOnly: option }));
  const names = options.filter((option): option is string => typeof option === 'string');
  if (names.length !== options.length) return null;
  return names.map((name) => (key === 'matchMin' ? { matchMin: name } : { matchMax: name }));
}

export function scanSource(file: string, text: string, root: string): Usage[] {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const modules = new Map<string, string>();
  const helpers = new Set<string>();
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    const specifier = statement.moduleSpecifier.text;
    const clause = statement.importClause;
    if (clause === undefined || clause.isTypeOnly) continue;
    if (specifier.endsWith('.module.css') && specifier.startsWith('.') && clause.name !== undefined) {
      modules.set(clause.name.text, resolve(dirname(file), specifier));
    }
    if (specifier === PACKAGE && clause.namedBindings !== undefined && ts.isNamedImports(clause.namedBindings)) {
      for (const element of clause.namedBindings.elements) {
        if ((element.propertyName ?? element.name).text === 'responsive') helpers.add(element.name.text);
      }
    }
  }
  if (helpers.size === 0) return [];

  const cssOfWrap = (node: ts.Expression): string | undefined => {
    const call = unwrap(node);
    if (!ts.isCallExpression(call) || !ts.isIdentifier(call.expression) || !helpers.has(call.expression.text)) {
      return undefined;
    }
    const arg = call.arguments[0];
    const css = arg !== undefined && ts.isIdentifier(arg) ? modules.get(arg.text) : undefined;
    if (css === undefined) {
      throw new Error(`${located(source, call, root)}: responsive() takes the default import of a .module.css file.`);
    }
    return css;
  };

  const wrappers = new Map<string, string>();
  const usages: Usage[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer !== undefined) {
      const css = cssOfWrap(node.initializer);
      if (css !== undefined) wrappers.set(node.name.text, css);
    }
    if (ts.isCallExpression(node)) {
      const callee = node.expression;
      let target: ts.Expression | undefined;
      let className: string | undefined;
      if (ts.isPropertyAccessExpression(callee)) {
        target = callee.expression;
        className = callee.name.text;
      } else if (ts.isElementAccessExpression(callee) && ts.isStringLiteralLike(callee.argumentExpression)) {
        target = callee.expression;
        className = callee.argumentExpression.text;
      }
      if (target !== undefined && className !== undefined) {
        const css = ts.isIdentifier(target) ? wrappers.get(target.text) : cssOfWrap(target);
        if (css !== undefined) {
          const found = matches(node.arguments[0]);
          if (found === null) {
            throw new Error(
              `${located(source, node, root)}: ${className}() needs one of ${OPTION_KEYS.join(', ')} with a literal value, a literal array or a ternary of them.`
            );
          }
          const at = located(source, node, root);
          for (const match of found) usages.push({ css, className, match, at });
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return usages;
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && SOURCE.test(entry.name) && !entry.name.endsWith('.d.ts'))
    .map((entry) => join(entry.parentPath, entry.name))
    .filter((file) => !file.split(/[/\\]/).includes('node_modules'));
}

export function scanDirectory(dir: string, root: string): Map<string, Usage[]> {
  const byFile = new Map<string, Usage[]>();
  for (const file of sourceFiles(dir)) byFile.set(file, scanSource(file, readFileSync(file, 'utf8'), root));
  return byFile;
}
