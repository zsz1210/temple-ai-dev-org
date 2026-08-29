# Roadmap：從 Toolkit 到可日常觀測的 AI 開發組織

這些是工程階段與 Exit Gate，不是日期承諾。只有上一階段的證據成立，才擴張自動化。

## Phase 1：可安裝、可操作的組織骨架（本版本）

目標：任何 repository 都能取得同一套 Position、身份模型、工作流與檢查，不依賴聊天標題。

交付：

- 中央 Toolkit repository、MIT License 與第三方 provenance。
- `init`、checksum-aware `upgrade`、`doctor`、`status` 與 `temple.lock`。
- 九個 Position、專案首次 init 命名、五 Identity 精簡配置。
- managed / project-owned / generated 邊界。
- decision interview、domain modeling、Decision Ledger、ADR 與 handoff/QA 範本。
- Archify 的 opt-in Adapter 合約。
- Sample Project、CI 與無覆寫測試。
- Work item、handoff、transition、close CLI 與 named gate evidence。
- Codex task registry、穩定標題建議、revision、attention 與 archive readiness。
- English Learning Inbox 的真實 Safari Share Extension pilot。

Exit Gate：乾淨與既有 repository 都能初始化；九個 Position 可觀測；Developer/Independent QA 分離；重跑不覆寫；關閉聊天後能從檔案恢復組織狀態。

## Phase 1.5：Greenfield Project Bootstrap Pilot

目標：從一個尚未整理的產品點子開始，建立全新 private repository、完成產品與技術基線，並交付第一個可獨立驗證的垂直切片；使用者不需要重新設計一次開發組織。

進入條件：先以 AiPet 完成第二個既有 repository 的可攜性驗證，確認目前骨架不只適用於 English Learning Inbox。

預定交付：

- 從模糊點子到 Project Charter：問題、目標使用者、預期成果、non-goals、constraints、success criteria 與重要未知。
- 以 `$domain-modeling` 建立 ubiquitous language、bounded contexts、重要規則與 invariants，並把未解 terminology conflict 留給明確 owner。
- Product Manager、UX Designer 與 Tech Lead 對核心流程、技術基線、風險和第一個垂直切片完成具證據的 review。
- 在新 private repository 內執行首次 init，由使用者確認五個 Agent Identity 名字與九個 Position assignment。
- 產品決策、ADR、initial roadmap、acceptance criteria 與第一張 durable work item 都保存在新 repository，不依賴創始對話。
- 第一張 work item 完成 Spec → Design → Build → Test → Eval → Independent QA → Release Gate。
- 以新的 Codex task 只讀 repository canonical state 後接續工作，驗證換對話仍能恢復產品意圖與組織狀態。
- 專案面向的 instructions、status 與 artifacts 使用專案名稱或「本專案的 AI 開發組織」；`Temple` 只保留在中央工具品牌、CLI、Skill ID、schema、lock 與相容性識別。

Exit Gate：一個非範例、可回復、不碰 production 的全新產品 repository 從點子走到第一張 work item closeout；Developer 與 Independent QA 驗證同一 revision；新的對話不需使用創始聊天即可接續；使用者沒有手動重建 Position、交接或觀測機制。

AiPet portability pilot 同時評估 `tdd`、`diagnosing-bugs` 與 `prototype` 哪一項最適合成為第一個 optional Skill pack；未通過真實 work item 與獨立 QA 前不預設安裝。

## Phase 2：營運 MVP

目標：在已驗證的 lifecycle CLI 上加入範圍衝突、外部證據 Adapter 與更強的 Observer。

預定交付：

- affected-path ownership 與重複 active scope 警告。
- 更完整的 JSON Schema runtime validation 與 migration registry。
- exact Git revision、test、runtime、unverified、risk、rollback evidence adapter。
- timeline、staleness 與 approval-pending Observer projection。
- Archify adapter 的隔離安裝、provenance 與降級測試。
- 本機唯讀 Overview：active、blocked、QA pending、approval pending。

Exit Gate：至少一張真實、可回復、不碰 production 的 work item 完成全流程；兩張並行 work item 不互相覆寫；所有 gate 可追溯到 actor、revision 與 evidence。

## Phase 3：即時控制面

目標：不必逐一打開 Codex tasks，也能看到進度、失敗與等待批准的事項。

預定交付：

- Codex task/turn/tool event correlation 與 replay-safe ingestion。
- Live dashboard：Agent activity、plan、diff、test、QA、release gate。
- stalled、orphan、scope conflict、evidence stale 與成本異常警示。
- Human Inbox：批准、拒絕、補充商業事實，並寫回 canonical approval record。
- GitHub PR/Checks read-only evidence adapter。

Exit Gate：事件在合理延遲內顯示；重連不重複 gate 或遺失 canonical state；中斷/失敗能正確變成 blocked；批准能被看見、記錄並約束後續執行。

## Phase 4：可靠性與多專案日常使用

目標：從單一 pilot 提升到每天可依賴的個人企業級開發組織。

預定交付：

- backup/restore、event checksum、migration 與 crash recovery。
- policy/eval suite：假完成、錯 revision、自我驗收、未批准外部操作、重工。
- 多 repository registry，但各專案仍保留 project-local canonical truth。
- Portfolio read-only view、容量與成本聚合。
- secrets redaction、資料保留、audit export、通知節流。
- Template `upgrade` 的 migration rehearsal 與 rollback。

Exit Gate：至少十張不同類型 work item 完成；政策違規測試都被阻止或升級；乾淨環境可以從備份恢復；使用者能透過 Overview 與 Human Inbox 管理日常工作。

## Phase 5：企業系統整合（選配）

只有在 Phase 4 證明流程有效後才加入 issue tracker、CI/CD write actions、組織 RBAC、遠端 worker、集中 audit store、Slack/Email 通知與跨團隊 portfolio。外部系統不得取代 project-local truth 或 Human Approval 邊界。

## 第一個 pilot 選擇條件

- 1–3 個可觀察 acceptance criteria。
- 能在本機、測試環境或 Simulator 驗證。
- 不涉及帳務、正式資料、production deploy 或外部通知。
- affected paths 明確、可回復、可以保存 exact revision。
- 足以走完 Spec → Design → Build → Test → Eval → Independent QA → Release Gate。

## 每一階段都追蹤的成效

- 重複 active scope 次數。
- 因脈絡遺失造成的返工次數。
- 沒有 evidence 的完成聲明比例。
- handoff 後重新理解工作所需時間。
- blocked 與 approval pending 的可見時間。
- Developer 與 Independent QA 身份分離率。
