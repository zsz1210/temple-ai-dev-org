# WI-0184 first candidate packaging finding

Candidate `bc269d3feca6cf5cff3c91082f7406f601fda213` passed 8 focused packet tests but complete verification stopped at the package boundary before the full suite: 402 files exceeded the reviewed limit of 400. This is a package inventory finding, not a model or product-oracle failure.

Independent npm dry-run inventory comparison against the prior design checkout found exactly two additions: `src/context-packet.mjs` and `docs/adr/0055-transient-stage-material.md`. Both are intended runtime/documentation distribution files. Total unpacked size is 3,407,778 bytes, below the unchanged 8 MiB ceiling; test files and project artifacts remain excluded.

Same-scope correction: update the reviewed file-count ceiling to 402 for these two named additions, retaining forbidden-path, required-path and size checks. Rerun full verification on the corrected candidate. No live generation or publication is authorized.
