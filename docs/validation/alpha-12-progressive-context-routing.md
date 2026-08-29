# Alpha.12 Progressive Context Routing validation

- Date: 2026-08-29
- Framework revision: `310545b9b60ba76059bf00526fa6ab724d66ae2b`
- Version: `0.1.0-alpha.12`
- Branch: `main`
- Environment: macOS, Node.js 25.6.1
- CI evidence: [GitHub Actions run 33254212517](https://github.com/zsz1210/temple-ai-dev-org/actions/runs/33254212517)

## Validation question

Can a clean repository install the alpha.12 organization, preserve a project-owned Context Map, discover repository Skills without changing ownership, create a bounded work item with affected paths and context references, resolve a generated Context Capsule through the deterministic provider, and remain healthy under doctor and status checks?

## Automated verification

The tested revision ran:

```bash
npm run verify
```

Observed result:

- repository checks passed with 49 project-overlay files and 10 Positions;
- all 45 Node test cases passed;
- the context-specific suite covered managed and project-owned Skill discovery, capability search, route and Learning retrieval, generated Capsule persistence, affected-path overlap, invalid route detection, unsafe path rejection, unknown route rejection, upgrade preservation, and the optional semantic-provider contract;
- GitHub Actions repeated `npm install --ignore-scripts` and `npm run verify` successfully on the pushed revision.

## Clean-project CLI smoke test

A temporary empty target was initialized with five test-only Agent Identities assigned across all ten Positions. The fixture was not committed and was moved to the local Trash after the run.

The smoke test then:

1. added `docs/product.md` as a canonical product contract;
2. added one active `product-contract` route to the project-owned `.ai-org/project/context-map.json`;
3. created `WI-0001` with `docs/**` as an affected path and `product-contract` as an explicit context reference;
4. queried capabilities for `product documentation` as Product Manager;
5. resolved the work-item context as Product Manager at revision `smoke123`;
6. ran `temple doctor` and read status v3 without writing another view.

Observed result:

- `project-documentation` ranked first in capability search;
- the Context Capsule selected `product-contract` and cited `docs/product.md`;
- the provider was `repository-deterministic` with `semantic=false`;
- no affected-path overlap was reported in the single-work-item fixture;
- the generated Capsule was written to `.ai-org/views/work-items/WI-0001.json`;
- doctor reported 18 passes, 0 warnings, and 0 failures;
- status v3 reported one active context route, six available core capabilities, and no invalid capabilities.

## What this evidence supports

- The installation and upgrade paths preserve the Context Map as project-owned state.
- Capability discovery observes a repository-local extension without adding it to `temple.lock.managed_files`.
- Deterministic context routing returns bounded paths, scores, reasons, provider provenance, and overlap warnings without requiring a model or external service.
- Generated Registry and Capsule files can be rebuilt and do not become canonical authority.
- The documented CLI path works in a clean local repository and in Linux CI for the tested revision.

## What remains unverified

- Recovery by a new Codex task in a real product repository using only the routed sources.
- Retrieval quality and maintenance cost in a large repository with many routes, Skills, Lessons, and concurrent work items.
- Human coordination behavior when multiple maintainers and their Agents act on overlapping work.
- A real semantic or hybrid Retrieval Provider, embedding lifecycle, local-model resource use, privacy controls, and deterministic fallback.
- Windows CLI execution and cross-platform path behavior beyond the existing automated tests.

These gaps remain roadmap inputs. This record must not be cited as proof that cross-task recovery, multi-maintainer governance, large-repository retrieval, or semantic RAG is already production-ready.
