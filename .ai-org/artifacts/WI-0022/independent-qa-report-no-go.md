# Independent QA no-go — WI-0022

- Candidate: `5733bb25202d8acc2de31ec8e0501787557962cb`
- Focused federation tests: 6/6 passed
- Full verification: 184/184 passed
- Doctor: 35 pass, 1 stale-plan warning, 0 fail
- Semantic verdict: NO-GO

The canonical file and directory symlink attacks now fail closed and participant hashes remain unchanged. However, Git replacement objects can remap expected commit A to B while HEAD remains A, allowing B's project and Work Item content to be projected under provenance A. Corrective WI-0023 must disable replacement objects for every federation Git subprocess and retain the exact attack as a regression.
