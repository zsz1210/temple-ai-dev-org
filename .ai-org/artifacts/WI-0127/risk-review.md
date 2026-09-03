# WI-0127 risk review

Risk is low. The only persistent product changes are a validation report and its index entry.

- Disposable repositories may hide real-user friction. The report must separate mechanical execution from comprehension.
- Fast script timings may be misread as productivity gains. They are reported only as deterministic runtime and never as human time saved.
- Existing tests may pass while public guidance is stale. The audit compares documentation directly with current source behavior.
- Counting commands can overstate human burden because Agents normally operate the CLI. The report distinguishes machine steps from human approvals.
- An audit can become an excuse to redesign every subsystem. Findings are ranked by core-path consequence, and implementation is excluded.
- The optional Console refresh timeout observed in `WI-0126` remains a separate test-stability signal and is not turned into core-path scope.
