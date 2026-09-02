# WI-0111 evidence revision reconciliation

The normalized Developer, Quality Evaluator, and Independent QA observation documents retain `2d523b5f71f8b794b8539b1e44d7db7d28dc9977` as the exact code candidate they tested.

The Developer observation artifacts were committed at `f5b4dc155db34eab7026ae48b95a87926cd4dc72`, the Quality Evaluator artifacts at `799d10d6c2abbdcc3e872cd0d302b0866c4701e1`, and the Independent QA artifacts at `8ef67485c8f44b94296739c5add08bd5bde18a93`.

Their corresponding Evidence Registry entries therefore use those artifact-bearing commits as `scope_revision`, allowing Doctor to reproduce every recorded digest from Git without changing the tested revision, result, or zero-generation boundary.
