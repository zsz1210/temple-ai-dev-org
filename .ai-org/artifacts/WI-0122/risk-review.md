# Risk review — WI-0122

Risk is Standard because this changes a versioned validation boundary but remains local, reversible, and covered by deterministic tests.

Primary risks are choosing an ambiguous reason precedence, rejecting legitimate pinned outputs, or leaving schema and semantic validation inconsistent. The mitigation is an explicit mode-first precedence table, tests built from actual resolver output, byte-identical managed schema copies, focused verification, full repository verification, and separate Independent QA.

Rollback is a revert of the exact repair candidate. No data migration, Provider action, model execution, external write, deployment, publication, or release is involved.
