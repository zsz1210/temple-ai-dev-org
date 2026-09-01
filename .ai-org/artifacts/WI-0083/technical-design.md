# Technical Design — Matched Model Advisory

## Architecture decision

Extend the existing Usage Protocol v2 pipeline instead of adding a routing executor.

```text
project-owned usage-policy.json
  └─ matched-evaluation source list and decision contract
       └─ .ai-org/evaluations/model/*.json
            └─ schema + bounded loader
                 └─ deterministic paired evaluator
                      ├─ usage report / preflight projection
                      └─ usage evaluate --fixture preview

No branch continues to task launch, model mutation, policy mutation, or provider contact.
```

`src/usage-policy.mjs` owns policy defaults and validation. `src/usage-attribution.mjs` owns bounded evaluation loading, deterministic comparison, and the read-only usage projection. The current observational shadow recommendation remains visible and distinct.

## Project-owned policy extension

Add an optional `calibration.matched_evaluation` object to `temple.usage-policy/v1`:

```json
{
  "sources": [],
  "maximum_age_days": 90,
  "supported_method": "paired-sign-test-v1"
}
```

Fresh projects receive the object. Existing project-owned policies remain valid when it is absent; runtime projection treats absence as an empty source list with framework defaults. Upgrade must not overwrite an existing policy.

Every source must be a normalized repository-relative JSON path below `.ai-org/evaluations/model/`. A path outside that root, a symlink escape, a missing file, invalid JSON, oversized string, or project mismatch becomes an explicit invalid source. The loader never searches the repository or follows a path supplied by telemetry.

## Matched evaluation contract

Add managed schema `temple.matched-model-evaluation/v1` and register optional project documents at `.ai-org/evaluations/model/*.json`.

Each document declares:

- stable evaluation ID, project ID, observation and expiry times;
- one exact task shape with all five required dimensions;
- one rubric ID, rubric revision, required case IDs, and minimum score;
- one paired decision contract matching the Usage Policy's configured method, minimum effect, alpha, power, and pilot variance;
- one baseline profile and at least one challenger;
- requested and effective provider, model, and reasoning evidence for every profile;
- the same case IDs, input digests, and source revisions for every candidate;
- per-case quality score and evidence references;
- per-case `total_tokens`, `latency_ms`, `rework_count`, and `human_intervention_count`;
- privacy constants confirming that prompts, responses, hidden reasoning, credentials, and raw provider payloads are absent.

The schema rejects unknown fields. Programmatic validation additionally rejects duplicate identities, case-set drift, digest drift, source-revision drift, profile mappings inconsistent with project policy, and quality pass flags inconsistent with the declared score threshold.

## Deterministic evaluation

For one valid document:

1. Check project identity, expiry, policy mode, exact task-shape completeness, profile mappings, privacy constants, and statistical-contract equality.
2. Require the baseline and each challenger to contain the exact same ordered set of case identities after deterministic sorting.
3. Apply the quality gate to every case. A failed or missing quality case rejects that candidate before resource comparison.
4. Pair each qualified challenger's `total_tokens` with the baseline by case ID.
5. Compute:
   - average quality and resource measures;
   - average Token reduction ratio;
   - wins, losses, and ties by paired Token count;
   - exact two-sided sign-test probability over non-tied pairs.
6. A challenger qualifies only when its average Token reduction meets `minimum_effect` and its sign-test probability is at most the configured `alpha`. `power` and `pilot_variance` remain declared study-design provenance; Temple does not invent achieved power from the result.
7. Sort qualified challengers by total Tokens, latency, rework, human intervention, then profile ID. Recommend the first.

The supported method is intentionally narrow and versioned. Temple does not claim that this method or any fixed case count fits every project. A project that needs another statistical method remains `not-qualified` until a separate implementation and validation adds it.

## Result model

The evaluator returns one bounded summary per source:

- `available`, `not-qualified`, `stale`, or `invalid`;
- task-shape ID and evaluation provenance;
- recommended and baseline profile IDs;
- candidate aggregates, quality result, effect, sign-test value, and rejection reasons;
- confidence `project-qualified` only when every configured gate passes;
- fallback Seed Policy profile;
- zero routing authority and all execution flags false.

Usage report and preflight add:

- `routing.shadow_recommendation` for the existing unmatched observation;
- `routing.matched_advisory` for the best sorted matched result or its blockers;
- `routing.recommendation_source` to distinguish the two;
- source coverage and invalid-source counts.

Existing fields remain backward compatible. `execution_status` remains `not-implemented`, `automatic_routing` remains `false`, and `model_switch_performed` remains `false`, including when policy mode is `automatic`.

## Command surface

Add a read-only preview:

```bash
node ./templew.mjs usage evaluate . \
  --fixture .ai-org/evaluations/model/example.json \
  --no-write --json
```

The command reads the current project and Usage Policy, evaluates exactly one safe repository file, prints the bounded result, and exits nonzero for invalid or stale evidence. It never writes a generated view and never contacts a provider.

`usage report` and `usage preflight` automatically read the sources explicitly listed by project policy. They do not scan for files and do not promote a fixture into canonical evidence.

## Compatibility and ownership

- The Usage Policy remains project-owned and optional new fields are backward compatible.
- The evaluation schema and catalog entry are framework-managed and mirrored in `project-overlay`.
- Evaluation documents are project-owned; Temple upgrades never replace them.
- Generated usage views remain observation-only and cannot satisfy lifecycle gates.
- Requested and effective execution data remain distinct; missing effective model or reasoning evidence blocks qualification.

## Verification design

Focused tests cover:

- valid matched qualification and deterministic selection;
- lower Tokens with failed quality;
- incomplete, duplicate, mismatched, stale, unsafe, or privacy-invalid evidence;
- decision-contract and project-policy mismatch;
- policy backward compatibility and fresh-install defaults;
- report, preflight, and CLI projections;
- no write, no provider call, no policy mutation, and no automatic routing under adversarial options;
- schema catalog validation and project-overlay parity.

Independent QA must reproduce the exact candidate in a detached worktree and confirm all routing authority flags remain false.
