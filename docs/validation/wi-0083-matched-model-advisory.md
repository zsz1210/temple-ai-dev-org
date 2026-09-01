# WI-0083 Matched Model Advisory

- Status: deterministic local evaluator independently verified; real matched model results and routing execution remain unverified
- Tested revision: `ad10d528113963673724d9b02004b62e87aaafbe`
- Environment: macOS 26.5.2, Node.js 25.6.1, npm 11.11.0
- Work Item: `WI-0083`

## Capability under test

Temple can read project-owned matched-evaluation records from explicitly configured paths below `.ai-org/evaluations/model/`. It verifies that each candidate used the same task shape, cases, input digests, source revisions, rubric, Seed Policy mapping, privacy contract, and statistical decision contract.

Quality is checked before resource efficiency. Only a challenger that passes every required quality case can be compared by paired Token use. The current `paired-sign-test-v1` implementation then requires the configured minimum effect and exact two-sided sign-test threshold. Latency, rework, human intervention, and profile ID provide deterministic tie-breaking.

The output is advisory only. It cannot launch an evaluation, contact a provider, change a model, rewrite policy, advance a Work Item, bypass a budget or gate, or authorize release.

## Verification performed

Developer, Quality Evaluation, and Independent QA used the same exact candidate revision. Independent QA created a second fresh detached worktree and observed:

- `npm run verify`: 260 tests passed, 0 failed;
- repository and documentation-link checks passed;
- schema validation checked 104 documents through 28 schemas with 0 errors;
- Doctor reported healthy with 35 passes, 0 failures, and one known stale generated parallel-plan warning;
- the self-host preflight reported zero configured matched sources, `not-configured`, no recommendation source, no executor, no automatic routing, no model switch, and no canonical-state change;
- all three README editions retained the same ten-section hierarchy.

Focused adversarial cases cover quality loss despite lower Tokens, incomplete or duplicated cases, input or revision drift, effective-profile mismatch, stale evidence, statistical-contract mismatch, private or unknown payload fields, unsafe paths, linked files, missing or oversized sources, shadow mode, and legacy policy compatibility.

## What this proves

- The repository schema, bounded loader, evaluator, CLI preview, report and preflight projections, install and upgrade behavior, and documented authority boundary work locally at the tested revision.
- A project can obtain an explainable read-only recommendation when it supplies a valid matched evaluation and a satisfied project decision contract.
- A missing, invalid, stale, or incomparable record fails closed without changing a model or project policy.

## What remains unproven

- Temple's own repository has no configured matched-evaluation source, so there is no real recommendation for Luna, Terra, Sol, or another model.
- Temple does not generate the evaluation runs. Representative cases, rubrics, provider access, budget, and quality evidence require separate project authorization.
- The current method and case count are not claimed to suit every project; only `balanced` plus `paired-sign-test-v1` is implemented.
- Automatic model routing, adaptive self-modifying policy, cross-project learning, monetary savings, production operation, and broad organizational qualification remain outside this evidence.
