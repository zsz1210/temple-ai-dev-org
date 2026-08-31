# WI-0065 risk review

| Risk | Control | Residual status |
|---|---|---|
| A thread default is still read as turn-effective | Separate fields and explicit source; effective turn remains null without direct protocol evidence | accepted for the installed protocol |
| Legacy consumers break | Keep nullable additive fields and the legacy compatibility projection | low |
| Dashboard becomes noisy | Show compact human labels only on the Team model card | low |
| New fields leak prompts or hidden reasoning | Store configuration labels only; no prompt, response, or chain-of-thought retention | low |
| Shared-file overlap changes command authority | Limit edits to reasoning metadata and tests; no remote command or trust-policy change | low |
| Automatic routing is inferred from observations | Documentation and code keep routing disabled | low |

No external action, credential, deployment, or irreversible migration is introduced.
