# WI-0196 generation-free verification

## Result

The two-phase acquisition successor passes its focused fault-injection suite without contacting a model. The existing WI-0194 event suite also remains green.

## Commands

```text
node --test .ai-org/artifacts/WI-0196/events.test.mjs .ai-org/artifacts/WI-0194/events.test.mjs
52 passed, 0 failed

npm run verify:fast
54 passed, 0 failed

npm run verify
632 passed, 0 failed
```

## Covered behavior

- activity-only quarantine before verification;
- exact `thread/resume` child-ID, model, and reasoning-effort binding;
- buffered early child-event replay;
- activity/spawn race and single late corroboration;
- duplicate spawn and second-candidate rejection;
- resume ID, model, missing effort, effort mismatch, and transport failures with fixed stop codes;
- executor-level nested and foreign activity, candidate overflow, duplicate spawn, and usage-integrity failures;
- helper-write rejection;
- interrupted-cleanup uncertainty;
- conservative parent/child Token aggregation;
- byte-level preservation of sealed WI-0194 and WI-0195 inputs.

## Boundary

This evidence establishes deterministic local behavior only. It does not establish compatibility with the current live Codex App Server, successful helper measurement, delivery efficiency, or any comparative result. A separately sealed and approved minimal live probe is still required for that claim.
