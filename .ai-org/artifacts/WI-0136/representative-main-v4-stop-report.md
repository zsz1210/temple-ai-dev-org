# Representative comparison v4 stop report

Protocol `b01f96b48bb585e4b24390fa0b0c322d2abfc03d8f99650fa9b07a3da4932c71` passed exact approval and preflight, then ran once with zero retry and zero fallback. It completed the entire Minimal Responsible arm before the Temple Design turn crossed its 100,000 Operational-Token stage limit. The blind evaluator did not start.

The completed Minimal Responsible arm used 234,099 Operational Tokens: 55,927 for Design, 119,854 across the three concurrent Build slices, and 58,318 for cold Integration. Every service test, public integration test, and held-out test passed; cold recovery found all four revisions and all three slices; no boundary violation was observed.

The stopped run observed 335,914 candidate Operational Tokens in total. Subtracting the completed arm leaves 101,815 observed during the censored Temple Design attempt. The v4 stopped artifact correctly retains the completed arm, but the active Design observation is null because the main runner throws before attaching partial stage telemetry. This is an evidence-retention defect that must be repaired before a successor run.

V4 provides a valid standalone observation of the Minimal Responsible arm, but no matched Temple-versus-minimal comparison. A successor must use fresh matched repositories, preserve partial stage telemetry, raise the Design ceiling transparently from the censored observation, recalculate the aggregate ceiling from the completed arm plus remaining declared stage limits, freeze a new digest, and receive separate exact approval. It must not resume or retry this lab.
