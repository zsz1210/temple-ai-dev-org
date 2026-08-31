# WI-0067 work order

- Outcome: run the retained four-repository commerce rehearsal through the verified bounded runner and report only revision-bound local evidence.
- Experiment root: `/Users/zsz1210/Documents/ChatGPT/temple-effectiveness-lab`.
- Participants: `commerce-coordinator`, `commerce-catalog`, `commerce-orders`, and `commerce-notifications`.
- Execution ceiling: ten model turns and ten launch attempts, zero retries, no fallback, at most two concurrent turns.
- Model policy: every live turn requests `gpt-5.6-luna` with `max` reasoning.
- Token ceiling: 40,000 warning and 60,000 hard per turn; 300,000 warning and 400,000 hard aggregate.
- Time ceiling: ten-minute warning and fifteen-minute hard per turn; three-hour warning and four-hour hard for the program.
- Disk ceiling: 25 MiB warning and 50 MiB hard per repository; 100 MiB warning and 200 MiB hard aggregate.
- Authority: local synthetic repositories only. No API key, usage reset, paid API, public or private GitHub creation, hosted CI, deployment, publication, company data, or production action.
- Stop rule: the first resource, correlation, protocol, identity, clean-tree, path, lifecycle, or QA-independence failure stops the run without retry.

