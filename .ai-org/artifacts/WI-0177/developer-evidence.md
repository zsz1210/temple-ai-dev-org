# Developer evidence

Candidate: `c8fc420da7ef570c80419bc8ff771fddb22f45dc`.

Rikku changed the framework-owned source of `temple-work` and the AGENTS delivery-profile rule. The project-owned root AGENTS integration block was synchronized without changing its maintainer prefix. `node ./templew.mjs upgrade . --dry-run` reported one managed update; the supported upgrade then updated only the installed Skill and its lock entry, preserving other project-owned configuration.

`node --test test/skill-policy.test.mjs test/context.test.mjs test/workflow.test.mjs`: 40 passed, 0 failed, 0 skipped; 26,293.612 ms. Coverage includes source-manifest hash sensitivity and unsafe sources; real initialized context routing; fresh install equality; Lean and Standard lifecycle paths; title normalization; missing evidence refusal; checksum-aware upgrade and rollback; and two new narrow instruction-contract guards. These static Skill guards are not model adherence tests.

`git diff --check` passed. Upgrade Doctor: 36 pass, 1 expected stale-plan warning before replanning, 0 fail. Independent QA and complete candidate verification are pending in this record and must be joined separately before closeout.

This batch corrects routing ambiguity, not file-size efficiency: overlay AGENTS grew from 6,206 to 6,421 bytes; the Skill grew from 5,304 to 6,599 bytes because reuse/authority and workflow boundaries are now explicit. Bytes are not Tokens. Reduced repeated source loading is a hypothesis for a later frozen comparison; no token, latency, or overall-efficiency improvement is claimed.

No other worktree, comparison protocol, model policy, dependency, lifecycle implementation, release, or npm state was changed.
