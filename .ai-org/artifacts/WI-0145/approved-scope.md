# WI-0145 approved scope

## User outcome

A new adopter can ask Temple for an initial model setup recommendation without needing a long conversation history. When authorized aggregate usage metadata exists, Temple may use it to make the initial proposal feel familiar, while keeping habit separate from proof of quality or efficiency.

## Input contract

The caller supplies one local JSON document containing:

- one bounded Provider catalog observation with provenance;
- project compatibility assessments that name eligible abstract profiles and evidence;
- optional explicit per-profile preferences;
- optional aggregate usage observations containing no prompt or hidden-reasoning content.

## Recommendation precedence

For each abstract profile:

1. use one compatible explicit preference when present;
2. otherwise use one uniquely most-observed compatible historical configuration as a familiarity prior;
3. otherwise use the single compatible candidate when only one exists;
4. otherwise remain unresolved and expose the alternatives.

A tie, incompatible preference, undiscovered historical model, unsupported reasoning effort, or absence of compatibility evidence does not produce a recommendation.

## Output and authority

The plan distinguishes catalog discovery, compatibility, proposal, existing adoption, requested execution, and effective execution. Every result declares that Provider contact, policy mutation, model execution, and automatic adoption were not performed.

## Non-goals

- live `model/list` transport;
- interactive terminal or Management Console UI;
- automatic policy application;
- evaluating whether a model is objectively best;
- reading raw prompts or prior conversation bodies;
- generating a model turn.
