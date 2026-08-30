# Temple — AI Development Organization Framework

[English](README.md) | [日本語](README.ja.md) | **繁體中文**

**使用多個 AI Agent 開發，也不讓專案變成一堆彼此斷裂的對話。**

Temple 可以在全新或既有專案裡安裝一個以 repository 為核心的小型開發組織。它為 AI Agent 提供穩定的職責、共享的專案狀態、可重複使用的工程方法、範圍明確的工作，以及以 evidence 為基礎的交付流程，讓下一個 Agent 不需要重建原始對話也能繼續工作。

> Temple 目前是用於低風險專案與框架驗證的 early alpha，還不是 npm release 或 production control plane。

## 為什麼需要 Temple？

Coding Agent 很快，但速度本身不會自動形成團隊。

沒有共同的運作方式時，Agent 可能在產品還沒釐清前就開始實作、重複另一個對話已經做過的事、同時修改相同檔案、把實作與核准混在一起，或是在沒有可重現 evidence 的情況下宣告完成。對話結束後，重要決定也會一起消失。

Temple 把需要延續的內容留在 repository 裡：

- **職責清楚：** Product、architecture、development、quality、integration、release、observation 彼此分離；即使同一個 AI 暫時擔任多個角色，責任也不會混在一起。
- **共享事實：** Spec、decision、Work Item、handoff、learning 與 evidence 可以跨 task 保留下來。
- **工程方法：** Skill 將訪談、domain modeling、文件、測試、除錯與組織擴展變成可重複使用的做法。
- **安全協作：** Agent 並行前，先依照 dependency、affected path、ownership 與共享 resource 拆分工作。
- **可驗證交付：** Developer 的主張、evaluation、Independent QA、approval 與 release 是對應 exact revision 的不同階段。

Temple 不是共享聊天記憶，也不是 prompt 合集。它是產品點子與負責實現它的 Agent 之間的運作層。

## 它怎麼運作

```text
Idea
  ↓ 釐清 product intent 與 shared language
Specification
  ↓ 建立範圍明確的 Work Item 並分配責任
Build
  ↓ 使用 engineering Skill，安全地並行開發
Verification
  ↓ evaluation、獨立重現、approval、close
Repository state
  → 下一個人或 Agent 可以直接延續
```

例如你提出「加入訪客結帳」時，Product Manager 會先把點子整理成可以核准的 outcome；Architect 與 UI／UX 職責會定義受影響的 contract；Developer 取得彼此不重疊的 Work Item；Quality 評估實際 behavior；Independent QA 從 candidate revision 重新驗證；最後由 Release 判斷 evidence 是否足夠。每個階段都讀寫 repository，而不是依賴一個不斷變長的 chat。

Temple 定義十個穩定 Position：Product Manager、UX Designer、UI Designer、Software Architect、Developer、Quality & Evaluation Engineer、Independent QA、Release Manager、Integration Owner 與 Observer。第一次初始化時，這些 Position 會被分配給專案自己的 Agent Identity。小型專案可以先由五個 Agent 開始；團隊擴大後再加入專家，不必重新設計整個組織。

**Position** 定義責任；**Agent Identity** 是專案裡實際執行工作的 AI；**Skill** 是可重複使用的方法。Skill 可以改善做事方式，但不能擴張權限或跳過 verification gate。

## 快速開始

需求：Git、Node.js 20 以上、Codex，以及準備導入的專案目錄。

### 1. 從 source 安裝

```bash
git clone https://github.com/zsz1210/temple-ai-dev-org.git
cd temple-ai-dev-org
npm ci
npm run verify
npm link
```

Early alpha 期間 repository 維持 private，因此 clone 需要存取權限。

### 2. 初始化一個專案

用 Codex 開啟這個 repository，然後告訴它：

> 使用 `$temple-init` 初始化 `/absolute/path/to/my-project`。替 Agent Identity 提議英文名字，寫入檔案前先等我確認。

Temple 會先檢查目標專案、提出組織配置、顯示 dry run、安裝 project-owned state 與 framework-managed files，最後執行健康檢查。每個產品不需要 fork 一份 Temple；Temple 會成為該產品 repository 的一部分，而中央 framework 仍可獨立 upgrade。

### 3. 開始一個範圍明確的 outcome

在初始化完成的專案裡告訴 Codex：

> 使用 `$decision-interview` 釐清這次修改，再使用 `$temple-work` 建立一個可以被獨立驗證的最小 Work Item。

常用檢查：

```bash
node ./templew.mjs doctor .
node ./templew.mjs status .
node ./templew.mjs observe .
```

既有專案導入、CLI 指令、upgrade、並行工作、tracker、UI mode 與疑難排解，請參考[使用指南（英文）](docs/usage.md)。

## 選擇需要的組織程度

| Profile | 適合情況 | 會增加什麼 |
|---|---|---|
| **Solo** | 一個人使用多個 AI Agent | 十個 Position 預設由五個 Agent Identity 擔任，職責與 Independent QA 仍清楚可見 |
| **Collaborative** | 多個人或專家共同維護專案 | Human Principal、agent sponsorship、Position pool、Discipline、claim、dependency 與 integration ownership |
| **High-Assurance** | 風險需要更強的人類問責 | 依風險調整的 evidence、rollback、獨立核准與更嚴格的職責分離 |

UI 工作可以選擇 `not-applicable`、`code-first`、`preview-first` 或 `design-led`。Figma 是選用工具；需要的 evidence 依專案規模與風險調整，而不是強迫所有專案先使用同一套設計工具。

## 跟著專案一起成長的方法

Core installation 包含初始化、bounded work、decision interview、domain modeling、project documentation 與 Skill authoring。選用的 Build Quality pack 會加入 TDD 與有紀律的 bug diagnosis。

專案可以加入自己的 Skill，不必把 ownership 交給 Temple。Engineering Learning Loop 會先保存 Lesson 與 Practice，只有反覆 evidence 足夠時，才將它提升為 Skill、check、ADR 或 instruction。Context routing 能讓 Agent 找到相關方法與專案知識，而不必每次讀完整個 repository。

Temple 不會預設安裝所有 engineering Skill、semantic search、external tracker integration 或 model。選用 capability 必須保持明確、可 review，也能被移除。

## 仍然由人負責的事情

Temple 負責協調 repository 裡的工作，但不會接管 business truth、priority、credential、實質費用、不可逆的外部操作或高風險核准。公司仍可使用 Jira、GitHub Projects 等工具作為人類的 planning surface，再由 Temple Work Item 管理 repository 內的 AI execution 與 evidence。

目前 alpha 證明的是 local 與 fixture-backed behavior，不代表所有公司組織、distributed race、regulated audit 或 production deployment 都已通過驗證。

## 文件

請從[文件導覽（英文）](docs/README.md)開始。它依讀者與目的整理文件，而不是把整個實作歷史塞在 GitHub 首頁。

- [使用指南（英文）](docs/usage.md) — install、initialize、operate、upgrade
- [願景與運作模型（英文）](docs/vision.md) — responsibility、lifecycle、設計思想
- [Roadmap](docs/roadmap.zh-TW.md) — delivered、now、next、later
- [測試策略（英文）](docs/testing.md) — local、CI、release、live validation
- [架構決策（英文）](docs/adr/README.md) — 重要選擇背後的原因
- [驗證紀錄（英文）](docs/validation/README.md) — 有界 evidence 與保留中的缺口
- [Changelog（英文）](CHANGELOG.md) — release history

## License

[MIT](LICENSE)。第三方來源與採用邊界記錄在 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
