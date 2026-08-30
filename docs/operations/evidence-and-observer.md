# Evidence and Observer

Temple separates three things that are often accidentally collapsed:

1. an observation was recorded;
2. a Position accepted that observation for a named lifecycle gate;
3. a human authorized a high-risk or external action.

The Evidence Registry handles only the first. Work Item transitions handle the second. Existing human-authority boundaries handle the third.

## Registry

`.ai-org/project/evidence.json` is project-owned canonical state. Each `temple.evidence/v1` entry identifies its Work Item, kind, outcome, actor, observation time, adapter, exact Git scope revision when available, and SHA-256 digests for repository artifacts.

Supported kinds are:

| Kind | Source | Important behavior |
|---|---|---|
| `git-revision` | Local Git object database | Resolves the supplied ref to an exact 40-character commit |
| `test` | `temple.test-observation/v1` JSON | Checks result/exit-code consistency and hashes the observation and artifacts |
| `runtime` | `temple.runtime-observation/v1` JSON | Records environment, scenario, provenance, result, revision, and artifacts |
| `unverified-claim` | Explicit manual statement | Remains `unverified` and creates Observer attention |
| `risk` | Explicit manual review | Preserves severity, status, and mitigation; open high or critical risk creates attention |
| `rollback` | Repository procedure | Hashes the procedure; `verified` also requires an exact Git revision |

The adapters inspect supplied local state. They do not execute tests, launch runtimes, deploy, publish, contact a provider, mutate an external tracker, or add a reference to `gate_evidence`.

## Capture examples

Copy the managed observation templates into a project-owned artifact path and replace every placeholder with facts from the actual run.

```bash
node ./templew.mjs evidence git . \
  --work-item WI-0001 \
  --revision HEAD \
  --title "Candidate revision"

node ./templew.mjs evidence test . \
  --work-item WI-0001 \
  --observation .ai-org/artifacts/WI-0001/test-observation.json

node ./templew.mjs evidence runtime . \
  --work-item WI-0001 \
  --observation .ai-org/artifacts/WI-0001/runtime-observation.json
```

When the correct environment is unavailable, record that limitation rather than manufacturing a pass:

```bash
node ./templew.mjs evidence unverified . \
  --work-item WI-0001 \
  --summary "The interaction looks correct in the static preview" \
  --reason "The required device is unavailable" \
  --expected-verification "Reproduce the interaction on the named device"
```

## Observer projection

`node ./templew.mjs observe . --no-write --json` reads Work Items, runtime workers, events, and normalized evidence. It classifies work as active, blocked, QA-pending, approval-pending, or queued and reports:

- evidence bound to a different resolved scope revision;
- explicitly unverified, invalidated, or expired evidence;
- failed test or runtime observations;
- open high and critical risks;
- release approval still pending;
- failed or attention-state runtime workers.

Without `--no-write`, the same command writes `.ai-org/views/observer.json` and a static `.ai-org/views/overview.html`. They are generated, read-only projections with no approval or mutation controls. Delete and rebuild them at any time.

For terminal Work Items, `tested_revision` is the current exact-revision authority. Evidence captured against earlier revisions remains classified and visible as immutable history, but revision drift in that history is no longer current operational attention. Nonterminal stale evidence continues to require attention.

## Gate use

After the responsible Position reviews a registry entry and its source, it may deliberately cite the entry ID or artifact path through the normal `transition --satisfy requirement=reference` command. Recording evidence alone never changes the Work Item.

`doctor` validates the registry structure, Work Item references, and captured artifact digests. It does not claim that a supplied observation is truthful or that an external environment was actually exercised; Independent QA must still reproduce the required behavior.
