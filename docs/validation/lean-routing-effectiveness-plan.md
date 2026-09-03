# Native Lean routing effectiveness experiment

This experiment replaces the inconclusive WI-0130 setup. It does not reuse WI-0130 as evidence that Temple's Lean process or adaptive routing works: those candidates were created as Standard Work Items, and one held-out requirement was not explicit in the candidate-visible task contract.

## Questions

The next run separates three decisions:

1. **Process:** Does native Lean Temple help compared with a responsible conventional workflow when both use Terra medium?
2. **Targeted escalation:** Does Luna max recover ambiguous or invariant-sensitive work often enough to justify its additional resources?
3. **Capability ceiling:** Does Sol xhigh add objective quality beyond Luna max on the same Temple treatment?

Sol is not a proposed default. It is the flagship ceiling and a possible escalation for consequential work or a lower route that cannot satisfy an explicit contract.

## Four matched arms

| Arm | Process | Requested route | What the comparison means |
| --- | --- | --- | --- |
| A | Responsible conventional | Terra medium | Baseline |
| B | Native Lean Temple | Terra medium | A→B isolates the process effect |
| C | Same Lean Temple | Luna max | B→C measures an efficient deep-reasoning route bundle |
| D | Same Lean Temple | Sol xhigh | C→D measures the flagship ceiling route bundle |

Because C and D change both model and reasoning effort, they do not isolate a pure model effect. If the ceiling arm wins, a later matched-effort experiment is required before attributing the improvement to Sol alone.

## Fairness controls

- The pinned Temple CLI must create `lean`, `bounded`, `low` Work Items and advance the actual Lean edge `intake → build`.
- Every case declares identity, immutability, idempotency, compatibility, and error semantics. `unknown` blocks setup.
- Held-out tests may enforce only the candidate-visible acceptance contract.
- A/B share task, acceptance contract, model, and reasoning effort.
- B/C/D share the same normalized Temple Context Capsule and repository treatment.
- Context is reported as deterministic UTF-8 bytes and component digests. This is repository-owned context size, not Provider input-token attribution.
- Objective held-out tests are primary. Arm-neutral blind review is secondary and freezes before mappings are unsealed.
- Retry, fallback, network access, dependency installation, and out-of-scope writes remain prohibited.

## Routing change under test

The shadow seed now treats explicit bounded work as Terra medium. `semantic-ambiguity` and `invariant-sensitive` task shapes can recommend Luna max. Sol xhigh remains the consequential-work route and may be pinned only for the capability-ceiling arm. No route starts a Provider task or becomes automatic.

## Evidence and stopping rules

The first corrected run keeps the two frozen cases so its result can be compared with WI-0130. It is still diagnostic. The next sample size must be derived from corrected-pilot variance, not an arbitrary Work Item count. Broader qualification then adds mechanical, error-semantics, cross-file, concurrency, API-contract, and ambiguous-requirement cases.

The live run is a separate Work Item. Before generation it must record:

- the final protocol digest and framework revision;
- exact installed Codex App Server schema and model availability;
- an explicit per-candidate, candidate-aggregate, evaluator, combined operational-Token, and wall-clock ceiling;
- owner approval for the three allowed models and Pro included allowance; and
- zero retry and zero fallback.

WI-0131 intentionally stops with `generation_ready: false`. A missing approval or Provider handshake is a boundary, not an experiment failure.

## Commands

Validate the protocol without creating a lab:

```bash
node scripts/run-effectiveness-pilot-v2.mjs --mode validate
```

After the framework changes are committed, create a fresh offline lab from that exact commit:

```bash
node scripts/run-effectiveness-pilot-v2.mjs \
  --mode setup \
  --lab-root /absolute/path/to/new-lab \
  --framework-revision <commit>
```

Run the provider-free preflight:

```bash
node scripts/run-effectiveness-pilot-v2.mjs \
  --mode preflight \
  --lab-root /absolute/path/to/new-lab
```
