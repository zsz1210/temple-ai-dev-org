# Work order — WI-0064

## Objective

Revalidate the corrected Provider-observed model attribution path with exactly one local Codex App Server turn in the existing synthetic instrumentation repository.

## Authorized boundary

- Existing target: `<LOCAL_HOME>/Documents/ChatGPT/temple-effectiveness-lab/instrumentation-pilot`
- Model request: `gpt-5.6-luna`
- Reasoning request: `max`
- Approval policy: `never`
- Sandbox: read-only
- Network: disabled
- Launch attempts: 1
- Turns: 1
- Automatic retries or fallback: 0
- Token warning / hard stop: 40,000 / 60,000 total Tokens
- Turn ceiling: 15 minutes
- Whole validation gate: 45 minutes
- External spend, paid key, purchase, or reset: prohibited

The run may mutate only Temple organization state in the synthetic repository. It must not modify product files, contact a production system, push, deploy, publish, or release.

## Stop condition

Stop before the four-repository rehearsal if the installed protocol preflight fails, a launch field cannot be correlated exactly, the effective model is missing or outside the approved GPT-5.6 profile, a retry or fallback occurs, product files change, or the resource envelope is exceeded.
