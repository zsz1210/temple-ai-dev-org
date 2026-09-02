# WI-0111 product specification

## User outcome

A maintainer can run the offline protocol gate and know that an allowlisted command with a quoted search expression is not falsely rejected, while shell composition and substitution still fail closed.

## Acceptance

1. `rg -n 'applyCommand|balance|event|command' src test` is accepted because the alternation character is single-quoted argument data.
2. A quoted argument followed by `|`, `||`, `&`, `&&`, `;`, `<`, or `>` outside quotes is rejected.
3. `$` and backtick substitution are rejected outside single quotes, including inside double quotes.
4. Newlines, carriage returns, unclosed quotes, dangling escapes, empty actions, missing actions, mixed action lists, and non-allowlisted prefixes are rejected.
5. The scanner performs no shell evaluation, process launch, normalization, file access, network access, or model generation.
6. The live preflight calls the same helper tested by replay fixtures.
