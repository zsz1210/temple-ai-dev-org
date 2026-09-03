# Acceptance criteria — WI-0125

1. Direct CLI execution without `--lab-root` fails before writing a preflight or starting model generation.
2. The error clearly identifies the missing `--lab-root` argument.
3. An explicit temporary lab root continues through the existing preflight boundary.
4. Existing Wave 5B protocol and repository tests remain compatible.
