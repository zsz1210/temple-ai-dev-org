# Developer evidence — WI-0022

- Developer revision: `0f274c6131e259fa5b2f968b29856dc269124b34`
- Integrated candidate: `5fb81a86bd9828f561ad9611daef3b0e2eab9b9c`
- Focused federation tests: 6/6 passed
- Integrated full verification: 184/184 passed

Participant canonical documents, Work Items, capacity, and evidence are read from regular blobs in the registry's exact expected Git revision. Canonical symlink files or directories fail closed. The exact internal shadow-project reproduction no longer projects modified working-tree content as an unchanged revision, and aggregation still performs no participant write.
