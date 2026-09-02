# Developer Verification — WI-0092

- Position: Developer
- Agent Identity: Rikku (`agent-rikku`)
- Environment: macOS, repository-isolated worktree
- Candidate: recorded by the subsequent Developer handoff

## Behavior verified

- Off, On demand, and Managed local modes remain distinct.
- Managed planning is read-only, deterministic, macOS-only, and uses a direct argument vector rather than a shell.
- Apply requires the exact reviewed digest; active replacement needs explicit replacement and activation authority.
- Activation failure restores the previous plist and manifest when possible.
- Removal requires the installed digest plus deletion confirmation and retains telemetry.
- Usage reports a bounded post-start Work Item correlation gap without allocating account-wide usage.
- The private projection contains mode, service state, and gap fields but no plist, manifest, log, executable, or service-label paths.
- Human documentation describes the optional operating modes, privacy boundary, explicit external-task registration, and multi-machine limit.

## Commands and results

```text
npm run check
PASS

node --test test/local-observer-service.test.mjs test/phase-4b.test.mjs test/control-plane-private-viewer.test.mjs test/control-plane-foundation.test.mjs
39 passed, 0 failed

npm run test:browser
4 viewports x 6 primary views passed; reduced-motion passed

npm run verify
276 passed, 0 failed
```

## Runtime visual review

A controlled private-viewer snapshot exercised Managed local, Running, and one unobserved completed Work Item. Playwright confirmed the mode and gap text at 1440x1000 and 390x844 with `scrollWidth === innerWidth` at both sizes. Developer-reviewed local screenshots are stored outside the commit under `output/playwright/WI-0092/`.

This fixture demonstrates the required state and layout. It is not claimed as live Codex usage or an active macOS service installation; those remain separate integration evidence.
