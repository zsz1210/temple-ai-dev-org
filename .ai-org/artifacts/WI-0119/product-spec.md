# Product specification — WI-0119

## Problem

Temple has model guidance, usage attribution, capability discovery, workflow profiles, and task records, but these are not yet connected by a formal execution-routing contract. As a result, a coordinator can choose a model too early, bind the choice to a Position, overlook a required modality or privacy boundary, or discover provider incompatibility only after spending time and Tokens.

The same gap prevents Temple from expanding cleanly beyond software delivery. A video-production step, for example, may require storyboarding, image generation, audio, rendering, and human editing measures. Those needs should not require a new hard-coded software Position or a Token-only cost model.

## User outcome

A project can describe a Work Item as one or more execution steps. For each step, Temple deterministically identifies the required capabilities, filters execution profiles that cannot satisfy hard constraints, applies the project's declared preference order, and returns an explainable route. The result can be inspected by a human or coordinator without executing anything.

## Domain model

| Concept | Meaning | Does not mean |
| --- | --- | --- |
| Position | Stable responsibility and authority | A model, Provider, Skill, or running task |
| Task Shape | Characteristics of the current step used for comparison and policy matching | Agent identity or title text |
| Capability Route | Required and optional capability IDs, modalities, tools, or services for one step | Permission to use them |
| Execution Profile | A project-owned candidate configuration with declared capabilities and policy attributes | A universal claim that the profile is best |
| Execution Step | One independently routable unit inside a Work Item | A separate Work Item lifecycle |
| Execution Route | The resolved candidate, constraints, explanation, and requested execution settings | A task launch or Provider acknowledgement |
| Resource Observation | One measured value with unit, source, and quality | A missing value converted to zero |
| Model Calibration | Evidence that may qualify a future preference | Permission to execute automatically |

## Resolution order

For every step Temple must:

1. validate the request and project policy;
2. build the Capability Route from explicit required and optional capability IDs;
3. reject profiles that miss a required capability, modality, allowed Provider, data class, execution boundary, or risk class;
4. apply `pinned` selection when the named profile remains eligible, otherwise fail closed;
5. for `shadow` or `advisory`, use the first eligible profile in the matched rule's project-declared preference order;
6. use the explicit fallback profile only when it is eligible and no rule candidate resolved; and
7. return `unresolved` when no eligible profile exists.

Rules are exact structured matches over task kind, lifecycle stage, and risk class. They do not inspect free-form prompts or Position display names. The first matching rule wins, which makes policy ordering material and testable.

## Selection modes

- `pinned`: the request names one profile. Temple either resolves that exact profile or returns an unresolved reason.
- `shadow`: Temple computes and records what it would suggest, but the output has no recommendation authority.
- `advisory`: Temple returns a read-only recommendation that a human or coordinator may apply separately.
- `automatic`: unsupported and schema-invalid in this release.

Every result states `automatic_execution: false`, `provider_contact: false`, and `mutation_performed: false`.

## Resource model

The policy declares typed measures rather than assuming every task is text generation. The initial vocabulary covers:

- Tokens;
- latency in milliseconds;
- retry count;
- Credits;
- GPU time in seconds;
- image count and image pixels;
- video duration in seconds;
- audio duration in seconds; and
- human editing time in minutes.

Projects may add namespaced measures with an explicit unit and aggregation rule. Observations must carry a numeric value, source, and evidence quality. Unknown or unavailable values are omitted or explicitly marked unavailable; they are not stored as numeric zero.

## Extension case

A fixture must define a custom `video_producer` responsibility string, capabilities such as `content.storyboard` and `media.video.render`, and an execution profile outside the core development vocabulary. The resolver must accept it without changing `.ai-org/core/positions.json`. This proves routing extensibility only; it does not claim a complete media-production organization.

## Human-facing projection

The CLI returns the complete route explanation as JSON. Status and the Management Console System view expose the current selection mode, automatic-execution boundary, profile count, capability count, and resource-measure count. The Console remains read-only and does not imply that a displayed route has been executed.

## Acceptance

The acceptance criteria in `.ai-org/work-items/WI-0119.json` are authoritative. A passing implementation must also preserve existing usage attribution and matched-evaluation behavior.
