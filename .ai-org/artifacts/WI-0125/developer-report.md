# Developer report — WI-0125

Candidate `78bf7b80060e55be361bfc6b284fe5fdeb2c96bd` removes the machine-specific Wave 5B lab default. Direct CLI use now requires `--lab-root`; absence fails before path-dependent reads, preflight writes, or model generation. Existing explicit temporary-root behavior remains covered.

Focused verification passed all eight Wave 5B live-protocol tests with zero failures. No Provider call, model execution, network request, push, merge, deployment, publication, or release occurred.
