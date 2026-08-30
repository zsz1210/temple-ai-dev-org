# Evidence provenance correction — WI-0019

- Affected evidence: `EVID-20260830T091043Z-FA4695AF` and `EVID-20260830T091044Z-404EAF84`
- Scope revision retained: `7dda4c6b3e1fc9fd16b1fcc55b794e1f1c5d5de5`
- Outcome retained: Independent QA `fail`
- Reports retained: both original NO-GO observations and reports

The two evidence records were registered after the corrective files had already changed in the working tree. The adapter therefore hashed five current working-tree files while correctly retaining the older observed scope revision. Doctor detected that those hashes did not belong to the recorded Git revision and failed closed.

Temple does not currently expose an evidence-correction CLI. The Integration Owner corrected only those five artifact digests to the independently computed SHA-256 values of `git show 7dda4c6b3e1fc9fd16b1fcc55b794e1f1c5d5de5:<path>`:

| Path | Correct historical SHA-256 |
|---|---|
| `src/cli.mjs` | `47f78057ed3190202883c0248c6366b18f4048981d301a1e87cf3a6e93e85f24` |
| `test/phase4-cli.test.mjs` | `867da33eb1b38114b834bcdac90b439148bf1acb1f4e6f6a6d39711a66b9d9c9` |
| `project-overlay/.ai-org/core/schemas/schema-catalog.json` | `fb0a55ba7f183a5ae64fdffa984de6a7b186aa24d162704b6ac0ee260428783f` |
| `test/phase4-installation.test.mjs` | `18869e1262f3fb3e7f8fe8844634c0eceed82b1ab214de5dfc42acf2769bbc02` |

`src/cli.mjs` appears in both evidence records and uses the same historical digest. No evidence entry, failed outcome, report, timestamp, scope revision, or current implementation file was removed or rewritten. Doctor then validated all 68 evidence records and returned 35 pass, 1 stale-plan warning, and 0 fail.
