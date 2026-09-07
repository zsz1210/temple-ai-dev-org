# WI-0239 — Verification and evaluation

Date: 2026-09-07 UTC. Developer: Rikku (`agent-rikku`). Evaluation: Lulu
(`agent-lulu`). This record evaluates retained evidence, not new product behavior.

## Fresh read-only evidence checks

A Node.js assertion pass against the sealed private lab and `comparison.json`
exited 0. It checked protocol/run digests, both runtime bundle manifests, all six
export rows, two attempted observations, exact usage and command-category objects,
setup/turn/attempt durations, cleanup flags, Token arithmetic and censoring flags.
The ordinary oracle accepted 46 cases; the previous subject has no oracle result.
All four unattempted rows retain null usage. Observed Operational Tokens sum to
132,550; the aggregate explicitly remains incomplete.

Git comparison against `a69a5080978b28ef482753ba70dea8d0b6960748` found no changes
in executable code, scripts, tests, dependencies, distributed/installed instruction
sources or `temple.lock`. The same source candidate
`af5a984aee6706ab308c693d95e138134162d5d6` passed 767/767 in the accepted
[WI-0238 verification](../WI-0238/verification-r1.md). That exact source evidence
is reused, not counted as a new full test run for every Position.

Read-only post-stop inspection confirmed the previous subject's Test state,
released claim, candidate-matched handoff, two normalized evidence registrations
and uncommitted bookkeeping. No product test, completion repair, retrospective
oracle, lab mutation or new provider turn followed the seal. Ordinary and previous
subjects both report confirmed provider exit and empty background terminals.

## Evaluation

The bounded execution/reporting contract permits an honestly reported stop.
That contract is satisfied by preserving the two attempts and four unattempted
cells, but the scientific comparison remains **inconclusive**. Previous-Temple
product correctness, all changed-requirement contrasts and any compact-Temple
effect remain unobserved. No default routing or product-efficiency claim follows.

The report separates uncached input, cached input, output, complete/incomplete
usage, elapsed-until-stop, partial command classification and actor-authored
evidence. It does not hide the 1,176 Token overshoot or count reasoning output
twice. The source accepts local artifact evidence for the eligible Lean finish;
separate normalized registrations are not mandatory for that particular path.

Distinct QA must independently challenge these claims and perform the evidence-only
fast/link and canonical-state checks. Its actual result belongs in
`independent-qa.md`; this record does not predeclare that review passed.
