# Distinct Lean verification — WI-0246

## Judgment and provenance

**PASS** for the approved README documentation candidate
`ca962508ef41d7e6b16f9e8b9d5ddf56f6684765`.

Verifier: Lulu (`agent-lulu`), Position `quality_evaluator`, Principal `human`.
Identity and eligibility were resolved from current assignments and compact Context;
Developer is Rikku (`agent-rikku`). This is a distinct Lean Verifier judgment,
not formal Independent QA, provider authentication, or release approval.

Runtime: `/root/readme_verifier`; prepared worker
`worker-20260917144358-d942740a`; active claim
`claim-20260917144358-fe5b6485`. The worker registry confirms attachment.
Inspection date: 2026-09-17 UTC. Local runtime: Node.js v24.20.0.
Checkout HEAD during verification:
`e8e1e462ae07a2b6884f30bdb6fb90dde2dda73c`.

The six reviewed product files are byte-identical to the Developer candidate:
`README.md`, `README.ja.md`, `README.zh-TW.md`, `CHANGELOG.md`,
`docs/getting-started/solo.md`, and `docs/getting-started/usage.md`.
The newer HEAD contains separately qualified recovery code; it is not silently
substituted for the README candidate. Shared canonical and evidence changes were
preserved. This worker writes only this report.

## Acceptance and risk assessment

Authority: [approved brief](readme-brief.md), current WI-0246 acceptance,
the whole operating contract, Temple Work and Project Documentation Skills,
their applicable Lean/parallel/recovery references, and the testing guide.

| Acceptance / risk | Independent result |
| --- | --- |
| English, Japanese and Traditional Chinese agree | PASS. Read all three versions. Their 12 major sections and setup subsection align, as do all four Bash blocks. Profiles, current Alpha.33 label, source setup, bootstrap, optional features and maturity qualifications have equivalent meaning. |
| Adoption is separate from contribution | PASS. Source checkout plus `npm ci` gives access to the pre-init Skill. Full verification and optional `npm link` appear inside the contributor disclosure. CLI-only installation expressly does not supply pre-init Skill context. The usage guide makes later global-command assumptions explicit and names the pinned project launcher. |
| Commands and bootstrap match repository behavior | PASS within source/command inspection. Package name, bin, Node 24 minimum and version agree with package metadata. The local pinned launcher returns `0.1.0-alpha.33`; its implementation validates the version-pinned lock. Initialization Skill and usage guide require existing-policy inspection and combined confirmation before writes, then conflict resolution and session bootstrap. No installation or session-loading success is inferred. |
| Approved work does not repeat discovery | PASS. Each language limits decision interviews to unclear outcomes and directs approved scope and acceptance to Temple Work. |
| Autonomous delivery and model routing remain optional and bounded | PASS. All versions preserve independent judgments and authority limits, distinguish the coordinator from a model-launching service, and label Console, Observer and usage collection optional. Autonomous-delivery and model-routing source documentation support these boundaries. |
| Solo adapter explanation is accurate | PASS. Updated prose separates the confined Node adapter from explicit trusted-local non-Node POSIX commands. `src/verification.mjs` and the collaborative-delivery guide support the non-sandbox, no-Windows and no-compatibility-inference qualifications. |
| Maturity and publication prose are evidence-limited | PASS. All versions retain Early Alpha, supervised low-risk scope, experimental/bounded collaboration, and no broad multi-human/multi-machine, regulated, automatic-routing or universal savings claim. The changelog publication date matches the Developer's recorded publication inspection; no fresh external publication check is claimed here. |
| Links and existing diagrams are retained | PASS. Repository documentation-link check passed. Git comparison confirms both picture blocks in each language are unchanged from the candidate's parent and no diagram asset changed through current checkout. |

No acceptance defect was found. The scope remains low-risk prose; no product code,
executable example semantics, dependency, policy or UI asset change is accepted by
this judgment.

## Actual checks and reused evidence

Independently executed:

- `node scripts/check-doc-links.mjs`: exit 0, documentation link checks passed.
- `node ./templew.mjs --version`: exit 0, `0.1.0-alpha.33`.
- `git diff --check`: exit 0.
- A read-only Node assertion compared each of the six working files with
  `git show <candidate>:<path>`, compared all four Bash blocks across the three
  languages, counted aligned headings, compared each complete picture block with
  `<candidate>^`, and asserted an empty `git diff <candidate>^ -- docs/assets`:
  all assertions passed.
- Git inspection confirmed that the candidate changed exactly the six approved
  product paths. Current worker/claim attachment and Context identify the exact
  Developer candidate and separate Verifier.

These are source, local CLI and document checks, not fresh onboarding execution.
An initial source-search glob matched no file and was corrected to an `rg` search
over `src`; this was an inspection-command error, not a product test failure.

Reused evidence was read and attributed, not represented as this worker's run:

- [Developer verification](verification.md): candidate-specific `verify:fast`,
  58 passed, zero failures, with repository/link/package checks; prior publication
  metadata inspection. Its retained original diagnostic blocker is historical.
- [Rendered review](rendered-review.md): parent inspection of actual GitHub
  desktop rendering in the named English, Japanese and Chinese regions. Its
  no-clipping result is bounded to those regions and viewport. This worker did not
  launch a browser or establish mobile/ultrawide layout qualification.
- [Recovery full verification](../WI-0247/full-verification.md): exact current
  recovery code HEAD, Node.js v24.20.0, 1,266 passing offline tests across 121
  files, zero failures. This qualifies recovery code and is not a new README
  onboarding or performance measurement.
- [Diagnostic reconciliation](finish-recovery-wi0246-readme-build.json) and
  [recovery result](recovery-result.md): original failure preserved; current
  diagnostics passed with Doctor 37 pass, zero warnings, zero failures. The
  approved recovery records explicitly grant neither authority nor acceptance.

## Lean closeout recommendation and limits

Recommend **Lean closeout: pass** for the exact six-file README candidate above.
The parent should join this completed worker's evidence, run the already assigned
final `npm run verify:fast` over the resulting evidence/administrative changes,
and perform the authorized canonical closeout and fresh diagnostics through the
pinned CLI. This report does not claim those future operations passed.

No whole-suite repetition is warranted by this prose-only verification artifact;
the separate behavioral revision already has its exact full result. Any product
change invalidates this candidate judgment and requires a new comparison/review.

No fresh install, end-to-end onboarding, separate-account or multi-machine trial,
live provider check, performance qualification, merge, publication, deployment or
release approval was performed. The authorized verification slice ends here.
