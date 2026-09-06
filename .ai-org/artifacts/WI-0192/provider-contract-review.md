# Installed-provider contract review

## Evidence

Generation-free inspection on 2026-09-06 used Codex CLI 0.153.1 and freshly generated v2/ItemCompletedNotification.json, SHA-256 `69aba3fe5f72f38bf5c541e7e2c09de40778abe65ff969d9fc73372037812091`.

The collab item declares agentsStates, id, model, prompt, reasoningEffort, receiverThreadIds, senderThreadId, status, tool and type. It does not declare a top-level error.code. Each agent state has status and an optional message; tool statuses are inProgress, completed, failed and interrupted. The exact run configuration acknowledges features.multi_agent=true; no max_threads or max_depth override was returned. None of these facts proves a helper can be spawned successfully.

The previous repair's mocked error.code classification was not grounded in this schema. It is replaced by bounded agentsStates status and message hashes. Unknown error causes stay unknown; provider text is not stored or reinterpreted as a machine quota/model error. Historical spawn-rejection cause remains unavailable.

Official [App Server documentation](https://learn.chatgpt.com/docs/app-server) describes generated local schemas and thread-scoped operations. [Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents) describes native delegation. These sources support using the installed contract rather than assuming tool capabilities; they do not establish successful child delivery or usage nonduplication for this harness.

## Verification and authorization boundary

The final 12-case generation-free regression passed in 11.19 seconds, including a fresh installed-schema assertion. Full repository verification passed 632/632 in 151.56 seconds; final documentation and package checks passed. This is a Developer contract inspection, not independent acceptance or a live native-support result.

The composed Lean delivery helper does not support artifact-only scopes. The ordinary handoff/release/transition route documented by temple-work applies; no fake product path, profile change, deleted journal or bypassed evidence is needed.

The current user requested continuing through testing. That authorizes this local review and repair, but the prior single-run approval is spent, the successor protocol is not frozen/reviewed, and the usage policy has no automatic numerical budget. No new subject run, fallback, reset, Credits purchase or automatic top-up was performed. Pro quota inspection reported 96 percent of the weekly window consumed; that percentage is not convertible to a guaranteed Token capacity.

## Proposed next live scope, not approved

After review, freeze a fresh support-only protocol: two paired scenarios (source lookup and untrusted-source instruction), four parent turns plus at most four helper turns, same Terra medium route, 100,000 Operational Tokens and eight minutes per actor, 800,000 conservative Operational Tokens and 40 minutes overall. These are explicit ceilings derived from eight times the previous per-actor envelope, not predicted consumption or optimal limits. Use only included Pro quota, zero retries/fallback/reset/purchases/top-up. Stop on missing native coverage or provider/authority/limit failure; retain incomplete observations without replacement.

Do not reuse the WI-0191 approval, compare changed fixture/metric observations as unchanged replications, or silently enable the disabled successor runner. Exact protocol review and fresh budget authorization remain required before live execution. Normal implementation and finish cases need a separate decision about the changed metric before repeating them.
