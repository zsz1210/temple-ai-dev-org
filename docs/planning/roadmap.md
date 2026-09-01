# Temple roadmap

**English** | [日本語](roadmap.ja.md) | [繁體中文](roadmap.zh-TW.md)

Temple's repository-local operating model is implemented and proven across bounded local pilots. The project is now in release qualification for its first public Alpha: reducing state drift, defining a safe distribution, and proving that a new user can adopt the framework from a clean source. This is the final stage of the initial open-source release, not the end of Temple's development and not a production-readiness claim.

Version history belongs in the [changelog](../../CHANGELOG.md). Exact test results and retained limits belong in [validation records](../validation/README.md). The current release gates are tracked separately in [release readiness](release-readiness.md).

## Current position

- **Package metadata:** `0.1.0-alpha.29`; this is the proposed first public-Alpha release candidate, not yet a public release.
- **Development stage:** core local framework complete; first public-Alpha release qualification in progress.
- **Suitable today:** supervised Solo and small-team work, local multi-repository coordination, repository-backed recovery, and read-only operational review.
- **Distribution today:** the GitHub repository is private, the npm package is marked `private: true`, and no npm version has been published.
- **Not yet claimed:** production-grade distributed coordination, regulated operation, unattended external action, automatic model routing, or measured cost savings.

## Delivered operating system

The local framework already provides:

- stable Positions separated from project-specific people, Agent Identities, and Assignments;
- Solo, Collaborative, and High-Assurance governance contracts with explicit human authority;
- repository-owned specifications, decisions, Work Items, handoffs, evidence, learning, and approvals;
- the visible `Spec → Design → Build → Test → Eval → Independent QA → Release Gate` delivery path;
- affected-path coordination, claims, resources, safe parallel waves, workers, and integration joins;
- deterministic context and Skill discovery without requiring RAG, a local model, or a daemon;
- local backup, restore, audit, recovery, federation, and read-only portfolio boundaries;
- a human-facing Management Console that keeps local commands separate from private read-only access;
- project-local Token attribution, calibration policy, and a deterministic matched-model advisory that cannot switch models by itself;
- governed Lessons, Practices, Skill Proposals, project Skills, and optional Packs without automatic promotion.

## Now — qualify the first public Alpha

### 1. Keep repository truth consistent

- Reconcile stale Work Item states with their exact Git and verification evidence.
- Keep failed and blocked experiments as evidence instead of hiding them to make the Dashboard look complete.
- Rebuild generated status and planning views only after canonical state is correct.

### 2. Define the release and distribution

- Finish aligning the selected `0.1.0-alpha.29` identity across package metadata, changelog, validation record, exact candidate revision, and proposed Git tag.
- Use an immutable GitHub Release as the first distribution; keep npm deferred until separate adoption evidence and approval exist.
- Keep the enforced package allowlist green. It includes the runtime and public documentation while excluding self-host state, test evidence, screenshots, and optional-adapter examples.
- Prove clean installation, exact-revision launcher recovery, upgrade preservation, re-initialization, Doctor, and rollback from the final candidate.

### 3. Finish the public trust boundary

- Keep the Human-approved MIT license aligned across package metadata, contribution terms, notices, and release notes.
- Finish the operator-owned Provider trust decision before recommending Provider execution from untrusted repositories.
- Add supported-version and private vulnerability-reporting instructions, review third-party notices, and enable appropriate public repository protections.
- Retain the reviewed immutable GitHub Actions revisions and minimal workflow permissions.
- Retain the tested Node.js 22 and 24 LTS contract. Node.js 26 remains a forward-compatibility signal until it enters LTS and is intentionally added.

### 4. Prove the final candidate

The required automated, package, clean-consumer, security, and compatibility checks are listed in [release readiness](release-readiness.md). A public release requires evidence at the exact candidate revision; an older passing test run is history, not release proof.

## Next — learn from real adoption

After the first public Alpha:

- run one greenfield and one existing-project adoption with people who did not build Temple;
- run a representative company or OSS pilot and the retained real multi-human, multi-machine collaboration plan;
- collect real matched task results in shadow mode before enabling any model recommendation for everyday work;
- repeat recovery and upgrade on another supported operating system and under process-level failure;
- exercise federation and read-only portfolio views across separately maintained repositories;
- measure setup friction, state recovery, rework, blocked time, evidence quality, and human comprehension without inventing a savings percentage.

## Later — production and enterprise qualification

Only after the corresponding real-environment evidence:

- live Provider soak, disconnect, crash recovery, and bounded performance tests;
- a real High-Assurance drill with distinct Human Principals and recovery loss scenarios;
- approved external-tracker, CI/CD, deployment, or notification writes with preview, rollback, and audit;
- organization-wide RBAC, remote workers, centralized audit export, and cross-team portfolios;
- optional semantic retrieval where deterministic routing has demonstrated a real limit;
- automatic model routing only inside an evidence-qualified autonomy envelope.

## Intentionally not a default dependency

Temple will not require every engineering Skill, Figma, a vector database, a local model, a daemon, external tracker authority, or unlimited agent tasks merely because those options are popular. Optional capabilities must keep their authority, privacy, provenance, rollback, and test boundaries visible.

## Public-Alpha exit criteria

The first public Alpha is ready when:

- the repository, Dashboard, changelog, package version, tag, and validation record describe the same candidate;
- a clean consumer can install, initialize, inspect, upgrade, and recover without the originating chat;
- the published artifact contains only the reviewed framework surface and required notices;
- every promised Node.js and operating-system combination passes at the exact candidate;
- security reporting, contribution, license, provenance, and repository-protection choices are explicit;
- blocked real-world validations remain visible and the public claims stop at the evidence boundary.
