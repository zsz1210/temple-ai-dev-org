<h1 align="center">Temple</h1>

<p align="center"><strong>AI 開發組織框架</strong></p>

<p align="center">讓人與 AI 在同一個專案裡分工、交接、驗證，並把每次工作的經驗留下來。</p>

<p align="center"><a href="README.md">English</a> · <a href="README.ja.md">日本語</a> · <strong>繁體中文</strong></p>

<p align="center">
  <a href="https://github.com/zsz1210/temple-ai-dev-org/actions/workflows/ci.yml"><img alt="CI 狀態" src="https://github.com/zsz1210/temple-ai-dev-org/actions/workflows/ci.yml/badge.svg"></a>
  &nbsp;·&nbsp; Early Alpha
  &nbsp;·&nbsp; Node.js 20+
  &nbsp;·&nbsp; <a href="LICENSE">MIT License</a>
</p>

<p align="center"><a href="#how-temple-organizes-development">運作方式</a> · <a href="#quick-start">開始使用</a> · <a href="#maturity">目前限制</a></p>

---

## Temple 是什麼？

現在要讓 AI 規劃、寫程式、測試或審查並不難。難的是，當參與者變多、對話變長，工作又散落在不同工具裡，專案還能不能說清楚：為什麼要做、誰負責、目前做到哪裡，以及憑什麼判定完成。

Temple 用保存在版本庫裡的檔案與規則，管理專案的決策、分工、工作狀態、驗證結果與可重用經驗。即使換了對話、AI 或電腦，接手的人仍然找得到繼續工作所需的資訊。Temple 不是公司階級，也不是一張固定的組織圖；無論是一個人搭配多個 AI，或是多人團隊各自使用 AI，都能從同一套基礎開始。

### 可以導入既有專案，也能從新專案開始

Temple 不是用來開發 App、Web 或後端系統的應用程式框架，也不綁定特定的程式語言、開發框架、雲端服務或專案管理工具。你可以把它導入正在開發的既有專案，也可以從建立新專案時就開始使用。原本的產品架構、程式碼、依賴套件、資料模型與部署方式，仍然由你的專案決定。

Temple 為專案加入的是一套有紀錄、可以追查的 AI 開發組織方式。它定義人與 AI 各自負責什麼、哪些決定必須由人確認、工作如何拆分與交接、完成一項工作需要留下哪些驗證紀錄，以及有效做法如何累積成可重用的知識。導入時，Temple 會在版本庫裡新增組織設定與協作紀錄，但不會要求你重寫產品，或把既有專案改造成 Temple 專用的應用程式架構。

> **簡單來說：你的專案決定產品怎麼做；Temple 定義人與 AI 要怎麼一起把它做完。**

> [!NOTE]
> Temple 目前仍是 Early Alpha。現階段適合在有人監督的情況下，用於低風險的本機專案或範圍明確的試行。大型多人、多台電腦的實際運作、正式環境監測，以及無人值守的外部操作，都還不能視為已充分驗證。

![Temple 把人類決定的方向、專案裡的分工與驗證機制、人與 AI 的執行工作，以及版本庫保存的專案紀錄連接起來。](docs/assets/temple-overview.zh-TW.svg)

<a id="how-temple-organizes-development"></a>

## Temple 怎麼把開發工作組織起來

沒有共同做法時，重要資訊很容易散落在不同對話、工具和成員手上。Temple 把開發工作分成六個面向，並將相關紀錄留在版本庫裡：

- **產品方向：** 先確認要為誰解決什麼問題，以及希望帶來什麼改變。
- **責任與授權：** 說清楚誰負責執行，以及哪些決定必須由誰確認。
- **工程方法：** 找到這類工作已經驗證過、可以重複使用的做法。
- **工作協調：** 訂出每項工作的範圍，掌握目前進度、阻礙與相依關係，並判斷哪些工作可以同時進行。
- **驗證與交付：** 完成進入下一階段前需要的測試、查核與交付紀錄。
- **經驗累積：** 把這次有效的做法留下來，並在需要時重新驗證。

整套框架建立在三個簡單原則上：

1. **重要資訊不能只存在對話裡。** 對話可以用來討論與執行工作，但規格、決策、進度、交接、測試與核准紀錄，必須在對話結束後仍然找得到。
2. **職責不綁死在某個人或 AI 身上。** 執行者可以更換，專案的分工方式不必跟著重做。
3. **「做完了」必須有依據。** 實作、測試、評估、獨立 QA 與發布準備是不同階段；每個結論都要能對應到實際版本與紀錄。

Temple 不會要求你放棄 Jira、GitHub Projects、Figma、既有規格或團隊原本的版本庫使用方式。這些工具繼續管理各自擅長的資訊；Temple 則把 AI 參與的工作範圍、交接內容與驗證結果，可靠地留在程式碼旁邊。

