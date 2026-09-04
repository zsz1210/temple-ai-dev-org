# WI-0152 Technical Design

## Components

1. `src/evidence-profiles.mjs`
   - owns the versioned project configuration, framework defaults, validation, and exclusive creation path;
   - keeps all three required profile definitions present and enforces non-weakenable safety floors.
2. `src/publication-audit.mjs`
   - enumerates Git-tracked repository files or npm-package dry-run files;
   - scans bounded text content using named rules;
   - compares repository findings with an optional reviewed Git baseline;
   - returns a deterministic report without matched values or file contents.
3. `temple publication audit`
   - read-only command with `--profile private|public|restricted` and `--surface repository|package|both`;
   - defaults to the project-owned active profile and both surfaces;
   - exits non-zero when blocked findings exist.
4. Project overlay and schema catalog
   - generated projects receive `.ai-org/project/evidence-profiles.json` with active profile `private`;
   - the file remains project-owned while its schema remains framework-managed;
   - upgrade creates the file only when absent and never overwrites project policy.
5. Temple self-host configuration
   - selects `public` and pins the user-reviewed pre-feature revision as its repository-only legacy baseline;
   - current package-facing documentation is normalized, while Git history and immutable historical evidence remain unchanged.

## Finding model

Each public report finding contains only:

- rule and evidence-class identifiers;
- classification: `blocked`, `review-required`, or `allowed`;
- disposition such as `new`, `retained-legacy`, or `policy-allowed`;
- repository-relative path and one-based line number;
- occurrence count and remediation text.

The scanner never returns the matched substring, contextual source line, raw content hash, or baseline fingerprint. Findings are sorted by surface, classification, rule, path, and line.

## Baseline algorithm

For each sensitive occurrence, Temple computes an in-memory SHA-256 fingerprint from rule ID, relative path, and exact matched bytes. It scans the pinned baseline revision through `git ls-tree` and `git show`, builds a counted fingerprint multiset, and consumes at most the baseline occurrence count when classifying current repository findings. Package findings never consult this set.

The baseline revision must resolve to a Git commit and must not be a moving ref. The policy stores only the full commit ID, reviewer, timestamp, and rationale—not detected values.

## Rules and classes

- `secret-material`: private-key headers and high-confidence Provider credential shapes; always blocked.
- `sensitive-dotenv`: tracked `.env`-style files except documented examples; always blocked.
- `maintainer-home-path`: absolute macOS, Linux-home, or Windows user paths; synthetic names such as `example` are ignored.
- `private-network-endpoint`: private IPv4 literals and private Tailnet hostnames.
- `local-only-runtime-data`: raw telemetry/runtime paths and live account-state snapshot filenames.
- `binary-review`: tracked binary files are counted and require separate review; their contents are not scanned or declared safe.

Approved Token budgets, Credits/reset approval facts, model metadata, and lifecycle evidence are not sensitive classes and therefore remain allowed unless they independently contain a blocked pattern.

## Surfaces

- `repository`: current Git-tracked files, with optional reviewed legacy baseline.
- `package`: exact file list reported by `npm pack --dry-run --json --ignore-scripts`, with no baseline exception.
- `both`: union reported as separate surfaces.

Untracked files, Git history, workflow logs, live local telemetry directories, and external account APIs are deliberately outside this command. Full-history and hosted-log review remain release-gate activities.

## Verification

- unit tests for defaults, semantic validation, secret redaction, profile classification, counted baseline behavior, binary handling, and package strictness;
- CLI tests for default profile, explicit override, non-zero blocked result, and no canonical mutations;
- init/upgrade/schema tests for ownership preservation;
- package-boundary test plus a real self-host public audit;
- full `npm run verify`, Doctor, and exact-revision Independent QA.

## Failure behavior

Invalid policy, non-commit baseline, Git enumeration failure, npm dry-run failure, unsafe path, oversize text input, or unreadable tracked file fails closed. A passing report remains evidence for a human release decision, not publication authority or a security certification.
