/**
 * Layer 2 — pure-logic unit tests for cleanupFields.
 * Run with: node --test tests/unit/cleanupFields.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { CLEANUP_FIELDS, cleanupFlowState, GUARDED_ACTIONS } from '../../src/engine/cleanupFields.mjs';

// node:test can't natively load .ts; we use a tiny runtime transpile via tsc.
// This file is the spec; the actual entry is run via the runner script that
// transpiles the TS dependencies first. See tests/unit/run.sh.

test('CLEANUP_FIELDS exposes all 5 flow buckets', () => {
  assert.deepEqual(
    Object.keys(CLEANUP_FIELDS).sort(),
    ['checkin', 'checkpoint', 'info', 'runner', 'trigger'],
  );
});

test('CLEANUP_FIELDS.runner contains _selected_om_audio (audio bug fix)', () => {
  assert.ok(
    CLEANUP_FIELDS.runner.includes('_selected_om_audio'),
    'runner cleanup must include _selected_om_audio so it clears between flows',
  );
});

test('CLEANUP_FIELDS.checkpoint contains all 4 decision fields', () => {
  const expected = [
    'checkpoint_decision',
    'checkpoint_feeling',
    'checkpoint_feeling_simple',
    'checkpoint_user_reflection',
  ];
  for (const k of expected) {
    assert.ok(
      CLEANUP_FIELDS.checkpoint.includes(k),
      `checkpoint cleanup missing ${k}`,
    );
  }
});

test('CLEANUP_FIELDS.trigger contains _trigger_resolution_toast', () => {
  assert.ok(CLEANUP_FIELDS.trigger.includes('_trigger_resolution_toast'));
});

test('cleanupFlowState clears info+runner on every call', () => {
  const cleared = [];
  const setVal = (value, key) => cleared.push(key);
  cleanupFlowState('checkpoint', setVal);
  for (const k of CLEANUP_FIELDS.info) assert.ok(cleared.includes(k));
  for (const k of CLEANUP_FIELDS.runner) assert.ok(cleared.includes(k));
  for (const k of CLEANUP_FIELDS.checkpoint) assert.ok(cleared.includes(k));
});

test("cleanupFlowState('all') clears every bucket", () => {
  const cleared = new Set();
  const setVal = (value, key) => cleared.add(key);
  cleanupFlowState('all', setVal);
  const allFields = [
    ...CLEANUP_FIELDS.info,
    ...CLEANUP_FIELDS.runner,
    ...CLEANUP_FIELDS.checkin,
    ...CLEANUP_FIELDS.trigger,
    ...CLEANUP_FIELDS.checkpoint,
  ];
  for (const k of allFields) assert.ok(cleared.has(k), `missing ${k}`);
});

test('GUARDED_ACTIONS contains submit + generate_companion', () => {
  assert.ok(GUARDED_ACTIONS.has('submit'));
  assert.ok(GUARDED_ACTIONS.has('generate_companion'));
  assert.ok(GUARDED_ACTIONS.has('seal_day'));
});
