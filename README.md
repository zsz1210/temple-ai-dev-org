# AI Development Organization Template

這是一套可重複安裝到不同軟體專案的 AI 開發組織模板。它把「對話」降級為工作介面，把 Git 裡的規格、決策、工作項目與驗證證據提升為正式狀態，避免多個 AI 對話互相不知道、重複工作，或因標題改動而失去脈絡。

Phase 1 提供：

- 九個穩定的 Position（職位），但不預先替任何 Agent 命名。
- 第一次 `init` 才建立專案自己的 Agent Identity 與英文名字。
- 同一個 Agent 可以兼任多個 Position；Developer 與 Independent QA 必須由不同 Identity 負責。
- `Spec → Design → Build → Test → Eval → Independent QA → Release Gate` 的明確流程。
- `temple init`、`temple doctor`、`temple status` 三個可執行命令。
- `temple-grill` 與 `temple-grill-with-docs` 兩個專案 Skill。
- 可選的 Archify 視覺化 Adapter 邊界；它不是控制平面，也不會自動改寫專案狀態。

## 核心使用方式

中央 repository 發布版本；實際專案不是 fork 它，而是在專案根目錄執行初始化：

```bash
git clone git@github.com:zsz1210/ai-development-org-template.git
cd ai-development-org-template
npm test
node ./bin/temple.mjs init /absolute/path/to/your-project --config /absolute/path/to/init-config.json --dry-run
node ./bin/temple.mjs init /absolute/path/to/your-project --config /absolute/path/to/init-config.json
node ./bin/temple.mjs doctor /absolute/path/to/your-project
node ./bin/temple.mjs status /absolute/path/to/your-project
```

在 Codex 裡，第一次請在中央模板 checkout 開啟任務並使用 `$temple-init`，同時提供目標 repository 的絕對路徑。Skill 會先讀取目標專案，再讓你選擇自己命名或由 AI 提議英文名字；名字確認後才執行初始化。安裝完成後，目標 repository 本身也會擁有這個 Skill。

最小的非互動設定檔格式：

```json
{
  "schema_version": "temple.init/v1",
  "project": {
    "id": "your-project",
    "name": "Your Project"
  },
  "naming_mode": "ai-suggested",
  "agents": [
    {
      "display_name": "<confirmed English name>",
      "positions": ["engineering_manager", "release_manager", "observer"]
    },
    {
      "display_name": "<confirmed English name>",
      "positions": ["product_manager", "ux_designer"]
    },
    {
      "display_name": "<confirmed English name>",
      "positions": ["tech_lead"]
    },
    {
      "display_name": "<confirmed English name>",
      "positions": ["developer"]
    },
    {
      "display_name": "<confirmed English name>",
      "positions": ["quality_evaluator", "independent_qa"]
    }
  ]
}
```

上面的字串是必須替換的欄位，不是預設 Agent 名字。完整流程見 [使用手冊](docs/usage.md)；Phase 1 的交付範圍見 [Phase 1](docs/phase-1.md)，後續建置與觀測路線見 [Roadmap](docs/roadmap.md)。

## 權責摘要

使用者主要與 Engineering Manager 對話，提供商業事實、優先順序與高風險批准。各 Position 讀寫相同的專案狀態，但只能對自己負責的產物作業。聊天標題不是識別碼，也不是事實來源。

系統把檔案分成三類：

- Managed：由模板版本管理，可由未來的 `temple upgrade` 更新。
- Project-owned：專案自行維護，升級不得覆蓋。
- Generated：可由 canonical state 重建，不應手動當作唯一真相。

詳細結構見 [架構文件](docs/architecture.md) 與 [ADR 索引](docs/adr/README.md)。

## 目前限制

Phase 1 尚未提供 `temple upgrade`、自動呼叫 LLM 命名、背景排程或跨 repository 控制平面。Archify 只完成穩定版本釘選與 Adapter 合約；啟用方式會在後續 Phase 實作。這些限制刻意保留，避免第一版在還沒有可驗證狀態模型前就引入隱性自動化。
