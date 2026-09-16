# Independent QA: Alpha.33 preparation

**PASS within the approved package and disposable-upgrade preparation scope.**

Independent QA identity: `agent-lulu`; Developer: `agent-rikku`. Their distinct
assignments were checked directly. Current stage is `independent_qa`, with active
claim `claim-20260916070331-46194af3` and exact Developer candidate
`b2edfe22678beaa904eaec27b4d01330707623c6`. This judgment follows evaluation under
the same QA identity; QA did not implement or repair the candidate.

Evidence: `qa-observations.json`, `evaluation.md`, `full-verification.md`,
`full-verification-final.log`, `package-audit.json`, and `dependency-audit.json`.

Acceptance is supported by independent exact-source repacking to SHA-256
`03c725189ace782c362b7deee65854980d4072a22600983ed290ec1c652138d2`
(444 files, 997361 bytes); explicitly attributed reuse of the prior independent
seven-group package replay on byte-identical archive contents; and new independent
pre-upgrade managed-conflict, wrong-version-launcher, nested project-owned-file,
and delayed termination controls. Every added control passed. The corrected
cleanup test preserves owned-ID and immediate PID disappearance assertions.
The parent's retained full run on this candidate passed 1248/1248, exit 0,
with zero failed, cancelled, skipped or todo tests. The previous rejected run
remains recorded as failed; it does not supply passing evidence.

No unresolved defect was found within this acceptance scope. The package audit
allows its 444-file surface with zero findings. The parent separately reported
three pre-existing repository-wide local-path findings and 110 binary manual-review
entries outside the new WI-0243/package surface. This report grants neither
repository-wide publication clearance nor public Release approval.

Limits: synthetic local fixtures on Node.js v24.20.0/macOS; no real downstream
upgrade, live model/provider, multi-machine qualification, tag, publication or
deployment. The executor's successful termination acknowledgment remains a provider
contract, not independently demonstrated real-provider behavior here. Three
worker-owned fixture roots were removed after their observations were retained.

Next owner: Release Manager for the bounded preparation gate and ordinary integration
decision. Subsequent evidence-only commits may cite the exact tested revision;
packaged source, executable, fixture, dependency or test changes require reassessment.
