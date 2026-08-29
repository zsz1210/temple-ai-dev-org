# Temple

[English](README.md) | [日本語](README.ja.md) | **繁體中文**

**一套可安裝、以 repository 為狀態核心的 Codex AI 開發團隊運作模型。**

Temple 協助分散的 Codex 任務參與同一套可觀測流程。它為每個任務提供可用來恢復脈絡的 repository 狀態、明確的 Position，以及與記錄下來的 revision reference 綁定的 evidence 交接。

```text
Goal → Spec → Design → Build → Test → Eval → Independent QA → Release Gate
```

Temple 不試圖讓 Agent 共享聊天記憶，而是讓 repository 成為唯一可信的狀態來源。

## 為什麼需要 Temple？

多個 Codex 任務很有用，但對話並不適合保存正式狀態。缺少共用運作模型時，常會出現：

- 工作在不同任務間被重複執行或半途遺失；
- 決策和未解問題散落在聊天紀錄中；
- 任務標題取代了真正可靠的識別方式；
- 沒有經過測試的 revision 或可重現 evidence，也被宣稱為「完成」。

Temple 將 work item、assignment、decision、handoff、revision 與驗證 evidence 保存在專案裡，讓新任務擁有可用於恢復工作的持久狀態。

## 快速開始

需求：Git、Node.js 20 以上，以及一個要導入 Temple 的專案目錄。

### 1. 安裝 Toolkit

```bash
git clone https://github.com/zsz1210/temple-ai-dev-org.git
cd temple-ai-dev-org
npm run verify
npm link
```

目前仍處於 early alpha，repository 暫時為 private，因此執行 clone 命令需要 GitHub 存取權限。公開 repository 會是另一個獨立的 release step。

### 2. 初始化專案

建議在 Codex 開啟 Temple checkout，然後提出以下要求：

> 使用 `$temple-init` 初始化 `/absolute/path/to/my-project`。請先替五個 Agent Identity 提議英文名字，等我確認後再進行任何修改。

初始化流程會檢查目標專案、提出名字和 Position assignment、執行 dry run，接著安裝專案組織並執行健康與狀態檢查。

若要使用互動式或設定檔初始化，請閱讀[使用手冊（英文）](docs/usage.md)。

### 3. 開始可觀測的工作

```bash
cd /absolute/path/to/my-project

temple work-item create . \
  --title "Ship one bounded outcome" \
  --scope "One verified user flow" \
  --acceptance "Independent QA verifies the exact revision"

temple doctor .
temple status .
```

工作進入不同生命週期時，使用 `temple handoff`、`temple transition` 與 `temple close`。執行 `temple --help` 可查看完整命令。

## 你會得到什麼

| 能力 | 提供內容 |
|---|---|
| 可持續的脈絡 | 由 repository 保存的 work item、decision、event 與 evidence |
| 清楚的責任歸屬 | 九個穩定 Position，指派給專案自己的 Agent Identity |
| 以 evidence 為基礎的交接 | 記錄下來的 revision reference、完成內容、evidence 與未解項目 |
| 可觀測狀態 | 可重新產生的專案狀態 view，以及 Codex task registry |
| 安全維護 | 具 conflict 保護的 init、upgrade，以及選配的 managed Skill pack |

小型專案一開始由五個 Agent Identity 覆蓋全部九個 Position。未來擴編時，只需重新指派 Position，不必重寫流程或歷史。Developer 與 Independent QA 永遠由不同 Identity 擔任。

## 如何導入既有專案

Temple 是安裝進專案，而不是要求專案 fork 這個 repository。安裝後的組織會成為該專案 instructions 與 state 的一部分，中央 Toolkit 則可以獨立升級。

Temple 不會自行建立、重新命名或封存 Codex 任務，也不會執行外部 release。高風險批准、商業優先順序、敏感資料與不可逆操作仍由人類負責。

Temple 目前仍是 early alpha。請先用低風險專案驗證，再考慮用於關鍵交付。

## 文件

- [使用手冊](docs/usage.md) — 初始化、日常命令、升級與故障處理
- [願景與運作模型](docs/vision.md) — Position、責任與生命週期
- [架構](docs/architecture.md) — identity model、所有權邊界與 canonical state
- [能力目錄](docs/capability-catalog.md) — core 與 optional Skills
- [Roadmap](docs/roadmap.md) — 目前方向與預定驗證
- [架構決策](docs/adr/README.md) — 設計決策及其理由

詳細文件統一以英文維護。

## License

[MIT](LICENSE)。第三方來源與採用邊界記錄在 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
