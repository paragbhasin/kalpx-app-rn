#!/usr/bin/env node
/**
 * Layer 2 — pure-logic test runner.
 *
 * Compiles a small set of TS files (with no React Native dependencies)
 * to a temp dir using the local typescript compiler, then runs node:test
 * against the compiled .mjs files.
 *
 * Usage:
 *   node tests/unit/run.mjs
 *
 * Add new pure-logic test files to TEST_FILES below. Source files they
 * import are compiled into the same temp dir automatically when listed
 * in SOURCE_FILES.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');
const OUT_DIR = resolve(__dirname, '.compiled');

// TS source files to compile (no React Native dependencies allowed).
const SOURCE_FILES = [
  'src/engine/cleanupFields.ts',
];

// Compiled test entry points (these are .mjs files in tests/unit/).
const TEST_FILES = [
  'tests/unit/cleanupFields.test.mjs',
  'tests/unit/checkpoint_actions.test.mjs',
];

function clean() {
  if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true });
  mkdirSync(OUT_DIR, { recursive: true });
}

function compileSources() {
  console.log('Compiling sources to', relative(REPO_ROOT, OUT_DIR));
  for (const file of SOURCE_FILES) {
    const fullPath = resolve(REPO_ROOT, file);
    const source = readFileSync(fullPath, 'utf8');
    const result = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
        esModuleInterop: true,
      },
      fileName: file,
    });
    if (result.diagnostics && result.diagnostics.length) {
      for (const d of result.diagnostics) {
        console.error(ts.flattenDiagnosticMessageText(d.messageText, '\n'));
      }
      process.exit(1);
    }
    // Mirror the source path under OUT_DIR but with .mjs extension
    const outPath = resolve(OUT_DIR, file.replace(/\.ts$/, '.mjs'));
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, result.outputText);
    console.log('  ✓', file);
  }
}

function rewriteTests() {
  // Test files import sources via relative paths like '../../src/engine/cleanupFields.ts'.
  // After we move them into OUT_DIR, the relative path to the compiled source
  // changes. Rewrite the import string accordingly.
  for (const file of TEST_FILES) {
    const fullPath = resolve(REPO_ROOT, file);
    const outPath = resolve(OUT_DIR, file);
    let source = readFileSync(fullPath, 'utf8');
    for (const src of SOURCE_FILES) {
      const compiled = resolve(OUT_DIR, src.replace(/\.ts$/, '.mjs'));
      // Original import string in the test file (relative from test source dir)
      const fromOriginal = relative(dirname(fullPath), resolve(REPO_ROOT, src));
      // New import string (relative from the *moved* test file in OUT_DIR)
      let toCompiled = relative(dirname(outPath), compiled);
      if (!toCompiled.startsWith('.')) toCompiled = `./${toCompiled}`;
      source = source.split(fromOriginal).join(toCompiled);
    }
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, source);
  }
}

function runTests() {
  const args = ['--test', ...TEST_FILES.map((f) => resolve(OUT_DIR, f))];
  const proc = spawnSync('node', args, { stdio: 'inherit', cwd: REPO_ROOT });
  process.exit(proc.status || 0);
}

clean();
compileSources();
rewriteTests();
runTests();
