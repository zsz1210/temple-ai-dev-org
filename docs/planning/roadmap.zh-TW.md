# Temple 發展路線

[English](roadmap.md) | [日本語](roadmap.ja.md) | **繁體中文**

Temple 正在建立一套可靠、以儲存庫為核心、由人類掌握方向的 AI 開發組織運作方式。現在最重要的不是 Dashboard，也不是趕著發布版本，而是先讓這個開發組織從產品定義、交付、獨立審查、復原到學習，都能清楚而一致地運作。

最後檢視日期：2026 年 9 月 3 日。這份發展路線由 Temple 專案維護；當新證據改變方向，或目前階段達到完成條件時，就會重新檢視。

## 願景

無論是個人開發者、跨專業的小型團隊，或更大的組織，都能為 AI Agent 設定清楚的責任、安全地平行推進工作、不依賴舊對話就能恢復脈絡，並根據證據決定是否交付。

Temple 應依照工作規模與風險調整流程強度，而不是要求每個專案都啟動服務、使用特定設計工具、收集 Usage，或操作 Management Console。

## 如何閱讀這份發展路線

這裡描述的是成果與優先順序，不是任務清單，也不會替仍需要證據的未來工作承諾固定日期。

- **現在**只有一個主要任務，並附有可衡量的完成條件。
- **接下來**列出可能的下一階段；順序會依目前驗證結果調整。
- **之後**是信心較低、需要更多證據或新決策才會進行的方向。
- 詳細執行狀態放在儲存庫的 [Work Items](../../.ai-org/work-items/)。
- 實驗結果與適用範圍放在[驗證紀錄（英文）](../validation/README.md)。
- 版本變更放在 [Changelog（英文）](../../CHANGELOG.md)。
- 公開發布條件仍保留在[發布準備狀態（英文）](release-readiness.md)；它是暫停，不是刪除。

## 目前有證據支持的狀態

| 領域 | 現有證據 | 適用邊界 |
| --- | --- | --- |
| 核心運作模型 | 已實作，並完成數個範圍明確的本機演練 | 尚未取得正式營運或企業規模資格 |
| 乾淨環境導入 | 安裝、初始化、bootstrap 引導與 Doctor 的確定性流程已通過 | 尚未驗證全新 Agent 的理解，以及陌生使用者的真實導入 |
| 既有專案與多個儲存庫 | 本機 brownfield、復原與多儲存庫演練已在各自範圍內通過 | 尚未執行真實多人、多機器協作 |
| Workflow Profile | 已實作 Lean、Standard、High-Assurance 與確定性的升級條件 | 尚未由不同真人執行真實 High-Assurance 流程 |
| Execution Route | 已完成不綁 Provider、可分步驟、可解釋的確定性解析與輸入邊界強化 | 目前唯讀，不能啟動模型或套用建議 |
| 控制組交叉比較 | Wave 5A、5B 已取得機制、負擔與候選結果 | 結果尚不合格：Wave 5A 只有一組可比較樣本，Wave 5B 結論為 `inconclusive` |
| Provider 信任 | `WI-0033` 仍停留在 Spec | Temple 不建議從不受信任的儲存庫啟動 Provider |
| 公開發布 | 已有 private Alpha 候選版本與歷史發布證據 | `WI-0086` 仍為 blocked；公開不是現在的主線 |

`no-go` 與 `inconclusive` 都是有價值的實驗結果。Temple 會保留它們，但不會把它們當成尚未做完的實作，也不會改寫成框架有效的證明。

## 現在——讓核心流程真正可靠

目前的主要任務，是讓使用者即使不啟動 Management Console，也能理解並走完下列流程：

```text
定義產品與權限
  -> 建立範圍明確的工作並分派
  -> 設計與實作
  -> 測試與評估
  -> Independent QA 與發布判斷
  -> 恢復脈絡並保留學習
```

### 想達成的成果

1. **一條完整路徑。** 使用者只靠儲存庫與 CLI 契約，就能從專案初始化走到組織層級的結案。
2. **符合比例的流程。** 輕量工作維持 Lean，一般工作保留必要審查，只有高風險工作才增加更嚴格的程序。
3. **可靠的延續能力。** 新 task 能從儲存庫恢復責任、狀態、證據與下一個動作，不依賴舊對話標題或記憶。
4. **可以理解的執行選擇。** Position 權限、Capability、Workflow Profile，以及模型或工具建議維持分離且可解釋。
5. **先有證據，再做主張。** 測試、比較與導入演練都必須回答一個明確問題，並在原先定義的證據邊界停止。

