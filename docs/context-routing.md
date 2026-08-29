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

Humans and authorized Agents maintain canonical project files, the thin `.ai-org/project/spec-index.json` authority registry, and the thin `.ai-org/project/context-map.json` routing map. The specification index answers which product or interface document governs a revision; the Context Map answers when an Agent should read a source. Neither stores the source body. The CLI derives two disposable views:

- `.ai-org/views/capabilities.json` inventories repository Skills and their lifecycle ownership.
- `.ai-org/views/work-items/WI-####.json` records the bounded Context Capsule resolved for one work item and Position.

Both files can be rebuilt. They never override the Spec, ADR, Skill, Learning record, work item, Assignment, or evidence to which they point.

The Capability Registry classifies exact managed Skill paths as `core`, `optional-pack`, or another framework-managed distribution. An unlisted repository Skill is observed as a `project-extension`; discovery does not add it to `temple.lock`, install it, approve its dependencies, or transfer ownership to Temple.

## Context Map

The Context Map is a compact index of important project sources. Do not copy full documents into it. Each route gives an Agent enough information to decide whether the referenced source should be read.

```json
{
  "schema_version": "temple.context-map/v1",
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
      "status": "active"
    }
  ]
}
```

Active routes must use repository-relative safe paths, name valid Positions, and point to existing files. `temple doctor` checks those conditions. A work item may pin routes through repeatable `--context-ref` values; `temple doctor` rejects references that do not exist.

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
  --revision abc123 \
  --no-write \
  --json
```

Remove `--no-write` to persist the generated capsule. A capsule contains:

- the canonical work-item path, scope, acceptance criteria, and unresolved items;
- the Work Item's revisioned product, UX, UI, API, and technical-design references, resolved to their current authority metadata with stale-reference warnings;
- the Position, assigned Agent Identity, and caller-supplied or inferred revision reference;
- matching Context Map routes;
- active Practices and validated Lessons relevant to the query;
- matching repository Skills and their distribution class;
- affected-path overlaps with other non-terminal work items;
- the provider ID, retrieval mode, scores, reasons, and warnings.

The resolver does not read every routed document into a prompt. It returns paths and reasons so the Agent can open only the sources necessary for the current responsibility.

## Retrieval Provider boundary

Alpha.12 ships `repository-deterministic`, a local provider that uses explicit IDs, work-item references, Position hints, phrases, terms, tags, and paths. It is reproducible, requires no network, model, vector database, daemon, or embedding download, and reports `semantic: false`.

The `temple.retrieval-provider/v1` contract reserves an adapter boundary with `id`, `mode`, `semantic`, and `search(request)`. A future local hybrid adapter may combine deterministic filters with embeddings or a local LLM when repository size and measured retrieval misses justify the operational cost. Such an adapter must preserve repository-relative citations, provider provenance, bounded result limits, project privacy, and deterministic fallback. The current CLI does not select, install, or run a semantic provider.

## Scaling and maintenance

- Keep route summaries short and discrimination-oriented.
- Route stable source families, not every implementation file.
- Use `work_items` and `context_refs` for explicit exceptions; do not encode transient chat state.
- Deprecate a route before removing it when active work may still reference it.
- Treat affected-path overlap as a warning for coordination, not an automatic ownership claim or work cancellation.
- Evaluate retrieval failures from real work before adding semantic infrastructure.

This design supports small repositories without setup overhead and provides a stable seam for larger repositories without making RAG a dependency of every project.

## Validation evidence

The bounded local and CI evidence for alpha.12 is preserved in [Alpha.12 Progressive Context Routing validation](validation/alpha-12-progressive-context-routing.md). It proves the stated deterministic installation and CLI path, not real-project cross-task recovery, multi-maintainer governance, large-repository retrieval quality, or a semantic provider.
