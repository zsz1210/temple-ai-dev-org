# Quality report

Lulu evaluated exact candidate `eef2908440d900568b07a60a221a89566615e77d` against the accepted protocol contract.

## Results

- Repository and documentation checks passed.
- Focused Control Plane suite passed 19/19.
- The current installed CLI regenerated the same `thread/start` sandbox enum: `read-only`, `workspace-write`, `danger-full-access`.
- The current installed CLI regenerated the same approval strings: `untrusted`, `on-request`, `never`.
- The current installed CLI regenerated the same `turn/start` sandbox policy tags: `dangerFullAccess`, `readOnly`, `externalSandbox`, `workspaceWrite`.
- Regenerated schema digests match the recorded research evidence.
- Unsupported `onFailure` and raw wire values fail before Provider contact.
- Thread and turn rejection tests retain stable reason, RPC code, and bounded category without retaining the secret Provider message.

## Boundaries

The tests used local pure logic, temporary fake App Servers, and schema generation only. They did not call a real `thread/start`, `turn/start`, model, network-capable agent, or external mutation.

## Decision

Pass to Evaluation. The candidate fixes the reproduced protocol mismatch and adds regression coverage, but it does not yet prove a real live launch.
