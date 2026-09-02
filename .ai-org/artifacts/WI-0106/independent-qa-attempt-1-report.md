# WI-0106 Independent QA attempt 1

- Candidate: `c27f193d03f36ecc50c6e4d4dba3f55e6928b0f9`
- Decision: **NO-GO**
- Independent QA: Lulu (`agent-lulu`)
- Developer: Rikku (`agent-rikku`)

The exact candidate passed the full repository suite (`280/280`), schema validation (`128` documents against `29` schemas), fixture behavior, `18/18` manifest checks, `20/20` pinned-source checks, resource arithmetic, identity separation, Wave 5C blocking boundary, personal Pro rate caveat, and retention of the first Quality NO-GO. No model generation or external write occurred.

Two corrections are required before release-gate review:

1. `arm-neutral-export.schema.json` exposes `candidate_revision`. A blind evaluator with repository access could resolve that SHA and inspect organization files or commit metadata to infer the process condition before scoring. The exact revision must remain in a sealed coordinator mapping with the condition mapping and usage, while the blind package carries only an unlinkable salted evidence ID.
2. `resource-preflight.json` attributes `55,297.014709 ms` to WI-0105, but the named retained observation records `55,324.376083 ms`. The threshold remains conservative, but the cited measurement must match its canonical artifact.

This failed attempt remains evidence and must not be replaced by a later pass.
