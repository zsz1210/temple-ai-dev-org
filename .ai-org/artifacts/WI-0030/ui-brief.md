# UI brief — WI-0030 command privacy correction

## Reused interaction contract

WI-0030 keeps the approved WI-0029 command form, explicit confirmation, target visibility, operation availability, delivery states, responsive behavior, and accessibility contract.

## Required correction

- Before submission, the confirmation surface may show the complete instruction from transient browser state.
- After submission, command history must show only a truthful metadata summary that contains no raw instruction content.
- Label the durable history value as a retained summary, not a retained preview.
- One-character and ordinary short instructions must receive the same non-retention protection as long or secret-bearing instructions.

## Required state coverage

Re-run the WI-0029 disabled, idle, active, confirmed, accepted, rejected, delivery-unknown, interrupted, completed, desktop, and narrow states. Explicitly compare the transient confirmation with the durable command history and stored command document.
