# Independent review: rework required

Reviewer: agent-lulu, distinct from Developer agent-rikku; independent worker wi0201_lifecycle_recheck. Candidate cbc18f9b7d15c98c3236325f3a0734b1a7853f4b. Source diff from candidate was empty.

Independent rerun: `node --test test/context-enter.test.mjs test/context-packet.test.mjs`, 32/32 passed (~39 seconds).

P2: validateAvailableWholeSources accepts a JSON array as sha256 via regular-expression coercion. Reproduced with `[{path:"AGENTS.md",sha256:["sha256:"+"a".repeat(64)]}]`. Installed CLI likewise accepts it. Strict equality prevents body suppression; no authority bypass observed. The malformed-input rejection contract nevertheless requires an explicit string type guard and array regression. Candidate is not accepted until corrected and independently rechecked.

Defaults, changed/missing/unsafe sources, actor restrictions, recovery, projections and digest tests passed. Context residency remains caller-attested. No live experiment or external operation.
