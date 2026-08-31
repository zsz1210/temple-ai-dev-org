# Alpha.28 multi-human governance — automated and simulated gates passed

- Version: `0.1.0-alpha.28`
- Governing Work Item: `WI-0076`
- Scope: local implementation, browser review, and disposable multi-clone simulation

## Result

Alpha.28 separates accountable people, Agent Identities, Position eligibility, assignments, claims, human authority, recovery, and validation provenance. It preserves Solo behavior, introduces an explicit collaboration v1-to-v2 migration, and replaces the Team hierarchy with Responsibilities, People & Agents, and Authority.

## Gate status

| Gate | Status | Evidence |
| --- | --- | --- |
| Repository and documentation checks | Passed | `npm run verify` |
| Complete automated suite | Passed: 257/257 | `.ai-org/artifacts/WI-0076/developer-report.md` |
| Fresh init, v1 migration, and upgrade preservation | Passed | `test/collaboration-governance.test.mjs`, `test/workflow.test.mjs` |
| Local actor binding and private-viewer redaction | Passed | focused and complete automated suites |
| Responsive and keyboard browser review | Passed | `.ai-org/artifacts/WI-0076/browser-review.md` |
| Simulated Collaborative two-clone drill | Passed | `.ai-org/artifacts/WI-0076/simulated-collaboration-report.md` |
| Real Collaborative | Not run | Requires distinct humans and independently administered environments |
| Representative pilot | Not run | Retained validation |
| High-Assurance drill | Not run | Retained validation |

## Supported conclusion

The local implementation is safe to use as Alpha.28's project-governance contract. It can surface competing repository writes, preserve both commits, recover accepted state, distinguish local binding provenance, and prevent simulated evidence from satisfying the real gate.

It does not prove provider authentication, cross-machine atomic locking, a real team operating model, a representative company or OSS pilot, or High-Assurance recovery under actual personnel loss.

## Next evidence

The next broader claim requires the existing real-environment plan: at least two distinct active Human Principals using independently administered environments, exact revisions, retained conflict or handoff evidence, and no reuse of this simulated pass as real evidence.
