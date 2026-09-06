# Diagnostic improvement and transport assessment

Developer candidate: `a21085cc`.

## Verified behavior

- Full `npm run verify`: 665 passed, zero failed/skipped/cancelled,
  156587.80125 ms.
- Focused format and command-policy tests: 19 passed.
- Prior WI-0217 experiment seal passed unchanged.
- `git diff --check` passed.

The experiment-local classifier now emits a nullable, manifest-bounded
`argument_detail`, while retaining the original `argument-shape` top-level rule.
Details distinguish missing option values, extra positionals, an unexpected
option terminator, invalid source JSON and invalid source-row shape. No argument
value, raw JSON, input fragment or parser exception is retained. Direct and
single-wrapper commands are covered, including privacy sentinels. Unclassified
shape errors remain null instead of guessing. The policy contract version is v5.

Allow/deny rules, execution, interruption, sandbox, model prompts and retries
are unchanged. The existing runtime persists the classification object; these
details will be available in future observations. Old sealed observations have
no new information and are not rewritten. This is not proof that WI-0217's
specific rejected command is now accepted or that its root cause is fixed.

## Transport assessment

Inspection of `src/cli.mjs`, `src/context-packet.mjs` and
`scripts/context-material-comparison.mjs` established:

1. The generated experiment prompt already supplies the literal serialized
   available-source declaration. Adding another copyable command is not a new fix.
2. The CLI accepts optional JSON through `--available-whole-sources`; omission
   means no reuse declaration. Existing prompt instructions already require
   omission when prior bodies are unavailable or changed.
3. Actual reading and retained context remain caller obligations. A helper must
   not claim reading merely because it computed a hash or opened a file.
4. The CLI's general declaration contract permits more local sources than this
   bounded experiment's intentionally narrower AGENTS.md/TEMPLE.md allowlist.
   Do not expand the experiment automatically to the general CLI contract.

Recommendation: keep the existing transport for now, with precise diagnostic
coverage. If a future observation identifies literal/JSON assembly as the issue,
design a narrowly scoped structured transport and test real CLI argv behavior,
read acknowledgements, scope and sandbox boundaries before live evaluation.
Do not implement a generic command wrapper or silently drop reuse declarations
in one experimental arm: that would alter the treatment and context volume.

## Handoff

No model experiment or external spending occurred. This report is Developer
verification, not distinct-Identity Independent QA. Next responsibility is
quality evaluation/review of this exact diagnostic change. A new live run is not
started or implied; the prior incomplete comparison remains incomplete.
