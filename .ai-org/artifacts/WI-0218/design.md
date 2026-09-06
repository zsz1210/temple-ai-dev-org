# Argument diagnostics without argument retention

Approved slice: distinguish command argument failures, test supported forms and
assess transport improvements. No live experiment, relaxed allowlist or source
read acknowledgement is authorized by this implementation.

Keep the existing top-level `argument-shape` rule and allow/deny decisions.
Add a nullable `argument_detail` drawn only from a fixed manifest: missing option
value, unexpected positional, unexpected option terminator, invalid source JSON,
invalid source-row shape. Other shape failures remain unspecified. No option
names, values, parser messages, input fragments, paths or hashes enter this field.

Compatibility tests cover direct and wrapped literal commands, valid source JSON,
empty and malformed rows, missing values and extra arguments. Diagnostics are
observations, not containment. Existing provider events retain the classification
object; no raw command persistence or retry is introduced.

For deterministic transport, first evaluate the installed CLI's existing optional
`--available-whole-sources` argument. Do not add a helper that claims files were
read on behalf of a model. A future helper or argv transport requires separately
bounded implementation and acceptance tests. This slice should identify the safe
next design, not silently change the experimental treatment.

Acceptance: focused compatibility/privacy tests, unchanged legacy decisions,
full `npm run verify`, prior sealed evidence unchanged. Independent assurance
remains distinct from Developer verification.
