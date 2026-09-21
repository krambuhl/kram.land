#!/usr/bin/env node
import { version } from './version.ts';

const [command] = process.argv.slice(2);

if (command === '--version') {
  console.log(version());
} else {
  console.error(`token-jet: unknown command ${command ?? '(none)'}`);
  process.exitCode = 1;
}
