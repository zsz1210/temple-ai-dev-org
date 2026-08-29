# 架構

## 三層身份模型

```text
Position (template-defined)
    │ assignment
    ▼
Agent Identity (project-defined at init)
    │ executes
    ▼
Work Item + Evidence (project-owned)
```

- Position 的 ID、責任與 gate 由中央模板定義。
- Agent Identity 有穩定 `agent_id` 與可變 `display_name`；改名不應改掉歷史 ID。
- Assignment 有生效狀態，把一個 Identity 配到一個或多個 Position。

Codex 的 `.codex/agents/*.toml` 是 Position 的 runtime configuration，不是專案中的人物姓名。專案實際名字保存在 `.ai-org/project/agents.json`。

## 檔案邊界

| 類型 | 路徑 | 所有權 | 升級規則 |
|---|---|---|---|
| Managed | `.ai-org/core/**`、`.agents/skills/temple-*/**`、`.codex/agents/**`、`TEMPLE.md` | 中央模板 | 只在 checksum 與預期一致時更新 |
| Project-owned | `.ai-org/project/**`、`work-items/**`、`decisions/**`、`events/**`、`artifacts/**`、根 `AGENTS.md` | 專案 | 永不由 upgrade 覆蓋 |
| Generated | `.ai-org/views/**` | CLI/Observer | 可由 canonical state 重建 |

`temple.lock` 記錄模板版本、managed file checksums、功能狀態與 `AGENTS.md` 整合狀態，為未來 `temple upgrade` 提供基礎。

## Canonical state

Phase 1 使用 Git 友善的 JSON 與 Markdown：

- `project.json`：專案識別與初始化時間。
- `agents.json`：Agent Identity。
- `assignments.json`：Position 到 Identity 的映射。
- `tasks.json`：Codex task/thread 的 stable ID、Position、Agent、revision 與狀態；不是 App 控制 API。
- `work-items/*.json`：工作狀態與 evidence pointer。
- `decisions/*.md`：Decision Ledger 與 ADR proposal。
- `events/events.jsonl`：可追加的事件流。
- `views/status.md`：由 `temple status` 產生的 projection。

對話可以根據這些檔案恢復上下文；對話本身不能反向覆蓋它們。

## 命令責任

### `temple init`

驗證初始化設定、預演檔案計畫、拒絕 managed conflict、建立專案身份與 assignment、寫入 lock。沒有設定檔時可在互動終端手動輸入五個名字；AI 建議命名由 `$temple-init` Skill 協調。

### `temple doctor`

驗證 managed checksum、JSON 模型、Position 完整性、Agent 名字唯一性、Developer/Independent QA 分離、Skill 與 `AGENTS.md` 整合。

### `temple status`

只讀 canonical state，輸出 work item、task registry、revision、attention、recent events 與 archive readiness，並可更新 `.ai-org/views/status.md`。它不把 view 反寫成決策。

### Lifecycle commands

- `temple work-item create` 配發下一個 durable ID。
- `temple handoff` 產生證據化交接文件。
- `temple transition` 只允許 workflow 中存在的 edge，且每項 `requires` 都必須有具名 evidence reference。
- `temple close` 產生 release record，要求 exact tested revision、rollback 與 approval record；它不執行 external release。
- `temple task register/update/list` 維持 task/thread registry 與建議標題，但不直接操作 Codex App。

所有 lifecycle 與 task mutation 會在系統暫存目錄取得以 project path 雜湊命名的短時 exclusive lock。其他 process 會短暫等待，逾時則停止；超過五分鐘的 lock 視為 crash residue 並可由下一個命令清理。Lock 不在 repository 內，也不屬於 canonical state。

### `temple upgrade`

Upgrade 先以舊 `temple.lock` 驗證每個已安裝 managed file。只有 checksum 未改變的 managed files 才能更新；新 managed paths 必須不存在或與中央內容相同。Project-owned files 永不覆蓋，generated status 可以重建。

## Archify Adapter

Archify 僅負責把經過選擇的架構或流程資料轉成視覺化 artifact：

```text
Canonical files → read-only adapter → Archify input → HTML/artifact
```

產物必須標記來源 revision 與 generated time。Archify 不得建立 work item、不批准 release、不改 Agent Assignment。Phase 1 只釘選合約，不自動安裝或執行第三方程式。
