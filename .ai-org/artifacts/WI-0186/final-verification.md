# WI-0186 final local verification

Behavioral candidate: `ea8ef29799a4bbcde94c4ff296a37fdb48b031c0`.

`npm run verify` passed repository, link and package checks, then **587/587 tests**, zero failures/skips, in **107.410 seconds**. This covers the final container-shape guard and actual formatted-response assertions. Source, tests, scripts and documentation remained unchanged against the candidate after verification. Doctor passed **37/37**, zero warnings/failures at the checked review state. Independent review is recorded separately in independent-qa.md.

The final candidate's measure.mjs output reproduced the saved measurement.json locally. It compares the same synthetic stage snapshot with default/full acquisition and optional stage acquisition, without model calls:

| Stage | Full body bytes | Stage body bytes | Full CLI output bytes | Stage CLI output bytes | CLI reduction |
| --- | ---: | ---: | ---: | ---: | ---: |
| Developer | 71,293 | 54,352 | 90,861 | 80,975 | 10.88% |
| Fresh Verifier | 73,508 | 57,218 | 94,754 | 86,376 | 8.84% |

These are single fixture observations; dynamic synthetic evidence can vary slightly between executions. Body reductions alone were not used as proof of smaller output: tests assert actual formatted CLI-output reduction for both stages and recompute representation binding. Full local source acquisition remains unchanged. Whole governing policies, entry documents, procedures, handoff and evidence are preserved; no required read is waived.

No live model comparison or Token, price, model-latency, quality-superiority or general delivery-efficiency claim is made. The comparison above is against the previous full packet, not against ordinary delivery. This bounded slice adds an opt-in presentation mode; it does not activate entry shortcuts, composed completion or a new workflow. Merge, publication and external release are outside this closeout.
