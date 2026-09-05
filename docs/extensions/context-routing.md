# Progressive context routing

Temple keeps project truth in ordinary repository files and routes each Agent to the smallest useful evidence set for a work item. The routing layer reduces repeated full-repository reading; it does not create a second source of truth.

```text
Canonical Specs / ADRs / Skills / Work Items / Learning
                       │
                       ├── specification authority index
                       ▼
         project-owned Context Map
                       │
                       ▼
       deterministic Retrieval Provider
                       │
                       ▼
       generated work-item Context Capsule
```

## Source and ownership model

Humans and authorized Agents maintain canonical project files, the thin `.ai-org/project/spec-index.json` authority registry, and the thin `.ai-org/project/context-map.json` routing map. The specification index answers which product or interface document governs a revision; the Context Map answers when an Agent should read a source. Neither stores the source body. The CLI derives disposable views:

- `.ai-org/views/capabilities.json` inventories repository Skills and their lifecycle ownership.
- `.ai-org/views/parallel-plan.json` derives safe dispatch waves and freshness from canonical coordination state.
- `.ai-org/views/work-items/WI-####.json` records the bounded Context Capsule resolved for one work item and Position.

These files can be rebuilt. They never override the Spec, ADR, Skill, Learning record, work item, Assignment, or evidence to which they point.

The Capability Registry classifies exact managed Skill paths as `core`, `optional-pack`, or another framework-managed distribution. An unlisted repository Skill is observed as a `project-extension`; discovery does not add it to `temple.lock`, install it, approve its dependencies, or transfer ownership to Temple.

## Context Map

The Context Map is a compact index of important project sources. Do not copy full documents into it. Each route gives an Agent enough information to decide whether the referenced source should be read.

```json
{
  "schema_version": "temple.context-map/v2",
  "routes": [
    {
      "id": "checkout-spec",
      "kind": "product-spec",
      "title": "Checkout specification",
      "summary": "Product rules and acceptance criteria for checkout.",
      "paths": ["docs/specs/checkout.md"],
      "tags": ["checkout", "payments"],
      "positions": ["product_manager", "developer", "independent_qa"],
      "work_items": [],
      "read_when": ["Changing or verifying checkout behavior"],
      "owner_position": "product_manager",
      "status": "active",
      "stages": ["spec", "design", "build", "test", "independent_qa"],
      "purposes": ["primary", "integration"]
    }
  ]
}
```

Active routes must use repository-relative safe paths, name valid Positions, and point to existing files. `temple doctor` checks those conditions. A work item may pin routes through repeatable `--context-ref` values; `temple doctor` rejects references that do not exist.

Context Map v2 may also constrain a route by `stages` and `purposes`. An omitted or empty array means the route applies everywhere. `temple.context-map/v1` remains readable and behaves as unscoped; context resolution never rewrites that project-owned file. A pinned route outside the selected stage or purpose is excluded with a warning rather than silently overriding the route boundary.

## Capability discovery

List the current repository inventory or find capabilities relevant to a task:

```bash
temple capability list .
temple capability list . --json
temple capability find . --query "checkout documentation" --position developer
```

Search uses Skill names, descriptions, paths, Position hints, and declared invocation metadata. A result is a routing suggestion, not permission to perform the Skill's operation.

## Work-item Context Capsule

Record affected paths and any known context routes when creating work:

```bash
temple work-item create . \
  --title "Verify checkout totals" \
  --scope "Checkout calculation and tests" \
  --acceptance "Independent QA reproduces the public totals" \
  --affected-path "src/checkout/**" \
  --context-ref checkout-spec
```

Resolve context before acting in a Position:

```bash
temple context resolve . \
  --work-item WI-0001 \
  --position developer \
  --stage build \
  --purpose primary \
  --revision abc123 \
  --no-write \
  --json
```

Remove `--no-write` to persist the generated capsule. `--stage` defaults to the Work Item's effective lifecycle stage, while `--purpose` defaults to `primary`. Use `integration` for joining component revisions and contracts, and `recovery` when a fresh Agent must reconstruct the operating boundary. A capsule contains:

- the canonical work-item path, scope, acceptance criteria, and unresolved items;
- the Work Item's revisioned product, UX, UI, API, and technical-design references, resolved to their current authority metadata with stale-reference warnings;
- the Position, assigned Agent Identity, and caller-supplied or inferred revision reference;
- matching Context Map routes;
- active Practices and validated Lessons relevant to the query;
- matching repository Skills and their distribution class;
- affected-path overlaps with other non-terminal work items;
- the Work Item's current parallel-plan disposition, wave, and plan freshness;
- the provider ID, retrieval mode, scores, reasons, and warnings.
- the selected stage, purpose, and explicit `TEMPLE.md` fallback policy;
- a body-free source manifest with one stable selection digest plus per-file category, byte size, and SHA-256.

The resolver does not read every routed document into a prompt. It returns paths and reasons so the Agent can open only the sources necessary for the current responsibility.

