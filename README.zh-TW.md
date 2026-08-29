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
| 組織與權限 | 十個穩定 Position、專案自己的 Agent Identity、default Assignment、Human Principal、Agent sponsorship、帶 Discipline 的 Position pool、明確的人類批准邊界，以及 Developer 與 Independent QA 的分離 |
| 工程方法 | Core Skills，以及包含 `$tdd` 與 `$diagnosing-bugs` 的選配 Build Quality pack |
| 工作協調 | 固定的 `Spec → Design → Build → Test → Eval → Independent QA → Release Gate` lifecycle、可持續保存的 work item 與 handoff、deterministic safe dispatch wave、claim-before-worker preparation，以及可觀測的共享 runtime capacity |
| 團隊與 tracker 協調 | 區分公司 tracker、team-visible outcome、AI 內部拆解與 Codex session；透過明確 mapping、欄位權限、有限 observation 與 evidence-backed reconciliation 串接 |
| 驗證與交付 | 具名的 gate evidence、evaluation、獨立重現、revision reference、approval record、rollback plan 與有明確範圍的 closeout |
| 持久狀態、學習與可觀測性 | 由 repository 保存的 decision、Context Map、Lesson、Practice、work item、event、task registry、產生式 Capability Registry、Context Capsule、status，以及具 conflict 保護的 upgrade |

Position 定義責任與批准邊界；Agent Identity 是被指派到 Position、屬於專案自己的執行者；Skill 則是執行某類工作時可重複使用的方法。Skill 不會擴張權限，也不能取代 evidence gate。

有介面範圍時，UI Designer 是正式 Position，但 Temple 不要求每個專案都先製作 Figma。Work Item 可以標示沒有 UI、由負責的 AI 直接 code-first、先做 preview，或依照核准的設計來源；選擇的 [UI delivery mode（英文）](docs/ui-design.md) 會依風險調整 evidence。

## 快速開始

需求：Git、Node.js 20 以上、Codex，以及一個要導入 Temple 的專案目錄。

### 1. 安裝 Temple

```bash
git clone https://github.com/zsz1210/temple-ai-dev-org.git
cd temple-ai-dev-org
npm ci
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

node ./templew.mjs work-item create . \
  --title "Ship one bounded outcome" \
  --scope "One verified user flow" \
  --acceptance "Independent QA verifies the candidate revision" \
  --ui-mode code-first \
  --affected-path "src/verified-flow/**"

node ./templew.mjs capability find . --query "verify one user flow"
node ./templew.mjs context resolve . --work-item WI-0001 --no-write
node ./templew.mjs doctor .
node ./templew.mjs status .
```

工作進入不同 lifecycle 階段時，透過 repository launcher 使用 `handoff`、`transition` 與 `close`。launcher 會固定已安裝的 framework 版本，讓後續 task 不必依賴剛好存在的 global CLI。執行 `node ./templew.mjs --help` 可查看完整命令。

當一個 parent outcome 已拆成邊界清楚的 child Work Item，可以使用 `node ./templew.mjs parallel plan . --parent <WI-ID>` 產生 fresh、capacity-aware 的 dispatch manifest。這個指令不會建立 Codex task 或 claim。建立每一個 first-wave runtime 前，`parallel prepare` 會把符合資格的 claim、稀缺 resource reservation 與 runtime-worker correlation 一起記錄。internal subagent 與獨立的 user-owned Codex task 會保持區分，而指定的 Integration Owner 仍須完成 exact evidence join 後再重新規劃。詳見[平行編排（英文）](docs/parallel-orchestration.md)與[runtime coordination（英文）](docs/runtime-coordination.md)。

Alpha.19 完成 Phase 2C：Pack v2 可攜帶有版本與 provenance 的 reference、script 與 asset；runtime JSON Schema 與 migration plan 可直接檢查；Learning 提供原子化新增、revalidation 與 retrieval evaluation；High-Assurance 可在通過人類責任與風險 gate 後選用；選配的 Archify adapter 只接受 exact local source 並隔離安裝、檢查 digest。預設不會安裝 semantic model、vector database、daemon、第三方下載或執行外部動作。

## 工程方法與擴展

Temple 會維持精簡的預設安裝。產品思考與組織運作 Skills 作為 core capability 安裝，開發程序則採選配方式。目前提供的 Build Quality pack 會加入 TDD 與範圍明確的 bug diagnosis，但不會改變 Position ownership 或 lifecycle authority。

Temple 也包含 `$skill-authoring` 與 [Skill 撰寫指南（英文）](docs/skill-authoring.md)，協助使用者建立邊界清楚、由專案自行管理的 Skill。Temple-compatible Skill 應定義明確且不重疊的 trigger、authority boundary、evidence input、執行程序、output、停止條件與 verification。

[Engineering Learning Loop（英文）](docs/engineering-learning.md)讓已完成的工作可以循著受治理的路徑，從 evidence 形成 Lesson、正式採用的 Practice，並只在理由充分時晉升為 Skill、自動檢查、ADR 或 instruction。精簡的專案 index 讓後續 Agent 只取回相關學習，不必載入全部歷史，也不會把每個觀察都變成規則。

