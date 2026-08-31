# Technical design — WI-0059

## Method

1. Use the repository-pinned `node ./templew.mjs` launcher for every lifecycle mutation.
2. Validate that each close candidate has an exact Developer candidate revision and non-empty Test, Evaluation, and Independent QA gate evidence.
3. Claim each close candidate as Release Manager `agent-mog`, close it against its recorded tested revision, and release the claim through closeout.
4. Reuse the human approval record only for this enumerated reconciliation set. Every close records organizational readiness while external release remains not performed.
5. Do not transition, cancel, rewrite, or close the five retained items.
6. Generate a reconciliation result that records before/after counts and retained boundaries.
7. Rebuild the parallel plan only after lifecycle changes are committed and verified, so its preparation boundary matches the resulting repository revision.

## Risk review

- **False release claim:** mitigated by distinguishing Temple organizational closeout from push, publication, deployment, and external release in every artifact and close result.
- **Evidence laundering:** mitigated by requiring each item to already contain Test, Evaluation, and Independent QA gate evidence at an exact candidate revision.
- **Hiding unfinished work:** mitigated by leaving five named items nonterminal and documenting their exact missing decision or environment validation.
- **Dashboard drift:** mitigated by rebuilding generated status and verifying the private read-only snapshot after closeout.
- **History loss:** mitigated by using CLI events and canonical Work Item updates rather than editing lifecycle JSON manually.

## Rollback

This slice changes repository lifecycle records, not shipped behavior. If reconciliation is incorrect, revert the reconciliation commit and rebuild generated views. Do not rewrite historical evidence or force individual Work Item files by hand.
