# Changelog

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
