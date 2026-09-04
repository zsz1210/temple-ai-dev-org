# WI-0157 Approved Scope

The Human Principal authorized the recommended follow-up after WI-0156 and approved merging PR #34 first.

The accepted correction has three parts: disclose release-gate evidence names in CLI help, reject invalid repository artifact references before lifecycle mutation, and publish an append-only evidence erratum after deterministic reproduction showed Doctor was not the timestamp writer.

The scope deliberately preserves normalized Evidence IDs, Git revision references, and non-path lifecycle reasons. It also preserves the sealed WI-0156 report and Evidence digests rather than rewriting history.

Completion requires exact-candidate automated verification and a distinct Independent QA identity. It does not authorize another clean-room Provider run or any public release action.
