# WI-0082 Product Direction

- Position: Product Manager
- Agent Identity: Yuna (`agent-yuna`)
- Status: approved scope and acceptance criteria

## Reader problem

A technically interested first-time reader can understand Temple's broad promise, but may lose the thread when the README suddenly uses Temple-specific vocabulary, a `$skill-name` invocation, or an internal repository path without explaining whether it is a command, a concept, an Agent instruction, or a source of project truth. Opening the underlying Agent contract first increases that burden.

The reader also needs a fast visual answer to a different question from the overview diagram: "What happens to one approved request before Temple calls it ready?"

## Intended outcome

After this change, a reader can:

1. recognize that `$name` means "ask Codex to use this Temple method," not "run this in a terminal";
2. follow every Core Skill invoked by the README to a human-facing explanation of its trigger, outcome, and authority limit;
3. resolve the first essential Temple terms without reading schemas or Agent instructions;
4. distinguish the system overview from the request delivery path; and
5. continue into deeper English documentation without degrading the natural Japanese or Traditional Chinese README prose.

## Content scope

- Explain all six Core Skills in one human-facing guide, even though the current Quick Start directly invokes only three. This prevents the guide from becoming a partial catalog and gives `Core Skills` a stable destination.
- Explain the minimum vocabulary needed to understand the README and governance boundary, including profiles, identity and responsibility, lifecycle, evidence, learning, and repository ownership terms.
- Link first use and action-oriented occurrences. Avoid turning every repeated term into a link.
- Keep the README concise. The new diagram replaces the text-only delivery sequence rather than adding a third explanation of the same flow.

## Acceptance criteria

- English, Japanese, and Traditional Chinese READMEs retain one aligned section hierarchy.
- `$temple-init`, `$decision-interview`, and `$temple-work` each link to the correct heading in the Core Skills guide.
- The Core Skills guide explains `$name`, all six repository Core Skills, their non-triggers, outputs, and authority limits in ordinary language.
- The terminology guide separates Temple-specific names, precisely used software terms, lifecycle terms, learning terms, and repository ownership terms.
- The diagram shows human direction, delivery work, assurance, and durable repository evidence without implying a reporting hierarchy or automatic authority.
- All new links resolve; all SVGs parse and use one geometry; desktop and narrow renderings remain readable.

## Deferred

- Separate pages for each Skill.
- Maintained Japanese and Traditional Chinese editions of the full documentation set.
- A separate Wiki or documentation-site source of truth.
- Interactive diagrams or a diagram vendor dependency.
