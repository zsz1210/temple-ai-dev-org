# WI-0111 developer report

## Implemented

- Replaced the blanket shell-metacharacter rejection with a deterministic linear scanner that distinguishes literal characters inside quotes from executable shell control outside quotes.
- Kept the scanner conservative: control characters, unquoted separators and redirects, unquoted substitutions, double-quoted substitutions, dangling escapes, and unclosed quotes fail closed.
- Added the exact WI-0110 `rg -n 'applyCommand|balance|event|command' src test` structured search action as a positive regression case.
- Added adversarial negative cases for a top-level pipe, command chaining, substitution, multiline input, dangling escapes, and unclosed quotes.
- Expanded the deterministic replay fixture to eleven scenarios and made the no-generation preflight prove both the quoted-search positive case and a top-level-pipe negative case.
- Updated the Wave 5 plan without authorizing another live run.

## Verification

- Module, test, and runner syntax checks: pass.
- Focused protocol and validation-program suite: 20/20 pass.
- Retained WI-0110 lab exact-schema preflight-only check: pass; `model_generation_performed: false`.
- Full repository verification: 288/288 pass.
- Repository and documentation checks: pass.

## Boundary

No model generation, retry, fallback, deployment, publication, release, or external mutation occurred. This correction qualifies only the offline command-policy behavior; a future live Luna experiment requires a new Work Item, a new lab, and explicit execution authority.

Candidate revision: `2d523b5f71f8b794b8539b1e44d7db7d28dc9977`.