## 從需求到交付：Temple 的工作流程

![一項 Work Item 會依序通過人類決策、工程交付與獨立品質保證，並把可追溯的驗證紀錄留在專案版本庫。](docs/assets/temple-delivery-path.zh-TW.svg)

Temple 會先把一項需求整理成範圍清楚的[工作項目（Work Item）](docs/concepts/terminology.md#work-item)，再連結這次會用到的規格、文件與工作方法。誰正在處理、交接了什麼，以及進入下一階段前需要哪些結果，都會跟著這個工作項目一起保存。

互不依賴的工作可以同時進行；有相依關係的成果，則要連同確切版本交給指定的整合負責者。接手的人或 AI，不論使用另一個任務或另一台電腦，都能直接從版本庫確認目前狀態，不必翻找舊對話來猜先前發生過什麼。

## 一個人也能用，團隊變大也不用換制度

| 模式 | 適合情況 | 主要差異 |
|---|---|---|
| **[Solo](docs/concepts/terminology.md#solo)** | 由一個人主導專案，AI 協助完成不同工作 | 同一個人可以負責多個職位，但執行開發與獨立 QA 的[執行身分（Agent Identity）](docs/concepts/terminology.md#agent-identity)必須分開。 |
| **[Collaborative](docs/concepts/terminology.md#collaborative)** | 多位成員各自使用 AI 一起開發 | 記錄每位人類授權哪些 AI、誰能承接哪些職位、工作由誰認領，以及最後由誰整合。 |
| **[High-Assurance](docs/concepts/terminology.md#high-assurance)** | 錯誤代價較高，需要更嚴格的查核 | 依照風險增加身分分離、驗證要求與復原準備，並由不同的人分別核准重要決定。 |

目前驗證最完整的是 Solo。Collaborative 與 High-Assurance 的規則已經實作，也通過本機測試；但在大型團隊與多台電腦的實際運作中，仍需要更多驗證。

### 團隊擴大後，組織方式不必重做

Temple 把常見的開發責任整理成十個長期使用的職位（Position）：

| 產品與體驗 | 工程與交付 | 品質與發布 |
|---|---|---|
| Product Manager | Engineering Manager | Quality & Evaluation Engineer |
| UX Designer | Tech Lead | Independent QA |
| UI Designer | Developer | Release Manager |
|  |  | Observer |

每個職位都可以暫時空缺、交給一位預設執行者，或設定一份可以承接工作的成員與 AI 名單。同一個人或 AI 可以兼任多個職位，但在同一項工作裡，Developer 與 Independent QA 必須使用不同的 Agent Identity。

### 先認識四個核心名詞

| Temple 用語 | 白話意思 |
|---|---|
| **[職位（Position）](docs/concepts/terminology.md#position)** | 一組長期存在的責任與權限界線，不等於公司裡的頭銜或上下關係。 |
| **[執行身分（Agent Identity）](docs/concepts/terminology.md#agent-identity)** | 專案用來辨識某位人類或某個 AI 的唯一身分。即使顯示名稱相同，也能用不同 ID 清楚區分。 |
| **[工作項目（Work Item）](docs/concepts/terminology.md#work-item)** | 一件可以被追蹤與驗收的工作，包含範圍、負責者、狀態和完成條件。 |
| **[驗證紀錄（Evidence）](docs/concepts/terminology.md#evidence)** | 用來支持測試、審查或核准結論的紀錄，並註明它對應的版本。 |

Skill 比較像一份可重用的工作方法：它告訴 AI 遇到某類任務時該怎麼做，但它不是授權書，也不能替人核准新增套件、接受風險或發布產品。

<a id="quick-start"></a>

## 開始使用

開始前請準備 Git、Node.js 20 以上版本、Codex，以及你想導入 Temple 的專案目錄。

### 1. 從原始碼安裝 Temple

```bash
git clone https://github.com/zsz1210/temple-ai-dev-org.git
cd temple-ai-dev-org
npm ci
npm run verify
npm link
```

### 2. 初始化專案

在 Codex 裡開啟 Temple 版本庫，然後直接告訴 Codex 你要初始化哪個專案。提示詞中的 `$name` 表示「請使用這項 [Temple Core Skill（英文）](docs/getting-started/core-skills.md)」，不是要貼進終端機執行的指令。

> 使用 [`$temple-init`](docs/getting-started/core-skills.md#temple-init) 初始化 `/absolute/path/to/my-project`。請先提議 Agent Identity 的英文名字，等我確認後再寫入檔案。

完成後，目標專案會新增一套可以直接檢查的 Temple 設定與紀錄：

- [`TEMPLE.md`](docs/concepts/terminology.md#temple-md) 與職位設定，說明各項責任和授權界線。
- [`.ai-org/`](docs/concepts/terminology.md#ai-org) 保存專案自己的 Agent Identity、工作項目、參考資料、驗證紀錄與學習內容；其中部分檢視可以重新產生。
- [`templew.mjs`](docs/concepts/terminology.md#templew) 與 [`temple.lock`](docs/concepts/terminology.md#temple-lock) 固定使用的 Temple 版本，也明確列出哪些檔案由框架管理。
- [Core Skills（英文）](docs/getting-started/core-skills.md)提供可重複使用的工作方法；專案另外建立的 Skill 仍屬於該專案。

### 3. 建立第一個工作項目

進入已初始化的專案後，可以提出：

> 使用 [`$decision-interview`](docs/getting-started/core-skills.md#decision-interview) 釐清這項變更，再使用 [`$temple-work`](docs/getting-started/core-skills.md#temple-work) 建立最小且能被獨立驗證的 Work Item。

接著可以在本機檢查專案：

```bash
node ./templew.mjs doctor .
node ./templew.mjs status .
node ./templew.mjs observe .
```

Temple 會安裝到各個產品專案中，不必為每個產品各自 fork 一份框架。剛開始也不必一次啟用所有機制：先用 Solo 完成一件範圍清楚的工作，再依照實際需要增加 AI、專業分工、外部整合或更嚴格的檢查。

若要進一步了解導入、升級、自我託管、並行工作、外部追蹤工具、UI 模式與疑難排解，請參考[使用指南（英文）](docs/getting-started/usage.md)。

<a id="maturity"></a>

## 目前可以做到什麼？還有哪些限制？

| 狀態 | 目前界線 |
|---|---|
| **可在有人監督下試用** | Solo 流程、十個可彈性指派的職位、工作項目與階段檢查、從版本庫找回相關資料與 Skill、學習與驗證紀錄、本機狀態檢查，以及升級時的檔案保護與復原機制。 |
| **功能已實作，驗證範圍仍有限** | Collaborative、High-Assurance、安全的並行規劃、服務狀態與用量觀察、唯讀的外部追蹤、多專案總覽，以及本機控制功能。這些能力已通過自動測試或小範圍驗證，但還不能據此判定適合任何團隊直接用於正式流程。 |
| **尚未完成驗證** | 大型團隊與多台電腦的實際運作、正式環境的自動監測或修復、無人值守的外部寫入、完成設定的語意搜尋、有法規或稽核要求的環境，以及在大型企業全面使用。 |

上面的成熟度判斷來自自動化檢查與範圍有限的驗證紀錄，不代表 Temple 已經通過各種企業環境、法規稽核、分散式衝突或正式環境上線的考驗。在取得可靠的實測數據以前，Temple 也不會宣稱能固定節省多少時間或 Token。

## 延伸閱讀

| 想了解…… | 建議閱讀 |
|---|---|
| 查詢 Temple 專有名詞 | [Temple 術語表（英文）](docs/concepts/terminology.md) |
| 了解 `$temple-init` 這類提示詞的用途 | [Temple Core Skills（英文）](docs/getting-started/core-skills.md) |
| 了解 Temple 整體如何運作 | [Temple 願景（英文）](docs/concepts/vision.md) |
| 查看系統架構與工程界線 | [系統架構（英文）](docs/concepts/architecture.md) |
| 安裝、導入或升級 Temple | [使用指南（英文）](docs/getting-started/usage.md) |
| 了解多人如何各自使用 AI 協作 | [多人協作指南（英文）](docs/operations/collaboration.md) |
| 了解測試、驗證紀錄與發布準備 | [驗證紀錄與 Observer（英文）](docs/operations/evidence-and-observer.md) |
| 為專案加入或建立 Skill | [能力目錄（英文）](docs/extensions/capability-catalog.md)與 [Skill 建立指南（英文）](docs/extensions/skill-authoring.md) |
| 了解專案經驗如何經過驗證，再成為可重用的 Skill | [工程學習流程（英文）](docs/extensions/engineering-learning.md) |
| 查看目前限制與待完成的驗證 | [開發藍圖](docs/planning/roadmap.zh-TW.md)與[驗證紀錄（英文）](docs/validation/README.md) |

完整的[文件導覽（英文）](docs/README.md)也收錄架構決策、貢獻方式、安全政策、版本紀錄，以及研究與試行結果。

## Temple 能安排工作，但不能替人作主

Temple 可以協調版本庫裡的工作，但產品要解決什麼問題、先做什麼、是否使用敏感憑證、是否花費大量資源、是否執行不可逆操作、是否修復正式環境，以及是否核准高風險變更，仍然由人類決定。外部系統可以提供資訊，但不會因此自動取得工作流程或發布的決定權。

## 授權條款

[MIT](LICENSE)。第三方來源與採用界線記錄在 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
