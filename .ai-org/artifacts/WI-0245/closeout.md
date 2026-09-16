# Release-toolchain preflight closeout

Accepted candidate: 471bdc0d76eafb2479bafd4fa4b9f2863cea69d1. WI-0245 is done.

The release workflow now pins the qualified official Node, checks Node/npm/zlib
through a shared local/hosted packing helper, and compares the attached archive
before starting complete verification. Complete verification remains mandatory;
the final qualified repack must still match the retained asset before OIDC publish.
The helper records the fingerprint, uses the same Node to invoke npm and refuses
existing output directories. The ADR and maintainer commands document the boundary.

Full verification: 1253/1253 pass, 315230.821084 ms. Distinct Independent QA PASS;
the reviewer ran 10 focused tests and eight independently authored counterexamples.
Actual Homebrew toolchain refusal took 255 ms without producing output. Official
Node pack succeeded (1862 ms), and a repeated destination preserved the archive.
Seven temporary installation/upgrade groups passed; these are synthetic fixtures.
All times are bounded local observations, not a hosted time or financial claim.

Post-close verify:fast: 58/58, zero fail/cancel/skip/todo, 2222.215833 ms. Doctor:
37 pass, one existing legacy actor-policy warning, zero failures. Fresh Status has
no active claim, workers or unresolved item; plan has zero selected/active/blocked
work. Later changes are evidence/lifecycle only; the tested implementation is unchanged.

The first dispatch preview lacked a named integration owner and correctly refused
worker preparation without spawning anything. The coordinator recorded Mog through
the supported CLI, refreshed the plan, then reserved and attached the QA worker.
No guard was bypassed and no failed preview is counted as actual work execution.

Ordinary PR CI and merge finish integration. No GitHub Release, npm publication,
channel update, permission change or real downstream upgrade was performed. The
new workflow's first live Release execution remains a later authorized publication;
local shell controls and CI do not claim that external result.

Next useful action: rehearse the published Alpha.33 upgrade and contributor entry
on a copy of a real project, retaining its policies and original checkout. This
recommendation does not authorize that next project mutation or another release.
