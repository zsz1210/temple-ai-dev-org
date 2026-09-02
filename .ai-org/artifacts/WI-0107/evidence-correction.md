# WI-0107 evidence revision correction

Three test evidence records were initially registered against developer candidate revision `984cd027771c8f1fbfaee9fc8bc8e9facaf29c1f` while their normalized observation files were still uncommitted. Commit `531ed2888735753dab9575d47540dc7b0c83b0ef` is the first revision containing those exact evidence artifact bytes.

The canonical evidence registry therefore uses `531ed2888735753dab9575d47540dc7b0c83b0ef` as the artifact-bearing scope revision for:

- `EVID-20260902T124251Z-7FE05C38`
- `EVID-20260902T124252Z-133FDF8A`
- `EVID-20260902T124314Z-BD1ABAB2`

The observation documents retain `984cd027771c8f1fbfaee9fc8bc8e9facaf29c1f` as the code revision that was tested. No outcome, digest, approval, gate, or experiment claim changed.
