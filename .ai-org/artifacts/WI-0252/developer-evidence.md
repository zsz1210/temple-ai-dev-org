# Integration developer handoff

Candidate: `11b464126c99ddc9c0b39c455ec81b9704f76479`.
Developer: agent-rikku. Distinct reviewer: agent-lulu.

The product delta ports ADR-0068 and the earlier qualified recovery branch onto
the main-derived closeout branch. The merge keeps async physical product checks,
literal pathspecs, every-parent descendant history validation, and the existing
explicit recovery module. No managed installed Skill or lock was hand-edited.
The source Skill guidance remains original Temple material with its prior trigger,
dependencies and no additional authority. Current canonical WI-0247 is unchanged.

Archive verification compared all 23 embedded files byte-for-byte with source
6ca7c69665e59559769f3a402d37dac2f8f190fb, verified every SHA-256/length, and checked
the 31-line event delta appended to its exact common base. This is a source
snapshot, not lifecycle import, reassignment or renumbering.

## Editing checks

- Initial focused set: 108 tests, 106 pass and two failures. The failures were
  outdated expectations at integration seams: the new portable observation must
  update after diagnostic recovery; a committed product mismatch now fails the
  physical content check before the general HEAD check. Both safety conditions
  still rejected/settled correctly; tests now assert exact permitted observation
  changes and unchanged lifecycle bytes on rejection.
- A targeted recheck of those two tests passed 2/2, 4,371.560 ms Node duration.
- Combined collaboration regression passed 6/6, 11,026.895 ms. It adds both
  assume-unchanged and skip-worktree physical-drift controls after a committed
  handoff, verifies no Work Item mutation, restores bytes and completes normally.
- `npm run check` passed structure, links and actual package boundary: 451 files,
  1,017,175 packed bytes, 3,947,555 unpacked bytes. Existing roots/exclusions and
  the 8 MiB limit are retained.
- Temporary synthetic fixture ran initialization, Doctor and Status successfully;
  Doctor 36 pass / 1 generated-plan freshness warning / 0 fail with an active
  fixture claim. The fixture was removed. This was not downstream project setup.
- `git diff --check` passed. No Console/UI files changed.

Full `npm run verify` is running on the exact committed candidate at this handoff;
its result is not claimed here and must be attached before acceptance. The remote
review may perform distinct judgment and focused probes while that deterministic
run finishes. Historical branch verification is not substituted for this run.

Next owner: evaluate final complete results and the combined behavioral seams,
then record the remote agent's independent judgment. No merge or release.
