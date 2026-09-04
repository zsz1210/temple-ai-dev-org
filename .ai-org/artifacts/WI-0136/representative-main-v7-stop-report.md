# Representative comparison v7 stop report

Protocol `ff06ec032d8bc6f452e307269d9e87774e4f4207d0449af70905fcc314786674` passed exact approval and preflight, then ran once with zero retry and zero fallback. Minimal Responsible Design completed before the concurrent Build wave stopped. The Temple arm and blind evaluator did not start.

The stopped run retained 107,085 candidate Operational Tokens. Design completed at 55,565. Notifications stopped at 14,336 after requesting the allowlisted read-only command `rg --files coordinator`; Gateway retained 17,089 and orders-catalog retained 20,095 before both were interrupted as sibling work. No candidate Build result was accepted.

The command text contained no Git operation, parent traversal, network access, or write. The remaining rejection came from command-working-directory validation: the Provider can report a repository-relative cwd, while v7 resolved every cwd against the runner process directory. That made a repository-relative cwd appear outside the generated arm. V7 therefore records a harness path-normalization defect, not a Temple-effectiveness, task-quality, or model-quality result.

All three Build observations settled before the stop record was written, every App Server child exited, and all ten generated repositories across both arms remain clean. V7 cannot be resumed or retried. A successor must use fresh matched repositories, normalize absolute paths, `file://` paths, and Provider-relative cwd values against the generated arm without allowing escape, freeze a new digest, and receive separate exact approval.
