# WI-0158 Technical Design

## Frozen candidate

The experiment uses an unpublished archive packed from a clean detached checkout of `54d14f4e94a930719ca7674ebf1ad74be89de7ac`. The archive is installed only into a new disposable local repository. Its digest and inventory are recorded in the protocol before either Codex task starts.

## Sequential tasks

The delivery task receives a neutral product brief, the frozen archive, and an empty target directory. It must discover and follow packaged Temple guidance, create one QueueKeep Work Item, keep Developer and Independent QA identities distinct, and stop after accepted closeout.

Only after delivery stops does a different, fresh task receive the target repository path and a read-only recovery question. It receives neither the delivery conversation nor the coordinator Work Item ID. This ordering tests durable repository state rather than chat-to-chat transfer.

## Measurement

The coordinator records wall-clock elapsed time, completion state, command or process errors visible in task output, model retries, product rework after first verification, Human interventions, application tests, lifecycle and identity state, Status, Doctor, Git cleanliness, and reliable Provider Token telemetry when exposed. Missing telemetry remains `unknown`.

WI-0155 and WI-0156 are descriptive matched observations, not a control population. The final comparison may identify repeated friction or regressions, but it cannot establish general efficiency or causality.

## Stop boundaries

Each task receives one attempt and an enforceable 12-minute wall-clock boundary. A timeout, Provider failure, policy stop, or blocked lifecycle state is retained as the result. The coordinator does not coach, retry, substitute a model, invoke a reset, purchase Credits, publish, or continue QueueKeep.
