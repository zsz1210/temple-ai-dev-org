# WI-0144 approved scope

## Product question

How can a new Temple adopter obtain a useful initial model route without Temple knowing their Provider, available models, account access, budget, or project-specific quality needs in advance?

## Decision

Temple supplies Provider-neutral execution profiles and deterministic eligibility rules. The adopting project owns every concrete Provider, model, and reasoning mapping. A catalog observation may narrow what is available, but only compatibility checks and explicit project adoption may activate a mapping. Matched project-local evidence may later recommend a preference change; it never edits the policy automatically.

## Acceptance criteria

1. A fresh installation retains `null` Provider, model, and reasoning mappings.
2. The onboarding path works without chat history and records provenance for discovered, proposed, adopted, and observed facts.
3. An AI may explain or draft a mapping, but cannot present its own recollection as Provider evidence or adoption authority.
4. Missing access, capability, price, or quality evidence remains unknown. No model is selected merely because it is largest, cheapest, newest, or listed by a Provider.
5. The resolver remains deterministic and non-executing. A separate authorized executor would be required to contact a Provider.
6. Cold-start defaults, project calibration, and framework-wide guidance remain separate evidence scopes.
7. The WI-0143 successor design separates single-repository maturation from multi-repository cache isolation.

## Non-goals

- implementing an interactive setup wizard or Management Console editor;
- enabling `automatic` route execution;
- copying this repository's Luna, Terra, or Sol mapping into the framework overlay;
- claiming causal Token savings from WI-0143;
- generating new comparison candidates in this Work Item.
