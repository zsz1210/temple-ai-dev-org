# JSON sales-report product contract

This document is identical in both experimental arms. All code is dependency-free JavaScript ESM. There is no network, database, UI, package installation or deployment.

## Seed and entry point

Three initially unimplemented modules export `validateSales`, `summarizeSales` and `renderReport`. A fixed, supplied `report.mjs` exports:

```js
import { validateSales } from "./validate.mjs";
import { summarizeSales } from "./summarize.mjs";
import { renderReport } from "./render.mjs";

export function generateReport(input) {
  return renderReport(summarizeSales(validateSales(input)));
}
```

The entry point and frozen public tests cannot be changed. Add useful module tests without replacing acceptance tests.

## 1. validate.mjs — validateSales(input)

Input must be an array of plain objects (Object.prototype or null prototype), each with:

- `id`: a nonempty ASCII string matching `^[A-Za-z0-9_-]{1,32}$`, unique within the array.
- `category`: an ASCII string matching `^[A-Za-z][A-Za-z0-9 _-]{0,31}$`, with no leading or trailing spaces.
- `unitCents`: a nonnegative safe integer.
- `quantity`: a positive safe integer.

Do not coerce values. Reject missing/undefined/null fields, invalid rows and duplicate IDs with TypeError. Ignore extra own properties. Reject unitCents multiplied by quantity above Number.MAX_SAFE_INTEGER with RangeError.

Return a new array in the original order, containing new plain objects with exactly those four fields. Empty arrays are valid. Do not mutate input, even when input is frozen.

## 2. summarize.mjs — summarizeSales(validated)

Precondition: input satisfies the output contract of validateSales. This function need not repeat raw-input validation.

Return exactly:

```js
{
  rowCount: 0,
  totalUnits: 0,
  revenueCents: 0,
  categories: [
    { category: "Books", totalUnits: 0, revenueCents: 0 }
  ]
}
```

Aggregate row count, quantity and unitCents times quantity, globally and per category. Category matching is case-sensitive. Sort category rows by ascending ASCII code-unit order, not locale rules. Empty input returns zero totals and an empty categories array.

Every multiplication and accumulation must remain a safe integer; throw RangeError otherwise. Do not mutate input or reuse mutable row objects in output. Revenue-zero categories remain present.

## 3. render.mjs — renderReport(summary)

Precondition: input satisfies summarizeSales output. No additional raw-input validation is required.

Return this exact Markdown structure with LF line endings and one final newline:

```text
# Sales report

Rows: 2
Units: 3
Revenue: $12.05

| Category | Units | Revenue |
| --- | ---: | ---: |
| Books | 2 | $10.00 |
| Games | 1 | $2.05 |
```

This example represents two input rows: Books at 500 cents with quantity 2, and Games at 205 cents with quantity 1.

Render cents exactly as dollars with two decimal digits, no locale formatting or floating-point rounding. Use integer quotient/remainder, including values near MAX_SAFE_INTEGER. Preserve the supplied category ordering. Empty input retains the table header/separator and no body rows. Do not mutate the summary.

## Ownership

Single Builder owns all three module files and added tests.

Parallel workers own disjoint files:
- validation worker: validate.mjs and test/validate-added.test.mjs;
- summary worker: summarize.mjs and test/summarize-added.test.mjs;
- renderer worker: render.mjs and test/render-added.test.mjs.

A worker cannot edit another module to make its own tests pass. All three receive these complete contracts, so the single Builder is not disadvantaged by missing architecture information. They may read stubs and frozen tests, but do not read another worker's private output.

The integration actor receives all three exact candidates and their concise handoffs. It may repair the three implementation modules and added tests within this contract; changes and time are counted. It cannot change report.mjs or frozen acceptance tests. No new feature is allowed.

## Acceptance coverage to implement before freezing

- Empty input and the exact example above.
- Case-sensitive categories and deterministic ordering.
- Zero-price rows and zero-revenue categories.
- Integer money formatting: 0, 1, 99, 100, 101 and safe-integer boundaries.
- Null, strings, booleans, arrays as rows, class instances, missing fields and invalid IDs/categories.
- Duplicate IDs; ignored extra fields; fresh copies and frozen-input immutability.
- Fractional/negative/non-finite/unsafe values and coercible strings.
- Multiplication, total-units, global-revenue and category accumulation overflow.
- Seed functions must fail applicable tests; valid reference behavior and intentional faulty implementations must distinguish the checks.

This list is a contract, not a claim that executable checks or a reference implementation already exist.
