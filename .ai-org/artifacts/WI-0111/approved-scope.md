# WI-0111 approved scope

## Included

- Add a small deterministic state scanner for unquoted, single-quoted, double-quoted, and escaped command text.
- Allow shell metacharacters as literal data only where shell quoting makes them non-executable.
- Add the exact WI-0110 structured `search` action to replay evidence.
- Add adversarial unit tests and strengthen the live no-generation preflight.
- Update the Wave 5 validation document with the corrected offline gate.

## Excluded

- A general-purpose shell parser, command rewriting, shell execution, dependency installation, runtime allowlist expansion, changes to frozen experiment fixtures, another Wave 5A lab, another model turn, deployment, release, or publication.
