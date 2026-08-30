# WI-0001 Independent QA report

- Work item ID: `WI-0001`
- Tested revision: `ed624187b01200deb087bd69a48f93231c3734b3`
- QA Agent ID: `agent-lulu`
- Developer Agent ID: `agent-rikku`
- Environment: clean detached Git worktree with lockfile-strict dependencies
- Result: pass

## Reproduction

1. Created a detached worktree at the exact candidate revision.
2. Ran `npm ci`; six packages were installed, the audit reported zero vulnerabilities, and the command exited successfully.
3. Ran `npm run verify`; repository checks, documentation links, and all 136 tests passed.
4. Ran the pinned self-host doctor; it reported 36 pass, 0 warn, and 0 fail.
5. Listed `project-overlay/.ai-org/project/`; no Agent Identity, Assignment, or collaboration identity file was present.

## Acceptance criteria checked

- The documentation root contains one index and purpose-based subdirectories.
- All local Markdown links resolve.
- The language policy recognizes only maintained localized entry points.
- Historical record classes remain separate from current guides.

## Counterexamples attempted

- Looked for identity leakage into the distributable overlay.
- Exercised ordinary init collision refusal and explicit self-host scope through the full E2E suite.
- Searched for broken moved-file links through the repository link checker.
- Checked for an unclean detached checkout after verification; only ignored dependency installation was present.

## Residual risk

This proves one local exact-revision recovery path, not concurrent multi-machine editing or generated documentation-site navigation.
