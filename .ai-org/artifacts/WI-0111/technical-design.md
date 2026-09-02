# WI-0111 technical design

Implement one linear scanner over the structured action's `command` string.

- In unquoted state, reject newline, carriage return, command separators, background/pipeline operators, redirects, `$`, and backticks.
- In single-quoted state, treat all characters except the closing single quote as literal argument data.
- In double-quoted state, treat ordinary separators and redirect characters as literal, but reject `$` and backticks because substitution remains active there.
- Backslash may escape one following non-newline character in unquoted or double-quoted state; a trailing escape is invalid.
- End of input is valid only in unquoted state.
- After scanning, independently require the existing exact allowlisted command prefix.

The scanner does not tokenize, execute, expand, or rewrite the command. It answers only whether forbidden executable shell control is structurally present.
