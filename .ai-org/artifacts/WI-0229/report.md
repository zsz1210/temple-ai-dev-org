# WI-0229 implementation and verification

## Outcome

Candidate: `ef4f6cd34279ab11a3410876d84688b7a2ff68a3`.

Adds an explicit, disabled-by-default completion exception for a single
preapproved literal replacement in a non-normative plain-text note. Policy and
work-item-bound contract must already be committed in the Developer claim base.
The existing recoverable finish transaction records the result without a Verifier
handoff or an Independent QA claim. Ordinary Lean, Standard and High-Assurance
delivery retain their existing gates. No project policy was activated.

## Verification

Developer ran `npm run verify` on the exact candidate: **712 passed, 0 failed,
0 skipped**, 71 test files, 173786.710125 ms. Repository and documentation checks
passed; package boundary: 415 files, 895547 bytes packed, 3509812 bytes unpacked.
The suite includes existing init, upgrade, workflow and recoverable delivery
regressions. Its Node test-runner recursive-discovery warning did not skip a
reported test (the final skipped count is zero).

The new file contains 14 tests covering successful CLI completion and no-write
preview; opt-in, contract, identity, scope, profile and byte guards; protected
sources; unsupported options and generic transition rejection; journal/write and
diagnostic interruption recovery; stale previews; symlinks/hard links; executable
files and unrelated changes; and invalid UTF-8 bytes. These deterministic tests do
not measure real-world Token savings or semantic correctness of human policy.

Before the final candidate, independent read-only review found three issues:

| Finding | Repair and regression |
| --- | --- |
| Recovery did not repeat the whole-worktree and file-mode qualification | Bind original Work Item bytes to the journal input hash and requalify the same request at recovery; test unrelated changes and mode drift. |
| Hard-linked approval files were permitted | Require regular single-link files; test linked approval rejection. |
| Git blob decoding preceded hashing | Preserve raw bytes, validate UTF-8 and hash the actual blob; test a replacement-decoded forged digest. |

The reviewer rechecked the final candidate and found no remaining source-level
blocker. Formal QA is recorded separately, not inferred from this source review.
Earlier editing checks caught one test assertion about an absent handoff array
and one documentation link typo; both were repaired before full verification.

## Limits and compatibility

- Repository approval is a human trust boundary, not a cryptographic signature.
- The checker cannot establish that a human-classified note has no runtime consumer.
- Only one exact file under `docs/notes/` and one literal replacement are eligible;
  code, executable or normative documents are not eligible.
- No global workflow edge, schema migration, dependency, Skill activation or
  project-owned policy rewrite was introduced.
- No model generation, calibration, Credits, reset, npm publication or deployment
  was performed. The feature removes a separate Verifier step only for its narrow
  preapproved transformation; a general efficiency claim remains unsupported.
- Rollback is to stop opting in and use ordinary Lean verification; removal of the
  implementation must preserve already-recorded historical completion evidence.
