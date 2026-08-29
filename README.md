# Temple — AI Development Organization Toolkit

把多個 Codex 對話變成一個能交接、能驗證、能看見進度的 AI 開發團隊。

**Temple** 是一套可安裝的 AI 開發組織工具。你不需要分別記住每個 AI 對話做過什麼；你主要和 Engineering Manager 溝通，其他職位根據同一份專案狀態工作。初始化後，這套組織就是目標專案的一部分，不會把專案或團隊改稱為 Temple。

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
3. **Agent 名字屬於專案。** Temple 只定義職位；第一次初始化時才由你命名，或讓 AI 提議後由你確認。

## 第一次使用

### 1. 取得中央 Toolkit

```bash
git clone git@github.com:zsz1210/temple-ai-dev-org.git
cd temple-ai-dev-org
npm run verify
```

需求：Node.js 20 以上。你可以選擇執行 `npm link`，之後直接使用 `temple` 命令。

### 2. 請 Codex 初始化目標專案（建議方式）

在這個中央 Toolkit repository 開啟 Codex，告訴它：

> 使用 `$temple-init` 初始化 `/absolute/path/to/my-project`。請先替五個 Agent Identity 提議英文名字，等我確認後再執行。

Codex 會：

1. 唯讀檢查目標 repository。
2. 顯示五個 Agent Identity 與九個 Position 的配置。
3. 等你確認英文名字。
4. 先執行 dry-run，確認不會覆寫既有內容。
5. 正式執行 `init`、`doctor` 與 `status`。

初始化完成後，目標 repository 自己就會擁有 AI 開發組織 instructions、Skills、Position configs 與可觀測狀態。之後不需要回到中央 Toolkit 才能工作。

### 3. 開始第一張工作項目

在目標專案對 Engineering Manager 說：

> 為這個目標建立一張低風險 work item，先完成 Spec 與驗收條件，再交給 Developer；完成後交由 Independent QA 驗證同一個 revision。

日常檢查：

```bash
temple doctor .
temple status .
```

日常 canonical state 由 `temple` CLI 命令維持，不必再手改 work item JSON：

```bash
temple work-item create . --title "Outcome-oriented title" \
  --scope "Bounded scope" \
  --acceptance "Observable acceptance criterion"

temple handoff . --work-item WI-0001 --to developer \
  --input-revision abc123 \
  --completed "Approved design is ready" \
  --evidence docs/design.md

temple transition . --work-item WI-0001 --to build \
  --satisfy technical_design=docs/design.md \
  --satisfy risk_review=docs/design.md
```

如果沒有執行 `npm link`，可改用中央 checkout 的完整路徑：

```bash
node /path/to/temple-ai-dev-org/bin/temple.mjs doctor .
node /path/to/temple-ai-dev-org/bin/temple.mjs status .
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

Developer 與 Independent QA 必須是不同 Identity；Temple 會在初始化與 `doctor` 時檢查這項規則。

## 為什麼 repository 裡有 `project-overlay/`

`project-overlay/` 是「初始化時疊加到目標專案的來源」，不是安裝後會出現的一層目錄。`temple init` 會把它裡面的 `.ai-org/`、`.agents/`、`.codex/` 與 operating contract 放到目標 repository 的根目錄，因此產品專案不會叫 template，也不需要重新命名這個資料夾。

舊名稱 `template/` 容易讓人誤以為整個產品會被包在模板目錄裡，所以從 alpha.4 起改為 `project-overlay/`。這個改名只影響中央 Toolkit 的來源結構。

## 安裝到專案後會看到什麼

```text
AGENTS.md                 Codex 進入專案時讀取的共同規則
TEMPLE.md                 日常工作與交接契約（保留的相容性檔名）
temple.lock               Toolkit 版本與 managed checksums
.ai-org/
  core/                   Position、workflow、policy、schema
  project/                專案自己的 Agent 與 assignment
    tasks.json             Codex task/thread registry
  work-items/             有穩定 ID 的工作項目
  decisions/              Decision Ledger 與 ADR proposal
  events/                 可追加的事件紀錄
  artifacts/              測試、QA 與視覺化證據
  views/status.md          可重建的狀態總覽
