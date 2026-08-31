# Temple roadmap

[English](roadmap.md) | [日本語](roadmap.ja.md) | **繁體中文**

Temple 正在從已通過 local 驗證的 AI Development Organization Framework，走向能在多個真實專案裡被日常信任與使用的階段。這份 roadmap 只描述方向與 exit evidence；各版本歷史放在 [Changelog（英文）](../../CHANGELOG.md)，詳細證據放在 [Validation records（英文）](../validation/README.md)。

## 目前位置

- **目前 release line：** `0.1.0-alpha.28`
- **目前階段：** Phase 4 的 local implementation 與 bounded exit rehearsal 已完成；enterprise 與 statistical qualification 保留為後續驗證
- **現在適合：** 有人類監督的個人、小型團隊與 bounded multi-repository local workflow
- **尚未宣稱：** production-grade distributed coordination、regulated operation 或無人監督的外部操作

## 已交付的基礎

前三個 phase 已建立 framework 的主要運作方式：

- 不需要 fork framework，即可導入全新或既有專案。
- 將十個穩定 Position 與專案自己的 Agent Identity、Assignment 分開。
- 把 product specification、decision、Work Item、handoff、learning 與 evidence 保存在 repository-owned state。
- 提供可觀測的 `Spec → Design → Build → Test → Eval → Independent QA → Release Gate` lifecycle。
- 提供 Solo、Collaborative 與 High-Assurance profile，並保留明確的人類問責邊界。
- 不需讀取整個 repository，也不預設啟用 semantic retrieval，就能取得 bounded context 與可能適用的 Skill。
- 協調 dependency-safe parallel wave、affected path、claim、shared resource、runtime worker 與 integration join。
- 將公司 tracker、Temple Work Item 與 Codex task 維持為不同層，透過明確 reconciliation 連接。
- 用 static 與 local live view 觀測 exact-revision evidence、stale claim、approval、risk 與 recovery。
- 以清楚的 ownership、provenance、migration 與 rollback 邊界擴展 project-owned Skill 和 optional Pack。

詳細 release 順序不再重複寫在這裡。請查看 [Changelog（英文）](../../CHANGELOG.md)、[ADR index（英文）](../adr/README.md) 與 [Validation index（英文）](../validation/README.md)。

## Now — 讓 Temple 容易理解並值得依賴

眼前優先工作，是讓開發者不需要先閱讀整個專案歷史，就能導入與操作已被驗證的 local foundation。

### Public usability 與 release integrity

- 維護以人為主的三語 README 與分類清楚的 documentation map。
- Roadmap 專注未來方向，history 交給 changelog 與 validation record。
- 使用 change-aware CI：documentation change 執行 repository check，behavioral change 執行 complete suite。
- 使用 lockfile-strict dependency 與 clean-source recovery，確保安裝可重現。
- Public package 發布前，先定義支援的 Node.js 與 operating-system matrix。
- 檢查 package contents、security reporting、contribution guidance 與 public branch protection。

### Durability 與 recovery

- Alpha.24 已提供 local versioned backup manifest、完整 payload verification、stale-safe restore preview，以及可恢復的 multi-file apply，範圍只涵蓋 project-owned Temple state。
- Generated view 維持可重建；framework-managed file、application source 與 data、external system、control-plane telemetry 都不在這份 backup 邊界內。
- Alpha.27 加入 digest-bound retention preview／apply、redacted audit export，以及使用 AiPet disposable copy 得到的 exact rollback 與 interrupted-recovery evidence。Physical power loss、filesystem corruption、remote transport、production recovery 與其他 operating system 仍是保留中的驗證。

### 日常運作訊號

- Alpha.25 提供適用 Solo、Collaborative 與 High-Assurance fixture 的七項 adversarial policy scorecard；Alpha.26 加入誠實的 live usage preflight；Alpha.27 將 qualification 與 attach-outcome contract 接到可操作介面，但不製造觀測資料。目前 self-host 結果仍是 not-qualified、detailed live observation 為零，因此不宣稱 Token、cost、quality 或 routing 改善。
- 將 provider usage 歸因到可證明的 Work Item、Position、observed stage、task、attempt、provider、model 與 outcome；無法取得的資料和 monetary cost 維持 unknown。
- 定義低噪音的 duplicate scope、lost context、stale evidence、rework、blocked time 與 verification quality historical 指標。
- 讓 usage 與 cost 可見，但不授予 framework spending authority 或 automatic model switching。
- 讓 Human Inbox 與 Observer attention 可以被採取行動，但不把它們變成第二套 tracker。

## Next — 驗證更廣泛的環境與重複成果

Alpha.27 已完成 bounded local Phase 4 implementation。以下保留測試用來驗證更廣泛的環境與更強的宣稱；fixture 或新增 feature 不能取代它們。

- 在宣稱 longitudinal Token baseline 或 savings 前，蒐集至少十個可正確 correlation、形態多樣且已完成的 Work Item。
- 使用 physical 或 process-level failure、另一個支援的 operating system，以及明確授權的 production-like environment 重複 disaster recovery。
- 在真實且分開維護的 repositories 上演練 project-owned federation 與 read-only portfolio，同時不集中 credential 或 business truth。
- 以真實 branch、pull request、protected rule、CI、conflict 與 integration ownership 執行保留中的大型 multi-human／multi-machine test。
- 宣稱 production-readiness 前，先執行明確授權的 live provider、soak、disconnect 與 crash-recovery validation。

## Later — 選用的 enterprise integration

只有在相關的保留驗證完成後才考慮：

- 對 Jira、GitHub、Linear、Asana 或其他 tracker 的已核准 write action。
- 具備明確 authorization、preview、rollback 與 audit evidence 的 CI/CD 和 deployment action。
- Organizational RBAC、remote worker、centralized audit export 與 cross-team portfolio。
- 負責 production observability、incident coordination、vulnerability handling、policy evidence 與 operational risk review 的 optional SRE / Security responsibility。
- 在任何 remediation 或 deployment action 之前，先提供 read-only production telemetry 與 alert-provider adapter。
- 具備 throttling、privacy 與 responsibility boundary 的 Slack、email 或其他 notification。
- 在 deterministic routing 不再足夠的 repository 中，評估 semantic 或 local-model retrieval。

External system 不得取代 project-local truth 或 Human Approval boundary。

## 刻意不設為 default 的項目

Temple 不會只因為流行，就把這些能力放入 core：

- 安裝所有 candidate engineering Skill。
- 強制使用 Figma 或其他 design vendor。
- 強迫小型 project 使用 RAG、vector database、local model 或 daemon。
- 把 external tracker status 當成 release authority。
- 在 task boundary 不乾淨時，建立無限制的 Agent task 或 parallel work。
- Pilot app 已回答驗證問題後，仍把它當正式產品繼續開發。

## 成功衡量方式

當以下情況持續增加，代表 Temple 正在進步：

- 新 Agent 不需要原始 chat，就能恢復 current project state。
- Work Item overlap 與 unsafe parallel plan 在編輯衝突前被發現。
- Completion claim 指向可重現的 exact-revision evidence。
- Developer 與 Independent QA 維持實質分離。
- Project-owned files 能通過 init、upgrade、extension install、rollback 與 failure 而被保留。
- 人類不必閱讀所有 Agent conversation，也能理解 active work、decision、risk 與 approval。
- Framework 減少的是 rework 與 coordination cost，而不只是產生更多 artifact。
