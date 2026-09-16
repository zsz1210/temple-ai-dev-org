# Release archive compression recovery

The first Release workflow 35070834620 passed source verification but stopped
before npm upload: its fresh archive size differed from the attached archive.
Hosted result: 1218 registered tests, 1215 passed, three skipped, zero failed;
697124.500535 ms. This Linux observation is distinct from the local macOS
1248/1248 observation. The counts are not presented as identical runs. Two skipped
tests require macOS; the third parent requires installed Codex CLI and zsh and
contains the 30 nested cases absent from Linux registration. Comparing test names
confirmed all 30 belong to that explicitly optional parent in
test/delivery-control-pair.test.mjs. No unexplained test-count gap remains.

Both environments report Node 24.20.0 and npm 11.19.0. The local Homebrew Node
links zlib 1.2.12; the checksum-verified official Darwin arm64 Node distribution
reports zlib 1.3.2.1-motley-42c2f19. Using that official Node with the same npm
and unchanged checkout reproduces the hosted 998942-byte package size.

The original archive is 997361 bytes, SHA-256
03c725189ace782c362b7deee65854980d4072a22600983ed290ec1c652138d2.
The official-Node archive is 998942 bytes, SHA-256
d1d91dfb054ed68837661bf6c2fe243eba7a5ea6d7b6cb6dec8dfdb602808ace.
Both have 444 files and 3874046 unpacked member bytes. Crucially, decompressing
both gzip streams produces byte-for-byte identical complete tar streams, SHA-256
5367accd2b0da5705f5a87c5ca69d7ea6115fbd2110a7e54dcd29cf1bc124f33.
Thus file content, ordering, modes and tar metadata are unchanged, not merely
similar application behavior. A clean export of the release commit also reproduces
the original Homebrew archive, ruling out local uncommitted source as the cause.

This is a packaging-environment correction within the authorized Alpha.33
publication, not a new source candidate or an npm version replacement. npm upload
did not occur. Preserve the original GitHub attachment under an explicit
homebrew-zlib-1.2.12 reference name, add the official-Node archive under the
workflow's expected filename, and disclose both hashes in the Release notes.
The tag, source commit, content, dependency lock, OIDC permissions and exact-byte
gate remain unchanged. Existing independent source/content acceptance remains
applicable by whole-tar equality; rerun the existing bounded installation/upgrade
harness on the new gzip encoding before its upload. Then rerun the failed Release
workflow, including its full source verification and exact attached-byte gate.
The bounded harness subsequently passed all seven checks on the official-Node
gzip, including initialization, pinned-launcher checks, Alpha.32 upgrade, all
31 project-owned files retained and the conflict rejection control (5437 ms
summed subprocess time). Only the actual later registry result can establish
successful publication.

The original approval record's digest describes the initially qualified gzip.
This explicit correction preserves its exact qualified payload and original
evidence; it does not claim the user provided a new digest-specific instruction.
No published npm version or source tag is replaced, and no check is weakened.
