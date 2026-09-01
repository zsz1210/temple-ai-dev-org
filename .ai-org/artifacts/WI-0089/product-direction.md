# WI-0089 Product Direction

## User problem

A sidebar title such as `WI-0089 · Product Manager · Yuna` answers who is responsible but not what the task is doing. Names alone are also hard to remember when one Agent Identity holds several Positions. Unstructured titles make it easier to reopen the wrong task, duplicate work, or lose the main control conversation among execution tasks.

## Human-readable outcome

Put the outcome before the organizational metadata:

- `WI-0089 · Improve task titles · Product Manager (Yuna)`
- `Temple · Control and Roadmap · Engineering Manager (Mog)`

The ordinary title is generated from canonical Work Item data. The main-control title is a human navigation convention because it does not represent one bounded Work Item.

## Short-goal contract

- Collapse whitespace to one space and trim it.
- Replace the structural `·` delimiter inside a Work Item title with `-`.
- Bound the complete suggested title to 58 Unicode code points by shortening only the goal and appending `…`.
- Never remove or abbreviate the Work Item ID, Position, or Agent display name.

The initial Product handoff proposed a 48-code-point goal limit. Live Codex readback showed that this still let the app truncate the entire title before Position and Agent. The whole-title budget above supersedes that initial proposal with observed behavior.

## Authority and lifecycle boundary

Titles are mutable navigation labels. The stable Codex thread ID plus Work Item ID are the recoverable identity. A title change cannot create a claim, change task status, advance the lifecycle, archive a task, or update an external tracker.

Repository title refresh and Codex app rename are separate actions. Temple may refresh the stored suggestion explicitly, but it cannot claim that the visible app title changed until the app mutation succeeds.

## Non-goals

- Rewriting Work Item titles to fit the sidebar.
- Making titles canonical state.
- Automatically renaming every historical or inaccessible task.
- Creating a Codex task for the main control conversation.
- Archiving, messaging, dispatching, or switching models while changing a title.
