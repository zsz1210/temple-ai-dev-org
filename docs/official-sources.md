# Official sources and format references

- Codex Skills: <https://developers.openai.com/codex/skills>
- Codex `AGENTS.md`: <https://developers.openai.com/codex/guides/agents-md>
- Codex custom agents and subagents: <https://learn.chatgpt.com/docs/agent-configuration/subagents>
- Archify repository: <https://github.com/tt-a1i/archify>
- Matt Pocock Skills (design inspiration and capability review): <https://github.com/mattpocock/skills>
- GitHub pull-request management and standardization: <https://docs.github.com/en/pull-requests/reference/managing-and-standardizing-pull-requests>
- GitHub repository rulesets: <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets>
- GitHub merge queue: <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue>

Under the current official Codex conventions, Phase 1 places repository Skills in `.agents/skills`, repository instructions in the root `AGENTS.md`, and project custom agents in `.codex/agents/*.toml`. These external formats may evolve, so verify them against the official documentation before every central framework upgrade.
