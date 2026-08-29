# Changelog

## 0.1.0-alpha.3

- Roadmap 加入 Phase 1.5 Greenfield Project Bootstrap Pilot，安排在 AiPet 可攜性驗證後、Phase 2 營運 MVP 前。
- 明確分離中央工具名稱與專案身份：Temple 保留為 CLI 與技術 namespace，project-facing 文字改用專案名稱或 AI 開發組織。
- 狀態頁、operating contract、instructions、Skills、Agent 說明與 release closeout 採 project-native wording。
- 加入 ADR-0007，記錄相容性識別與專案語言的長期邊界。

## 0.1.0-alpha.2

- 加入 `work-item create`、`handoff`、具名 gate `transition` 與 `close` CLI。
- 加入 Codex task/thread registry、穩定標題建議、revision、attention 與 archive readiness。
- Canonical mutation 使用短時 project lock，避免並行 CLI process 遺失 work item、event 或 task 更新。
- `status` 升級為 v2，包含 work item owner、Agent、task、最近事件與觀測訊號。
- 加入 checksum-aware `upgrade`；managed conflict 在寫入前停止，project-owned state 保留。
- 加入 `$temple-work`、release record、manager closeout 與 task registry 範本。
- 以 English Learning Inbox Safari Share Extension 完成第一張真實低風險 pilot。

## 0.1.0-alpha.1

- 建立 Position、Agent Identity、Assignment 三層模型。
- 加入 `init`、`doctor`、`status` CLI。
- 加入兩個可攜式 grill skills 與九個 Codex Position 設定。
- 加入 managed、project-owned、generated 邊界及 `temple.lock`。
- 加入 Archify 選配 Adapter 合約、測試與 CI。
