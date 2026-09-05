# WI-0184 root-evidence correction

Candidate: `1c0b0bcd40afa4e61d8f4a1acd11a1f993149df9`.

Removed the unsupported requirement for a slash in local gate-evidence paths. Safe repository-root files now use the same whole-source acquisition, deduplication and provenance checks as nested files; unsafe paths and unresolved Evidence IDs remain rejected. Added an actual-CLI regression with a root artifact used by two gate requirements, verifying one emitted body, both reasons and unchanged canonical bytes.

`node --test test/context-packet.test.mjs` passed 9/9, zero failures/skips, in 11.370 seconds. Complete verification is running for this exact corrected candidate and will be recorded separately. Prior package and root-evidence findings remain preserved. This attempt does not claim prior full verification covers changed code. No model comparison, entry exemption or efficiency claim is introduced.
