# Roadmap：從可導入的框架走向可觀測的 AI 開發組織

[English](roadmap.md) | [日本語](roadmap.ja.md) | **繁體中文**

英文版是正式版本；日文與繁體中文翻譯會持續維護，讓更多使用者可以理解內容。

這裡列出的是工程階段與退出門檻，不是日期承諾。只有在前一階段具備相應證據後，才擴大自動化範圍。

目前已實作的框架版本為 `0.1.0-alpha.22`。Phase 1 到 Phase 3 已具備範圍明確的退出證據，[Closeout-0A](validation/closeout-0a-release-integrity.md) 與 [Closeout-0B](validation/closeout-0b-live-and-upgrade.md) 也已排除進入 Phase 4 前的 blocker。現在可以開始 Phase 4 的研究與 ADR，但仍須明確保留尚未完成的大規模與正式環境驗證。

## 貫穿整個框架的開發軌道

每個階段都推進相同的六個層次：產品意圖、組織與權限、工程方法、工作編排、驗證與交付，以及持久狀態與可觀測性。框架透過有證據支持的 profile 與 extension 擴展規模，而不是宣稱同一套固定流程已經適合所有專案。

Engineering Learning Loop 是貫穿各階段的軌道。Alpha.10 建立了專案自有的 Lesson 與 Practice；Alpha.19 加入 atomic CLI mutation、重新驗證訊號、明確 migration，以及決定性的 retrieval 評估。後續自動化仍需要真實證據：retrospective Skill、自動升級、定期回顧、已設定的 semantic retrieval，以及保護 privacy 的跨專案提升機制，目前仍在規劃中。

Capability 軌道從一組精簡 core、一個 opt-in Build Quality pack、專案自有 Skills，以及 Alpha.12 產生的 Capability Registry 開始；Registry 可以觀察 repository Skills，但不會奪取 extension 的所有權。Alpha.19 加入 Pack manifest v2，可處理多檔案組合、dependency、provenance、compatibility，以及隔離的 Archify adapter lifecycle。Architecture、review、exploration、Git 與 improvement、security pack、custom pack 發布、通用 third-party Skill 安裝，以及 model routing 自動化，仍需經過範圍明確的 pilot。

UI design 軌道從正式定義 UI Designer Position，以及 `not-applicable`、code-first、preview-first、design-led 四種明確結果開始。Alpha.14 會在每個 Work Item 記錄選擇，並在需要時固定已核准的 UI contract revision。Figma 仍是選用工具。Project profile 預設值、design source adapter、token 同步與 visual regression 整合，仍需後續驗證。

Product specification 軌道從 Alpha.14 的專案自有 authority registry、具有 revision 的 Work Item reference、contract-guided iterative delivery，以及 federated、hybrid 或 Temple-native 文件導入方式開始。外部同步、semantic contract validation 與組織特有的 approval adapter 不在目前實作範圍內。

Task coordination 軌道從 Alpha.15 的專案自有 tracker contract、明確分層的 company／Work Item／Codex task、可設定的 visibility 與 granularity、範圍有限的 GitHub Issues read adapter、正規化的人工 observation、conflict plan，以及以證據為基礎的 repository reconciliation 開始。外部寫入、Jira live access 與自動雙向同步不在目前實作範圍內。

Parallel orchestration 軌道從 Alpha.16 的決定性 group planning、對 dependency 與 conflict 安全的 wave、選用 capacity limit、plan-only dispatch manifest、source fingerprint staleness，以及 Integration Owner join gate 開始。CLI 保持 runtime-neutral，不會建立 task 或進行 claim。真實多人、多機器 dispatch 與 Git hosting contention 仍是保留驗證，不會被描述成已完成的 production 能力。

## Phase 1：可安裝、可運作的組織 skeleton（基礎已交付）

目標：讓任何 repository 都能擁有相同的 Position、identity model、workflow 與檢查，不依賴 chat title。

交付內容：

