<h1 align="center">Temple</h1>

<p align="center"><strong>AI 開發組織框架</strong></p>

<p align="center">為軟體專案建立一套人類與 AI 能共同運作、持續學習，並以證據交付的開發組織。</p>

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

AI 可以規劃、寫程式、測試與審查。但可靠的軟體開發還需要明確的產品方向、責任與授權、可重複使用的工程方法、工作協調、獨立驗證，以及能持續累積的專案記憶。

Temple 把這套運作方式保存在專案版本庫中。它不是上下管理關係，也不是固定的公司組織圖；它是一套讓專案知道如何決策、分工、執行、驗證與學習的共同制度。無論是一位開發者、數個 AI，或是一支更大的團隊，都能使用同一套基本模型。

> [!NOTE]
> Temple 目前仍是 Early Alpha，最適合在人類監督下，用於低風險的本地專案與範圍明確的試行。大型多人、多機環境的充分驗證、正式環境監測，以及無人值守的外部操作仍未完成。

![Temple 把人類決定的方向、專案內的四項組織機制、人類與 AI 的執行，以及版本庫保存的共同事實連接起來。](docs/assets/temple-overview.zh-TW.svg)

<a id="how-temple-organizes-development"></a>

## Temple 如何組織開發

Temple 把原本容易散落在對話、工具與不同人員之間的六件事連接起來：

- **產品方向：** 真正要解決什麼問題，以及批准了什麼成果。
- **責任與授權：** 誰負責這件工作，以及誰有權批准。
- **工程方法：** 這一類工作應該用什麼方式完成。
- **工作協調：** 現在正在做什麼、卡在哪裡，以及哪些工作可以安全並行。
- **驗證與交付：** 有哪些紀錄能證明工作完成並具備交付條件。
- **學習與記憶：** 下一個工作能找回、重用或重新驗證什麼。

三個原則讓整套制度維持清楚：

1. **專案版本庫才是共同記憶。** 對話是工作的地方，但規格、決策、工作狀態、交接、測試與批准必須能在對話之外被找回。
2. **責任與執行者分開。** 人員或 AI 可以更換，專案不必因此重寫整套運作方式。
3. **完成必須有證據。** 實作、測試、評估、獨立 QA 與發布準備是不同階段，而且必須對應到已知版本。

Temple 不會取代 Jira、GitHub Projects、Figma、既有規格文件或版本庫慣例。這些系統可以繼續管理各自負責的資訊；Temple 則在程式碼旁保存範圍明確的 AI 協作工作與驗證紀錄。

## 一項需求如何經過 Temple

```text
釐清成果
  → 批准範圍
  → 設計方法
  → 實作
  → 測試與評估
  → 獨立驗證
  → 記錄發布準備狀態
```

Temple 會為每項需求保存一件範圍明確的工作、需要的脈絡與方法、負責者、交接內容，以及進入下一階段所需的驗證紀錄。互不依賴的工作可以安全並行；彼此相依的成果則必須以確切版本和明確的整合負責者重新匯合。

決策、驗證紀錄與可重用的學習會留在版本庫裡。下一個人、AI、任務或電腦可以從目前的專案狀態接手，不必把舊對話當成權威來源。

## 同一套模型，因規模與風險調整深度

| 模式 | 適合情況 | 主要差異 |
|---|---|---|
| **Solo** | 一個人主導 AI 協作開發 | 少數執行身分可以兼任多項責任；開發與獨立 QA 仍保持分離。 |
| **Collaborative** | 多位人類成員各自操作自己的 AI | 明確記錄人類責任、可執行的角色範圍、工作認領、專業領域、共用資源與整合責任。 |
| **High-Assurance** | 工作具有較高的營運或商業風險 | 更嚴格地分離身分，並依風險增加驗證、復原準備與不同人類的批准。 |

Solo 是目前驗證最完整的模式。Collaborative 與 High-Assurance 的規則已經實作並通過本地測試，但大型真實多人、多機環境的充分驗證仍待完成。

### 增加人員，不必重新設計組織

Temple 定義十個穩定的責任角色：

| 產品與體驗 | 工程與交付 | 品質與發布 |
|---|---|---|
| Product Manager | Engineering Manager | Quality & Evaluation Engineer |
| UX Designer | Tech Lead | Independent QA |
| UI Designer | Developer | Release Manager |
|  |  | Observer |

每個責任角色可以暫時沒有人執行、指定一個預設執行者，或依照模式與專案規則建立更大的合格人員池。同一個人或 AI 可以兼任多個角色；但同一項工作的 Developer 與 Independent QA 必須使用不同的執行身分。

### 先認識四個詞

| Temple 用語 | 白話意思 |
|---|---|
| **責任角色（Position）** | 一份穩定的責任契約，並說明能做什麼、不能批准什麼。 |
| **執行身分（Agent Identity）** | 在專案裡實際執行工作的人或 AI。 |
| **工作項目（Work Item）** | 一項範圍明確、具備負責者、狀態與驗收紀錄的成果。 |
| **驗證紀錄（Evidence）** | 能支持測試、審查、批准或交付主張，而且對應到特定版本的紀錄。 |

