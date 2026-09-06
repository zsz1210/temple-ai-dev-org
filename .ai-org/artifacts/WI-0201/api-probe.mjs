import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createJsonRpcProcess } from '../../../src/codex-app-server-provider.mjs';
import { representativeAppServerArguments } from '../../../scripts/run-representative-microservice-comparison.mjs';
import { wave5ThreadIsolation } from '../../../src/app-server-protocol-replay.mjs';

// Real installed Provider, no turn/start and no model generation.
const root = await fs.mkdtemp(path.join(os.tmpdir(), 'temple-metadata-probe-'));
const conn = createJsonRpcProcess('codex', representativeAppServerArguments, { cwd: root });
const result = { schema_version: 'temple.ephemeral-api-diagnostic/v1', model_calls: 0, observations: [] };
try {
  await conn.request('initialize', { clientInfo: { name: 'ephemeral-metadata-diagnostic', version: '1' }, capabilities: { experimentalApi: true } });
  conn.notify('initialized', {});
  const start = await conn.request('thread/start', { ...wave5ThreadIsolation(root), model: 'gpt-5.6-terra', config: { model_reasoning_effort: 'medium' }, approvalPolicy: 'never', sandbox: 'read-only' });
  for (const omitTurns of [false, true]) {
    try {
      await conn.request('thread/resume', { threadId: start.thread.id, ...(omitTurns ? { omitTurns: true } : {}) });
      result.observations.push({ method: 'thread/resume', omitTurns, succeeded: true });
    } catch (error) {
      result.observations.push({ method: 'thread/resume', omitTurns, succeeded: false, rpc_code: error.rpcCode ?? null,
        category: /no rollout found/.test(error.providerReason ?? '') ? 'rollout-unavailable' : 'unknown-rpc-error' });
    }
  }
  const read = await conn.request('thread/read', { threadId: start.thread.id, includeTurns: false });
  result.metadata_checks = { identity: read.thread.id === start.thread.id, ephemeral: read.thread.ephemeral === true,
    model: read.thread.model === 'gpt-5.6-terra', effort: read.thread.reasoningEffort === 'medium',
    cwd: await fs.realpath(read.thread.cwd) === await fs.realpath(root), empty_turns: read.thread.turns.length === 0 };
  assert.equal(read.thread.id, start.thread.id);
  assert.equal(read.thread.ephemeral, true);
  assert.equal(read.thread.model, 'gpt-5.6-terra');
  assert.equal(read.thread.reasoningEffort, 'medium');
  assert.equal(await fs.realpath(read.thread.cwd), await fs.realpath(root));
  assert.equal(read.thread.turns.length, 0);
  result.observations.push({ method: 'thread/read', succeeded: true, identity_matched: true, ephemeral: true,
    configured_model: read.thread.model, configured_effort: read.thread.reasoningEffort, turns: 0 });
  result.status = 'passed';
} catch {
  result.status = 'failed';
  result.error = 'api-contract-check-failed';
  process.exitCode = 1;
} finally {
  await conn.close();
  await fs.rm(root, { recursive: true, force: true });
}
console.log(JSON.stringify(result, null, 2));
