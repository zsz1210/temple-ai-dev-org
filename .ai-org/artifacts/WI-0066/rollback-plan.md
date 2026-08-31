# WI-0066 rollback plan

If the bounded runner or report contracts regress before release:

1. stop any validation adapter before changing framework code;
2. retain the program manifest, state, event log, and participant revisions as failure evidence;
3. revert candidate revision `ab212c0f74106a011bfdcf6fedcf230dbfc84d03` in a reviewed follow-up commit;
4. do not delete or reinterpret participant Work Items, task records, usage journals, or WI-0064 evidence;
5. run fresh initialization, schema validation, `npm run verify`, Doctor, and Independent QA before attempting another experiment.

No database, remote service, deployment, or project-owned migration must be rolled back. Existing initialized projects do not contain a required validation manifest, so removing the optional capability leaves their canonical project state intact.
