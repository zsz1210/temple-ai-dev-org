import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { classify, diagnose } from './diagnose.mjs';
const parent = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const other = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const digest = createHash('sha256').update(parent).digest('hex');
const error = id => ({ target: 'codex_core::tools::router', feedback_log_body: `session_loop{thread_id=${id}}: error=collab spawn failed: no thread with id: ${id}` });
test('exact parent log establishes missing history without retaining log content', () => {
  const result = classify([error(parent), { feedback_log_body: `session_loop{thread_id=${parent}}: ToolCall: collaborationspawn_agent {"fork_turns":"5","message":"private"}` }], digest);
  assert.equal(result.failure, 'native-spawn-parent-history-unavailable');
  assert.equal(result.spawn_attempt_observed, true);
  assert.equal(result.history_fork_observed, true);
  assert.ok(!JSON.stringify(result).includes(parent));
  assert.ok(!JSON.stringify(result).includes('private'));
});
test('foreign or parent-reported error cannot establish the native failure', () => {
  assert.equal(classify([error(other)], digest).failure, null);
  assert.equal(classify([{ ...error(parent), target: 'agent-message' }], digest).failure, null);
  assert.equal(classify([], digest).failure, null);
});
test('malformed and excessive diagnostic windows fail before reading a database', () => {
  assert.throws(() => diagnose('/missing', digest, 'invalid', 'invalid'), /window/);
  assert.throws(() => diagnose('/missing', digest, '2026-09-06T00:00:00Z', '2026-09-07T00:00:00Z'), /window/);
  assert.throws(() => classify(Array(129).fill({}), digest), /overflow/);
  assert.throws(() => classify([], 'invalid'), /hash/);
});
