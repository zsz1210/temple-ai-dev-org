# Bounded four-repository commerce rehearsal — stopped safely

- Work Item: `WI-0067`
- Date: 2026-08-31
- Result: **stopped / no-go**
- External release: not performed

## Outcome

Temple initialized four independent local repositories and fifteen role-shaped Work Items for Coordinator, Catalog, Orders, and Notifications. The retained program declared ten Luna Max turns in seven waves, two-way concurrency, zero retry or fallback, and strict Token, time, disk, path, protocol, and authority boundaries.

The no-generation preflight passed: the installed CLI was `codex-cli 0.151.0-alpha.7.2`, all five pinned App Server schema digests matched, and `model/list` exposed `gpt-5.6-luna` with Max reasoning.

Wave 1 then started Catalog Tech Lead and Orders Product Manager concurrently. Both crossed the 60,000-Token per-turn ceiling before producing their required files. Temple interrupted both turns, recorded terminal status `interrupted`, stopped the program, did not retry, and did not launch the remaining eight turns. No product file changed.

## Observed usage

| Turn | Position | Requested / effective model | Requested / thread-observed effort | Total Tokens | Ceiling overshoot | Result |
|---|---|---|---|---:|---:|---|
| Catalog contract design | Tech Lead | Luna / Luna | Max / XHigh | 74,266 | 14,266 | interrupted |
| Orders checkout specification | Product Manager | Luna / Luna | Max / XHigh | 74,382 | 14,382 | interrupted |
| **Total** | — | — | — | **148,648** | — | stopped |

The aggregate contained 145,745 input, 114,176 cached-input, 2,903 output, and 1,784 reasoning-output Tokens as reported by the Provider. Cost and billing attribution remain unknown. The account usage probe was available but account-wide and unallocated; it cannot determine whether these two turns created a separate charge.

The apparent hard-limit overshoot is expected from the current control mechanism: App Server exposes no per-turn maximum-Token parameter, and Temple can interrupt only after receiving a usage event. The first event above the ceiling arrived near 74k for each turn. This is a bounded operational stop, not a byte-exact pre-consumption cap.

## What passed

- exact CLI and App Server protocol preflight;
- Luna Max availability before generation;
- four clean, independent repository baselines;
- two-way cross-repository launch;
- exact task, Work Item, Position, Agent, revision, model, turn, and usage correlation;
- interrupt delivery, terminal observation, durable checkpointing, zero retry, and later-wave suppression;
- separate Developer and Independent QA identities in every repository;
- current exact-revision federated portfolio after closeout;
- preservation of raw telemetry and generated usage projections without prompts or hidden reasoning.

## What did not run

The stop prevented implementation, v1/v2 rollout, producer-first failure and rollback, malformed-event recovery, stale/missing/path/overlap fixtures, service Independent QA, coordinator cold recovery, and the ten-completed-Work-Item longitudinal threshold. Those results remain **not run**, not failed and not zero.

## Reporting defect found

The as-run adapter placed telemetry under an ignored worktree runtime path. The runner could consume it, but `temple experiment report` correctly rejected that location because private telemetry must live under the Git common directory. The raw events were preserved and relocated to each participant's `.git/temple/control-plane` runtime, after which local usage projections reported 74,266 and 74,382 Tokens. The original stopped manifest and runner state remain retained evidence; they were not resumed.

This uncovered a missing pre-run validation: `experiment inspect` accepted a `usage_state_directory` that the report phase could not consume. A framework correction must reject that configuration before generation and make live adapters use the same resolver as reporting.

## Conclusion

The resource guard and no-retry behavior worked, but the intended commerce rehearsal did not complete and the evidence is not longitudinally qualified. This run cannot support savings, cost, model-quality, routing, enterprise-readiness, production-readiness, or release claims. A replacement experiment requires a new manifest and explicit approval; this stopped attempt must never be silently resumed or counted as a successful sample.
