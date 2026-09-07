# WI-0243 Independent QA

Decision: **PASS** for behavioral candidate
`68620faa8dc2cf766e76e7e590c85cf2b512a492`.

QA is `agent-lulu` (Lulu), Position `independent_qa`, Principal `human`,
claim `claim-20260907145919-e26ae7e8`, worker
`worker-20260907145919-8d8bbc0f`, runtime `/root/wi0243_qa`.
The active assignments map Developer to `agent-rikku` and Independent QA to
`agent-lulu`; the Work Item claim and attached worker agree. The identities
are distinct. This Work Item uses Standard, not High-Assurance.

## Independently observed evidence

Environment: Darwin arm64, Node.js `v24.20.0`, Git
`2.50.1 (Apple Git-155)`, branch `codex/continuity-reference-identity`, in the
isolated development checkout (machine-local coordinates omitted).
HEAD was the exact candidate. Both changed executable files matched that commit
with `git diff --exit-code`; concurrent modifications were organization/evidence
records. Reviewed the complete executable diff from `cad43c19` to the candidate.

Executed independently:

```text
node --test --test-name-pattern='baseline identity|real claim and finish record commit' test/continuity-fixture.test.mjs
tests 22
pass 22
fail 0
cancelled 0
skipped 0
todo 0
duration_ms 28234.353208
exit_code 0
```

The four positive full-ID, abbreviated-ID, branch and annotated-tag records were
produced through real claim/finish operations. Each passed the 46-case oracle.
Sixteen negative cases independently challenged the item and claim baseline
fields with wrong commits, missing refs, ambiguous object prefixes, ambiguous
branch/tag names, blobs, option-shaped input, empty strings and null. Each
rejected before the product executor ran. Ambiguous names were rejected even
when both names pointed to the correct baseline and repository configuration
disabled ordinary ambiguity warnings.

The existing delivery-record test independently passed its product/test drift,
missing/stale evidence, extra executable artifact, authority scope mutation,
foreign Work Item event, dirty evidence, missing required file and unrelated
history controls. A product candidate without the explicit record-descendant
mode still rejected a later record commit.

Source review found no weakening of exact candidate, ancestry, receipt digest,
handoff identity, protected-source or working-file checks. Reference resolution
uses an argument array, end-of-options protection and commit peeling, requires
the entire resolved ID to equal the frozen baseline, and rejects Git warnings.
The changes remain in the repository research instrument and its tests.
No blocking defect found in the approved repair scope.

## Retained evidence and limits

Read-only inspection independently recalculated normalized protocol/run digests
and matched both the retained seal and [recheck record](retained-recheck.json):

- Protocol: `sha256:3568e1f6ec0bf33665d0275661829a9c10c8a0ccde4b3f2fc4dfa453d2333dc2`.
- Run: `sha256:6b6fb0db1c0848be30d99432ed0106e642f0a613fda3a2f321b5945378ddb6be`.

The retained root was only read. QA did not repeat the retained isolated oracle;
its 46-case pass, two executor invocations and lack of checkpoint override are
coordinator-observed evidence in [verification](verification.md). The original
rejection remains separate from the repaired offline result. Reviewed
[design](design.md) and [report](report.md); neither this repair nor the offline
recheck establishes efficiency improvement or changed-spec treatment results.

Reused the exact-candidate full verification recorded in verification.md:
791/791 pass, exit 0, Node.js 24.20.0, 188869.722916 ms. The coordinator also
reported evidence-packaging `verify:fast` at 54/54, exit 0,
1134.661042 ms. These are attributed coordinator checks, not independently
rerun full-suite evidence. The assigned bounded QA run above supplies the
independent execution. No implementation, frozen evidence or lifecycle state
was repaired or changed by QA; only this artifact was written.

Next owner: Engineering Manager/Release Manager for worker join and required
lifecycle/packaging checks. This pass does not itself advance Release Gate,
merge, publish, authorize a new experiment or claim live sandbox qualification.
