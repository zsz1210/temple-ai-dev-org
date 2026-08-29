# ADR-0007：中央工具名稱與專案身份分離

- Status: Accepted
- Date: 2026-08-29

## Context

中央 template 與 CLI 需要穩定名稱，才能維持命令、schema、lock、Skill discovery 與 upgrade 相容性。但安裝進產品 repository 後，AI 開發組織已經是該產品的一部分；若 status、instructions 或 artifacts 持續把它稱為 Temple，會像在專案內嵌入另一個獨立組織，也會削弱產品自己的身份。

## Decision

`Temple` 只作為中央 template、CLI 與技術 namespace。`temple` CLI、`temple.lock`、`temple.*` schema、`$temple-*` Skill ID 和相容性 marker 保留原名。

安裝後面向專案的 headings、instructions、generated views、artifacts 與 Agent descriptions 使用專案名稱或「本專案的 AI 開發組織」。不得把專案或 Agent 團隊稱為 Temple。`TEMPLE.md` 目前保留為相容性檔名，但其內容描述該 repository 自己的 operating contract。

## Consequences

- 產品 repository 的文字與身份更自然，不會像依附另一個外部專案。
- 中央 CLI、既有 lock、schema 與 Skill invocation 保持相容。
- 未來新增 project-facing output 時必須檢查名稱邊界；純技術錯誤、命令和中央文件仍可使用 Temple。
- 若未來要移除 `TEMPLE.md` 檔名，必須透過有 rollback 的 migration，而不是在 upgrade 時留下孤兒檔案或強制刪除。
