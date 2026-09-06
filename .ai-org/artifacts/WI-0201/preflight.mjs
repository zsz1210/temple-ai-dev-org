import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sourceCheck as predecessorSourceCheck } from '../WI-0193/preflight.mjs';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
export const protocol = JSON.parse(fs.readFileSync(new URL('./protocol.json', import.meta.url), 'utf8'));

export function protocolCheck(candidate = protocol) {
  if (candidate.schema_version !== 'temple.native-child-compatibility-probe/v1') throw Error('protocol-version');
  if (candidate.status !== 'generation-disabled-awaiting-exact-readiness-and-approval') throw Error('protocol-status');
  if (candidate.purpose !== 'verify-one-parent-one-helper-observability-only') throw Error('protocol-purpose');
  if (candidate.source_revision !== 'f9332bdca3264eebfd071607c00d7c3415f77d24') throw Error('source-revision-drift');
  if (candidate.model !== 'gpt-5.6-terra' || candidate.effort !== 'medium') throw Error('route-drift');
  if (candidate.helper_context !== 'fresh-no-history' || candidate.helper_fork_turns !== 'none') throw Error('helper-history-drift');
  if (JSON.stringify(candidate.case) !== JSON.stringify({ id: 'support-read', arm: 'after', helpers: 1 })) throw Error('case-drift');
  const limits = candidate.limits ?? {};
  if (limits.subject_arms !== 1 || limits.subject_turns !== 2 || limits.max_children !== 1) throw Error('subject-limit-drift');
  if (limits.per_actor_operational_tokens !== 160000 || limits.aggregate_operational_tokens !== 320000) throw Error('token-limit-drift');
  if (limits.per_actor_ms !== 360000 || limits.aggregate_ms !== 900000) throw Error('wall-limit-drift');
  if (limits.retries !== 0 || limits.fallback !== false || limits.reset !== false) throw Error('retry-or-fallback-drift');
  if (limits.included_quota_only !== true || limits.purchase_credits !== false || limits.auto_topup !== false) throw Error('funding-drift');
  if (candidate.live_approval !== null) throw Error('embedded-approval-forbidden');
  return true;
}

export function sourceCheck() {
  protocolCheck();
  const result = predecessorSourceCheck();
  if (!result.protected_equal) throw Error('source-arm-drift');
  return result;
}

export function readiness() {
  return {
    ready: false,
    blockers: ['exact-seal', 'independent-readiness', 'fresh-live-approval'],
    model_calls: 0
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify({ kind: 'generation-free-native-child-probe-preflight', source: sourceCheck(), live: readiness() }, null, 2));
}
