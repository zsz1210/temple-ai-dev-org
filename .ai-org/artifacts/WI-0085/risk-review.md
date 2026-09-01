# Risk Review — WI-0085

## Disposition

Proceed with repository-local hardening. Retain a NO-GO for public release until external repository protections, reporting routes, release identity, and clean-consumer evidence are complete.

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| “Newest Node” is confused with a stable support promise | Consumers receive a short-lived or changing runtime contract | Support maintained LTS 22 and 24; reassess 26 after LTS qualification. |
| The allowlist omits a runtime file | A package installs but fails during init or use | Require representative runtime, overlay, Skill, pack, and documentation paths; run clean-package smoke later at the final candidate. |
| The allowlist includes private development state | Evidence, identities, screenshots, or project state becomes public | Reject self-host, test, example, output, and development roots in an automated dry run. |
| SHA-pinned Actions become stale | Security updates are missed | Record human-readable version comments and review updates deliberately; do not activate external dependency PR automation without approval. |
| Issue intake attracts secrets or private evidence | Sensitive data is exposed publicly | Repeat the warning in issue forms, contribution guidance, and security reporting instructions. |
| OSS files imply a mature support organization | Users expect an SLA or broad compatibility | Label the project Alpha, support only the latest Alpha after publication, and make the absence of an SLA explicit. |
| A public repository has no enforceable conduct route | Contributor harm cannot be handled privately | Keep public release blocked until a code of conduct and private moderation route are published. |
| Local verification is mistaken for publication authority | External settings or packages change without consent | Keep `private: true`; list visibility, settings, tag, Release, npm, and announcement as separate Human Principal gates. |

## Overlap ownership

WI-0035 retains the original CI cost and signal design. WI-0085 adds the supported LTS matrix, immutable Action pins, and package gate without weakening fail-closed scope selection. WI-0033 retains provider-trust ownership; WI-0085 changes only public vulnerability-reporting and version-support sections in `SECURITY.md`.
