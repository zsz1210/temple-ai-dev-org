# Product Direction — WI-0096

## User outcome

Contributors receive a CI result based on Temple behavior, not a transient Linux filesystem race after otherwise successful test assertions.

## Accepted behavior

- Cleanup remains mandatory and failures remain visible after bounded retries are exhausted.
- The retry window follows the existing repository precedent used by other temporary Git fixtures.
- No Phase 4B policy, Usage, evaluation, or safety assertion changes.

## Acceptance boundary

Focused Phase 4B execution, full Node.js 22 and 24 verification, and hosted CI must pass. A rerun without a code correction cannot satisfy the gate.
