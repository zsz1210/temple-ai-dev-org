# WI-0171 — Verification

Candidate: `7716b1fe5dc83ecfa3d52a15513d79aebeb63aaf`.

`node --test test/test-groups.test.mjs`: six tests pass. Valid base/list options remain supported. Unknown flags, duplicate base/list flags and missing base values are rejected by the parser. CLI preview with an unknown changed-scope flag reports full verification; an unknown explicit fast-group flag exits 1.

Parent integration `npm run verify`: 460 tests pass, zero failures or skips; Node test-run elapsed time 77,704.821 ms, plus passing repository, links and actual package-boundary checks. Independent review is recorded in `.ai-org/artifacts/WI-0170/independent-qa.md` and must accept this candidate before child closeout.
