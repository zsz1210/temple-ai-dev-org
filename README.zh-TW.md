# Temple — AI Development Organization Framework

[English](README.md) | [日本語](README.ja.md) | **繁體中文**

**透過一個能夠思考、建構、驗證、延續並持續進化的 AI 開發組織，將產品意圖轉化為可信任的軟體。**

Temple 是一套為 Codex 設計、以 repository 為核心的框架，將產品思考、穩定的責任分工、可重複使用的工程方法、以 evidence 為基礎的交付，以及持久的專案狀態連接起來。目前實作仍處於 early alpha，適合先用於低風險驗證。

```text
Intent → Shared model → Bounded work → Method-assisted build → Independent evidence → Durable continuation
```

## 為什麼需要 Temple？

Coding Agent 可以快速產生程式碼，但這不會自然形成一個開發組織。AI task 可能在產品還沒釐清前就開始實作、使用與其他 task 不一致的方法、混淆執行責任與批准權、在沒有可重現 evidence 的情況下宣稱成功，或在對話結束時遺失重要決策。

如果缺少把這些能力連接起來的結構，增加 task 或 Skill 反而可能放大問題。Temple 提供這個連接層：產品意圖在成為 scope 前先被釐清；即使執行的 Agent 改變，責任仍保持穩定；工程方法在明確的權限邊界內運作；交付宣稱必須通過 evidence gate；後續 task 則能從 repository 恢復狀態，不必重新拼湊聊天內容。

Temple 不是共享聊天記憶的系統，也不是一組 prompt 的集合。它是一套將想法轉化為 AI 開發組織可以持續接手並驗證之工作的運作框架。

## 框架架構

| 層級 | Temple 目前提供的能力 |
|---|---|
| 產品意圖與領域 | `$decision-interview` 深入釐清模糊處；`$domain-modeling` 建立共通語言、邊界、規則與 invariant；Spec、Decision Ledger 與 ADR 保存決策 |
| 組織與權限 | 九個穩定 Position、專案自己的 Agent Identity、Assignment、明確的人類批准邊界，以及 Developer 與 Independent QA 的分離 |
| 工程方法 | Core Skills，以及包含 `$tdd` 與 `$diagnosing-bugs` 的選配 Build Quality pack |
| 工作協調 | 固定的 `Spec → Design → Build → Test → Eval → Independent QA → Release Gate` lifecycle，搭配可持續保存的 work item 與 handoff |
| 驗證與交付 | 具名的 gate evidence、evaluation、獨立重現、revision reference、approval record、rollback plan 與有明確範圍的 closeout |
| 持久狀態、學習與可觀測性 | 由 repository 保存的 decision、Lesson、Practice、work item、event、task registry、產生式 status，以及具 conflict 保護的 upgrade |

Position 定義責任與批准邊界；Agent Identity 是被指派到 Position、屬於專案自己的執行者；Skill 則是執行某類工作時可重複使用的方法。Skill 不會擴張權限，也不能取代 evidence gate。

## 快速開始

需求：Git、Node.js 20 以上、Codex，以及一個要導入 Temple 的專案目錄。

### 1. 安裝 Temple

```bash
git clone https://github.com/zsz1210/temple-ai-dev-org.git
cd temple-ai-dev-org
npm run verify
npm link
```

目前仍處於 early alpha，repository 暫時為 private，因此 clone 需要 GitHub 存取權限。

### 2. 初始化專案

在 Codex 開啟 Temple checkout，然後提出以下要求：

> 使用 `$temple-init` 初始化 `/absolute/path/to/my-project`。請先替五個 Agent Identity 提議英文名字，等我確認後再進行任何修改。

Temple 會檢查目標專案、提出名字和 Position Assignment、執行 dry run，接著安裝開發組織並進行健康與狀態檢查。互動式與設定檔初始化方式請參考[使用手冊（英文）](docs/usage.md)。

### 3. 建立一個範圍明確的 work item

