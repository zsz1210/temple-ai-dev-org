# Evaluation report — multi-human team governance

- Work Item: `WI-0076`
- Candidate revision: `006ef1123d7d00560f56e0d03477737ea0ab9d10`
- Position: Quality & Evaluation Engineer
- Agent Identity: `agent-lulu`
- Result: pass

## Reproduction

A fresh detached worktree at the exact candidate installed the six pinned packages and passed `npm run verify`: repository checks, documentation links, and all 257 tests succeeded. The focused governance suite separately covered v1 migration, duplicate Principal names, explicit migrated-team bootstrap establishment, local binding, simulated-versus-real gating, and the two-clone conflict/recovery path.

The local browser review covered Responsibilities, People & Agents, and Authority at 1440 px and 390 px. It found no horizontal page overflow, console error, or warning, and ArrowRight moved focus and selection between tabs. Server tests prove that the private projection removes Principal, sponsorship, detailed grant, trustee-identity, and binding data before serialization.

## Acceptance assessment

- Identity, membership, assignment, claim, sponsorship, authority, and recovery are separate and schema-validated.
- Collaboration v1 survives upgrade byte-for-byte until explicit migration; fresh projects use v2.
- Simulated collaboration cannot satisfy the real gate.
- The two-clone test supports conflict visibility, no silent accepted-record loss, and recoverability, without claiming a distributed lock.
- Solo remains valid with an implicit accountable person and self-asserted local binding.
- Developer `agent-rikku` remains distinct from Independent QA `agent-lulu`.

## Retained limits

Pass is limited to the exact local candidate and simulated runtime. Provider authentication, real multi-human operation, representative pilot use, and High-Assurance drill remain unverified and must stay `not_run`.

## Verdict

Pass. The exact candidate is ready for Independent QA.
