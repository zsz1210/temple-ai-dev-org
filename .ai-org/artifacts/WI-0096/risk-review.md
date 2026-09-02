# Risk Review — WI-0096

| Risk | Mitigation |
| --- | --- |
| Hide a real cleanup defect | Retries are finite; the final error still fails the test. |
| Mask a behavior failure | Change cleanup hooks only; retain every assertion. |
| Fix one hook but leave equivalent races | Route all three recursive Phase 4B cleanup hooks through one helper. |
| Add production retry behavior accidentally | Keep the helper inside the test file; change no source module. |
| Treat a rerun as proof | Require a corrected revision and a new hosted run. |

The change is local, reversible, test-only, and performs no external action.
