# WI-0126 risk review

Risk is low and bounded to human-facing planning documents and their lifecycle evidence.

## Main risks

- **Overclaiming:** describing local or synthetic evidence as broad effectiveness proof.
  - Mitigation: retain explicit evidence states and direct validation links.
- **Hiding failure:** removing `no-go` or `inconclusive` outcomes while simplifying the roadmap.
  - Mitigation: summarize them as learned evidence and keep the detailed records unchanged.
- **Translation drift:** three roadmaps implying different priorities or maturity.
  - Mitigation: align structure and factual claims, then review each language as natural prose.
- **Release confusion:** rewriting direction could be mistaken for deleting release requirements.
  - Mitigation: leave `release-readiness.md` and `WI-0086` intact; label release as paused, not cancelled or approved.
- **Optional-tool inversion:** Console or Usage collection appearing necessary to use Temple.
  - Mitigation: place both outside the critical path and name their fallback CLI/repository boundary.

No runtime, credential, external-write, deployment, publication, irreversible, or security-boundary change is included.
