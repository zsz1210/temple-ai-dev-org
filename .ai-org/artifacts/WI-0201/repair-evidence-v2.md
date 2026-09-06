# Unified acquisition verification

The rejected candidate's legacy spawn bypass is removed. Activity and spawn completion now only nominate a candidate; neither binds a child. A schema-validated live metadata response is required before buffered child messages, usage or completion are attributed. Spawn-only discovery before and after native child-start is covered, including delayed metadata and foreign parent, retained child, wrong directory and failed-read counterexamples.

The corrected targeted suite passes 39 of 39 tests. The previously failing nested-activity replay retains its original public failure category rather than being flattened into a metadata transport error. No live model call was used to find or repair these defects. The earlier rejected readiness and unused seal remain historical, not authority for execution.

The real no-generation Provider check established metadata availability for ephemeral threads. Readiness still requires independent review of this corrected exact candidate. Live end-to-end compatibility is not claimed by these tests.
