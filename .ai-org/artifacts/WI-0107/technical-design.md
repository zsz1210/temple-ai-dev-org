# WI-0107 technical design

## Isolation

The experiment is materialized under a new user-owned lab root outside the framework repository. Setup refuses to replace an existing lab. It creates one coordinator directory and four Git repositories. The minimal repositories contain no `.ai-org` directory. The Temple repositories are initialized using an archived copy of the exact framework revision pinned by the protocol.

## Execution

The runner validates the pinned fixture digests, installed Codex CLI version and App Server schema digests, model availability, repository cleanliness, manifest semantics, approval record, and disk headroom before generation. `--preflight-only` performs no model turn.

Four single-turn waves pass through the existing fail-closed validation-program engine. A direct App Server connection is used so both Temple and minimal repositories share identical transport behavior without adding Temple state to the minimal arm. Runtime approval requests are declined. User-input requests, model reroutes outside GPT-5.6, missing detailed usage, missing terminal completion, and forbidden changes stop the program without retry.

The runner requests structured five-field completion output, records only that bounded result and numeric observations, runs public and hidden tests, commits only allowed product paths, and emits an arm-neutral package plus a separately sealed coordinator mapping. Raw prompts, raw responses, hidden reasoning, and credentials are not retained.

## Evaluation boundary

Objective tests run first. Blind subjective scores are a separate post-run step. Evaluator usage, if any, is not attributed to either process arm. Condition and usage remain sealed until the signed score record is complete. Two cases can qualify the mechanism only; they cannot establish a causal effect or general routing rule.

## Failure and cleanup

The lab is local and disposable, but the scripts never delete it automatically. An interrupted or ambiguous attempt remains stopped and cannot be relaunched. Cleanup requires a separate explicit action after evidence has been preserved.

