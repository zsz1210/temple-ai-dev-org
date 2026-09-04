# WI-0140 approved scope

## Problem

WI-0139 proved that stage-aware routing selected 63.79% to 65.51% fewer source bytes, but the completed multi-repository stage-aware condition still used 6.38% more Operational Tokens and took 8.01% longer. Initial package size therefore does not explain total context acquisition. Both single-repository conditions were censored at the 40,000-token limit.

## Required behavior

For each successful command completion, the harness derives and retains only bounded acquisition metadata:

- normalized repository ID and repository-relative path or an explicit unknown marker;
- access kind such as direct read, search scope, or required Git revision probe;
- route classification;
- returned output bytes when one unambiguous action makes that measurement meaningful;
- whether the observation was classifiable and policy-permitted.

Raw commands, query text, output content, prompts, responses, hidden reasoning, credentials, absolute paths, and temporary repository roots must not be retained.

## Classification

- `control`: the condition-local `CONTEXT_PACKAGE.json` read;
- `required-evidence`: allowlisted Git revision and clean-status reads required by the task;
- `routed`: an exact selected source or a file below an explicitly selected source directory;
- `permitted-fallback`: the declared Context Capsule fallback path;
- `off-route`: a safe repository source outside the route and fallback;
- `unknown`: no safe, unambiguous repository path can be derived.

Unknown observations reduce coverage and remain visible. They cannot be counted as adherence or silently treated as off-route.

## Successor experiment design

The next live protocol uses two repetitions of each strategy for each project shape. The second repetition reverses the within-shape treatment order, so treatment is not permanently tied to first or second execution. It retains Terra medium, zero retry, and zero fallback.

The single-repository ceiling is derived from the WI-0139 observed lower bound: the maximum censored condition was 40,460 Operational Tokens. The successor fixed ceiling is 51,000, which is the next 1,000-token boundary after adding one 10,000-token headroom band. This is a declared safety ceiling, not an estimate of optimal task cost. Multi-repository conditions retain the previously non-censoring 80,000 ceiling.

## Acceptance

- adversarial absolute paths, traversal, symlink escapes, oversized paths, failed commands, and ambiguous multi-action output cannot become compliant acquisition evidence;
- route metrics reproduce deterministically and keep unknown values explicit;
- analysis treats correctness as primary and reports acquisition/adherence before any Token claim;
- two balanced repetitions are required before a shape-level successor comparison can be complete;
- preparation and rehearsal use zero candidate turns and zero Operational Tokens;
- `.ai-org/artifacts/WI-0139/**` remains byte-identical to commit `1461cf6`.

## Exclusions

No live Provider generation, automatic routing decision, statistical or monetary claim, external write, merge, publication, or release is authorized by this scope.