- 中央 framework repository、MIT License 與 third-party provenance。
- `init`、checksum-aware `upgrade`、`doctor`、`status` 與 `temple.lock`。
- 十個 Position、專案第一次初始化時命名，以及精簡的五個 Identity 設定。
- managed、project-owned 與 generated 邊界。
- Decision interview、domain modeling、受治理的 project Skill authoring、Decision Ledger、ADR、handoff 與 QA template。
- Opt-in Archify adapter contract。
- Sample project、CI 與 no-overwrite tests。
- 具備具名 gate evidence 的 Work Item、handoff、transition 與 close CLI command。
- Codex task registry、穩定的 title suggestion、revision、attention signal 與 archive readiness。
- Project-owned Engineering Learning index 與 record、managed Lesson／Practice template、doctor validation 與 status count。
- UI Designer、tool-neutral UI delivery-mode policy、UI design brief template，以及向後相容的 Assignment migration。
- Project-owned Context Map、產生的 Capability Registry 與 Work Item Context Capsule、決定性 Retrieval Provider contract，以及 affected-path overlap warning。
- Project-owned specification index、具 revision 的 product／UX／UI／API／technical reference、contract-guided iterative delivery、enterprise document adoption guide 與 stale reference enforcement。
- Project-owned external tracker 設定、team-visible 與 internal Work Item mapping、範圍有限的 observation、明確 field ownership、reconciliation evidence、doctor／status／context projection，以及 read-only GitHub Issues adapter。
- 具有 safe wave、plan-only manifest、stale plan observation、runtime fallback 與 Integration Owner join gate 的 group parallel plan。
- 一個真實的 English Learning Inbox Safari Share Extension pilot。

退出門檻：全新與既有 repository 都能完成初始化；十個 Position 都可被觀測；Developer 與 Independent QA 保持分離；重複執行不會覆寫；關閉 chat 後仍能從檔案恢復組織狀態。

## Phase 1.5：Greenfield project bootstrap pilot（退出門檻已完成）

目標：從尚未結構化的 product idea 建立新的 private repository，確立 product 與 technical baseline，並交付第一個可獨立驗證的 vertical slice，而不需要使用者重新設計開發組織。

AiPet `WI-0001` 的既有 repository portability validation 已滿足進入條件。

Private FlowDeck pilot 完成內容：

