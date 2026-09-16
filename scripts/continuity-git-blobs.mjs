// Coordinator-only bounded reads. No persistent cache or candidate verdicts.
import { spawnSync } from 'node:child_process';

export const CONTINUITY_BLOB_BATCH_LIMIT = 16;
export function readContinuityBlobs(root, oids, { env, maxBlobBytes = 1024 * 1024, failure = 'unreadable-candidate' } = {}) {
  const require = condition => { if (!condition) throw Error(failure); };
  require(Array.isArray(oids) && oids.length <= CONTINUITY_BLOB_BATCH_LIMIT &&
    oids.every(oid => typeof oid === 'string' && /^[a-f0-9]{40}$/.test(oid)) &&
    Number.isSafeInteger(maxBlobBytes) && maxBlobBytes > 0 && maxBlobBytes <= 1024 * 1024);
  if (!oids.length) return [];
  const maxBuffer = oids.length * (maxBlobBytes + 128);
  const result = spawnSync('git', ['cat-file', '--batch'], {
    cwd: root, env, input: oids.join('\n') + '\n', timeout: 15000, maxBuffer
  });
  require(result.status === 0 && !result.error && Buffer.isBuffer(result.stdout) && result.stdout.length <= maxBuffer);
  const output = result.stdout, blobs = [];
  let offset = 0;
  for (const oid of oids) {
    const end = output.indexOf(10, offset);
    require(end >= offset && end - offset <= 127);
    const match = /^([a-f0-9]{40}) blob (0|[1-9][0-9]*)$/.exec(output.subarray(offset, end).toString('utf8'));
    const size = match ? Number(match[2]) : NaN;
    require(match?.[1] === oid && Number.isSafeInteger(size) && size <= maxBlobBytes);
    offset = end + 1;
    require(offset + size < output.length && output[offset + size] === 10);
    blobs.push(output.subarray(offset, offset + size));
    offset += size + 1;
  }
  require(offset === output.length);
  return blobs;
}
