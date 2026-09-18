# Integration qualification

The user authorized integration of the qualified contributor-entry branch into
main. Product candidate remains `8518841bdb2b0d66529652507cb9d83516d8b813`;
subsequent additions in this directory preserve evidence only.

The original full verification log and distinct verifier judgment are retained
without rewriting their historical stage boundaries. Canonical Work Item and
event records remain in the shared administrative checkout; unrelated Jev work
is excluded from this branch.

An additional disposable synthetic-project smoke used the shipped example init
configuration: dry-run, init, then Doctor and Status through the generated pinned
launcher with the candidate CLI explicitly selected. All four commands exited 0.
Doctor reported 36 pass, 1 warning, 0 fail: the shipped sample deliberately has
unconfirmed repository integration. A follow-up disposable Doctor confirmed that
exact warning; no policy was invented for the synthetic project.
The temporary fixture was removed. This is a local installation check, not a
real teammate onboarding study or a package publication.

Integration must use the normal pull request and required GitHub checks, matched
to the exact branch head. No package release or downstream upgrade is authorized
by this integration. The frozen full-suite result remains linked in
[qualification.md](qualification.md); evidence-only checks supplement it.

Evidence-only `npm run verify:fast` passed 58 tests with zero failures. All eight
copied evidence files match their originals byte-for-byte, including the raw
full-suite log. Product files are unchanged from the frozen candidate.
