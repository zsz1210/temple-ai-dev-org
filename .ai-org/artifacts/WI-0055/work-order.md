# Work order: harden App Server protocol compatibility

## Objective

Correct Temple's Provider-owned launch wire encoding and prevent a mock-only contract from reaching another live call.

## Required work

- preserve Temple's internal policy vocabulary at the caller boundary;
- translate supported internal values to the exact current App Server wire values;
- reject unsupported values before `thread/start`;
- test the wire request against a separately recorded contract snapshot derived from the installed schema;
- retain only bounded RPC classification on Provider rejection;
- update operator documentation and project learning.

## Stop boundary

Stop after local implementation, full verification, Independent QA, and organizational closeout. Do not call real `thread/start`, `turn/start`, or a model. Do not retry WI-0054, register a Codex task, push, publish, deploy, or release.
