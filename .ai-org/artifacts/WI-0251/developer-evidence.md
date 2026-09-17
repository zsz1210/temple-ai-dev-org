# Mechanical package-boundary evidence

Exact candidate: `41a1a4f7367fc09bdc80f4ef2a5ad6b0e5914261`.
Developer: `agent-rikku`.

`scripts/check-package.mjs` increases only MAX_FILE_COUNT from 446 to 448 and
documents the two public additions: `src/measurement-report.mjs` and ADR-0069.
Allowed roots, exclusions and the 8 MiB unpacked ceiling remain unchanged.
The exact candidate passed full verification (1,288/1,288) and package inspection:
448 files, 1,010,357 packed bytes, 3,923,843 unpacked bytes.
See the parent WI-0250 developer evidence for command and measurement provenance.
Distinct verification and its judgment remain required before closing this item.
