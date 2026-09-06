import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { requests, sha } from './executor.mjs';
import { requests as oldRequests } from '../WI-0196/executor.mjs';
import { protocol, protocolCheck } from './preflight.mjs';
import { bindings, approvalCheck } from './runner.mjs';

test('ephemeral support request removes the historical fork dependency while preserving isolation and route', () => {
  const fixture = { id: 'support-read', target: '/synthetic/fixture', prompt: 'Inspect TTL precedence.' };
  const old = oldRequests(fixture, protocol);
  const current = requests(fixture, protocol);
  assert.equal(old.thread.ephemeral, true);
  assert.equal(current.thread.ephemeral, true);
  assert.match(current.thread.developerInstructions, /fork_turns explicitly to "none"/);
  assert.match(current.thread.developerInstructions, /self-contained brief/);
  assert.match(current.thread.developerInstructions, /absolute assigned repository path/);
  assert.match(current.thread.developerInstructions, /read-only scope/);
  assert.doesNotMatch(old.thread.developerInstructions, /fork_turns explicitly/);
  const { developerInstructions: oldInstructions, ...oldThread } = old.thread;
  const { developerInstructions: newInstructions, ...newThread } = current.thread;
  assert.deepEqual(newThread, oldThread);
  assert.deepEqual(current.turn, old.turn);
  assert.notEqual(sha(current), sha(old));
  // A prompt assertion establishes the instruction contract, not model adherence.
});

test('sequential scenarios retain the exact predecessor request', () => {
  for (const id of ['entry-normal', 'finish-normal']) {
    const fixture = { id, target: '/synthetic/fixture', prompt: 'Bounded work.' };
    assert.deepEqual(requests(fixture, protocol), oldRequests(fixture, protocol));
  }
});

test('fork policy drift is rejected and the corrected executor is part of the seal', async () => {
  assert.equal(protocolCheck(), true);
  for (const fork of [undefined, 'all', '5', null]) {
    assert.throws(() => protocolCheck({ ...protocol, helper_fork_turns: fork }), /helper-history-drift/);
  }
  const bound = await bindings();
  assert.equal(bound['.ai-org/artifacts/WI-0199/executor.mjs'], sha(await fs.readFile(new URL('./executor.mjs', import.meta.url))));
  assert.ok(bound['.ai-org/artifacts/WI-0196/native-tracker.mjs']);
  assert.ok(bound['.ai-org/artifacts/WI-0196/event-policy.mjs']);
  assert.ok(!bound['.ai-org/artifacts/WI-0196/executor.mjs']);
  assert.throws(() => approvalCheck({ schema_version: 'temple.native-child-probe-approval/v1', approved: true, protocol_sha256: '2e3817ebedce79b7a5743ec9e1533f8e4dd6f49dc8a9320144a83d83505b69fe' }, { bindings: bound }), /approval-binding/);
});

test('all historical executable and live outcome files remain unchanged', async () => {
  for (const item of ['WI-0196', 'WI-0197', 'WI-0198']) {
    const dir = `.ai-org/artifacts/${item}`;
    const files = execFileSync('git', ['ls-tree', '-r', '--name-only', '586162c2dc84b99d95cee634544924d67663ed9a', '--', dir], { encoding: 'utf8' }).trim().split('\n');
    for (const file of files) assert.equal(sha(await fs.readFile(file)), sha(execFileSync('git', ['show', `586162c2dc84b99d95cee634544924d67663ed9a:${file}`])), file);
  }
});
