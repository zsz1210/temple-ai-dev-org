# WI-0113 product specification

## Problem

The feasibility runner currently turns ordinary multi-step Agent work into repeated human intervention. It treats cumulative gross Token throughput as a financial safety limit, loses detailed usage fields in interrupted-run evidence, reports zero disk change when interruption happens before post-turn inspection, and stops the entire four-candidate program on any per-candidate bounded stop.

## Required behavior

1. Launch every candidate in an isolated App Server environment that does not inherit the parent task identity or selected host capabilities.
2. Persist Provider input, cached-input, output, reasoning-output, and total Token counters on every usage update.
3. Derive a non-cached budget counter as `input_tokens - cached_input_tokens + output_tokens`; never call it billed cost or Credits.
4. Retain gross throughput separately for comparison and runaway diagnosis.
5. Inspect changed paths and disk growth after success and after interruption.
6. Isolate a bounded per-turn Token or time stop to that candidate and continue later independent candidates while aggregate, authority, protocol, scope, and filesystem violations remain program-fatal.
7. Produce one terminal report after all possible candidates have run, without per-turn human approvals.

## Acceptance evidence

Automated replay tests must cover detailed usage persistence, cached-input budgeting, interrupted filesystem measurement, isolated candidate stops, and fatal global stops. A fresh exact-schema preflight and four-candidate live run must then either produce four blinded packages or one self-contained final report identifying terminal exceptions.
