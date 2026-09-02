# Compatible event evolution

Add version 2 support to the `OrderPlaced` event codec while preserving all version 1 behavior. Version 2 uses `order: { id }` and `amount_minor`; the normalized decoded result remains `{ orderId, amountMinor }`.

`encodeOrderPlaced(order, 2)` must emit version 2, the default encoder behavior must remain version 1, and unknown versions must still be rejected. Preserve the exported APIs, add no dependencies, and change no files outside `src/` and `test/`. Add useful public tests and run `npm test`.

Return a short completion record with: changed paths, test command and result, assumptions, and remaining risks.
