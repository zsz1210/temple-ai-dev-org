# WI-0257: Optional compact evidence view

User authorized implementation after the Headroom offline pilot on 2026-09-19.
Stop at implemented, measured, independently verified delivery; no merge, release,
provider calls, external compression dependency or new model experiment.

Add `evidence view --source <repository-relative-file> --format text|json|node-test
[--compact] [--expected-sha256 <digest>] [--json]`. Default is full text, with a
read-only envelope containing source path, SHA-256, byte counts, omissions,
limitations and digest-bound original-read arguments. Never change acceptance,
source evidence, canonical state, test execution, or existing command defaults.

Compact JSON removes whitespace outside strings only, after syntax validation:
numbers, duplicate keys, ordering and string content remain lexically intact.
Compact node-test only omits complete top-level passing result lines with duration
from a recognized Node spec report before its complete summary. Preserve all
other lines, especially failure blocks, caveats and summary counts. Reject or
pass through uncertain formats; never truncate output to a target budget.
Text is preserved. A compact view is not evidence that an omitted named test ran.

Require ordinary relative regular-file paths, no symlink components/traversal,
bounded 8 MiB input, valid UTF-8 and stable observed bytes. Optional expected SHA
must match before any content is printed. Retain source permissions and bytes;
no output file, cache, process server or third-party dependency is introduced.

Acceptance: meaningful file/CLI tests cover failure preservation, unknown-format
passthrough, lexical JSON integrity, path/link/type/size/encoding/digest rejection,
and no-write behavior. Re-run the seven saved WI-0252 pilot samples, measuring
payload and envelope tokens separately, output bytes and duration. Check known
failure and limitation facts. Full npm verification on frozen candidate; distinct
Lulu verifier challenges boundaries. No model-quality or billing-saving claim.

Low-risk bounded Lean is eligible: additive local read-only presentation, no UI,
permission, lifecycle, learning or evidence-schema mutation. Governing records use
the shared canonical checkout's CLI so WI-0257 avoids the other branch's 0253-0256
allocations. Product changes are isolated at codex/compact-evidence-output based
on main 9b2669df. Other Jev records and edits are excluded from our product commit.
Rollback is to stop using the new command or revert its additive product change;
retain all actual evidence. No explicit context-map route exists for this scope.
