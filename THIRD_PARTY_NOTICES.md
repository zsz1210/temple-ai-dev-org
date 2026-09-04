# Third-party notices

## Runtime dependencies

The npm lockfile currently resolves these runtime packages. They are installed as separate dependencies and are not copied into Temple's source files.

| Package | Resolved version | License |
| --- | --- | --- |
| `ajv` | 8.20.0 | MIT |
| `ajv-formats` | 3.0.1 | MIT |
| `fast-deep-equal` | 3.1.3 | MIT |
| `fast-uri` | 3.1.6 | BSD-3-Clause |
| `json-schema-traverse` | 1.0.0 | MIT |
| `require-from-string` | 2.0.2 | MIT |

The dependency packages retain their own copyright and license files in an installed dependency tree. Review this inventory together with `package-lock.json` before each public release.

## Development dependencies

### Playwright Core

- Project: <https://github.com/microsoft/playwright>
- Package: `playwright-core`
- Pinned version: `1.62.1`
- License: Apache-2.0

Temple uses Playwright Core only for repository development and the Management Console browser gate. The integration launches an already installed Google Chrome with an ephemeral automation profile. Temple does not download, vendor, redistribute, or include a browser binary in its npm package or runtime dependency tree.

## Mermaid README diagrams

- Projects: <https://github.com/mermaid-js/mermaid> and <https://github.com/mermaid-js/mermaid-cli>
- Authoring tool: `@mermaid-js/mermaid-cli`
- Pinned authoring version: `11.10.1`
- License: MIT

Temple commits independently authored Mermaid source and the resulting static SVG documentation assets. Mermaid is used only during documentation authoring; it is not vendored, installed as a runtime dependency, or required to operate Temple.

## Archify

- Project: <https://github.com/tt-a1i/archify>
- License: MIT
- Pinned upstream release for the optional adapter contract: `v2.16.0`
- Resolved upstream commit: `c826e6c3a7abad19c0f3cd1ca57207d54b1ad8de`
- Reviewed downstream security patch: `fast-uri-3.1.7-security-override`

Archify is not vendored, installed, downloaded, or executed by default. An operator may explicitly copy an exact local checkout into a project-owned isolated directory. During that copy, Temple deterministically changes Archify's declared `fast-uri` override and matching lock entry from `3.1.5` to `3.1.7`; it executes no package manager or upstream code. The installed copy records the clean upstream base, the complete downstream patch descriptor, Archify's MIT license, the dependency's BSD-3-Clause license, and every resulting file digest. The adapter remains replaceable and cannot become the source of truth.

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
