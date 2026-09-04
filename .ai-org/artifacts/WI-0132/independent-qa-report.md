# Independent QA report — WI-0132

## Verdict

**Pass** for the registered experiment, retained evidence, report accuracy, regression safety, and organizational closeout.

**No-go** for automatic routing, a general model ranking, a monetary savings claim, or a framework-wide Temple effectiveness claim.

## Evidence independently checked

- Protocol digest: `84d30df16d72bfbae6ac1d111729ddab9e90d761c46a8694250955985028bc45`
- Candidate and evaluator completion: `8 / 8` and `1 / 1`
- Public and held-out acceptance results: `8 / 8` pass
- Blind evaluator results: `8 / 8` pass; scores from `96` to `99`
- Operational budget: `443632 / 580000`
- Candidate wall-clock budget: `868644 / 4500000` ms
- Retry, fallback, reroute, and path-violation counts: `0`
- Native Lean, bounded, low-risk preflight: pass for all Temple candidates
- Product-input matching: pass across A, B, C, and D
- Temple-context matching: pass across B, C, and D
- Score freeze before mapping unseal: pass
- Full repository verification at `fd4bbe881b3b86d25cd48846b13d9ae1546c4470`: `350 / 350` tests pass

The six raw source digests in the canonical observation were recomputed before closeout. The report's aggregate counts, Token totals, latency totals, score means, and percentage deltas agree with the retained candidate evidence.

## Interpretation checks

The report correctly states that native Lean Temple showed no correctness or blind-score gain over the responsible conventional Terra baseline in these two cases. It also keeps the measured 77.94% Token increase and 10.33% latency decrease visible instead of presenting only favorable evidence.

The report correctly rejects Luna Max as the default for these explicit bounded cases: no correctness gain, a one-point lower mean blind score, 76.36% more aggregate operational Tokens, and 266.43% more candidate time than Temple Terra.

The Sol result is reported as promising but unqualified. Sol used fewer Tokens and less time than Luna in aggregate and scored two points higher, but both arms already passed. The comparison changes model and requested effort together, effective turn effort is unavailable, and two cases cannot support a general route or cost claim.

## Residual limitations

1. Only two implementation cases were sampled.
2. Effective turn reasoning effort was not exposed.
3. The Terra evaluator may have model-specific preferences even though packages were arm-neutral.
4. Operational Token counts cannot be converted to monetary cost from this evidence.
5. The raw lab is temporary; the repository retains the bounded observation, source digests, and human reports rather than prompts or hidden reasoning.

## QA outcome

The Work Item may advance to Release Gate for a `go` organizational closeout of the experiment and report. Such closeout performs no external release and must not change automatic routing policy.