```bash
cd /absolute/path/to/my-project

temple work-item create . \
  --title "Ship one bounded outcome" \
  --scope "One verified user flow" \
  --acceptance "Independent QA verifies the candidate revision"

temple doctor .
temple status .
```

工作進入不同 lifecycle 階段時，使用 `temple handoff`、`temple transition` 與 `temple close`。執行 `temple --help` 可查看完整命令。

## 工程方法與擴展

Temple 會維持精簡的預設安裝。產品思考與組織運作 Skills 作為 core capability 安裝，開發程序則採選配方式。目前提供的 Build Quality pack 會加入 TDD 與範圍明確的 bug diagnosis，但不會改變 Position ownership 或 lifecycle authority。

Temple 也包含 `$skill-authoring` 與 [Skill 撰寫指南（英文）](docs/skill-authoring.md)，協助使用者建立邊界清楚、由專案自行管理的 Skill。Temple-compatible Skill 應定義明確且不重疊的 trigger、authority boundary、evidence input、執行程序、output、停止條件與 verification。

[Engineering Learning Loop（英文）](docs/engineering-learning.md)讓已完成的工作可以循著受治理的路徑，從 evidence 形成 Lesson、正式採用的 Practice，並只在理由充分時晉升為 Skill、自動檢查、ADR 或 instruction。精簡的專案 index 讓後續 Agent 只取回相關學習，不必載入全部歷史，也不會把每個觀察都變成規則。

這只是擴展模型的起點，並不是完整的 Skill ecosystem。Temple 目前沒有提供 Skill CLI、capability registry、custom-pack publisher 或 third-party Skill installer。Architecture、exploration、review、security、Git 與 retrospective packs 仍是經過評估、但尚未交付的候選能力。詳情請參考[能力目錄（英文）](docs/capability-catalog.md)。

## 專案規模與目前邊界

目前的小型團隊設定由五個 Agent Identity 覆蓋全部九個 Position。資料模型的設計目標，是在團隊擴大後仍保留 Position 用語與歷史 Identity ID，並維持 Developer 與 Independent QA 分離。現行 alpha 尚未提供重新指派 CLI 或風險分級的人力配置流程。

Temple 的設計可以從這個起點繼續成長，但尚未證明能適用所有專案規模。目前版本只有一套固定 lifecycle 與一個選配 development pack。依風險調整的 Lite、Standard、High-Assurance profile、更完整的 capability packs、精確 Git 與外部 evidence adapter、更充分的 cross-task recovery 證明、即時觀測，以及 multi-project view 都仍在規劃中。

Temple 目前會記錄 revision reference，但 CLI 還不會將每個 reference 驗證為精確的 Git object。它不會建立、重新命名或封存 Codex task，也不會執行外部 deploy 或 publish。商業事實、優先順序、敏感資料、重大成本、不可逆操作與高風險批准仍由人類負責。

Temple 是安裝進專案，而不是要求專案 fork 這個 repository。開發組織與狀態會成為該專案的一部分，中央 framework 則可以獨立升級。

## 文件

- [使用手冊](docs/usage.md) — 初始化、日常命令、升級與故障處理
- [願景與運作模型](docs/vision.md) — framework layer、Position 與 lifecycle
- [架構](docs/architecture.md) — identity、ownership、extension 與 canonical-state 邊界
- [Skill 撰寫指南](docs/skill-authoring.md) — project-owned Skill 的設計與驗證
- [Engineering Learning Loop](docs/engineering-learning.md) — evidence、Lesson、Practice、檢索與晉升
- [能力目錄](docs/capability-catalog.md) — 已提供、選配與候選的 engineering method
- [Roadmap](docs/roadmap.md) — 已驗證範圍與後續規劃
- [架構決策](docs/adr/README.md) — 設計決策與原因

詳細文件統一以英文維護。

## License

[MIT](LICENSE)。第三方來源與採用邊界記錄在 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
