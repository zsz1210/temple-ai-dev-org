# Changelog

## 0.1.0-alpha.7

- 以 FlowDeck 完成第一個 greenfield lifecycle pilot，並明確凍結為 Temple 驗證樣本，不延伸成正式產品。
- 新增 pilot retrospective，區分已證明的 init／product-definition／Build Quality／exact-revision closeout 與尚未證明的跨新 Codex task recovery、task registry、`$project-documentation`。
- 接受 ADR-0011，將 pilot purpose、stop condition、excluded follow-on work 與 closeout 後停止規則加入 installed instructions 和 operating contract。
- 記錄下一輪 Phase 1.5 hardening：unresolved resolution、candidate revision projection 與 CLI discoverability；不因一次 system fixture 摩擦擴張新的 Skills。
- 更新 roadmap、usage、capability catalog、Skill policy 與 scenario evidence，使狀態不再把 FlowDeck closeout 誤報為整個 Phase 1.5 已完成。

## 0.1.0-alpha.6

- 以 AiPet `WI-0001` 完成第二個既有 repository pilot：Simulator lifecycle、六項測試、四張 UI 證據、clean detached exact-revision Independent QA 與 release closeout。
- 將 Matt Pocock catalog 的開發能力整理為 Build Quality、Architecture、Review、Exploration、Git and Improvement 五個 optional pack；根據 pilot 選定 `tdd` + `diagnosing-bugs` 作為第一個 Temple-native 實作方向。
- 新增 `codebase-design` 與 `retro` 候選，並明確拒絕把過度寬廣、in-progress、Claude-specific 或 Node-specific Skills 當成通用核心。
- 新增 opt-in Build Quality pack，獨立實作 `$tdd` 與 `$diagnosing-bugs`；core init 預設不安裝。
- 新增 `temple pack list/install/remove`、pack manifest、`temple.lock` pack metadata 與 checksum-safe install、upgrade、re-init、remove 邊界。
- 驗證 dry-run 不寫入、衝突不產生部分安裝、修改過的 pack file 不被覆寫或移除，以及 pack scenarios 不與 core Skills 混淆。

## 0.1.0-alpha.5

- 保留 `project-documentation` 作為 Phase 1.5 core candidate，明確分離人類 README／專案文件與 AI-facing instructions，並記錄兩個外部參考實作的 pinned provenance 與 license。
- 將兩個重疊的訪談 Skills 合併為具 conversational 與 evidence-backed modes 的 `$decision-interview`，升級時只移除 checksum 未變的舊 managed Skill。
- 將 `$temple-work` 收斂為明確授權的 lifecycle mutation，並為 instructions、Position configs、decision 與 domain Skills 加入 read-only／persistence 權限邊界。
- 新增 canonical Skill registry、repository Skill 精確集合檢查、Skill scenario matrix 與升級移除測試。
- 保留 Matt Pocock 的 `research`、`resolving-merge-conflicts`、`wayfinder`、`triage` 與 OWASP security review 作為分層候選，不直接擴張核心安裝。

## 0.1.0-alpha.4

- Repository identity 改為 `temple-ai-dev-org`，中央安裝來源由 `template/` 改名為 `project-overlay/`，並保留舊 package identity 的升級相容性。
- 訪談 Skills 改為中性名稱 `$decision-interview` 與 `$evidence-backed-decision-interview`；upgrade 只會移除 checksum 未變的舊 managed Skill。
- 加入獨立實作的 `$domain-modeling` 與 project-owned domain glossary 範本，支援 Phase 1.5 的 ubiquitous language、boundary 與 invariant 工作。
- 加入 capability catalog 與 Skill design policy，保留 TDD、診斷、prototype、review 與 architecture candidates，不把整個外部 catalog 安裝到每個專案。
- 加入 MIT License、Matt Pocock Skills 的 pinned provenance、ADR-0008 與開源採用邊界。

## 0.1.0-alpha.3

- Roadmap 加入 Phase 1.5 Greenfield Project Bootstrap Pilot，安排在 AiPet 可攜性驗證後、Phase 2 營運 MVP 前。
- 明確分離中央工具名稱與專案身份：Temple 保留為 CLI 與技術 namespace，project-facing 文字改用專案名稱或 AI 開發組織。
- 狀態頁、operating contract、instructions、Skills、Agent 說明與 release closeout 採 project-native wording。
- 加入 ADR-0007，記錄相容性識別與專案語言的長期邊界。

## 0.1.0-alpha.2

- 加入 `work-item create`、`handoff`、具名 gate `transition` 與 `close` CLI。
- 加入 Codex task/thread registry、穩定標題建議、revision、attention 與 archive readiness。
- Canonical mutation 使用短時 project lock，避免並行 CLI process 遺失 work item、event 或 task 更新。
- `status` 升級為 v2，包含 work item owner、Agent、task、最近事件與觀測訊號。
- 加入 checksum-aware `upgrade`；managed conflict 在寫入前停止，project-owned state 保留。
- 加入 `$temple-work`、release record、manager closeout 與 task registry 範本。
- 以 English Learning Inbox Safari Share Extension 完成第一張真實低風險 pilot。

## 0.1.0-alpha.1

- 建立 Position、Agent Identity、Assignment 三層模型。
- 加入 `init`、`doctor`、`status` CLI。
- 加入兩個可攜式 grill skills 與九個 Codex Position 設定。
- 加入 managed、project-owned、generated 邊界及 `temple.lock`。
- 加入 Archify 選配 Adapter 合約、測試與 CI。
