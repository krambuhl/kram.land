import { readFileSync } from 'node:fs';

interface PackageJson {
  version: string;
}

export function version(): string {
  const file = new URL('../package.json', import.meta.url);
  const pkg = JSON.parse(readFileSync(file, 'utf8')) as PackageJson;
  return pkg.version;
}
