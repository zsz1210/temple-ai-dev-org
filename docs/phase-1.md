# Phase 1：可安裝、可驗證的組織骨架

## 完成定義

Phase 1 只有在以下條件成立時才算完成：

- 新 repository 可以用一份已確認名字的設定檔成功初始化。
- 模板內沒有預先定義的專案 Agent 名字。
- 九個 Position 都有唯一 active assignment。
- Developer 與 Independent QA 是不同 Identity。
- 重跑 init 不會覆蓋使用者內容，managed conflict 會停止。
- doctor 能發現 managed tampering、模型錯誤與 instructions 未整合。
- status 能從 canonical files 產生摘要。
- work item、handoff、transition 與 closeout 可透過 CLI 完成，非法 gate 會被拒絕。
- Codex task/thread 能以 stable ID 登錄，並投影 suggested title、revision、attention 與 archive readiness。
- alpha.1 可以透過 checksum-aware upgrade 升級，且 project-owned state 不被覆蓋。
- `$temple-work` 與兩個 grill skills 可在 repository 本地被 Codex 發現。
- 至少一張低風險真實 work item 完成 Developer、Independent QA 與 release gate 全流程。
- CI 能在乾淨環境執行所有測試。
- private GitHub repository 已建立並推送可重現的 commit。

## 本 Phase 不包含

- 自動啟動多個長駐 Agent 或背景排程。
- 由 CLI 直接呼叫模型替 Agent 命名。
- 自動安裝 Archify 或第三方 skill。
- 直接建立、改名、開啟或封存 Codex app task。
- Web dashboard、即時事件串流、跨 repository portfolio view。
- 自動發布 production 或繞過人類 release approval。

## 下一階段候選

1. affected-path ownership 與重複 active scope 警告。
2. Archify adapter 的 opt-in 安裝、輸入 schema、provenance 與 visual QA。
3. GitHub issue/PR/CI evidence adapter。
4. 即時 task event ingestion 與 Human Inbox。
5. Portfolio-level read-only dashboard。
