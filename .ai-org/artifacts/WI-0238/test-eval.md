# Test and evaluation join

Historical Test/Eval judgment, superseded by the later failed Independent QA
(`independent-qa.md`). Its negative findings required same-scope rework; this
record is preserved, not reused to accept the corrected candidate.

Candidate: `173f43e1becdca8c3f1e672b173497b95441cd71`.
Quality Evaluator: Lulu (`agent-lulu`), primary task acting at Test/Eval; this is
not the separate formal Independent QA runtime. Date: 2026-09-07 UTC.

Fresh check: `node --test test/skill-policy.test.mjs test/operating-contract.test.mjs test/phase4-installation.test.mjs`:
**10/10 pass**, exit 0, **4,383.708041 ms**, Node.js 24.20.0.
It exercises the distributed/installed whole bodies for Builder and Verifier,
older contract retention, managed drift and untracked collision rejection,
project-owned preservation, native bootstrap/import and capability/Skill routing.

The [Developer full result](verification.md) is explicitly reused, not rerun or
relabeled independent: 767/767 at this exact candidate. Source comparison confirms
that only evidence/canonical coordination is dirty. The instruction-only runtime
manifest, matched product facts and unchanged model/request maintain the intended
comparison; [readiness](readiness-summary.json) is generation-free, not performance.

Reviewing the [obligation map](obligation-map.md) against the four old/new sources
shows a source-level reduction without a new route, Position or weaker lifecycle.
Old test paragraphs moved to retained owners rather than weakening functional
bootstrap, identity or approval checks. Cold source bytes decrease; how much a
model actually reads and whether delivery improves remain unanswered until the
separately authorized diagnostic. No current acceptance defect is identified here.

Test/Eval passes the approved implementation/readiness scope. Handoff to separate
formal Independent QA; no claim of release, merge or a live model result.
