// WI-0224: coordinator-only seed/reference material. Never copy this module to actors.
export const maintenanceTask = "This is a maintenance delivery, not a new implementation. The existing shipping quote implementation has a compatibility regression: explicitly supplied undefined or null option properties are incorrectly treated as omitted defaults. Repair that regression while retaining the complete BRIEF.md API contract and add meaningful regression coverage. Preserve all public files. The fresh verifier must independently verify the exact repair candidate.";

export const referenceSource = `export function quoteOrder(lines, options = {}) {
  if (!Array.isArray(lines)) throw new TypeError('lines');
  if (options === null || typeof options !== 'object' || ![Object.prototype, null].includes(Object.getPrototypeOf(options))) throw new TypeError('options');
  const option = (name, fallback) => {
    const value = Object.hasOwn(options, name) ? options[name] : fallback;
    if (!Number.isSafeInteger(value) || value < 0) throw new TypeError('option');
    return value;
  };
  const shipping = option('shippingCents', 500);
  const threshold = option('freeShippingAtCents', 3000);
  let subtotalCents = 0;
  for (const row of lines) {
    if (row === null || typeof row !== 'object' || !Number.isSafeInteger(row.unitCents) || row.unitCents < 0 || !Number.isSafeInteger(row.quantity) || row.quantity <= 0) throw new TypeError('row');
    const product = row.unitCents * row.quantity;
    if (!Number.isSafeInteger(product) || !Number.isSafeInteger(subtotalCents + product)) throw new RangeError('subtotal');
    subtotalCents += product;
  }
  const shippingCents = lines.length === 0 || subtotalCents >= threshold ? 0 : shipping;
  const totalCents = subtotalCents + shippingCents;
  if (!Number.isSafeInteger(totalCents)) throw new RangeError('total');
  return { subtotalCents, shippingCents, totalCents };
}
`;
export const seedSource = referenceSource.replace('Object.hasOwn(options, name) ? options[name] : fallback', 'options[name] ?? fallback');
export const maintenanceContract = Object.freeze({
  version: 'shipping-option-presence/v1',
  seed_regression: 'nullish-coalescing-erases-explicit-option-presence',
  named_failure: 'explicit-undefined-and-null-options-must-throw-TypeError',
  changed_fixture_paths: ['order.mjs'],
  task_context: maintenanceTask,
  oracle: 'unchanged-delivery-control-pair-evaluateProduct',
  reference_repair: 'restore-own-property-presence-check',
});
