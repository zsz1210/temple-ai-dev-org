# Optional runtime test audit

Work Item: WI-0237, under WI-0234. Developer: `agent-rikku`, Principal: `human`; reserved runtime `worker-20260915231901-ef1dc0fc`, claim `claim-20260915231901-1d759d1f`. This report supplies Developer evidence only. Integration, complete verification and distinct-Identity Independent QA remain with the parent.

Read `TEMPLE.md`, `AGENTS.md`, the Work Skill and its parallel reference, the approved pruning plan, testing strategy, and the complete bodies of all eight files in `audit-inventory.json` → `groups.optional`. Confirmed the active claim and runtime attachment before editing. Baseline inventory revision is `477e0b60ecbe83caea18430ccb649c67ecd690ca`; the recorded passing baseline is behavioral candidate `8bfe3889`, using `.ai-org/artifacts/WI-0230/verification-8bfe3889.log.gz`. Worker base is `f9bbead6962d49f068c4a3d09cf40e871f2d8d01`.

## Result and deletion ledger

Audited 8 files and 64 baseline top-level test cases. Removed 2 cases, leaving 62. Changed 2 test files, removed 33 lines, and removed 2 unused imports. No assertion transfers or case consolidation, test skips, timeout changes, fixture changes, production changes, provider/account checks, or canonical-state mutations were made by this worker.

| Exact baseline title | File | Decision and meaningful coverage difference | Retained protection |
| --- | --- | --- | --- |
| `browser gate covers the approved responsive viewports and primary views` | `test/console-browser-contract.test.mjs` | Delete. Its two assertions deep-compared exported literal tables with a second copy of the same four pixel dimensions and six target/label pairs. It never opened a browser or observed responsiveness/navigation. Exact dimensions and display labels are no longer pinned in this unit test; no browser operation or runtime assertion was removed. | Unchanged `scripts/verify-console-browser.mjs` still runs mobile 390×844, tablet 768×1024, desktop 1440×1000 and ultrawide 3440×1440 through all six primary views. `assertPrimaryNavigation`, `navigateToView`, `verifyMobileSidebar`, `layoutViolations`, `organizationKeyboardContract` and `reducedMotionContract` check real navigation, visibility/ARIA, mobile dismissal, overflow, clipping, overlap, keyboard tabs and motion. Retained foundation test `Codex history bounds are validated and Temple Workspace exposes terminal work` still checks all six rendered `data-nav-target` values and parses embedded scripts. Retained browser tests cover intersection boundaries, confined screenshot paths, injected startup/runtime failures and cleanup, plus package/dependency boundaries. |
| `CLI help presents Console and collection as separate optional commands` | `test/optional-console-collector.test.mjs` | Delete. It launches `--help`, checks success and searches three strings: two command names and ordinary explanatory copy. It never invokes either command or detects whether Console starts collection. This removes only that specific help-copy pin and one help subprocess; command implementation and CLI parsing are unchanged. | Retained `the optional Console is read-only, does not own the writer lease, and does not grow telemetry` starts the Console, requests HTTP routes and proves no provider/repository poller or writer lease, mutation rejection, and unchanged telemetry size. Retained `the on-demand Collector writes retained telemetry without HTTP and can coexist with the Console` starts a Collector, verifies provider start/stop, writer exclusion, no HTTP/Console and retained telemetry after shutdown. `Temple Core initialization installs neither optional runtime` protects optional installation. The separate retained service CLI lifecycle test exercises actual collector service command wiring. |

These are explicit nonbehavioral-detail removals, not claims that HTTP/module tests exercise `--help`, or that a browser run proves a duplicate constant table. The browser gate implementation and selection remain unchanged. This worker did not execute the real-browser gate.

## Retained file review

