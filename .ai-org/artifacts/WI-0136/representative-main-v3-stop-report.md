# Representative comparison v3 stop report

Protocol `e38b4052462db8206a868cfc24a7a90ed6fe896fe09e8d78de4adbeb7de128ea` started the approved main comparison and stopped during the first arm's concurrent Build wave. It observed 144,372 Operational Tokens, completed no arm, used zero retry and zero fallback, and never started the blind evaluator.

The stop was caused by the harness, not by an out-of-scope model edit. Git reported ` M src/order-event.mjs`; the shared command helper trimmed the leading space before `statusPaths` removed the fixed three-character porcelain prefix, producing the false path `rc/order-event.mjs`. The actual changed path was the allowed `src/order-event.mjs`.

This attempt provides no Temple-versus-baseline result. The stopped artifact is retained as harness evidence. A successor protocol must parse both raw and leading-trimmed porcelain records, retain completed and active stage observations on any stop, rebuild fresh matched repositories, freeze a new runner digest, and receive separate exact approval. It must not resume or retry this lab.
