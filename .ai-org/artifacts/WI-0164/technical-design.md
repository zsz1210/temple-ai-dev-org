# WI-0164 Technical Design

## Immutable inputs

- Alpha.30 technical candidate: `a6849519c6067b2f73ca1a44d556faf7a5168b1d`
- Alpha.29 comparison source: `a3a28e7216652b04cfdc690e68bcb64b08fd5046`
- Required runtime: Node.js 24

The qualification runner creates detached worktrees at those revisions. It refuses dirty or mismatched source and writes all package archives, installed dependencies, screenshots, and consumer repositories below a temporary directory.

## Candidate checks

The Alpha.30 worktree runs:

1. `npm ci --ignore-scripts`;
2. `npm run verify`;
3. `npm run test:browser` with installed Chrome;
4. schema validation and Doctor;
5. production and complete dependency audits;
6. public-profile repository and package audits; and
7. `npm pack --ignore-scripts --json` exactly once.

The retained evidence records the complete npm file manifest, candidate revision, package version, filename, SHA-256, npm SHA-1/integrity, file count, packed size, and unpacked size. The tarball itself is not committed.

## Clean consumer

A disposable project installs the exact local tarball with scripts disabled and no package lock. It then runs:

- the installed CLI's version command;
- first initialization from a complete five-Identity configuration;
- an identical second initialization;
- the repository launcher with `TEMPLE_CLI_PATH` set to the installed exact-version CLI because the private package cannot be recovered from the public registry;
- read-only status; and
- Doctor.

The runner retains only normalized results, counts, versions, digests, and elapsed milliseconds. It does not retain the temporary path or generated repository contents.

## Alpha.29 upgrade comparison

The runner builds a separate local Alpha.29 archive from the named comparison revision, initializes a disposable project, adds a project-owned sentinel, and hashes project-owned policy, identity, learning, Work Item, specification, and sentinel files. The exact Alpha.30 CLI then performs a dry-run and real upgrade. Qualification requires:

- the plan to contain no managed-file replacement and no project-data migration;
- the lock version and bootstrap package spec to become Alpha.30; and
- every sampled project-owned digest to remain unchanged.

The Alpha.29 archive is comparison input only and is not a release candidate.

## Result boundary

Any failed check produces a no-go result and preserves its exact failing step. The runner never modifies the Alpha.30 candidate worktree. Evidence-only files added on this branch do not change the candidate package bytes.

No successful result authorizes publication or a stronger product claim.