The source manifest hashes selected safe regular files locally and retains no source body, prompt, hidden reasoning, tool payload, or credential. Its byte count measures repository content, not model Tokens or monetary cost. `TEMPLE.md` is included in the manifest only for explicit recovery purpose; primary and integration routes name it only as a fallback when authority is ambiguous or the route is incomplete. Temple never expands to it automatically.

Because `.ai-org/views/work-items/WI-####.json` remains a rebuildable latest view, a later resolution may replace an earlier Position, stage, or purpose view. Durable handoffs and evidence must cite canonical repository sources or normalized Evidence rather than using the capsule as lifecycle history.

## Compact entry

The source CLI adds an opt-in `temple.context-entry/v1` response for picking up current work:

```bash
node ./templew.mjs context resolve . --work-item WI-0001 --position developer --compact --no-write --json
```

`--compact` requires `--no-write --json`; it never writes or replaces the full generated capsule. The full response remains unchanged when the flag is omitted. This source addition is unreleased.

The compact entry keeps scope, acceptance, current recorded owner/claim, the last handoff and Developer candidate, unresolved items, selected references and warnings. It omits retrieval scoring, repeated query text and tracker observation detail. A `candidate_operation` and the profile edge guide navigation; they are not a readiness result. Additional policy gates, claim eligibility and current evidence must still be validated by the actual operation. Explicit route stage/Position selection does not change lifecycle ownership. Terminal work has no continuation; pending delivery recovery suppresses other next-operation hints.

Its body-free `source_manifest` is a compact projection, not the full manifest schema. The selection digest covers selected sources plus an authority group: entry instructions, workflow/policies, Identity/Assignment/collaboration, usage, repository integration and governing specification index. `sources` retains selected non-authority file hashes; `authority_snapshot` gives one group digest and its paths. A changed group requires rereading applicable authority; an unchanged hash never proves a source was read or remains available in the current session. Missing sources remain warnings or validation failures, never approval. Recovery and bootstrap reads still apply. Additional unselected authority remains the caller's responsibility.

Neither the manifest nor compact entry is a transaction-wide snapshot, a provider observation, or a Token measurement. Validators recheck mutable state at action time. Serialized sizes depend on selected content and may not be smaller for every tiny Work Item.

## Retrieval Provider boundary

Alpha.12 ships `repository-deterministic`, a local provider that uses explicit IDs, work-item references, Position hints, phrases, terms, tags, and paths. It is reproducible, requires no network, model, vector database, daemon, or embedding download, and reports `semantic: false`.

The `temple.retrieval-provider/v1` contract defines an adapter boundary with `id`, `mode`, `semantic`, and `search(request)`. Alpha.19 includes an injectable local-hybrid provider contract that can combine deterministic and local semantic results through reciprocal-rank fusion. Semantic output may rank only IDs already present in the supplied canonical repository corpus; it cannot replace their paths, content, or authority metadata. The provider preserves repository-relative citations and provenance and falls back deterministically when the local semantic provider fails.

The project-owned `.ai-org/project/retrieval.json` keeps `repository-deterministic` selected by default and marks local hybrid as `available_not_configured`. The framework installs no model, embeddings, vector database, daemon, or remote search. A project must supply and evaluate its own local provider before selection is considered.

## Retrieval evaluation

Store bounded cases in project-owned JSON and run:

```bash
node ./templew.mjs learning evaluate . \
  --fixture .ai-org/artifacts/retrieval-evaluation.json \
  --no-write \
  --json
```

Each case declares a retrieval kind, query, expected IDs, optional Position, and result limit. The report records result ranks, hit rate, mean reciprocal rank, and provider provenance. Remove `--no-write` to create the rebuildable `.ai-org/views/retrieval-evaluation.json` projection. The current large-repository validation field remains `not_run`.

## Scaling and maintenance

- Keep route summaries short and discrimination-oriented.
- Route stable source families, not every implementation file.
- Use `work_items` and `context_refs` for explicit exceptions; do not encode transient chat state.
- Add stage or purpose constraints only when the same source is genuinely irrelevant elsewhere; leave the arrays empty while evidence is insufficient.
- Compare `source_manifest.selection_digest` before reopening an unchanged route, but still read the underlying canonical source when the responsibility requires its body.
- Deprecate a route before removing it when active work may still reference it.
- Treat affected-path overlap as a warning for coordination, not an automatic ownership claim or work cancellation.
- Evaluate retrieval failures from real work before adding semantic infrastructure.

This design supports small repositories without setup overhead and provides a stable seam for larger repositories without making RAG a dependency of every project.

## Validation evidence

The bounded local and CI evidence for the original route and capsule foundation is preserved in [Alpha.12 Progressive Context Routing validation](../validation/alpha-12-progressive-context-routing.md). Alpha.19 adds deterministic evaluation and local-hybrid fallback coverage in [Phase 2C validation](../validation/alpha-19-extension-and-retrieval-maturity.md). Neither proves large-repository retrieval quality, production local-model operation, or multi-maintainer governance.
