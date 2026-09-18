# Optional Headroom tool-output adapter

Use this when a tool wrapper has a large, disposable log or JSON response. The
adapter produces a derived reading view and an exact original snapshot. It is
off by default and does not intercept Codex conversations or other tools.

## Read an original, without optional dependencies

```bash
node ./templew.mjs adapter headroom-view . --input output/build.log --kind log --json
```

The JSON envelope includes the original `content`, its SHA256, a status/reason and
metrics. Without `--enable-headroom`, Python is never started and no snapshot is
written. `headroom-view` always emits JSON, including without `--json`.

## Enable one eligible reading view

Obtain a trusted isolated Python environment through your normal dependency
process, with `headroom-ai==0.37.0` and `tiktoken==0.14.0`. Retain its dependency
lockfile, LICENSE and NOTICE files. Prepopulate the `o200k_base` tokenizer cache
through that setup process too. The worker reads `TIKTOKEN_CACHE_DIR`, or the
system temporary directory's `data-gym-cache`, without permission to modify it.
Missing cache data safely returns the original. Temple does not install or download them.
The executable must be an absolute path. This first adapter supports compression
on macOS with `/usr/bin/sandbox-exec`; other platforms return the original with
`unsupported-platform`. Original reads remain portable.

```bash
mkdir -p output/headroom
node ./templew.mjs adapter headroom-view . \
  --input output/build.log --kind log --enable-headroom \
  --python /absolute/path/to/venv/bin/python \
  --snapshot /absolute/path/to/project/output/headroom/build-original.txt \
  --query 'Which failures require follow-up?' --json
```

Use a new snapshot filename for each invocation. Only an explicit enable flag,
`log` or valid `json`, and at least 16 KiB can start compression. Inputs must be
regular UTF-8 files no larger than 1 MiB; query text is limited to 4 KiB. These
initial bounds are conservative operational limits, not calibrated optima.

The worker has isolated Python startup, a minimal environment, fresh scratch,
OS-denied network and writes outside scratch, no model calls or ML downloads, and
a 15-second limit. It exits after each invocation; no idle Node/Python service is
created. A separately configured Python environment is trusted local code, not an
untrusted executable sandbox or a complete supply-chain attestation.

The adapter returns compression only when the complete response envelope shrinks,
the content token estimate improves, and the original snapshot was written with
exclusive creation and owner-only permissions. It never overwrites a snapshot.
Keep snapshots local, outside `.git`, `.ai-org`, `.agents` and `.codex`; parent
directories must exist. The caller owns retention and deletes its own snapshots
after the task. A snapshot-write failure can leave an incomplete file (`snapshot_bytes`
is null when an opened snapshot's storage is uncertain); that path
is never advertised as usable readback and requires caller cleanup.

## Read back the exact original

For a compressed result, pass the returned `readback.snapshot` and
`readback.sha256` values, without guessing either:

```bash
node ./templew.mjs adapter headroom-read . \
  --input /absolute/path/to/project/output/headroom/build-original.txt \
  --expected-sha256 REPLACE_WITH_RETURNED_SHA256 --json
```

Missing, changed, symlinked or oversized snapshots fail explicitly. The adapter
does not substitute a newer source or reconstruct omitted text. Retain the full
envelope: a wrapper that discards its readback descriptor loses this guarantee.

## Fallback and measurement

Disabled, small or unsupported input returns exact original content. Organization
directories and the named AGENTS/TEMPLE/CLAUDE instruction files also pass through.
Missing or
wrong-version runtime, timeout, malformed worker response, CCR markers, snapshot
failure or no net reduction also returns the original with a bounded reason.
Worker diagnostics and private stderr are never inserted into the reading view.
Invalid UTF-8, unsafe file types and inputs over 1 MiB fail before compression.

Metrics include original/returned bytes, worker attempts, worker/total milliseconds,
snapshot bytes and optional `o200k_base` content token estimates. `candidate_output`
is the attempted compressed content; `returned_output` follows the content actually
returned, including fallback. Estimates exclude the envelope, model history,
answer/reasoning and later readback. `model_usage: null` means unobserved, not zero.
The adapter itself makes zero provider calls. A model-calling wrapper must record
its own initial and readback calls, cache, outputs, failures and latency before
claiming total savings. Do not turn local estimates into billing claims.

Jev or any other selector can choose upstream content before this command. This
adapter does not call Jev, select documents, change thresholds or grant spending
authority. No instructions, permissions, canonical evidence or code should be
passed through the lossy view. `--kind` is a caller declaration, not an automatic
security classifier. Returned data never becomes a gate or approval.

This adapter does not implement Headroom's native proxy, CCR persistence or
automatic retrieval loop. A CCR-marked result falls back to raw because the local
worker's cache does not survive its exit. The earlier synthetic diagnostic supports
trying this optional boundary, not a global default or a promise of faster tasks.

See [ADR-0070](../adr/0070-opt-in-tool-output-compression.md),
[third-party notices](../../THIRD_PARTY_NOTICES.md) and the
[pinned upstream release](https://github.com/headroomlabs-ai/headroom/releases/tag/v0.37.0).
