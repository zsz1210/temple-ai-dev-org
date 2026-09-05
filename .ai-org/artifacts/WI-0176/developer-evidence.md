# WI-0176 — Developer evidence

Candidate: `a59f62ce70697a5d38d588225b723d856a474844`; Node.js 24.20.0.

The pre-fix TERM-resistant fixture failed after 1.047 seconds: close returned while the child signalCode remained null. Test cleanup explicitly terminated the fixture afterward. After the fix, all six focused tests passed in 3.252 seconds with no failures or skips on macOS.

The fixtures cover normal RPC and graceful termination, concurrent close, forced exit of the owned child while a sibling remains responsive, natural exit with pending requests, asynchronous spawn failure, synchronous serialization failure and explicit failure when injected signal delivery cannot confirm termination. The failed-signal fixture restores its real kill handle and terminates its child in teardown. No existing service was stopped.

The implementation separates connection closure from observed process exit, rejects outstanding request timers, shares close completion, bounds TERM/KILL waits and destroys owned pipe/readline resources. It deliberately does not enumerate system PIDs or claim descendant/process-crash cleanup.

Node's own child-process documentation distinguishes successful signal delivery from termination and documents the exit event: [Node.js source documentation](https://github.com/nodejs/node/blob/main/doc/api/child_process.md). The fix checks observed exit, not `child.killed`. The initial spawn-failure fixture used an invalid cwd that throws synchronously; it was corrected to a nonexistent executable under a newly created temporary directory to exercise asynchronous spawn failure.

Complete verification is running separately; independent QA remains required.
