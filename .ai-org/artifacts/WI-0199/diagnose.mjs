import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const hash = value => createHash('sha256').update(value).digest('hex');
const uuid = '[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}';

// Local, read-only diagnostic. Never return a log body, message or raw identity.
export function classify(rows, expectedHash) {
  if (!/^[a-f0-9]{64}$/.test(expectedHash)) throw Error('invalid-actor-hash');
  if (!Array.isArray(rows) || rows.length > 128) throw Error('diagnostic-window-overflow');
  let missing = false, attempted = false, historyFork = false;
  for (const row of rows) {
    const body = row.feedback_log_body;
    if (typeof body !== 'string') continue;
    const parent = body.match(new RegExp(`session_loop\\{thread_id=(${uuid})\\}`))?.[1];
    if (!parent || hash(parent) !== expectedHash) continue;
    const missingId = body.match(new RegExp(`error=collab spawn failed: no thread with id: (${uuid})(?:\\s|$)`))?.[1];
    if (row.target === 'codex_core::tools::router' && missingId === parent) missing = true;
    if (body.includes('ToolCall: collaborationspawn_agent ')) {
      attempted = true;
      historyFork ||= /"fork_turns"\s*:\s*"(?:all|[1-9][0-9]*)"/.test(body);
    }
  }
  return {
    actor_sha256: expectedHash,
    spawn_attempt_observed: attempted,
    history_fork_observed: historyFork,
    failure: missing ? 'native-spawn-parent-history-unavailable' : null,
    raw_content_retained: false,
    authority: 'local-runtime-diagnostic-only'
  };
}

export function diagnose(database, actorHash, from, to) {
  const start = Date.parse(from), end = Date.parse(to);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start || end - start > 900000) throw Error('invalid-diagnostic-window');
  if (!/^[a-f0-9]{64}$/.test(actorHash)) throw Error('invalid-actor-hash');
  const sql = `SELECT target, feedback_log_body FROM logs WHERE ts BETWEEN ${Math.floor(start / 1000)} AND ${Math.ceil(end / 1000)} AND (target = 'codex_core::tools::router' OR feedback_log_body LIKE '%ToolCall: collaborationspawn_agent %') LIMIT 129`;
  const raw = execFileSync('sqlite3', ['-readonly', '-json', database, sql], { encoding: 'utf8', timeout: 5000, maxBuffer: 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
  return classify(JSON.parse(raw || '[]'), actorHash);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.length !== 4) throw Error('invalid-arguments');
    console.log(JSON.stringify(diagnose(...args), null, 2));
  } catch {
    console.error('diagnostic-unavailable');
    process.exitCode = 1;
  }
}
