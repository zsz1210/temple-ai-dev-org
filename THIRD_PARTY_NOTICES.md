# Third-party notices

## Archify

- Project: <https://github.com/tt-a1i/archify>
- License: MIT
- Pinned release for the optional adapter contract: `v2.15.0`
- Resolved commit: `e1ac748f19cf805e44bf74fb93c796662152e273`

Archify is not vendored, installed, downloaded, or executed by default. An operator may explicitly copy an exact local checkout into a project-owned isolated directory; that installed copy retains Archify's MIT license, pinned source provenance, and per-file digests. The adapter remains replaceable and cannot become the source of truth.

## Matt Pocock Skills inspiration

- Project: <https://github.com/mattpocock/skills>
- License: MIT
- Reviewed commit: `6654f6b60cd9d5be8b54c6fafe44346dabeb3b76`
- Upstream copyright: Copyright (c) 2026 Matt Pocock

The `grill-me`, `grill-with-docs`, `domain-modeling`, `tdd`, `diagnosing-bugs`, `codebase-design`, `code-review`, `prototype`, `retro`, `writing-great-skills`, and related development Skills were reviewed as product and maintenance inspiration. Temple's Skills, including `$skill-authoring`, are independent implementations written for repository-persisted decisions, project ownership boundaries, and the Temple lifecycle. No upstream Skill source is vendored, loaded, or wrapped at runtime.

If future versions copy or adapt upstream source, they must include the applicable MIT copyright and permission notice with the distributed copy or substantial portion.

## README and project documentation inspiration

- Hypergiant Agent Skills, `accelint-readme-writer`: <https://github.com/gohypergiant/agent-skills/tree/459a846a65544cf311164059f2ea4623ec443b02/skills/accelint-readme-writer> — Apache-2.0, reviewed commit `459a846a65544cf311164059f2ea4623ec443b02`.
- AsyrafHussin Agent Skills, `project-docs`: <https://github.com/AsyrafHussin/agent-skills/tree/1aa0ff717c10309226c9e678f00873976450fd76/skills/project-docs> — MIT, reviewed commit `1aa0ff717c10309226c9e678f00873976450fd76`.

Temple used these as design references for its independently implemented `project-documentation` Skill. Neither source is copied, loaded, or invoked by Temple; the distributed Skill is original Temple text grounded in its own repository-evidence and authority model.

## Security review inspiration

- Project: <https://github.com/OWASP/secure-agent-playbook>
- Capability reviewed: `code-review-security`
- License: CC-BY-4.0
- Reviewed commit: `79fea6b9115b55687818f8c4073844ee9ba907a6`

Temple records this as provenance for a possible future optional security-review pack. No OWASP source, play, or template is currently installed, copied, loaded, or invoked. Any later adaptation must preserve attribution and clearly identify changes under the applicable license.
