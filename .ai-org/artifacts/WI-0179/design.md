# WI-0179 — Optimized delivery comparison

## Authority and scope

The maintainer asked to continue and compare after PR #57. PR #57 is merged at `0002dacce9152918f00906f4ae611e06e5c153af`; the new comparison starts from that main revision. Preparation, implementation and generation-free checks are authorized. The proposed live-run matrix below needs its own explicit aggregate approval before any model turn; older experiment approvals are not reusable.

This is a bounded Standard Work Item. Mog integrates, Rikku implements, and Lulu independently checks an exact candidate. There is no UI change. No route policy, role default, subscription, Credits, reset, service, publication or release change is included. A passing implementation may be submitted as a PR under the standing instruction; a future PR is not automatically merged.

## Question and acceptance

Does the current compact-context/composed-delivery path reduce workflow overhead without losing product correctness or handoff integrity, compared with a competent ordinary workflow on the same small change?

1. Reuse the previous shipping-quote task, supplied tests, hidden oracle, fresh Builder/Verifier separation and ordinary workflow. Ordinary actors retain Git, tests, exact revisions and concise handoff; they are not a deliberately weak control.
2. Change only the Temple treatment and the supporting literal command recognizer: compact read-only Context plus `work-item deliver`, with real claim and revision validation. Preserve bootstrap reads and the verifier's independent fresh context. Record observed treatment adherence separately from product correctness.
3. Retain the main branch provider's owned-process shutdown fixes. Import only the four runner/policy source and test files from comparison commit `bba20cc140b72068827c7c858008c9768a16f067`, adapting them here. Do not import its canonical Work Items, events, artifacts or branch-local IDs.
4. Exercise both arms, all four stages and outside-write denial with the actual installed sandbox and zero model generation. Test negative command cases, requests against installed schemas, model availability, source/prompt/fixture digests, and the matrix totals before freezing. Product scope is `order.mjs` and `test/added.test.mjs`; post-commit root delivery records remain explicitly allowed evidence writes, not dirty product paths. Listing self-referential SHA evidence as product scope makes composed delivery impossible and is not a valid experiment setup.
5. Require distinct exact-candidate QA, `npm run verify`, frozen per-pair protocols and matching explicit live authority. Retain partial outcomes and stop at the first failure; no retries or fallback. Preparation evidence is not an experimental result.
6. Report pass/fail and treatment adherence before latency or Tokens. Keep setup, Builder, Verifier, operational Tokens, all Tokens, cached input, and command/context output volume separate. Unknown actual model/effort or usage remains unknown, never zero or inferred from the request.

## Proposed matched matrix

| Pair | Requested model / effort | Arm order |
| --- | --- | --- |
| terra-ordinary-first | gpt-5.6-terra / medium | ordinary, Temple |
| gpt6-temple-first | gpt-6-astra / medium | Temple, ordinary |
| terra-temple-first | gpt-5.6-terra / medium | Temple, ordinary |
| gpt6-ordinary-first | gpt-6-astra / medium | ordinary, Temple |

Each pair contains four fresh actor stages. Retain the previously successful per-stage protection cap of 80,000 Operational Tokens and six minutes, and the per-pair cap of 320,000 and 24 minutes. The proposed whole-run ceiling is 1,280,000 Tokens and 96 minutes (16 stages), not a predicted spend. If the maintainer approves Terra only, freeze a distinct two-pair matrix with an aggregate 640,000/48-minute ceiling rather than silently substituting it. No approval record is created from this proposal itself.

Use existing ChatGPT plan allowance only; no API key route, Credits purchase/refill or reset. Check installed model/effort availability before generation. GPT-6 is a test-specific exception, not a project model default. Two pairs per model counterbalance order but cannot establish statistical significance, cache causality, broad superiority, or performance on large projects. Historical one-pair results are contextual, not a causal control for the changed source and harness.

## Implementation and safety

The runner keeps its existing isolated subprocess environment, memory-disabled fresh threads, assigned-repository sandbox, immutable supplied files, retained artifact sealing, hidden oracle and fail-closed protocol checks. Scratch space remains outside sealed labs. The literal command recognizer documents admissible commands and classifies observed operations; it is not a pre-execution security boundary. The OS sandbox remains that boundary.

Introduce a new process-contract version. The optimized Temple Builder must obtain its claim ID from real CLI output, run compact Context with both `--no-write` and `--json`, and call composed delivery with the actual current claim and exact product revision. Do not fabricate or weaken the underlying lifecycle checks. The independent Verifier still checks the exact candidate, tests it and records its own acceptance. Capture actual compact-context and composed-delivery use as treatment evidence; a correct product with missing treatment is not an efficiency success for that treatment.

A matrix manifest binds selected models, order, totals and each fresh lab. Setup/preparation never starts generation. Source, prompts, command policy, fixture, provider schema and readiness evidence are pinned before approval is consumed. Labs, raw provider observations and absolute machine paths stay outside tracked public evidence; repository reports contain sanitized findings and digests only.

## Isolation, coordination and stop condition

Main WI-0172 reserves the other task. This isolated main-derived branch may read its completed implementation and reports but never changes that branch, old labs or historical artifacts. The source branch's WI-0178 is not main's WI-0178. The approved import is limited to `scripts/delivery-control-pair.mjs`, `scripts/delivery-command-policy.mjs` and their two tests. Shared provider changes from current main are preserved.

Implementation is sequential. Prepared Independent QA can review the committed candidate while the coordinator checks evidence without shared source edits. Abort and report if source/protocol digests drift, a sandbox or authority boundary fails, accounting becomes unreliable, a model is unavailable, the approved budget would be exceeded, or an actor violates the sealed contract. Investigate locally before requesting any materially new experiment. Do not repeat already-passing live stages.

Stop after the approved matrix and a findings/limitations/improvement report. A safety, provider or accounting failure stops the active pair immediately. A product-quality failure may still measure the other arm once under the existing pair contract; any non-comparable pair stops the matrix before another pair begins. No additional experiment is implied. If live approval has not arrived, stop at a verified ready-to-run candidate and label results as pending.

## Interface references

- [Official Codex App Server documentation](https://learn.chatgpt.com/docs/app-server): installed schema generation, model listing and active-thread usage notifications; inspected before implementation. Usage notifications are not proof of final account billing.
- The installed CLI-generated schema and the unchanged main provider are the executable contracts. No new external SDK or optional integration is introduced.