.agents/skills/           lifecycle、decision interview 與 domain modeling Skills
.codex/agents/            九個 Position 的 Codex runtime config
```

如果目標已經有 `AGENTS.md`，Temple 預設不會覆寫。它會留下待合併片段並由 `doctor` 顯示警告；只有在你明確批准時才附加 Temple 區塊。

### 名稱原則

`Temple` 只代表中央 Toolkit、CLI 與技術 namespace。安裝進產品 repository 後，狀態頁、instructions、artifact 與 Agent 說明都以產品名稱或「本專案的 AI 開發組織」表達。`temple` CLI、`temple.lock`、schema ID、CLI 專用 Skill ID 和相容性 marker 仍保留原名，避免破壞升級與自動化；一般能力 Skill 使用中性名稱。

## 安全邊界

- 中央 Toolkit 與產品 repository 分開；產品不需要 fork。
- Managed 檔案由 checksum 保護；內容不同時停止，不強制覆寫。
- Agent 名字、產品文件與工作歷史屬於專案，未來升級不得覆蓋。
- 生成的 status 或視覺化只是 projection，不會取代 canonical state。
- Temple 只登錄 Codex task/thread，不會自行建立、改名或封存 App 裡的 task。
- 商業事實、優先順序、外部承諾、敏感資料、不可逆操作與高風險 release 仍由人類批准。
- Archify 目前只是關閉狀態的選配 Adapter 合約，不是控制平面。

## Phase 1 現在能做什麼

- 安全初始化空白或既有 repository；完整產品定義與第一個垂直切片會在 Phase 1.5 驗證。
- 第一次 init 才建立並命名 Agent Identity。
- 驗證九個 Position、身份分離、managed files 與 work item 格式。
- 用 CLI 建立 work item、handoff、具名 gate transition 與 release closeout。
- 登錄 Codex task/thread、建議穩定標題並計算 archive readiness。
- 產生 assignment、work item、task、revision、attention 與最近事件總覽。
- 以 checksum-aware `temple upgrade` 安全更新 managed files，保留專案狀態。
- 提供 `$temple-work` 給日常 lifecycle 操作。
- 使用 `$decision-interview` 釐清模糊想法。
- 使用 `$evidence-backed-decision-interview` 依 repository 證據訪談並保存決策。
- 使用 `$domain-modeling` 統一 domain language、規則與邊界。
- 透過 Sample Project 與 CI 驗證 dry-run、重跑、衝突與不覆寫行為。

Phase 1 不會背景自動派工、不會直接操作 Codex sidebar、不會發布 production，也沒有跨專案即時 Web Dashboard。Archify 仍是關閉狀態的選配 Adapter。

## 升級既有專案

先預演，再正式升級：

```bash
temple upgrade /absolute/path/to/project --dry-run
temple upgrade /absolute/path/to/project
temple doctor /absolute/path/to/project
temple status /absolute/path/to/project
```

Upgrade 只更新與 `temple.lock` checksum 一致的 managed files。任何缺失或被專案修改過的 managed file 都會在寫入前停止；Agent 名字、work items、events、artifacts、decisions、task registry 與產品檔案不會被覆蓋。

## 進一步閱讀

- [完整使用手冊](docs/usage.md)：手動設定、命令與故障處理。
- [組織與技術架構](docs/architecture.md)：身份模型、檔案邊界與 canonical state。
- [Position 與工作流程](docs/vision.md)：九個職位的責任與 gate。
- [Phase 1 完成定義](docs/phase-1.md)：目前版本的驗收範圍。
- [Roadmap](docs/roadmap.md)：從 Greenfield Pilot、營運 MVP 到即時控制面與多專案管理。
- [Capability catalog](docs/capability-catalog.md)：已納入、保留待驗證與不直接採用的 Skills。
- [Skill design policy](docs/skill-design.md)：Skill 的觸發、內容密度與完成標準。
- [ADR 索引](docs/adr/README.md)：重要決策及其理由。

## License

Temple 以 [MIT License](LICENSE) 開源。第三方來源與採用邊界記錄在 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

`package.json` 保留 `private: true` 只是避免誤發佈到 npm，與 GitHub repository 是否公開無關。
