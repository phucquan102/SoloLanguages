#!/usr/bin/env node
// Usage: node tools/literal-check/bin/check-no-language-literals.mjs [--config <file>] [root ...]
import { main } from '../src/cli.mjs';

process.exitCode = main(process.argv.slice(2));
