# WI-0113 evidence revision reconciliation

The Developer observation retains d5c00fd23ef48f5dc1327e6eb73a51ef8293f1fb as the exact repository revision where the full verification and live result were first checked. The final Developer artifacts, including the disclosed blind-evaluator limitation, were committed at 25a9b2a6fa1bbdf0060ef6a72e9b253aafa9a080.

The Quality Evaluator observation retains 25a9b2a6fa1bbdf0060ef6a72e9b253aafa9a080 as the evaluated implementation revision. Its observation and report were committed at 1a9386a565d4b3d1e017c262b8ad635999ce1f16.

The corresponding Evidence Registry entries use those artifact-bearing commits as scope_revision. Their artifact digests therefore reproduce from Git while the observation documents continue to identify the exact revisions that were tested. No test outcome, experiment interpretation, model run, or external action was changed by this reconciliation.
