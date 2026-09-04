# WI-0162 Evidence Impact Review

## Finding

The retained-artifact normalization changed the current bytes of 34 artifact references held by 28 active historical evidence records. The semantic claims and original bytes remain in Git history, but the active records cannot continue to certify the normalized current-tree copies. Leaving those records active would make `temple doctor` fail and would blur historical evidence with current publication-safe artifacts.

## Disposition

The 28 records below are invalidated without replacement. Invalidation preserves each record and its history; it does not delete the evidence or rewrite Git history. The reason recorded by the Evidence CLI is: `Current artifact copy was intentionally normalized by WI-0162; original evidence remains in Git history, but this record no longer certifies the current bytes.`

- `EVID-20260830T154016Z-86813807`
- `EVID-20260830T160545Z-A3798CF9`
- `EVID-20260830T160545Z-5C42AB87`
- `EVID-20260830T232746Z-9E03FDB3`
- `EVID-20260830T232746Z-13594D48`
- `EVID-20260830T233121Z-F3CBC060`
- `EVID-20260830T233121Z-50313BBA`
- `EVID-20260831T000613Z-9DE8E1FC`
- `EVID-20260831T002425Z-5B40836C`
- `EVID-20260831T022410Z-58369A98`
- `EVID-20260831T032105Z-89198862`
- `EVID-20260831T040925Z-E32C8BCD`
- `EVID-20260831T041049Z-8FD71E16`
- `EVID-20260831T041424Z-A613B250`
- `EVID-20260831T071407Z-AF40D65E`
- `EVID-20260831T071540Z-BC8AE598`
- `EVID-20260831T074903Z-6CDF5683`
- `EVID-20260831T075937Z-3BAE25F9`
- `EVID-20260831T075937Z-CB2FDBC8`
- `EVID-20260831T080051Z-B766F6CC`
- `EVID-20260831T080236Z-4269D96C`
- `EVID-20260831T083308Z-B4168BA2`
- `EVID-20260831T083354Z-E14BB802`
- `EVID-20260831T083438Z-F5AD00DB`
- `EVID-20260831T092342Z-D19B763F`
- `EVID-20260902T013233Z-4FC4B090`
- `EVID-20260902T013602Z-6461D82A`
- `EVID-20260902T013738Z-985E8DE0`

## Prevention

The reusable plan now reports active evidence impact. Apply fails closed until every affected record is explicitly invalidated or replaced, preventing future normalization from silently breaking the evidence registry.

This disposition is publication preparation only. It grants no release or publication authority.
