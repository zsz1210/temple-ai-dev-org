# Final integration qualification

Candidate: `8f7ab5f0b4455dda0d51cb0a1e79ea3b72978462`.
Full `npm run verify`: **1,296/1,296 passed**, zero failures/skips/cancellations,
317.339792 seconds wall; runner 315,695.760709 ms, Node 24.20.0.
Raw output: [full-accepted.log](full-accepted.log).

Distinct remote agent-lulu independently accepted the final narrow correction
after inspecting the exact delta, running 8/8 collaboration tests (21.50 seconds),
repeating the exact-HEAD authority counterexample (rejected before writes), and
checking a real 64-character operation-ID recovery through descendant acceptance.
The earlier descendant counterexample remains covered and its prior recheck is
explicitly reused. [Independent judgment](independent-review-final.md).
No source/test/script/overlay/docs changes followed the tested candidate.

The two high-severity findings and the incomplete first correction remain in
attempt-specific reports. Earlier full passes do not overwrite those rejections.
The complete suite was run after final narrow acceptance on the unchanged code.
Current packaging passed at 451 files, 1,017,971 packed bytes, 3,950,084 unpacked
bytes. Temporary synthetic init/Doctor/Status passed during integration; final
repository Doctor before closeout is 37 pass / 0 warn / 0 fail.

Archive verification preserved 23 exact source files and 31 event-delta lines.
Canonical main WI-0247 remains byte-identical. Root compared the historical archive
with its actual source Git object; the remote reviewer independently checked its
internal hashes/reconstruction but lacked that original source object. No import
of colliding lifecycle authority occurred.

Four full runs totalled 1,129.175926 seconds (18 minutes 49 seconds). They include
one stale-assertion failure and two green candidates rejected by independent
probes, not four independent measures of ordinary task cost. The final full run
took longer than the initial run on this host; changed coverage, added physical
checks and uncontrolled load prevent causal or stable performance claims. No
matched latency or billing comparison was performed. Remote reviewer usage and
wall intervals are separately recorded and overlap coordinator activity.

The unchanged final candidate qualifies for the approved PR. This is not a package
release, deployment, main merge, or independent-human onboarding qualification.
Later evidence-only commits require fast verification and final Doctor.
