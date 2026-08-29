# 使用手冊

## 1. 安裝中央模板

```bash
git clone git@github.com:zsz1210/ai-development-org-template.git
cd ai-development-org-template
npm run verify
# Optional: expose the local CLI as `temple`
npm link
temple --version
```

中央模板只需要 clone 一次；每個產品 repository 透過 `temple init` 安裝，不需要 fork。

## 2. 第一次初始化

### 建議：由 Codex 協助

第一次先在中央模板 repository 開啟 Codex，並提供目標 repository 的絕對路徑：

> 使用 temple-init，讀取 `/absolute/path/to/target`，替五個 assignment slots 建議英文名字，等我確認後初始化。

AI 必須先顯示 Position 對應與名字提案，取得確認後才建立設定檔並執行 `init`。安裝後，目標 repository 會取得 `$temple-init`、`$temple-grill` 與 `$temple-grill-with-docs`。模板 repository 本身沒有任何預設名字。

### 手動設定檔

建立一份不需要提交 Git 的 JSON：

```json
{
  "schema_version": "temple.init/v1",
  "project": { "id": "product-id", "name": "Product Name" },
  "naming_mode": "manual",
  "agents": [
    { "display_name": "Name One", "positions": ["engineering_manager", "release_manager", "observer"] },
    { "display_name": "Name Two", "positions": ["product_manager", "ux_designer"] },
    { "display_name": "Name Three", "positions": ["tech_lead"] },
    { "display_name": "Name Four", "positions": ["developer"] },
    { "display_name": "Name Five", "positions": ["quality_evaluator", "independent_qa"] }
  ]
}
```

預演與正式執行：

```bash
node /path/to/ai-development-org-template/bin/temple.mjs init . --config /path/to/config.json --dry-run
node /path/to/ai-development-org-template/bin/temple.mjs init . --config /path/to/config.json
```

若目標已有 `AGENTS.md`，Temple 預設不改寫它，並在 doctor 顯示待整合警告。確認允許附加 Temple 管理區塊後，可加上 `--integrate-agents`。

## 3. 日常操作

```bash
node /path/to/ai-development-org-template/bin/temple.mjs doctor .
node /path/to/ai-development-org-template/bin/temple.mjs status .
node /path/to/ai-development-org-template/bin/temple.mjs status . --json
```

工作開始前讀：

1. 根 `AGENTS.md` 與 `TEMPLE.md`。
2. `.ai-org/project/assignments.json`，確認自己承擔的 Position。
3. 指定 work item 及其 evidence pointer。
4. 相關 Spec、Design、ADR。

工作結束前寫：

1. 產物與驗證證據。
2. work item 的狀態與下一個 Position。
3. 需要人類批准或尚未解決的問題。
4. 一筆事件到 `events.jsonl`（若該工作流已啟用事件寫入）。

## 4. 使用 grill skills

- `$temple-grill`：把模糊想法拆成已知事實、選項、決策與未知，不需要 repository 文件也能使用。
- `$temple-grill-with-docs`：先讀 repository 的相關文件與程式碼，再針對衝突、缺口、術語與 ADR 做訪談。

兩者都應將已確認決策保存到 Decision Ledger，不得只留在聊天中。它們的預設行為是訪談與提案，不會直接開始實作。

## 5. 故障處理

- `managed_file_changed`：先查看 diff；不要用重跑 init 覆蓋。若是有意修改，應升級為專案 extension 或提交回中央模板。
- `agents_md_pending_merge`：檢視 `.ai-org/project/AGENTS.temple.md`，再由人類批准整合。
- `developer_qa_not_independent`：更改 Assignment，讓 Developer 與 Independent QA 使用不同 `agent_id`。
- `missing_position_assignment`：補齊所有九個 Position；即使暫時由同一 Agent 兼任，也不能讓責任消失。
