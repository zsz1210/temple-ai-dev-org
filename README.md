# AI Development Organization Template

把多個 Codex 對話變成一個能交接、能驗證、能看見進度的 AI 開發團隊。

這套模板的內部工具稱為 **Temple**。你不需要分別記住每個 AI 對話做過什麼；你主要和 Engineering Manager 溝通，其他職位根據同一份專案狀態工作。

```text
你提出目標
   ↓
Engineering Manager 建立工作項目
   ↓
Spec → Design → Build → Test → Eval → Independent QA → Release Gate
   ↓
所有決策、進度與證據保存在專案裡
```

## 它解決什麼問題

當一個專案同時有多個 Codex 任務時，常見問題是：

- 不同對話不知道彼此做過什麼。
- 同一件事被重複實作。
- 換一個對話後無法接續。
- 對話標題改動後，很難辨認真正的工作。
- AI 說「完成了」，卻沒有可追溯的測試或 QA 證據。

Temple 不要求所有 AI 共享聊天記憶。它把職位、工作項目、決策、交接與驗證證據放回 repository，讓任何新任務都能從檔案恢復狀態。

## 使用者只需要記住三件事

1. **主要和 Engineering Manager 說話。** 描述目標、優先順序與你願意批准的風險。
2. **對話不是正式紀錄。** Work item ID、Spec、ADR、handoff、Git revision 與 QA evidence 才是。
3. **Agent 名字屬於專案。** Template 只定義職位；第一次初始化時才由你命名，或讓 AI 提議後由你確認。

## 第一次使用

### 1. 取得中央 Template

```bash
git clone git@github.com:zsz1210/ai-development-org-template.git
cd ai-development-org-template
npm run verify
```

需求：Node.js 20 以上。你可以選擇執行 `npm link`，之後直接使用 `temple` 命令。

### 2. 請 Codex 初始化目標專案（建議方式）

在這個中央 Template repository 開啟 Codex，告訴它：

> 使用 `$temple-init` 初始化 `/absolute/path/to/my-project`。請先替五個 Agent Identity 提議英文名字，等我確認後再執行。

Codex 會：

1. 唯讀檢查目標 repository。
2. 顯示五個 Agent Identity 與九個 Position 的配置。
3. 等你確認英文名字。
4. 先執行 dry-run，確認不會覆寫既有內容。
5. 正式執行 `init`、`doctor` 與 `status`。

初始化完成後，目標 repository 自己就會擁有 Temple instructions、Skills、Position configs 與可觀測狀態。之後不需要回到中央 Template 才能工作。

### 3. 開始第一張工作項目

在目標專案對 Engineering Manager 說：

> 為這個目標建立一張低風險 work item，先完成 Spec 與驗收條件，再交給 Developer；完成後交由 Independent QA 驗證同一個 revision。

日常檢查：

```bash
temple doctor .
temple status .
```

如果沒有執行 `npm link`，可改用中央 checkout 的完整路徑：

```bash
node /path/to/ai-development-org-template/bin/temple.mjs doctor .
node /path/to/ai-development-org-template/bin/temple.mjs status .
```

## 第一次會建立五個 Agent Identity

這些是責任配置，不是預設名字：

| Identity slot | 負責的 Position |
|---|---|
| Coordination | Engineering Manager、Release Manager、Observer |
| Product | Product Manager、UX Designer |
| Technical | Tech Lead |
| Delivery | Developer |
| Quality | Quality & Evaluation Engineer、Independent QA |

同一個 Agent 可以兼任多個 Position，因此第一天不需要同時運行九個 AI。未來擴編時，只需把 Position 改派給新的 Agent Identity，不必重做工作流程或歷史紀錄。

Developer 與 Independent QA 必須是不同 Identity；Template 會在初始化與 `doctor` 時檢查這項規則。

## 安裝到專案後會看到什麼

```text
AGENTS.md                 Codex 進入專案時讀取的共同規則
TEMPLE.md                 日常工作與交接契約
temple.lock               Template 版本與 managed checksums
.ai-org/
  core/                   Position、workflow、policy、schema
  project/                專案自己的 Agent 與 assignment
  work-items/             有穩定 ID 的工作項目
  decisions/              Decision Ledger 與 ADR proposal
  events/                 可追加的事件紀錄
  artifacts/              測試、QA 與視覺化證據
  views/status.md          可重建的狀態總覽
.agents/skills/           temple-init 與兩個 grill skills
.codex/agents/            九個 Position 的 Codex runtime config
```

如果目標已經有 `AGENTS.md`，Temple 預設不會覆寫。它會留下待合併片段並由 `doctor` 顯示警告；只有在你明確批准時才附加 Temple 區塊。

## 安全邊界

- 中央 Template 與產品 repository 分開；產品不需要 fork Template。
- Managed 檔案由 checksum 保護；內容不同時停止，不強制覆寫。
- Agent 名字、產品文件與工作歷史屬於專案，未來升級不得覆蓋。
- 生成的 status 或視覺化只是 projection，不會取代 canonical state。
- 商業事實、優先順序、外部承諾、敏感資料、不可逆操作與高風險 release 仍由人類批准。
- Archify 目前只是關閉狀態的選配 Adapter 合約，不是控制平面。

## Phase 1 現在能做什麼

- 安全初始化新專案或既有 repository。
- 第一次 init 才建立並命名 Agent Identity。
- 驗證九個 Position、身份分離、managed files 與 work item 格式。
- 產生 assignment 與 work item 狀態總覽。
- 使用 `$temple-grill` 釐清模糊想法。
- 使用 `$temple-grill-with-docs` 依 repository 證據訪談並保存決策。
- 透過 Sample Project 與 CI 驗證 dry-run、重跑、衝突與不覆寫行為。

Phase 1 還沒有 `temple upgrade`、背景自動派工、即時 Dashboard 或自動安裝 Archify。這些會在狀態模型通過真實 pilot 後逐步加入。

## 進一步閱讀

- [完整使用手冊](docs/usage.md)：手動設定、命令與故障處理。
- [組織與技術架構](docs/architecture.md)：身份模型、檔案邊界與 canonical state。
- [Position 與工作流程](docs/vision.md)：九個職位的責任與 gate。
- [Phase 1 完成定義](docs/phase-1.md)：目前版本的驗收範圍。
- [Roadmap](docs/roadmap.md)：從營運 MVP 到即時控制面與多專案管理。
- [ADR 索引](docs/adr/README.md)：重要決策及其理由。
