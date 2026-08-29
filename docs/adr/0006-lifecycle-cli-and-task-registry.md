# ADR-0006：Lifecycle mutation 經由 CLI，Codex task 採 registry 而非聊天標題

- Status: Accepted
- Date: 2026-08-29

## Context

第一個 English Learning Inbox pilot 證明 repository canonical state 能跨 Developer 與 Independent QA 接續，但 work item、event、release closeout 仍有人工編輯，Codex task ID 也沒有被正式連回 work item。只靠聊天標題仍可能造成重複工作、錯誤交接與 sidebar 雜亂。

## Decision

Temple 提供 `work-item create`、`handoff`、`transition` 與 `close` 作為 lifecycle mutation boundary。Transition 必須對 workflow 的每個 named requirement 提供 evidence reference，CLI 拒絕非法 edge 或缺少 gate evidence。

Codex task/thread 以 `.ai-org/project/tasks.json` 登錄 stable task ID、work item、Position、Agent、thread/client-thread ID、revision 與 status。標題只使用可重建的建議格式 `WI-#### · Position · Agent Name`；真正 identifier 是 work item ID 與 thread ID。Temple 計算 archive readiness，但不直接建立、改名或封存 Codex App task。

## Consequences

- 新對話可以從 work item、registry 與 exact revision 恢復工作，不依賴標題或聊天記憶。
- 手工 JSON 漂移與跳過 gate 的機會降低，但使用者或 Agent 必須明確提供 evidence mapping。
- Codex App 的實際 task mutation 仍透過產品工具並遵守使用者授權；CLI 只保存 canonical registry。
- Observer 可以指出 blocked、attention 與 archive-ready，但不能代替 Manager、QA 或 Release Manager 做決策。
