# WI-0127 audit contract

## Required coverage

The audit must distinguish four layers:

1. **Core mechanics:** initialization, canonical state, Work Items, profiles, context, Skills, execution advice, claims, evidence, QA, closeout, recovery, and learning.
2. **Human journey:** what a first-time user sees, what they must decide, and where the documented path breaks or branches.
3. **Optional operations:** Console, continuous Usage observation, Provider execution, trackers, and integrations.
4. **Qualification:** what local deterministic evidence proves and what still requires real people, models, machines, or organizations.

## Measurements

- lines and non-contiguous sections needed to reconstruct the current public path;
- Temple CLI invocations and authored evidence artifacts in the existing bounded brownfield fixture;
- deterministic onboarding and brownfield elapsed time, Doctor result, preservation, and lifecycle result;
- contradictions between public documentation and current code or canonical policy;
- missing steps in the human path; and
- severity based on user consequence, not implementation convenience.

## Severity

- **P0:** unsafe, destructive, authority-breaking, or unable to complete the core path.
- **P1:** likely to make a normal user take the wrong path, misunderstand state, or fail continuity.
- **P2:** meaningful friction or discoverability loss with a supported workaround.
- **P3:** polish or future qualification that does not impair the current core path.

## Acceptance boundary

A passing deterministic rehearsal proves current mechanics only. It does not prove that an unaided person or fresh Provider session understands the framework, that Temple improves delivery, or that the same result generalizes to enterprise operation.
