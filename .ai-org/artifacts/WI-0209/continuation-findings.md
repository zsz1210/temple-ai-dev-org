# Fresh attempt v2 findings and bounded offline rework

The renewed attempt stopped at stage six: slim Verifier, `argument-shape`, classified as `git-diff` with option roles. Its exact argument text was not retained, so no exact command or harmful intent is asserted. The command-completed notification reported exit zero: this observation guard detects and interrupts; it is not a pre-execution shell firewall. There is no evidence of a write or escape from this read-only Git classification.

The original seal failed because canonical subject roots use `/private/tmp` while `verifySeal` checks them against lexical `/tmp`. All six lexical checks return false and all six real-path containment checks return true. All six Git safety digests still match. The catch then sets `archive_failure` and updates elapsed time in the already sealed run. Only `run.json` differs from the manifest; no product/evidence file differs.

Read-only reconstruction removes `archive_failure` and restores `elapsed_ms` to 683596 (current 683764). The exact pretty-printed bytes then match manifest hash `sha256:e5b7f36a8efe0f669cb865ff314ff0adf1bd1af5635145aded048cc49923c3f2`, and the parsed object matches seal run hash `sha256:5587a7d75208fbe8911e68541aac700c3eb97a08b51d10928fd9384b9ef49a62`. This is reconstruction evidence, not repair of the original lab. Preserve the original invalid seal and do not reseal, overwrite, resume or retry.

Offline rework scope: canonicalize lab and subject paths for containment verification; keep failures visible without rewriting files after sealing starts; test alias paths, outside siblings/symlinks and post-seal verification failure. No product or command permission expansion. Keep the Git argument compatibility finding for a separate bounded design rather than guessing the rejected argument or weakening arbitrary-command controls.

The three-arm comparison remains incomplete. Two completed deliveries and one interrupted delivery are provisional diagnostic data with the above integrity qualification. No aggregate efficiency claim or acceptance follows.
