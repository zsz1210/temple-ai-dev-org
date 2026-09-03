# Technical design — WI-0133

## Design summary

WI-0133 changes two independent context sources and keeps their effects observable:

1. `project-overlay/AGENTS.md` becomes a compact always-on router. Detailed operating mechanics remain in `TEMPLE.md` and repository Skills and are loaded when their route is relevant.
2. The deterministic retriever stops treating Position membership and generic control words as sufficient evidence that a Skill belongs in a Context Capsule.

The frozen WI-0132 analyzer stays unchanged. New efficiency language is implemented as a separately versioned decision helper and used only by future protocols.

## Compact instruction contract

`project-overlay/AGENTS.md` remains project-owned integration text rather than a managed-file ownership claim. The compact block groups instructions into four sections:

- **Start:** identify Work Item and Position; resolve the bounded Context Capsule; use the pinned launcher and repository Skills.
- **Authority:** repository evidence is canonical; specifications, trackers, generated views, identities, assignments, and Learning keep separate authority.
- **Delivery:** preserve affected paths, claims, overlap handling, lifecycle gates, UI mode, High-Assurance requirements, distinct Independent QA, and pilot stop conditions.
- **Safety:** require governing approval for exceptional actions; preserve project-owned files and exact managed-file ownership.

The toolkit root `AGENTS.md` keeps its repository-specific preamble and receives the identical compact Temple marker block. A regression test compares the marked block with the distribution source and asserts every named invariant.

The contract removes the unconditional list of registries that every scoped task had to pre-read. A known Work Item instead starts with `context resolve`, which already validates and projects the relevant canonical state. New-work, recovery, and specialized operations route to `TEMPLE.md` or the applicable Skill.

## Retrieval change

`normalizedTokens` excludes common English control words, generic repository words, and file-extension noise. This is deterministic and provider-neutral.

`scoreDocument` separates relevance signals from ranking boosts:

- relevance signals: explicit context reference, Work Item reference, phrase match, or meaningful lexical match;
- ranking boost: Position match.

A document with only a Position match is excluded. Once another signal exists, the Position boost still orders likely Skills above neighboring matches. Exact IDs and meaningful terms remain supported.

No threshold is guessed from WI-0132 scores. Tests exercise the observed false-positive query and known positive queries directly.

## Context measurement

`measureContextEnvelope` keeps the existing stable digest inputs and reports each component's byte share plus the largest component. Byte counts remain repository-context measurements, not Provider Token estimates.

The no-generation setup records capability counts and reasons inside the normalized routed context. The WI-0133 verification compares the old retained component values with the optimized fresh fixture.

## Versioned decision semantics

A new module exports `classifyEfficiencyEvidenceV3` with schema `temple.effectiveness-decision/v3`. It accepts pre-registered thresholds and only returns `promising-efficiency` when:

- neither arm loses objective correctness;
- blind quality is non-inferior by the declared point bound;
- operational Tokens improve by at least the declared percentage; and
- latency improves by at least the declared percentage.

Otherwise it returns a bounded rejection, neutral, or inconclusive classification. Every classification has zero routing authority and an explicit next action. `analyzeEffectivenessPilotV2` and WI-0132 artifacts remain byte-identical.

## Confirmation protocol

`.ai-org/artifacts/WI-0133/terra-ab-protocol.json` defines two arms and two corrected cases. Its resource envelope is derived from WI-0132:

- per-candidate ceiling: observed Terra maximum `55,035 × 1.25`, rounded up to `69,000`;
- candidate aggregate: observed A+B total `138,762 × 1.25`, rounded up to `174,000`;
- evaluator ceiling: observed eight-package evaluator `27,237 × 1.25`, rounded up to `35,000` rather than assuming a four-package linear reduction;
- combined ceiling: `209,000` operational Tokens;
- candidate program time: observed A+B `206,499 ms`, rounded to a conservative `600,000 ms` to tolerate startup variance.

The protocol records `generation_ready: false`, requires a fresh Provider handshake and exact owner approval, and cannot be passed to the existing four-arm live command accidentally. Validation is local and performs no generation.

## Evidence retention

Retain a compact JSON bundle under WI-0133 containing WI-0132 source digests, condition aggregates, per-case metrics, frozen blind scores and rationales, context components, and protocol limits. Exclude prompts, responses, hidden reasoning, credentials, candidate repositories, and raw Provider payloads.

## Verification

- Focused Context and effectiveness tests.
- Fresh disposable initialization and Context Capsule inspection.
- Byte comparison against the retained 9,350-byte instruction baseline.
- Provider-free confirmation-protocol validation.
- Existing WI-0132 source artifacts remain unchanged.
- `npm run verify`, schema validation, and Doctor.
- Independent QA by Lulu, distinct from Developer Rikku.
