# WI-0150 Work Order

## Decision

An external friend-run usability test is no longer a mandatory gate for the first narrow Alpha. Temple's primary supported path is AI-assisted, so the release rehearsal should reproduce that actual use: a fresh AI session reads repository-visible instructions and operates in a new project without prior Temple chat history or undocumented maintainer guidance.

## Approved scope

- Replace the external new-user gate in the Roadmap and Alpha readiness page with a fresh-session clean-room rehearsal.
- Require a disposable new repository, frozen starting inputs, no prior Temple conversation context, and no maintainer coaching during the run.
- Exercise installation or source access, initialization, one bounded Work Item through closeout, a second cold session recovering state, final Status, and Doctor.
- Permit the participant to use AI to read and execute the repository documentation; that is the intended product path.
- Record completion, elapsed time, errors, rework, Human interventions, and documentation gaps. Token observation remains optional and unavailable values remain unknown.
- State that this rehearsal does not establish unaided human documentation usability or statistically general performance.
- Leave historical `WI-0086` unchanged and treat the current readiness page as the superseding release plan.

## Acceptance criteria

1. Roadmap and release readiness name the same rehearsal and stop requiring another person for the first narrow Alpha.
2. The gate is reproducible and strong enough to detect hidden chat-memory, maintainer-coaching, initialization, lifecycle, or recovery dependencies.
3. The public claim boundary remains explicit.
4. No version, repository visibility, permission, tag, GitHub Release, npm state, or announcement changes.

## Design and risk

Use `fresh-session clean-room rehearsal` as the human-readable term. Keep the release-readiness gate concise, then describe the exact run under the preparation sequence. The Roadmap should name outcomes rather than duplicate the checklist.

Risk is low and reversible. The main risk is weakening usability evidence; mitigate it by narrowing the Alpha claim and retaining an optional external-human study as future ecosystem evidence rather than a release prerequisite.
