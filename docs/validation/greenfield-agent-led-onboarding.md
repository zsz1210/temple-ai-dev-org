# Greenfield agent-led onboarding — deterministic path passed with provider limits

- Work Item: `WI-0115`
- Framework candidate: `0.1.0-alpha.29`
- Environment: local macOS, Node.js 25, offline npm cache
- Provider model generation: not run

## Question

Can a clean project install Temple and receive a safe, actionable Agent bootstrap contract without treating installed instructions as proof that a model loaded or understood them?

## Result

The deterministic path passed. A disposable project installed the locally packed candidate without registry access, initialized five synthetic Agent Identities across all ten Positions, and ran the installed `templew.mjs` launcher. Doctor reported 36 passes, one warning, and no failures. Pack, install, init, Doctor, and read-only Status took approximately 2.4 seconds in this run.

The init result named three instruction sources—`AGENTS.md`, `TEMPLE.md`, and `.agents/skills/temple-work/SKILL.md`—and the runner read each source successfully. The absent-file Claude path created a project-owned `CLAUDE.md` containing only `@AGENTS.md`; the lock did not claim that file as framework-managed.

Every bootstrap authority flag remained false. Init created no Work Item, claim, lifecycle transition, approval, external action, or proof of model comprehension.

## Retained limit

This run did not start a fresh Codex or Claude session. Provider-owned instruction loading, comprehension, human correction, and Token usage therefore remain unverified and `null`, not zero. A later bounded model run requires its own approved usage envelope and cannot reuse deterministic installation success as comprehension evidence.

The raw observation is retained in `.ai-org/artifacts/WI-0115/onboarding-observation.json`.

## Reproduce

From a clean Temple source checkout with locked dependencies installed:

```bash
node scripts/validate-agent-led-onboarding.mjs \
  --output /tmp/temple-agent-led-onboarding-observation.json
```

The output path must not already exist. The runner deletes its disposable consumer unless `--keep` is supplied.
