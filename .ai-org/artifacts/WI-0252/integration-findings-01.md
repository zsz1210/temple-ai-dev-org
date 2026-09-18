# Full integration verification, attempt 1

Candidate 11b464126c99ddc9c0b39c455ec81b9704f76479 failed full verification:
1,294 tests, 1,293 pass, one failure, no skips/cancellations; 257.731 seconds wall.
The failure at test/lean-delivery.test.mjs:81 is the same stale error-message
expectation as the earlier diagnostic repair check: the product is correctly
rejected by physical-byte verification before the former blanket HEAD check.
The focused selection missed this separate delivery test file.

Return to Build within the same integration scope. Update that safety assertion
to the actual physical mismatch and retain a no-canonical-write check; search all
remaining HEAD-message expectations before another full run. Preserve this failed
attempt. No gate is waived and no product scope is changed. The remote read-only
review remains pinned to the original candidate; its result must be explicitly
requalified against any correction before final acceptance.
