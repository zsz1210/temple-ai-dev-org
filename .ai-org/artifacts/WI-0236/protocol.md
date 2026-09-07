# WI-0236 — Minimum matched comparison authorization record

## Authority and frozen candidate

The user's current request to complete steps 1–3 authorizes the bounded comparison described in [the work order](design.md). This is a coordinator-recorded execution binding of that scope, not a claim that the user separately typed or reviewed the following digest. No earlier digest-bound approval is reused.

- Source candidate: `1f922e99508d76455a645a1b8683df34e7b7616d` (public-safe squash; not merged into main).
- Protocol version: `continuity-approved/v3`.
- Protocol SHA-256: `sha256:91cdbcc310e3679f0d781a484c7acc6e05bb02de033c1690611c9d4d61205898`.
- Instrument SHA-256: `sha256:109f5b8ba1b74bc290de7f4ae6e9e362cf382099a0fb4c4e1614ca1d7f2b6d9b`.
- Runtime bundle SHA-256: `sha256:eadf806d728767d8aa829c7f3e8de4fbffe2ffcb60841f01d3f9e23dec1e1922`.
- Installed provider: `codex-cli 0.153.4`; subscription authentication only.

The full protocol includes private ephemeral filesystem coordinates and remains local. These digests bind it without publishing those coordinates. Existing private branches and original WI-0234 experiment records remain retained; the new public commit excludes unpublished private ancestry and preserves executable content from local candidate `94163eb0`.

## Fixed order and ceilings

| Subject | Requirement condition | Arm | Model | Reasoning |
| --- | --- | --- | --- | --- |
| 1 | Stable | Ordinary | gpt-5.6-terra | medium |
| 2 | Stable | Temple | gpt-5.6-terra | medium |
| 3 | Changed specification | Temple | gpt-5.6-terra | medium |
| 4 | Changed specification | Ordinary | gpt-5.6-terra | medium |

Per subject: at most 100000 Operational Tokens and eight minutes. Aggregate: at most 400000 Operational Tokens and forty minutes. Operational Tokens mean uncached input plus output; cached input and reasoning output are reported separately, not double-counted. Account percentages are not converted into a Token balance.

There are zero retries, replacements, fallbacks, purchases, automatic refills or resets. The first subject is the canary and belongs to the four-subject budget. Failed native execution, unknown usage, source drift or uncertain cleanup stops the batch. Retain partial outcomes without an automatic repair-and-restart loop.

## Pre-generation qualification

The installed native thread/configuration check passed without model generation: correct fixed model/reasoning, native instruction source and filesystem/network boundaries; provider exit confirmed. This is not proof of successful model-selected tool execution, which only the first subject can supply.

The isolated independent oracle passed all four controls: current-requirement implementations accepted and stale-requirement implementations rejected for both arms. No model generated those controls. The complete local behavioral suite on the exact candidate is an additional required dispatch gate; its result is recorded in the verification report, not inferred here.

## Interpretation

Score product correctness, completion/blocker reporting and Temple administration independently. Report all-attempt usage and measured time, not only accepted deliveries. Use `command_observations.completed_items` for deduplicated command counts; old `completed_commands` counts events. Lexical categories and bounded observed bytes are hints with explicit unknown coverage, not semantic read proof, per-command Tokens or causal attribution.

One pair per condition is diagnostic only. Historical v2 strict completion scores remain unchanged and are not directly comparable with the new schema. Do not claim cache control, general savings, a default policy improvement or statistical significance. Stop after this sealed batch and its report.
