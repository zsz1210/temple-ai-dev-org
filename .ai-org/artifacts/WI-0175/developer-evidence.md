# WI-0175 — Developer evidence

Candidate: `d59845c0cd4748fd6c4c746314b6d89d4acf7e97`.
Runtime: Node.js 24.20.0. Developer: Rikku.

Before the fix, the regression file failed 2/3 cases: `--affected-path` returned success, and unsupported-option validation occurred after accessing the target. The valid-update case passed.

After the dispatcher guard, `node --test test/work-item-configure-options.test.mjs` passed 3/3 in 2.261 seconds. The rejection case checks nine requests against a recursive byte snapshot of all fixture files and directories, including work items, audit events and generated views. Valid repeated references, clearing flags, JSON/text updates and help were retained. An initial test mistakenly treated globally unknown `--force` as globally recognized; it was corrected to the recognized `--same-scope` before committing the candidate.

No canonical schema or configure mutation semantics changed. Unsupported options fail before target access and mutation lock acquisition. This is a configure-only guard, not a claim that every CLI command now has an option contract. Full verification and independent QA remain required before closeout.
