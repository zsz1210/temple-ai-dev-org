# WI-0098 technical design and risk review

## Design

Introduce the project-owned `.ai-org/project/repository-integration.json` document with schema `temple.repository-integration/v1`.

The document records only the minimum coordination mapping Temple needs:

- `status`: `unconfirmed`, `deferred`, or `confirmed`;
- `authority`: always `project`;
- `source`: `not-inspected`, `repository-policy`, or `human-confirmed`;
- `policy_refs`: repository paths or stable external references to authoritative policy;
- `summary`: a short routing note, not a policy copy;
- `integration_target`: the named integration branch or target when known;
- `change_isolation`: `unknown`, `project-defined`, `required`, `recommended`, or `not-required`;
- `review_gate`: `unknown`, `project-defined`, `required`, or `not-required`;
- confirmation provenance.

`temple.init/v1` accepts an optional complete `repository_integration` document. Omission remains backward compatible and creates the unconfirmed default. AI-assisted `$temple-init` must inspect likely policy sources, propose a record, and include it in the user's pre-write confirmation.

Upgrade uses exclusive creation for a missing project-owned record. It never adopts the path into `temple.lock.managed_files` and never rewrites an existing record. Doctor validates the document and reports unconfirmed or deferred state as a warning. Status exposes the bounded summary for humans and Agents.

Installed `AGENTS.md` and `TEMPLE.md` instruct later Agents to read the record before choosing a branch, pull request, merge request, or equivalent integration action. They follow referenced project policy and ask only when an unconfirmed decision materially affects the requested work.

## Risk review

- **Vendor lock-in:** mitigated by free-form policy references and vendor-neutral coordination fields.
- **Policy duplication and drift:** mitigated by making project policy authoritative and treating the summary as a routing note only.
- **Backward compatibility:** mitigated by an optional init field and an unconfirmed default for existing configs.
- **Project-owned overwrite:** mitigated by exclusive create on init and upgrade plus preservation tests.
- **False enforcement claim:** mitigated by reporting confirmation state only; Temple does not configure hosting controls.
- **Prompt fatigue:** mitigated by asking only when the record is not confirmed and the missing choice affects current work.
- **Sensitive data:** policy references and summaries must not contain credentials, tokens, private email addresses, or copied confidential policy text.

## Verification plan

- Model validation accepts normalized confirmed records and rejects inconsistent provenance.
- Fresh init writes confirmed and unconfirmed records correctly.
- Re-init and upgrade preserve existing bytes.
- Schema validation, Doctor, and status expose the intended state.
- Installed Skill and Agent contracts remain synchronized.
- Full verification and clean exact-tarball consumer tests pass on supported Node.js versions.