- 第一次初始化新的 private repository，由使用者確認五個 Agent Identity 名稱與九個 Position Assignment。
- 從模糊 idea 建立 Project Charter、domain language、core flow、technical baseline、ADR、acceptance criteria 與第一個持久 Work Item。
- 第一個 Work Item 完成 Spec -> Design -> Build -> Test -> Eval -> Independent QA -> Release Gate。
- Build Quality pack 在真實 iOS vertical slice 中保存 red／green 與 diagnosis evidence。
- 精確 candidate revision 通過 automated test、Simulator system integration、Independent QA 與 clean checkout closeout。
- Project-facing instruction、status 與 artifact 使用 project name 或「this project's AI development organization」。`Temple` 僅保留於中央 framework brand、CLI、CLI 特有 Skill ID、schema、lock 與 compatibility identifier。
- Pilot 依照 [ADR-0011](adr/0011-pilot-stop-boundary.md) 凍結；sample app 不會繼續擴展為正式 product。
- Alpha.8 加入 unresolved item 的 exact-match listing、resolution、merge、deduplication、Developer handoff candidate-revision projection，以及可複製的 post-init doctor／status command。
- Alpha.8 也安裝獨立實作的 `$project-documentation` core Skill。針對三語 public README 的 read-only forward test 找出並修正 stale capability state、prerequisite、verification、repository visibility 與 revision wording。
- Alpha.9 加入並 forward-test core `$skill-authoring` procedure、public project-extension contract、四種 distribution class，以及 exact-path protection，避免未追蹤的 project Skill 在 init、pack installation 或 upgrade 時被默默接管。
- Alpha.10 建立最小化 Engineering Learning Loop 基礎，不安裝 retrospective Skill 或自動 promotion workflow。
- Alpha.11 加入 UI Designer，以及 risk-scaled、tool-neutral UI delivery mode，不要求所有 project 先使用 Figma 或製作實作前 mockup。
- Alpha.12 加入決定性的 Progressive Context Routing、不轉移 ownership 的 project Skill discovery、範圍有限的 Context Capsule，以及 affected-path overlap warning。Semantic 或 hybrid retrieval 保持為 adapter boundary，而不是預設 dependency。
- Alpha.12 的 local 與 CI evidence 保存在 [Progressive Context Routing validation record](validation/alpha-12-progressive-context-routing.md)；真實專案 cross-task recovery、multi-maintainer behavior、大型 repository retrieval quality 與 semantic provider 仍未驗證。
- Alpha.13 加入 Collaborative 基礎：Human Principal、Agent sponsorship、具 Discipline 的 Position pool、不易碰撞的 Collaborative Work Item ID、parent／dependency／contract field、決定性 parallel readiness、Principal-backed claim、upgrade migration，以及 status／doctor observability。
- Alpha.13 的範圍化 local evidence 保存在 [Collaborative foundation validation record](validation/alpha-13-collaborative-foundation.md)。
- Alpha.13 的 local automated evidence 不會取代保留的 [large-scale real-environment test](validation/collaborative-large-scale-test-plan.md)。多人、多機器與 Git hosting behavior 明確維持 `not_run`。
- Alpha.14 加入 product specification authority 與 revision contract、enterprise document adoption mode、Work Item specification reference、明確 no-UI handling、tool-neutral interaction contract、doctor／status／context observability，以及 upgrade-safe project-owned seeding。
- Alpha.15 加入 task 與 tracker coordination model：分離 company planning、repository Work Item 與 Codex session；保留 AI-only child decomposition；設定 mapping granularity；inspect GitHub Issue 或 supplied observation；規劃 conflict；在不進行外部寫入的情況下記錄 evidence-backed repository reconciliation。
- Alpha.16 加入 group-level parallel planning、決定性 safe wave、明確 runtime capacity handling、plan-only dispatch manifest、source-fingerprint staleness、Context Capsule routing 與 Integration Owner join gate，且不把 CLI 變成 task runtime。
- 保留的 IdeaDock test 從尚未結構化的 idea 建立新的 private product，在實作前停止起始 task，並要求新的 Codex task 在沒有先前 chat summary 的情況下，從 repository state 恢復上下文。
- 新 task 重建 product intent、organization、specification、Work Item、plan、acceptance、ownership 與 stop boundary；使用真實三個 worker 的 first wave；join 精確 candidate revision；重建 stale plan；針對同一 revision 完成獨立的 Quality Evaluation 與 Independent QA。
- IdeaDock 關閉全部五個 Work Item，Developer、Quality Evaluation 與 Independent QA 為 28/28，doctor 為 27/27，沒有 active claim，也沒有 production release。Product 在 first slice 後凍結。
- 範圍有限的結果保存在 [Greenfield cold-task recovery result](validation/greenfield-cold-task-recovery-result.md)。它沒有驗證 clean-host CLI bootstrap、internal subagent 的 user-owned task record、stage-specific discipline rule、共享 Simulator scheduling，以及多人、多機器執行。

Phase 1.5 退出門檻已完成：

- 新的非 example product 從 idea 推進到 first-slice closeout；Developer 與 Independent QA 驗證同一個精確 revision；新 conversation 在沒有起始 chat 的情況下繼續；使用者不需要手動重建 Position、handoff 或 observation mechanism。
- FlowDeck 維持凍結。IdeaDock 也會停在已宣告的 experiment boundary，除非收到新的明確 product request。
- 保留的 [large-scale real-environment test](validation/collaborative-large-scale-test-plan.md) 仍為 `not_run`，Phase 1.5 完成不代表它已完成。

退出門檻：一個不接觸 production、全新、非 example 且可恢復的 product repository，從 idea 推進到第一個 Work Item closeout；Developer 與 Independent QA 驗證同一 revision；新 conversation 不依賴起始 chat 仍可繼續；使用者不需手動重建 Position、handoff 或 observation mechanism。

完整結果與 gap 請參考 [FlowDeck Greenfield Pilot Retrospective](pilots/flowdeck-greenfield-retrospective.md)。AiPet 與 FlowDeck 都可保留 opt-in Build Quality pack，但這個 pilot 不足以證明其他 candidate Skill 應直接加入。

## Phase 2：Operational MVP

目標：在 Alpha.16 的 collaboration、routing、specification、tracker 與 group orchestration 基礎上，進一步強化 scope coordination、external evidence adapter 與 Observer。

現有基礎：

