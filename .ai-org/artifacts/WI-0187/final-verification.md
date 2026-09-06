# WI-0187 full local verification

Behavioral candidate: `2611def7db156eab8e1936f5feeefe7c51ade014`.

Full `npm run verify` passed repository, link and package checks and **619/619 tests**, zero failures/skips, in **152.265 seconds**. This covers the final diagnostic-record shape and target guards. Log SHA-256: `4ac19541d5ad614f2757059f6a9cf4f7ee93f56faedd64aa8dd814be30012e0a`. Implementation, tests, scripts and documentation matched the exact candidate after execution. Doctor passed **37/37**, zero warnings/failures after rebuilding the runtime plan.

The package has 406 files and 3,442,877 unpacked bytes. Against the previous 403-file inventory, only the new finish module, ADR and completion guide were added, with no removals. Publication audit has zero blocked findings and the same 68 preexisting binary review items; this is not publication approval.

Actual CLI observations in `measurement.json` compare completion plus explicit full Status inspection and Doctor with the composed command. Developer and Verifier each use **3 commands versus 1**. The individual operations already rebuild views internally. Claims, product verification, evidence creation, setup and model inference are excluded.

| Stage | Separate command time | Finish command time | Separate response bytes | Finish response bytes |
| --- | ---: | ---: | ---: | ---: |
| Developer | 766 ms | 678 ms | 2,586 | 3,295 |
| Verifier | 634 ms | 678 ms | 6,442 | 3,219 |

These are single local synthetic observations, not end-to-end elapsed time or AI turn counts. They show that fewer commands need not mean uniformly faster commands or smaller output. No model was invoked by the measurement: model/effort are not applicable, and development/review agents are not comparison participants. No Token, cost, quality-superiority or ordinary-versus-Temple efficiency claim is made.

Independent acceptance is recorded separately in `independent-qa.md`. After this slice passes and is closed locally, the user already authorized dependent slice C. No live model comparison, merge, deployment or publication is included.
