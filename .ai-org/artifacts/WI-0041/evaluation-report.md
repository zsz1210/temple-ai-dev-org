# Evaluation report — WI-0041

- Candidate revision: `660f397a6f17c805ec2ef0467d27c8a53ca28134`
- Evaluator: Lulu (`agent-lulu`), Quality & Evaluation Engineer
- Decision: pass and proceed to Independent QA

## Counterexample found and corrected

The first runtime review of WI-0040 reproduced a real failure: opening the loopback Dashboard against a retained journal caused each replayed SSE record to start another snapshot fetch. Chromium accumulated 193 `ERR_INSUFFICIENT_RESOURCES` errors and the UI remained stale. WI-0041 was created as a serialized child correction rather than treating the automated tests as sufficient.

## Exact-candidate results

- Focused control-plane tests: 27/27 pass.
- Full repository verification: 218/218 pass.
- The 2,000-event regression permits at most one active refresh and collapses the burst into one sequential follow-up.
- Local desktop 1440 × 1000: `Snapshot current`, 0 console errors, no horizontal overflow.
- Local narrow 420 × 900: `Snapshot current`, 0 console errors, no horizontal overflow.
- Private tailnet 1024 × 1366: `Snapshot current`, 0 console errors, no horizontal overflow, read-only label visible, Inbox absent, Agent Commands absent.

## Usage truthfulness

The live project correctly renders Total Tokens and monetary cost as `unknown`, 0 detailed observations, 0/10 qualified Work Items, 2/28 registered completed Work Items, no observed model evidence, and no savings or routing claim.

## Transient screenshot digests

- Desktop 1440 × 4804: `sha256:de0e067dc74a537b04e99aeda22826dbf5143058c072dc6ec6bdebb3efa552c8`
- Narrow 420 × 8399: `sha256:2f7d0dbcf4d322ad54bd8126eabdefbc5e0c8b5ea8756b0288c0bf4c1633cecf`
- Private tablet 1024 × 4564: `sha256:4c23d9c2efa6ebfd60ceb0d09f97109bd3f2c46c5086b7208671b0476f02bec1`

Screenshots are transient local review material and are not repository authority. The report, runtime observation, candidate revision, and reproduced browser facts are the durable evidence.
