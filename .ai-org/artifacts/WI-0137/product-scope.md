# WI-0137 product scope

## Problem

WI-0136 showed that Temple and a competent minimal workflow could reach the same correctness and recovery result, but Temple's Build and Integration stages carried more cached context and tool output. The current Context Capsule identifies useful paths, yet it does not bind the result to a lifecycle stage or execution purpose and does not expose the selected source footprint. A caller therefore cannot distinguish a small primary task route from integration or recovery context, nor verify whether a later optimization actually reduced the routed source set.

## Outcome

Make Context Capsules stage-aware, purpose-aware, content-addressed, and measurable while preserving repository files as the only authority.

A caller resolving context will be able to see:

- the effective lifecycle stage used for routing;
- whether the route is for primary work, integration, or recovery;
- which selected repository sources are authoritative, routed context, learning, or methods;
- the exact UTF-8 byte footprint and SHA-256 digest of each readable selected source;
- the stable digest of the complete selection manifest;
- why a source was selected and when full operating-contract recovery is appropriate.

## Compatibility

- Existing project-owned `temple.context-map/v1` documents remain valid and behave as unscoped routes.
- New projects may use `temple.context-map/v2` and optionally constrain a route by lifecycle stage and purpose.
- Empty `stages` or `purposes` means the route remains applicable everywhere, preserving the current behavior.
- Generated Context Capsules move to `temple.context-capsule/v2`; they are disposable views and can be rebuilt.

## Repository topology boundary

The contract is topology-neutral:

- a single repository resolves sources inside that repository;
- a coordinator-led workspace resolves coordinator-owned context and may point a component Agent at only its declared component paths and contracts;
- an autonomous federation continues to resolve one capsule inside each authoritative participant repository.

This Work Item does not centralize participant authority or change federation semantics. A coordinator-led component contract is a later, separate architecture change.

## Non-goals

- no model invocation, automatic model selection, or Token-price estimate;
- no prompt or source-body retention in generated telemetry;
- no semantic Retrieval Provider, embedding service, vector database, or RAG dependency;
- no automatic deletion or retention policy for project evidence;
- no Management Console redesign;
- no claim that byte size equals model Tokens or monetary cost.

## Acceptance

1. Context resolution defaults to the Work Item's effective lifecycle stage and accepts explicit `--stage` and `--purpose` values.
2. Context Map v2 route constraints exclude unrelated stages and purposes; v1 and unscoped v2 routes remain compatible.
3. The capsule contains a deterministic, source-body-free selection manifest with byte and digest measurements for safe in-repository regular files.
4. Missing, unsafe, non-regular, or unreadable selected sources are reported without crossing the repository boundary.
5. Tests cover legacy compatibility, stage filtering, purpose filtering, deterministic manifests, changed-content sensitivity, and a component-scoped integration fixture.
6. Documentation distinguishes routing evidence from authority and bytes from Tokens.

## Evidence boundary

The motivating numbers come from one matched four-repository scenario. They justify measuring and reducing repeated context, but they do not establish a population-wide savings rate. The next controlled cold-handoff experiment must compare the revised route against the previous route before any effectiveness claim or routing-policy change.