- Non-terminal Work Item 之間的 affected-path overlap warning。
- 可觀察 project 與 third-party Skill、但不會奪取檔案 ownership 的 project Capability Registry。
- Project-owned Context Map、產生的 Context Capsule，以及具有未來 semantic-adapter contract 的決定性 Retrieval Provider。
- Solo 與 Collaborative profile selection、Human Principal sponsorship、具 technical Discipline 的 Position pool、範圍有限的 work claim，以及決定性 parallel-readiness check。
- 具有 safe wave、plan-only dispatch manifest、stale-plan detection 與 Integration Owner join gate 的決定性 group planning。
- 具有 revision-pinned Work Item contract 與 stale-reference blocking 的 project-owned specification authority registry。
- Team-visible Work Item mapping、受保護的 field ownership、範圍有限的 GitHub Issues observation adapter、產生的 conflict plan，以及明確 repository reconciliation。

已交付 increment：

### Phase 2A — Recoverable runtime coordination（`0.1.0-alpha.17`）

- 提供 repository-visible、version-pinned CLI launcher，帶有精確 clean-source Git recovery metadata，且沒有未指定版本的 global fallback。
- 提供 stage-specific Discipline 與 shared-resource requirement、capacity-aware wave，以及可觀測的 reservation。
- 提供具 rollback 的 atomic claim-before-worker preparation、已驗證 first wave 的逐 entry continuation，以及 stale 或 edited plan rejection。
- 分離 internal subagent 與 user-owned Codex task 的 runtime correlation。Worker completion 會釋放 resource，但不會偽造 lifecycle progress。
- Local test 涵蓋已宣告的 process boundary。真實 multi-machine Git 與 pull-request contention 仍為 `not_run`。

### Phase 2B — Evidence and Observer surface（`0.1.0-alpha.18`）

- 提供精確 Git revision、supplied test 與 runtime observation、明確 unverified claim、risk 與 rollback 的 local evidence adapter。
- 提供 lifecycle timeline、evidence staleness、pending approval 與 recovery-oriented attention signal 的 Observer projection。
- 提供 active、blocked、QA-pending、approval-pending 與 queued work 的 local read-only overview。
- 將 external write、command execution 與 live production action 保留為明確 authorization boundary。

### Phase 2C — Extension and retrieval maturity（`0.1.0-alpha.19`）

- 提供可處理 reference、script、asset、declared dependency、provenance 與 compatibility metadata 的 Pack manifest v2。
- 提供 Draft 2020-12 runtime validation，以及不會默默重寫既有 project-owned data 的明確 migration registry。
- 提供 atomic Learning CLI mutation、明確 v1-to-v2 migration、Practice revalidation signal、Observer attention 與決定性 retrieval-quality evaluation。
- 提供隔離的 clean-local-source Archify installation、精確 provenance、封閉的逐檔 digest set、drift detection，以及未安裝時的 graceful degradation。
- 提供 selectable High-Assurance risk contract，具備 human-accountability prerequisite 與 risk-scaled artifact、UI、normalized evidence、rollback、approval gate，同時維持十個 Position 的責任。既有 High-Assurance Work Item 在後續 profile change 後仍保留原 contract。
- 提供保護 privacy、可注入且具 deterministic fallback 的 local-hybrid Retrieval Provider boundary。預設仍不安裝 model、embedding、vector database、daemon 或 remote retrieval service。

保留的 evidence work：

- 在真實 multi-machine Git 與 pull-request contention 下驗證 affected-path coordination 與 resolution state。
- 在宣稱 production readiness 前，以真實 project corpus 評估大型 repository retrieval quality 與任何 local hybrid provider。

Local 退出門檻：已透過 recoverable lifecycle pilot、決定性 parallel regression case、normalized evidence 與 exact-revision High-Assurance closeout 完成。上述真實 multi-machine 與大型 repository case，在提出更廣泛的 production-readiness claim 前仍須完成。

## Phase 3：Real-time control plane

目標：不需要逐一打開每個 Codex task，也能看到進度、失敗與 pending approval。

已接受的 [Phase 3 design](phase-3-control-plane.md) 與 [Work Item breakdown](phase-3-work-items.md) 會分離 canonical project state、generated local telemetry 與 disposable view；誠實呈現 provider capability；並維持 runtime permission、business fact 與 governance approval 的 authority separation。Phase 3A、3B 與 3C 已在 local 交付，且明確保留限制。

