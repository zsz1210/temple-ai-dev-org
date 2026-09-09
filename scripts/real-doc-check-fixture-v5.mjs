import fs from 'node:fs';
import {docFixture as previous,reviewRubric as previousRubric,referenceBoundaryMutations} from './real-doc-check-fixture-v4.mjs';
export {referenceBoundaryMutations};
export const deliveryCheckerSource=fs.readFileSync(new URL('./core-delivery-check.mjs',import.meta.url),'utf8');
export const docFixture={...previous,fixture_version:5,seed:{...previous.seed,'check-delivery.mjs':deliveryCheckerSource},spec:previous.spec+`

## V5 deterministic delivery check
The existing temporary-file cleanup requirement is checked mechanically.
After final changes run node check-delivery.mjs. This immutable public helper
runs supplied test/*.test.mjs using the current Node executable and an owned
TMPDIR, reports leftover files/directories/symlinks and persistent cwd changes,
then removes only its own temporary area. Correct all reported delivery defects
before submitting. It contains no hidden behavior tests or reference solution.
Passing it is necessary but not sufficient: independent semantic verification,
hidden behavior and meaningful-regression checks still apply. The helper grants
no additional file, lifecycle, model or external authority.
`,correction_basis:'WI-0277 missed temporary cleanup; equal public precheck and deterministic acceptance for both Temple modes; preserve all historical outcomes.'};
export const reviewRubric=previousRubric+' Run node check-delivery.mjs. Check every SPEC requirement, including test cleanup and path validation; collect all known defects in one response instead of stopping after the first. DELIVERY_CHECK.json, when supplied, reports only public tests and cleanup findings, never hidden tests or execution history. A public mechanical failure is a delivery defect even when ordinary test assertions pass. Passing checks do not replace independent semantic review.';