### 完成條件

當儲存庫證據能證明以下事項，這個階段才算完成：

- 陌生使用者或全新的 Agent 不需要維護者的舊對話，也能完成文件中的核心流程；
- 相同流程至少在一個全新專案與一個既有專案成立；
- 平行工作、交接、Independent QA 與中斷復原仍能受到規則約束；
- 使用者看得懂 Workflow 與 Execution Route 為何這樣選，以及何時需要人類權限；
- 操作阻力、人工介入、重工、經過時間與可取得的資源用量，都以實測值或 unknown 呈現；
- 沒有 Console、Usage 觀測與外部整合時，核心流程仍然能運作。

眼前要做的是一次核心路徑走查：實際從頭走過 CLI 與儲存庫流程，找出缺少或重複的決策，依影響程度排序，只修正會妨礙上述成果的缺口。

## 接下來——用真實導入確認適用範圍

以下任務的實際順序，會由核心路徑走查結果決定。

### 陌生使用者導入

- 讓沒有參與 Temple 開發的人，各自嘗試一次全新專案與既有專案導入。
- 觀察他在哪裡需要維護者解釋、遺失狀態、誤解權限，或被迫執行不必要的流程。
- 只有重複出現並有證據支持的學習，才依既有升級規則轉成文件、Practice、Skill 或框架修改。

### 能產生結論的交叉比較

交叉測試已經開始，但比較**還沒有完成**。先前的測試證明 fail-closed 執行機制可以運作，也找出了多個協議缺陷。Wave 5B 的四個候選執行完成，並得到暫時性的資源差異；然而有效的盲測分數沒有成功凍結，因此 Work Item 正確地以 `inconclusive` 結束。

再次啟動模型前，Temple 會先完成以下準備：

- 明確指定實驗要支援哪一項決策；
- 選擇具有代表性的任務類型，不再只重複兩個 synthetic case；
- 將「Temple 對最小合理流程」和「模型對模型」視為不同的實驗變因；
- 事先固定輸入、工具、存取權、評分範圍、品質關卡、telemetry 欄位與停止條件；
- 在本機、不產生模型用量的情況下，先驗證實際 Provider 協議；
- 先定義什麼結果會導致修改框架、維持現狀，或放棄假設。

只有品質合格的配對可以進入資源比較。少量樣本可以診斷測試機制，不能證明普遍性的 Token、時間、成本、品質或重工改善。

### 組織與儲存庫規模

- 在各自獨立管理的環境中，執行真實多人、多機器協作。
- 以分開維護的儲存庫演練 federation，確認整合責任與衝突復原。
- 在前端、後端、infrastructure、設計、QA、SRE、Security 混合的團隊驗證，不把框架綁死在固定人數或職位組合。

## 之後——只在證據支持時擴充

- 等操作者掌握信任來源、精確協議契約與明確 autonomy boundary 都成立後，再加入 Provider 執行。
- 由不同 Human Principal 實際驗證 High-Assurance、復原損失，以及受監管或企業環境控制。
- 先量出確定性 context routing 的實際限制，再加入 semantic retrieval。
- 取得具代表性的 matched evidence 與安全 fallback 後，才考慮自動 Execution Route。
- 只有在儲存庫擁有者重新開啟公開決策，且同一候選版本通過保留的發布關卡後，才恢復公開發布準備。

## 它們是輔助工具，不是地基

- **Management Console：** 協助人類理解狀態的唯讀介面。沒有它也必須能使用 Temple。
- **Usage 觀測：** 用於歸因與分析的選用 Provider telemetry；沒有觀測到的數值是 unknown，不是 0。
- **本機 Observer 或 daemon：** 需要持續收集時才啟用，不是正式 Work Item、證據或復原的必要條件。
- **外部 tracker 與 integration：** 提供團隊協作介面，但不能取代 Temple 的 lifecycle authority。
- **Figma、RAG、本機模型與額外 Skill：** 都是可選擴充，不是所有專案的預設依賴。

## Roadmap 寫法依據

這份結構參考了三項公開原則：Roadmap 應說明成果與目前不做的事情；Roadmap 與實際執行 backlog 應該分開；越遠的未來，不確定性就應該越明確。參考資料包括 [UK Government Service Manual](https://www.gov.uk/service-manual/agile-delivery/developing-a-roadmap)、[GitHub Projects 文件](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects)，以及 [Atlassian 的 Agile Roadmap 指南](https://www.atlassian.com/agile/product-management/roadmaps)。
