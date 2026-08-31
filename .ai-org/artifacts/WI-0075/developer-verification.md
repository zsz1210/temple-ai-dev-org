# WI-0075 developer verification

- Candidate: `025c9c67c3a2ba8eae4d87f7f8140b397f72de9d`
- Ten consecutive focused runs exercised both wall-clock tests 20 times with the expected exact stop codes.
- Full validation-program suite: 12 passed, 0 failed.
- `npm run verify`: repository and documentation checks passed; 250/250 tests passed in 53.0 seconds wall time.
- Only test configuration changed. Runtime limits, production code, CI topology, and workflow timeout remain unchanged.