目前產生的 Capability Registry 可以列出 core、optional-pack 與 project-owned repository Skills，且不會奪走 extension 的 ownership。`temple capability find` 與 work-item Context Capsule 能協助 Agent 選出範圍明確的 evidence 與可能適用的方法，但選取結果不會擴張權限或安裝 dependency。Pack v2 已規範多檔 official pack；project-owned Skill 仍維持可延伸且不被中央 framework 接管。Temple 目前仍沒有提供 Skill mutation command、custom-pack publisher 或 third-party Skill installer。Architecture、exploration、review、security、Git 與 retrospective packs 仍是候選能力。詳情請參考[能力目錄（英文）](docs/capability-catalog.md)、[extension contract（英文）](docs/extension-and-migrations.md)與[context routing guide（英文）](docs/context-routing.md)。

## 專案規模與目前邊界

預設 Solo 設定由五個 Agent Identity 覆蓋全部十個 Position。Product Design Identity 一開始同時負責 Product Manager、UX Designer 與 UI Designer。Collaborative 基礎可以加入 Human Principal、額外 Agent Identity、sponsorship，以及帶有 frontend、backend、full-stack、infrastructure、UI、UX 等 Discipline 的多成員 Position pool。既有 default Assignment 保持相容，而單一有邊界的 Work Item 可以由其他符合資格的 pool member 認領。

Solo、Collaborative 與 High-Assurance 都已可選擇。Collaborative mode 提供較不易跨 clone 碰撞的 Work Item ID、dependency、parallel readiness 與 Principal-backed claim。High-Assurance 至少需要兩位 active Human Principal、每個 active Agent Identity 都有 sponsor，且 Developer 必須和 Independent QA、Release Manager 分離；每個 Work Item 再依風險調整 exact-revision evidence、rollback 與 approval gate。大型多人、多機器實測仍是 `not_run`，所以不能據此宣稱所有公司拓撲、regulated audit 或 production release 都已準備完成。詳見[協作開發模型（英文）](docs/collaboration.md)、[High-Assurance（英文）](docs/high-assurance.md)與[Evidence and Observer（英文）](docs/evidence-and-observer.md)。

Temple 會把 normalized Git、test、runtime、rollback，以及 High-Assurance handoff/closeout 的 scope 解成 exact commit；其他輕量 reference 仍可能保留呼叫者提供的值。它不會建立、重新命名或封存 Codex task，也不會執行外部 deploy 或 publish。商業事實、優先順序、敏感資料、重大成本、不可逆操作與高風險批准仍由人類負責。

公司團隊可以繼續使用 Jira、GitHub Issues 或其他 tracker 作為規劃介面，Temple 則把 AI 執行與 evidence 保存在 repository Work Item。Team-visible parent 可以對應到外部項目，AI 內部 child item 不必污染公司看板；外部的完成狀態也不能跳過 QA 或 Release Gate。Alpha.15 可以有限度讀取 GitHub Issue 或匯入 observation，並保存 reconciliation evidence，但不會對外部系統進行寫入。

Temple 是安裝進專案，而不是要求專案 fork 這個 repository。開發組織與狀態會成為該專案的一部分，中央 framework 則可以獨立升級。

## 文件

- [使用手冊](docs/usage.md) — 初始化、日常命令、升級與故障處理
- [願景與運作模型](docs/vision.md) — framework layer、Position 與 lifecycle
- [架構](docs/architecture.md) — identity、ownership、extension 與 canonical-state 邊界
- [協作開發模型](docs/collaboration.md) — Human Principal、Position pool、task slicing、parallel readiness、claim 與流程圖
- [平行編排](docs/parallel-orchestration.md) — safe wave、runtime dispatch、staleness 與 Integration Owner join gate
- [Runtime coordination and recovery](docs/runtime-coordination.md) — pinned launcher、stage requirement、shared resource 與 worker/task correlation
- [Task 與 external tracker 協調](docs/task-and-tracker-coordination.md) — 公司看板、AI 內部工作、欄位權限、mapping 與 reconciliation
- [產品規格系統](docs/product-specifications.md) — product truth、帶版本的 Work Item reference 與 iterative delivery
- [企業文件導入](docs/enterprise-document-adoption.md) — 在不產生雙重權威的前提下保留、橋接或遷移既有文件系統
- [UI interaction contract](docs/ui-interaction-contracts.md) — 串接介面行為、設計產物、實作與後端契約
- [Skill 撰寫指南](docs/skill-authoring.md) — project-owned Skill 的設計與驗證
- [Engineering Learning Loop](docs/engineering-learning.md) — evidence、Lesson、Practice、檢索與晉升
- [Progressive context routing](docs/context-routing.md) — Context Map、Context Capsule、deterministic evaluation 與 local-hybrid boundary
- [Extension 與 migration contract](docs/extension-and-migrations.md) — Pack v2、runtime schema、compatibility 與明確 migration
- [High-Assurance profile](docs/high-assurance.md) — 前置條件、risk tier、exact evidence、rollback 與 approval
- [Archify adapter](docs/archify-adapter.md) — pinned local installation、isolation、provenance 與 graceful degradation
- [UI design modes](docs/ui-design.md) — 無 UI 記錄、code-first、preview-first、design-led 與工具原則
- [能力目錄](docs/capability-catalog.md) — 已提供、選配與候選的 engineering method
- [Roadmap](docs/roadmap.md) — 已驗證範圍與後續規劃
- [架構決策](docs/adr/README.md) — 設計決策與原因

詳細文件統一以英文維護。

## License

[MIT](LICENSE)。第三方來源與採用邊界記錄在 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
