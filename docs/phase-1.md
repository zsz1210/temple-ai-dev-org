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
- 兩個 grill skills 可在 repository 本地被 Codex 發現。
- CI 能在乾淨環境執行所有測試。
- private GitHub repository 已建立並推送可重現的 commit。

## 本 Phase 不包含

- `temple upgrade` 的實作。
- 自動啟動多個長駐 Agent 或背景排程。
- 由 CLI 直接呼叫模型替 Agent 命名。
- 自動安裝 Archify 或第三方 skill。
- Web dashboard、跨 repository portfolio view。
- 自動發布 production 或繞過人類 release approval。

## 下一階段候選

1. 實作 checksum-aware `temple upgrade` 與 migration。
2. Work item/event CLI 與 observer projection。
3. Archify adapter 的 opt-in 安裝、輸入 schema、provenance 與 visual QA。
4. GitHub issue/PR/CI evidence adapter。
5. Portfolio-level read-only dashboard。
