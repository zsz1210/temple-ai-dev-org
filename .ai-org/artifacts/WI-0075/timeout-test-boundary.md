# WI-0075 timeout-test boundary

## Evidence

GitHub Actions run `33413177825` completed in 5 minutes 58 seconds. It passed the repaired control-plane tests and every other test except `runner interrupts a turn at its wall-clock hard limit`.

The test configured:

- per-turn hard limit: 20 ms
- whole-program hard limit: 200 ms

On the constrained runner, fixture and pre-launch work consumed enough of the program budget that only 20 ms or less remained. The runner therefore correctly chose the whole-program limit; the test incorrectly assumed the per-turn limit would always win.

## Approved change

- In the per-turn test, set the non-target whole-program warning/hard limits to 30/60 seconds.
- In the whole-program test, set the non-target per-turn warning/hard limits to 30/60 seconds.
- Keep the target warning/hard limits at 5/20 ms and keep exact stop-code assertions.
- Do not change runtime logic, retry policy, CI topology, or workflow timeout.

The long non-target values do not lengthen the tests because the intended 20 ms target timer still terminates each test.
