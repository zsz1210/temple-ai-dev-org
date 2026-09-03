# Rollback plan — WI-0120

Before integration, abandon the local repair branch. After a future integration, create a reviewed Git revert of the cumulative WI-0120 through WI-0124 runtime, schemas, overlay copies, tests, and `temple.lock` as one synchronized unit; then run `npm run verify`, schema validation, and Doctor. Preserve the original post-close finding plus every failed and passing QA record. This plan does not authorize any external action.
