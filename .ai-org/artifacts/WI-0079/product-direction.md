# WI-0079 product direction

## Reader outcome

After the human-facing README overview earns an engineer's attention, this preview should let that engineer explain Temple's mechanism in one minute:

1. a human retains intent and approval authority;
2. Temple turns that intent into bounded, attributable work;
3. people and AI Agents execute against routed repository context;
4. test, evaluation, Independent QA, and Release Gate evidence stay distinct;
5. the repository, rather than a conversation or generated dashboard, preserves the recoverable truth.

## Required story

The diagram must foreground one primary path:

`Human authority → Temple coordination → bounded execution → evidence gates → trustworthy repository record`

It must also show two supporting loops without competing with the primary path:

- repository context, Skills, Lessons, and Practices route back into later work;
- canonical repository state produces Observer and Workspace projections for people.

External trackers and providers appear only as observation inputs. They must not visually imply that they can approve work, satisfy QA, or mutate the lifecycle.

## Required engineering invariants

- **Repository authority:** canonical project state and Git evidence survive conversations and generated views.
- **Governed mutation:** Temple's CLI and policy checks mediate lifecycle changes; a projection never writes itself back into authority.
- **Bounded execution:** a Work Item, claim, affected paths, dependencies, context, and a responsible Position constrain execution.
- **Separation of duties:** implementation evidence is different from Independent QA and Release Gate decisions.
- **Recoverable learning:** validated Lessons, Practices, and Skills can be retrieved for later work but do not create authority.
- **External observation boundary:** trackers and providers inform coordination without becoming lifecycle truth.

## Information density

- Use 8 to 10 primary nodes, grouped into no more than four visible architecture boundaries.
- Keep the main story readable without hover, search, cards, or animation.
- Put file-level examples and secondary safeguards in node details rather than additional edges.
- Use Traditional Chinese explanatory copy for the owner-facing local preview while preserving exact technical identifiers in English. A later publication decision may create an English canonical artifact without changing this pilot's meaning.
- Do not enumerate all ten Positions, all lifecycle states, every CLI command, or every canonical JSON file.

## Owner decision after preview

The preview is intended to support three later choices, none of which are decided by this Work Item:

1. add a static engineering map to the README;
2. keep the map only in `docs/concepts/architecture.md`;
3. revise the content or visual density before either placement.

## Acceptance boundary

This is an architecture communication pilot, not proof of distributed operation, production monitoring, autonomous external action, or enterprise qualification. The artifact must retain Temple's Early Alpha maturity boundary.