| Audited file | Before → after cases | Retention reason |
| --- | --- | --- |
| `test/console-browser-contract.test.mjs` | 5 → 4 | Retain overlap edge/tolerance math, hostile screenshot path confinement, resource cleanup with failure injection and safe loopback binding, exact development-only Playwright dependency/license/package boundary. |
| `test/control-plane-foundation.test.mjs` | 12 → 12 | Model evidence provenance; replay-burst refresh serialization; stale-attention priority; journal redaction, collision handling, concurrent append/close and replay; shared worktree state; init/upgrade ownership; HTTP/SSE; nonblocking provider startup; config bounds; rebuild archival/usage retention. The large mixed HTML/config test has meaningful config validation, script parsing and regression guards, so it was not deleted merely because it also includes display copy. |
| `test/control-plane-inbox.test.mjs` | 6 → 6 | Preserve draft freshness; runtime/business authority separation and idempotency; opt-in command dispatch; adversarial instruction privacy and legacy scrubbing; exact-state/revision and independent-principal governance approval; loopback authentication/origin rejection. Different module, durable-state and HTTP entry points are complementary. |
| `test/control-plane-live.test.mjs` | 20 → 20 | Preserve pinned wire protocol transformations, privacy, bounded history/deduplication, canonical/observed distinction, Developer/QA safeguard, stale conditions, terminal event ordering, provider handshake and launch registration sequencing, usage/reroute correlation, every distinct failure and no-retry boundary, command eligibility, terminal history and degraded attachment. Unit normalization and subprocess provider cases prove different layers. |
| `test/control-plane-private-viewer.test.mjs` | 5 → 5 | Preserve Tailscale fail-closed configuration and cleanup, exact RFC1918 address boundaries, explicit-host CLI guard, separate LAN-listener behavior and spoofed headers, Tailscale host/identity controls, snapshot and SSE redaction, mutation exclusion and listener close. Existing environment-dependent LAN skip is unchanged. |
| `test/github-control-plane.test.mjs` | 3 → 3 | Preserve exact-SHA GET-only protocol, credentials redaction, ETag cache and stale-head invalidation, offline fixture network exclusion, explicit evidence capture and lifecycle non-mutation. Fixture and adapter paths are distinct. |
| `test/local-observer-service.test.mjs` | 5 → 5 | Preserve deterministic shell-free collector launch plans, unsupported-platform behavior, plan-bound authority, replacement/deletion confirmation, activation rollback, active-service replacement restriction, and actual CLI lifecycle wiring. Mock launchctl checks cannot replace the CLI test. |
| `test/optional-console-collector.test.mjs` | 8 → 7 | Preserve read-only rendering/control exclusion, opt-in installation, actual Console and Collector runtime separation, canonical filesystem refresh event, snapshot privacy and bounded payload compaction. The refresh event assertion and its cleanup remain intact. |

## Focused verification

Executed on Node.js `v24.20.0` (`/opt/homebrew/bin/node`) in the shared working tree after the two deletions:

```text
/usr/bin/time -p node --test test/console-browser-contract.test.mjs test/optional-console-collector.test.mjs
tests 11
pass 11
fail 0
cancelled 0
skipped 0
todo 0
duration_ms 3087.863875
real 3.12
user 3.01
sys 1.31
```

Exit status: 0. Raw worker log: `/tmp/temple-wi-0237-focused.log`. `git diff --check -- test/console-browser-contract.test.mjs test/optional-console-collector.test.mjs` also exited 0. Focused tests are editing evidence, not complete-suite or Independent QA evidence.

Exact tested file SHA-256 values:

| File | SHA-256 |
| --- | --- |
| `test/console-browser-contract.test.mjs` | `5d769b571c48e7b8dc0a1f45dffba84086f27a8e15deb2415c4db531ac591c7c` |
| `test/optional-console-collector.test.mjs` | `1aa0dcf59d11c2ba32a838507cd8edd84d1d25412d38e0994f14617b91b89792` |

The unchanged six test files were read in full but were not rerun by this worker. Parent verification must cover the integrated final candidate. No commit was created by this worker.

## Baseline timing context

The two deleted cases took `0.664584 ms` and `165.598583 ms` respectively in the existing complete baseline log: `166.263167 ms` summed test duration. That is not wall-clock savings; files run concurrently and the focused run is a different workload. This slice removes one subprocess and makes no material speedup claim.

The slowest five cases in this optional-file baseline were all retained:

| Exact baseline title | Recorded duration |
| --- | --- |
| `governance approval enforces current state, exact revision, active principals, and High-Assurance independence` | 4839.338625 ms |
| `upgrade seeds missing project-owned control-plane configuration without managing later changes` | 4669.2615 ms |
| `Human Inbox keeps runtime permission and business-fact authority separate and idempotent` | 3832.56575 ms |
| `HTTP becomes available before a slow Codex history reconciliation completes` | 2925.910417 ms |
| `Codex App Server provider-owned launch records attention without retry after turn rejection` | 2787.02275 ms |

These are one historical run on a contended machine. Slow setup does not justify losing the distinct behavior each case checks.
