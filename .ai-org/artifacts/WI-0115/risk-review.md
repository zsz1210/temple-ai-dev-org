# Risk review — WI-0115

- **Project ownership:** use an isolated temporary repository and a synthetic configuration; never initialize the Temple framework checkout.
- **False comprehension claim:** deterministic reads do not prove provider session loading or understanding; preserve all provider-owned fields as false or unknown.
- **External effects:** no deployment, publication, repository-host mutation, provider call, credential access, or model execution is part of the deterministic runner.
- **Data retention:** retain only paths, timings, booleans, counts, and command outcomes; retain no prompts or hidden reasoning.
