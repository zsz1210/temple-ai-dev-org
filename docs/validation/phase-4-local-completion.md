# Phase 4 bounded local completion

- Release line: Alpha.27
- Governing Work Item: `WI-0015`
- Integration Work Item: `WI-0019`
- Environment: local macOS, Node.js, disposable repositories, and an isolated copy of AiPet organization state
- External actions, deployment, publication, paid model calls, and model switching: none

## Supported outcome

Phase 4's bounded local implementation is complete. Temple can locally inspect and retain backups with explicit consent, export a privacy-bounded audit record, observe usage without inventing Token or cost values, and coordinate exact-revision repositories through a read-only portfolio. Repository files remain lifecycle authority throughout.

This record does not claim production, regulated, multi-machine, or statistically meaningful efficiency qualification.

## Phase 4A — durability and recovery

The Alpha.27 AiPet rehearsal used a clean copy of real project-owned organization state while leaving the primary AiPet checkout unchanged at `28d53b483d0e5c5a21d9b483221393c3dd83ef77`.

- Alpha.5 organization state upgraded to Alpha.27.
- The pre-upgrade backup and independent inspection shared digest `c1de191bd5f0b6c0e39e4d6896aed3089fa1324eb55d6cd13e1378df76ba3f68`.
- Retention preview selected one deletion; apply required the reviewed digest and explicit consent; two backups remained and the pre-upgrade backup was preserved.
- The audit export contained 11 bounded events and no recovery payload bodies.
- Schema validation passed and Doctor reported 36 pass, 0 warn, 0 fail.
- Exact rollback and simulated interrupted recovery were independently inspected in the preceding Phase 4A evidence.

Evidence: `.ai-org/artifacts/WI-0015/alpha27-aipet-cli-rehearsal.json` and [the detailed AiPet digest rehearsal](phase-4a-aipet-digest-rehearsal.md).

## Phase 4B — policy and usage truth

The self-host preflight observed three registered terminal tasks, zero live-resumable tasks, and zero correlated detailed usage observations. Qualification therefore remained `not-qualified`: 0 of the required 10 completed Work Items. Total Tokens and monetary cost remained `null`; Token-savings, cost-savings, model-quality, and automatic-routing claims remained disallowed.

The observation performed no account probe, model-generation call, model switch, external action, or canonical lifecycle mutation. This is a successful fail-closed result, not a savings result.

Evidence: `.ai-org/artifacts/WI-0015/alpha27-usage-preflight-summary.json`.

## Phase 4C — repository federation

The disposable coordinator projected two exact-revision participant repositories. Both were current, both Work Items were projected, and the Initiative, contract, and rollout waves resolved as current. Participant content hashes remained unchanged and no participant portfolio was created.

After one participant's canonical Work Item was intentionally dirtied, that participant became `unknown`; its project and Work Items were omitted, and dependent Initiative and contract resolutions also became `unknown`. Overall completion remained unknown. The portfolio reported no lifecycle mutation or external action.

Evidence: `.ai-org/artifacts/WI-0015/alpha27-federation-cli-rehearsal.json`.

## Verification gates

The final release candidate must retain all of the following before its Work Items close:

- the accepted `--root` retention syntax and the explicit portfolio `--allowed-root` boundary;
- schema validation of the actual generated `.ai-org/views/portfolio.json` path;
- focused Phase 4 tests and the full repository verification suite;
- valid cataloged schemas, checksum-clean managed files, and a healthy Doctor result;
- fresh Independent QA from an exact-revision clean worktree, separate from the Developer identity.

## Retained qualification

- physical power loss, storage corruption, encrypted or remote backup transport, and production recovery;
- long-duration control-plane soak, crash-at-write-boundary, large-journal, and large-repository tests;
- real multi-human and multi-machine federation through separate clones, protected branches, pull requests, CI, conflicts, and an Integration Owner;
- other operating systems, regulated audit acceptance, production release operation, and published-package installation;
- at least ten qualified real completed Work Items across varied task shapes before any Token, cost, quality, or routing claim.

These are visible future qualification items. They are not silently reclassified as passing local evidence.