已交付 increment：

- **Phase 3A — Event spine and provider foundation（`0.1.0-alpha.20`，已在 local 交付）：** versioned normalized event、Git-common-dir replay journal、cursor 與 checkpoint recovery、provider capability contract、repository 與 fixture provider、redaction、single-writer lease、rebuild archive，以及 read-only HTTP／SSE。
- **Phase 3B — Live Observer, Codex adapter, and alerts（`0.1.0-alpha.21`，已在 local 交付）：** provenance-aware live view、已固定並驗證 capability 的 Codex App Server adapter、disconnect reconciliation，以及 stateful actionable condition。
- **Phase 3C — Human Inbox and GitHub evidence（`0.1.0-alpha.22`，已在 local 交付）：** authority-separated request、policy-checked idempotent command gateway、runtime-request bridging、明確 business-fact incorporation、revision-bound Human Principal approval，以及具 explicit evidence capture 的 exact-SHA read-only GitHub PR／Checks adapter。

Phase 3 不承諾能 live access Codex Desktop 內所有已執行 task。Registered 或 unsupported task 會誠實標示為 snapshot-only、registered-only 或 unknown，除非有 documented 且 tested provider 證明更強能力。

Local 退出門檻：已透過 replay、reconnect、authority separation、exact revision、idempotency、provider failure、browser 與 deterministic GitHub adapter evidence 完成。經明確 authorization 的 live GitHub PR run、long-duration soak、所有 persistence boundary 的 crash test、remote access 與大型 multi-machine operation，仍是保留工作，不會被暗示為 production readiness。

## Phase 4：Reliability and everyday multi-project use

目標：從單一 pilot 前進到每天都能信任使用、適合個人的 enterprise-grade development organization。

Closeout-0 已完成：release reproducibility、範圍有限的 live Phase 3 check 與 data-bearing upgrade rehearsal 都已通過。Phase 4 的研究與 ADR 已可開始。Durability／recovery 與 multi-repository authority contract 必須先獲得接受，才能實作對應的 schema 或 feature；不得把仍保留的大規模或 production check 描述成已完成。

規劃交付內容：

- Backup 與 restore、event checksum、migration 與 crash recovery。
- 涵蓋 false completion、wrong revision、self-approval、unauthorized external operation 與 rework 的 policy／evaluation suite。
- 在每個 project 保留 project-local canonical truth 的 multi-repository registry。
- 具 capacity 與 cost aggregation 的 read-only portfolio view。
- Secret redaction、data retention、audit export 與 notification throttling。
- Framework `upgrade` 的 migration rehearsal 與 rollback。

退出門檻：至少完成十個不同類型的 Work Item；每個 policy-violation test 都被 block 或 escalated；clean environment 能從 backup 恢復；使用者能透過 Overview 與 Human Inbox 管理日常工作。

## Phase 5：Enterprise-system integration（選用）

只有在 Phase 4 證明 workflow 後，才加入經核准的 issue tracker write action、更豐富的 provider adapter、CI/CD write action、organizational RBAC、remote worker、centralized audit store、Slack 或 email notification，以及 cross-team portfolio。外部 system 不得取代 project-local truth 或 Human Approval boundary。

## 第一個 pilot 的選擇條件

- 一到三個可觀測 acceptance criteria。
- 可在 local、test environment 或 Simulator 驗證。
- 不包含 billing、production data、production deployment 或 external notification。
- Affected path 明確、變更可恢復，且能保存精確 revision。
- Scope 足以完成 Spec -> Design -> Build -> Test -> Eval -> Independent QA -> Release Gate。
- Specification 必須說明 experiment purpose、stop condition，以及不會自動獲得 authorization 的 follow-on work。Closeout 後依 ADR-0011 停止。

## 每個階段都追蹤的 metric

- 重複 active scope 的數量。
- 因 lost context 造成的 rework incident 數量。
- 沒有 evidence 的 completion claim 比例。
- Handoff 後理解工作所需時間。
- Blocked 與 approval-pending state 維持可見的時間。
- Developer 與 Independent QA 的 Identity separation 比率。
