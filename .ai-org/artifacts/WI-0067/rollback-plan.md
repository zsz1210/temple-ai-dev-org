# WI-0067 rollback plan

The four synthetic repositories are isolated under `/Users/zsz1210/Documents/ChatGPT/temple-effectiveness-lab` and have no remote, deployment, production, or external state. Preserve their exact commits and private runtime telemetry as validation evidence. If the framework report changes must be reverted, use a normal Git revert of the WI-0067 candidate; do not delete or rewrite the retained stopped-run repositories.
