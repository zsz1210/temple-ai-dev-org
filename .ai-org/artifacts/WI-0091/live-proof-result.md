# WI-0091 bounded live Token capture proof

## Result

`pass`

One Provider-owned Codex task ran once with `gpt-5.6-luna` at Max reasoning. The installed App Server contract and Provider model list were checked before generation. The task returned the exact fixed marker, completed normally, emitted one detailed Token observation correlated to WI-0091, and required no retry or interrupt.

## Correlation

- Launch revision: `c60a2d275f454f567c3a1dbf7e3a75753d4b794f`
- Task: `task-0006`
- Provider thread: `01a05f6d-b532-7693-bae6-7d90a5c787a4`
- Provider turn: `01a05f6d-b5f7-7e12-8f9b-a3ab027f2258`
- Position / Agent: Developer / Rikku (`agent-rikku`)
- Requested and effective model: `gpt-5.6-luna`
- Reasoning effort: `max`
- Terminal status: `completed`
- Elapsed time: 10,792 ms
- Attempts: one thread start, one turn, zero retries

## Detailed usage

| Dimension | Tokens |
| --- | ---: |
| Input | 24,267 |
| Cached input | 9,984 |
| Output | 26 |
| Reasoning output | 13 |
| Total | 24,293 |

The repository Usage report changed from 23,433 to 47,726 total Tokens and from one to two correlated observations. After the bounded Provider process stopped, capture health correctly returned to `historical-only`, with the latest observation at `2026-09-02T00:03:45.543Z`. That state means the history is current through the recorded timestamp but no live subscription remains active.

## Safety and claims

- Sandbox was read-only, network access was disabled, and approval policy was `never`.
- The preflight made no generation request.
- The one generated turn used no tools and made no repository edits.
- Raw instruction content, response content, hidden reasoning, and raw Provider payloads were not retained in Temple telemetry or this record.
- Monetary cost remains unknown because no approved price source was used.
- This proof demonstrates capture and attribution only. It does not demonstrate savings, model superiority, statistical qualification, or routing authority.
