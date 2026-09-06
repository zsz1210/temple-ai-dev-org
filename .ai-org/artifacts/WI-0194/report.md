# WI-0194: Local event-recorder repair report

## Result and scope

Repaired candidate: `f9edc11a207ffd6488102fe427e5d82c103514e5`.
The local successor recorder and deterministic verification are implemented.
This is not a completed live comparison, a model-quality result, or evidence that Temple reduces tokens or delivery time.

## Changes

- Classify all 19 installed ThreadItem kinds explicitly. Unknown types fail closed; declared external tool capabilities do not grant permission.
- Treat child activity as a hint only. Validated parent spawn completion remains necessary for child binding and model/effort checks.
- Record bounded, privacy-safe metadata before schema validation, preserving the first failure separately from recent events.
- Reject malformed non-string item types without object coercion, raw-value retention, or diagnostic recorder crashes.
- Retain bounded hashed untrusted actor hints before validation. Unbound actors and hint overflow preserve cleanup uncertainty; hints never authorize subscription, interruption, or terminal status.
- Replay early and late child events through the actual executor using installed schemas and a fake transport. Preserve failed/interrupted spawn outcomes and sealed predecessor files.

## Verification

| Check | Observed result | Limits |
| --- | --- | --- |
| Full `npm run verify` | 632 passed, 0 failed; 150.611 seconds | Ran on the first local candidate. Subsequent changes were exclusively WI-0194 artifacts; framework source and root tests were unchanged. |
| Repaired candidate focused suite | 33 passed, 0 failed; 15.191 seconds | Actual executor callbacks, real installed schemas, fake local transport; no model generation. |
| Initial distinct review | Changes required at `c68fb23` | Found malformed-type diagnostic crash and lost unbound-actor cleanup uncertainty; preserved in `review.md`. |
| Repaired candidate review | See `review-2.md` | Exact-candidate Lean quality review, not Standard Independent QA or release authority. |

Commands: `npm run verify` and `node --test .ai-org/artifacts/WI-0194/events.test.mjs`.
The focused suite includes six malformed JSON type values, unknown actor cleanup, hint overflow, both child-event orderings, the complete installed item union, and predecessor byte equality.

## What remains unproven

WI-0193 stopped during the first support case: the original recorder reported an unknown item and did not retain its raw kind. This repair cannot retrospectively identify that event or repair the missing comparison rows. Its sealed evidence remains unchanged.

No new live candidate, retry, fallback, credit purchase, or reset was performed for WI-0194. The spent zero-retry authorization is not reused. Live compatibility and the missing matched support comparisons require a separately reviewed and authorized successor protocol; they are not a reason to relabel these deterministic replays as experimental success.

No runtime framework change, dependency activation, release, or merge is included. PR #62 remains a draft stacked on its existing integration branch.
