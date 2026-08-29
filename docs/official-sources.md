# 官方來源與格式依據

- Codex Skills：<https://developers.openai.com/codex/skills>
- Codex `AGENTS.md`：<https://developers.openai.com/codex/guides/agents-md>
- Codex custom agents / subagents：<https://learn.chatgpt.com/docs/agent-configuration/subagents>
- Archify repository：<https://github.com/tt-a1i/archify>

Phase 1 根據目前官方 Codex 規則，把 repository skills 放在 `.agents/skills`、repository instructions 放在根 `AGENTS.md`，並把 project custom agents 放在 `.codex/agents/*.toml`。這些外部格式可能演進，因此每次中央模板升級前都應重新核對官方文件。
