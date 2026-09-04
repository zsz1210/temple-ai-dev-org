# WI-0142 technical design

## Decision

Keep WI-0141 immutable and harden the successor measurement path in three layers: acquisition normalization, cache-aware analysis, and a reusable evaluation contract.

## Acquisition normalization

The normalizer accepts only an exact single-path read from a supported action field or a strict single-file `sed`/`cat` command after the existing shell-wrapper normalization. It canonicalizes the target inside the disposable condition root before classifying it. The special condition-local `CONTEXT_PACKAGE.json` target is classified as `control`; it is not counted as a routed project source.

The retained observation stores only repository ID, repository-relative path, access kind, classification, and bounded output-byte count. Raw commands, command output, prompts, responses, hidden reasoning, absolute paths, and credentials remain excluded. Any path that cannot be derived unambiguously remains `unknown`.

## Cache-aware analysis

For each condition and matched repetition, derive:

```text
non-cached input = gross input - cached input
Operational Tokens = non-cached input + output
cache share = cached input / gross input
```

These are reported together; none is substituted for another. The historical WI-0141 protocol did not freeze, disable, or match cache state, so its cache-control validity is `insufficient` regardless of whether any individual pair happens to look balanced. Diagnostic deltas remain visible, but a causal process-efficiency claim is blocked.

Future protocols may declare a controlled method only when the Provider contract and observation can verify it. A numerical balance tolerance must be predeclared from pilot evidence rather than invented after results are visible.

## Reusable evaluation contract

The project template is a draft, non-executable protocol skeleton. It separates:

- the decision and falsifiable hypotheses;
- task strata, fixtures, arms, and the one intended causal factor;
- model, reasoning, process, context, and output-schema controls;
- order/counterbalancing and cache controls;
- objective quality gates and optional blind judgment;
- metrics, derived measures, budgets, stop conditions, privacy, and authority exclusions;
- protocol digest, exact approval, observation, analysis, and report boundaries.

Process-only experiments hold model settings constant. Model-only experiments hold the process and context constant. A process-by-model factorial comparison is allowed only when both factors and interactions are intentionally powered; it is never inferred from a confounded comparison.

## Compatibility and risks

- Existing WI-0141 schemas and artifacts stay valid and unchanged.
- New analysis fields are additive, so existing consumers can ignore them.
- The specialized harness remains sealed against another live run.
- The template grants no execution or spending authority.
- A future Provider or model release requires a fresh contract preflight; model names, reasoning controls, usage fields, caching behavior, and pricing must not be assumed from an older release.

