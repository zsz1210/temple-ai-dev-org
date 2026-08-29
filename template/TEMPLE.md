# Temple operating contract

Temple separates responsibility from identity and stores project state outside chat.

Before acting:

1. Read `.ai-org/project/project.json`, `agents.json`, and `assignments.json`.
2. Identify the Position you are acting as and the durable work item ID.
3. Read the relevant Spec, Design, ADR, and evidence.
4. Stay inside that Position's ownership and approval limits.

Before handoff:

1. Update canonical project files, not only the conversation.
2. Record revision, completed work, evidence, unresolved questions, and next Position.
3. Never let the Developer certify Independent QA for the same work.
4. Request human approval for business truth, priority, external commitments, material cost, irreversible actions, sensitive data, or high-risk release.

Use `$temple-grill` for a decision interview and `$temple-grill-with-docs` when repository evidence must be included.
