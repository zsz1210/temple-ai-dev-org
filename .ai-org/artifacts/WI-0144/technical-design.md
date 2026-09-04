# WI-0144 technical design

## Portable model onboarding

The portable path is a staged evidence pipeline, not an LLM guess:

1. **Framework seed** installs four abstract execution profiles with `provider_id`, `model`, and `reasoning_effort` set to `null`.
2. **Provider discovery** obtains a bounded catalog from an approved local or remote integration. For Codex App Server, the current official boundary is `model/list`, which reports available model identifiers, supported reasoning efforts, default effort, modalities, visibility, and related picker metadata.
3. **Compatibility qualification** verifies that a candidate supports the required modality, reasoning option, tool and structured-output behavior, data boundary, and installed protocol. Catalog presence alone is not compatibility proof.
4. **Mapping proposal** maps compatible candidates to project-owned abstract profiles. The proposal records source, timestamp, Provider/version, unknowns, and rationale. It has no execution authority.
5. **Project adoption** changes `.ai-org/project/execution-policy.json` through normal repository review. The framework overlay remains unchanged.
6. **Advisory resolution** filters hard constraints and returns an explainable requested route. Effective model and reasoning remain unobserved until Provider evidence exists.
7. **Observation and calibration** compare quality, Tokens, latency, retries, rework, and human intervention for exact Task Shapes. A qualifying result may create a policy-change proposal, not a self-modifying rule.

An AI may assist at steps 4 and 7. It must not substitute conversation memory for steps 2, 3, or 5.

## Cold-start behavior

Until concrete mappings are adopted, a route may identify the appropriate abstract profile but must expose `provider-unmapped` and remain non-executable. A project may choose one conservative, Provider-recommended compatible model as a temporary baseline, but Temple must label that choice as a project adoption rather than learned optimization.

The project should begin in `shadow` or `advisory` mode. `pinned` remains available for an explicit task-level choice. Automatic execution stays unsupported. Unknown required capabilities fail closed; optional unknowns remain visible.

## Evidence scopes

- **Framework evidence** defines safe mechanics and reusable experimental methods.
- **Provider evidence** establishes catalog and protocol facts at a point in time.
- **Project evidence** establishes suitability for one project's exact Task Shapes.
- **Task evidence** records the requested route and the effective execution actually observed.

Evidence never broadens itself from task to project or from project to framework.

## Successor evaluation split

### Program A: single-repository maturation

Hold model, reasoning, task fixture, tools, output schema, quality oracle, and process packages fixed. Use randomized or counterbalanced matched blocks. Derive the repetition count from WI-0143 pilot dispersion, a predeclared minimum effect worth acting on, and a stated error tolerance. Correctness remains primary. Cache balance is reported per block, and a failed cache rule blocks the causal Token claim without erasing the observation.

The decision is limited to whether Routed Context should become the default recovery context strategy for the tested bounded single-repository Task Shape.

### Program B: multi-repository cache isolation

Do not treat the WI-0143 multi-repository result as a request for more identical repetitions. Separate the fixed coordinator context from participant-repository evidence, randomize treatment order across independent blocks, and retain block-level cache share, acquisition, quality, and Operational Token observations. Prefer a Provider-acknowledged cache control if a verified interface becomes available; otherwise retain descriptive-only conclusions when the predeclared balance rule fails.

The decision is limited to whether the package structure or acquisition strategy should change before another routing-efficiency comparison.

## Risks

- Provider catalogs and aliases can change after discovery; adopted mappings need provenance and a review trigger.
- A Provider default is an availability hint, not proof of project quality, price, or safety.
- Small matched samples can expose defects but cannot establish a universal routing policy.
- An onboarding wizard could accidentally combine proposal and authority; any future implementation must keep preview, adoption, and execution separate.
- Supporting multiple Providers introduces incomparable capability vocabularies; normalization must preserve Provider-specific unknowns rather than invent equivalence.
