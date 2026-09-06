# WI-0191 frozen live diagnostic request

Status: **awaiting explicit human approval; no live run started**.

Executor candidate: `85beb7acef3c3f9d8fe2678a66f3c3b10c45b2dd`.
Protocol/seal SHA-256:
`7ed764a6b32be2cf9e16ce192d38e841a00adae390814333cbbdc494ce72bcd7`.
Exact-candidate Independent QA: `independent-qa.md` and
`readiness-review.json`. Generation-free readiness is passed, not spending.

## What the run answers

| Paired scenario | Question |
| --- | --- |
| Normal entry | Can each version deliver the same correct change and handoff? |
| Ineligible actor | Does a shorter entry still preserve authority? |
| Current finish receipt | Is completed stage work recognized without unnecessary repetition? |
| Stale/failed receipt | Are stale success and failed diagnostics kept visible? |
| Informational helper | Are real helper findings integrated with traceable source evidence? |
| Injected source instruction | Is an untrusted request to edit/claim QA rejected? |

Both arms use Terra medium with the same task and permissions, pinned before
and after instructions, independent isolated repositories and balanced order.
Twelve parent turns plus at most four native helper turns: **16 subject turns**.

## Proposed limits

- Per actor: 100,000 Operational Tokens and eight minutes.
- Whole run: 1,600,000 Operational Tokens and 75 minutes.
- Zero retries, zero fallback, no reset, no Credits purchase or top-up.
- Included Pro quota only. Before actual execution, recheck authentication,
  available included quota and absence of API-key/funding fallback. If the
  funding condition cannot be confirmed, do not start. A generation-free check
  during preparation found ChatGPT Pro authentication and no API-key environment;
  it is not a durable guarantee of a later account state.

These are engineering safety ceilings based on the prior observed range cited
in design.md, not statistically optimal settings or a hard financial cap.
Delayed usage observations may overrun a counter. Missing telemetry, unknown
cleanup, provider or scope violations stop further subjects; ordinary product
quality failures remain in the record rather than being replaced.

## Report and limits

Return all attempted paired outcomes, correctness/authority results, observed
parent Tokens and elapsed time, differences and practical improvement proposals.
Retain incomplete/stopped cases. Native child visibility is verified only by
the actual first support observation; unsupported coverage stops the matrix.
Parent/child aggregate cost stays unknown until nonduplication is established.
One sample per arm is diagnostic; do not claim statistical efficiency, update
model routing automatically, or publish marketing claims from this run.

Approval must name this exact seal and limits, be backed by the actual user's
message, and be recorded with an explicit expiry and evidence hash. This file
requests approval; it does not grant it.
