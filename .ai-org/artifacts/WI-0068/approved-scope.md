# WI-0068 approved scope

- Validate each resolved participant telemetry directory with the canonical control-plane resolver during `experiment inspect` and program resolution.
- Carry the resolved private directory internally into cross-repository reporting instead of rebuilding it with an inconsistent path rule.
- Cover invalid worktree-local configuration, safe default resolution, and report construction in tests.
- Update operator documentation.
- No model launch, retry, external action, dependency, schema format, release, or stopped-run mutation.