Skill 是可重用的工程方法。它能引導工作如何進行，但不能自行取得授權、批准相依套件或跳過生命週期的檢查關卡。

<a id="quick-start"></a>

## 開始使用

需要準備：Git、Node.js 20 以上、Codex，以及一個目標專案目錄。

### 1. 從原始碼安裝 Temple

```bash
git clone https://github.com/zsz1210/temple-ai-dev-org.git
cd temple-ai-dev-org
npm ci
npm run verify
npm link
```

### 2. 初始化專案

使用 Codex 開啟 Temple 的版本庫，並提出：

> 使用 `$temple-init` 初始化 `/absolute/path/to/my-project`。請先提議 Agent Identity 的英文名字，等我確認後再寫入檔案。

Temple 會在目標專案加入一套看得見的運作層：

- `TEMPLE.md` 與責任角色設定會定義責任和授權的界線。
- `.ai-org/` 保存專案擁有的身分、工作項目、脈絡路由、驗證紀錄、學習與可重建檢視。
- `templew.mjs` 與 `temple.lock` 會固定框架的執行版本和每個受管理檔案的所有權。
- Core Skills 提供可重複使用的方法；專案自己的 Skill 仍由該專案擁有。

### 3. 建立第一個工作項目

進入已初始化的專案後，可以提出：

> 使用 `$decision-interview` 釐清這項變更，再使用 `$temple-work` 建立最小且能被獨立驗證的 Work Item。

接著在本機檢查專案：

```bash
node ./templew.mjs doctor .
node ./templew.mjs status .
node ./templew.mjs observe .
```

每個產品專案都是「安裝 Temple」，不需要為每個產品 fork 一份框架。建議從 Solo 和一項範圍明確的成果開始；只有在專案真的需要時，再增加更多 AI、專業領域、整合或更嚴格的檢查關卡。

導入、升級、自我託管、並行工作、外部追蹤工具、UI 模式與疑難排解，請參考[英文 Usage guide](docs/getting-started/usage.md)。

<a id="maturity"></a>

## 現在可以使用到什麼程度？

| 狀態 | 目前界線 |
|---|---|
| **現在可用** | 人類監督下的 Solo 工作方式、具備彈性指派的十個穩定責任角色、工作項目與生命週期檢查、可從版本庫確定找回的脈絡與能力、受治理的 Skill 與學習、驗證紀錄、本機狀態，以及升級與復原界線。 |
| **實驗性或限定範圍** | Collaborative 與 High-Assurance 規則、安全的並行規劃、服務與用量觀察、唯讀的外部追蹤與多專案總覽，以及本地控制層（control plane），已具備版本庫測試或限定的本地驗證，但不代表一般性的組織驗證。 |
| **規劃中或尚未驗證** | 大型真實多人、多機運作、正式環境監測或修復、無人值守的外部寫入、已設定的語意搜尋、受監管情境的驗收，以及廣泛的企業使用證明。 |

目前的主張來自自動化版本庫檢查與限定範圍的驗證紀錄，不能代表所有企業結構、法規稽核、分散式競爭或正式環境部署。Temple 也不會在缺少比較基準以前，宣稱節省了特定比例的時間或 Token。

## 依照目的繼續閱讀

| 我想要…… | 從這裡開始 |
|---|---|
| 理解完整的運作模型 | [Vision（英文）](docs/concepts/vision.md) |
| 查看系統與工程界線 | [Architecture（英文）](docs/concepts/architecture.md) |
| 安裝、導入或升級 Temple | [Usage guide（英文）](docs/getting-started/usage.md) |
| 讓多位人類與各自的 AI 協作 | [Collaborative development（英文）](docs/operations/collaboration.md) |
| 理解測試、驗證紀錄與發布準備 | [Evidence and Observer（英文）](docs/operations/evidence-and-observer.md) |
| 加入或建立工程方法 | [Capability catalog（英文）](docs/extensions/capability-catalog.md)與 [Skill authoring（英文）](docs/extensions/skill-authoring.md) |
| 理解學習與有意識的 Skill 升格 | [Engineering Learning Loop（英文）](docs/extensions/engineering-learning.md) |
| 查看目前限制與待完成驗證 | [Roadmap](docs/planning/roadmap.zh-TW.md)與[驗證紀錄（英文）](docs/validation/README.md) |

完整的[文件導覽（英文）](docs/README.md)也包含架構決策、貢獻方式、安全政策、版本紀錄、研究與試行證據。

## 人類授權必須保持清楚

Temple 負責協調版本庫內的工作，但不擁有商業事實、優先順序、憑證、重大支出、不可逆的外部操作、正式環境修復或高風險批准。外部系統可以提供工作資訊，但不會自動取得生命週期或發布的決定權。

## License

[MIT](LICENSE)。第三方來源與採用界線記錄在 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
