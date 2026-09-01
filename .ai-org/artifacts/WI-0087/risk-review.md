# WI-0087 Risk Review

- **False green:** bounded retries do not swallow persistent cleanup failures because the promise still rejects after the final attempt.
- **Scope expansion:** the helper is private to `test/control-plane-inbox.test.mjs` and handles only its `mkdtemp` root.
- **Behavioral regression:** all existing assertions remain unchanged and the full suite must rerun.
- **Platform mismatch:** local supported-major checks are necessary but insufficient; the replacement revision must also pass both hosted Linux lanes.
