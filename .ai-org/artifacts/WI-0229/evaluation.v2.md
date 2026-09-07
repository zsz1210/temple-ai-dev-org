# WI-0229 — corrected-candidate evaluation

Candidate: `e9c9ade27195923efcd7f58b2735a1dace193e5a`.
Evaluator: `quality_evaluator` / `agent-lulu`, Principal `human`.
Judgment: **passed** against [brief.md](brief.md) and
[ADR-0061](../../../docs/adr/0061-exact-text-mechanical-completion.md).
The corrected test evidence and exact full-suite attribution are in
[qa.v2.md](qa.v2.md); the original rejection remains in [qa.md](qa.md).

- Explicit selection requires prior committed policy and Work-Item-bound literal
  contract, exact distinct base/current candidate with ancestry, matching Principal
  and active Developer claim, and sole contract-based approved scope/acceptance.
  Unknown schemas/fields, unsupported paths or broader scope fail closed.
- Qualification is restricted to one allowlisted non-normative UTF-8 `.txt` note,
  one unique literal replacement, bounded sizes and no additional committed or
  non-bookkeeping dirty changes. Exact managed-array paths, indexed authority,
  executable files, symlinks and hard links are excluded. Raw Git bytes are checked
  before decoding and hashing. The corrected ownership regression directly proves
  the repaired guard rather than a later unrelated failure.
- Recovery binds the original Work Item bytes to the input snapshot and reruns
  mechanical qualification while separately checking before/after canonical
  outputs. It preserves extra-file/mode checks across interrupted writes. Existing
  receipt, diagnostics, same-request and historical-replay semantics remain.
- Without the explicit option, ordinary Lean still hands off to a distinct
  Verifier. Standard/High-Assurance retain their gates; generic transition does
  not acquire a Build-to-Done shortcut. No workflow definition, installed Skill,
  initialization default, policy activation, dependency or schema migration changed.
- Completion is explicitly mechanical and not Independent QA. Installation and
  upgrade do not enable it. Documentation preserves the trust limitation: a human
  classifies the note; the checker proves the exact declared transformation, not
  semantic harmlessness or a cryptographic human signature. No Token/time/quality
  improvement is claimed. Rollback means opting out for future work and preserving
  pending transactions and historical evidence before changing CLI versions.

No remaining concrete blocker was found in the approved bounded feature. The
framework change itself still requires distinct-from-Developer Independent QA;
this evaluation is not that gate and does not authorize integration or publication.
