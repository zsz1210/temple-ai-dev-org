# WI-0181 Developer verification

Candidate: `ce132142f6d1eaf50ba0e1885e3d46aa1e6caf2b`. Developer Identity: `agent-rikku`.

- Focused CLI runtime tests: 2/2 passed (5.080 seconds), covering full/compact Doctor parity across healthy, warning, failed and missing-installation cases; full global attention, selected row, no-write, full generated writes and rejected Status options.
- `npm run verify`: **570/570 passed, 0 failed, 0 skipped**, 101.331 seconds. Includes repository, documentation/package checks and full offline suite. No paid actor experiment was run.
- Doctor after canonical changes and managed Skill upgrade: 36 pass, 1 warning, 0 failures. The warning accurately identifies the previously generated parallel plan as stale; it must be rebuilt before reviewer dispatch. Compact output preserved it.
- Maintained Skill installed through `upgrade`, with exact managed checksums preserved. No direct edits to the lock or managed destination. Its trigger/non-trigger, launcher dependency and authority are unchanged. The finish clause distinguishes stage handoff from acceptance and retains required checks.

At the same Build-stage repository snapshot, full JSON Status was 392,938 bytes; compact Status for WI-0181 was 4,962 bytes. Full JSON Doctor was 5,612 bytes; compact JSON Doctor was 452 bytes. These are UTF-8 output sizes for this repository, **not model Token or latency measurements** and not the small comparison fixture. All non-pass checks and global attention were preserved.

Static completion scenarios: a scoped Builder returns after handoff and required checks; failed Doctor remains unresolved; a Verifier cannot infer product acceptance from diagnostics; a whole-work request still follows its remaining authorized gates. These are author contract checks, not a fresh-model forward test or Independent QA. A separate reviewer must inspect this exact candidate.

The coordinating assistant is identified by this session as GPT-6-based; no independent provider acknowledgement or exact immutable model revision is exposed for this host turn. It is not an actor sample in the comparison dataset. The next live comparison must record actual requested/acknowledged model and effort fields through its provider, as the sealed comparisons do.
