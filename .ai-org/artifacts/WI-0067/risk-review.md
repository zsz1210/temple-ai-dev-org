# WI-0067 risk review

| Risk | Control | Residual status |
|---|---|---|
| Usage unexpectedly grows | 40k/60k per turn and 300k/400k aggregate callbacks with interrupt | bounded by Provider callback latency |
| A turn continues after timeout | adapter dispatches the registered interrupt and runner stops; no next wave | bounded by Provider interrupt behavior |
| Duplicate billing or quota use | ten launch attempts maximum, persistent pre-launch checkpoint, zero retry | low |
| Model or schema drift | exact CLI and schema digest preflight plus Luna Max model-list check | low |
| Model edits outside scope | clean start, exact Git diff, per-turn path allowlist | low |
| One service controls another | separate repositories and lifecycle; coordinator read-only | low |
| QA edits implementation | IQA allowlist contains QA evidence only | low |
| Synthetic failure corrupts evidence | disposable copy or runtime-switch injection, explicit expected outcome | low |
| Usage is mistaken for money | monetary fields remain null and no billing claim is allowed | low |
| Local result is marketed as enterprise proof | report permanently denies enterprise-readiness and savings claims | low |

The experiment may consume the user's included Codex allowance. It uses no API key, usage reset, or separately priced API call, and Temple cannot prove account billing from Token telemetry.

