# FlowDeck Greenfield Pilot Retrospective

- Pilot type: Phase 1.5 greenfield bootstrap
- Date: 2026-08-29
- Product disposition: frozen validation sample
- Production or external release: not performed

## Experiment purpose

驗證使用者提出一個尚未定義的產品點子後，Temple 能否在新的 private repository 內建立五個 Agent Identity／九個 Position 的組織，完成產品定義、技術設計、第一個 bounded vertical slice、測試、評估、Independent QA 與 release closeout，而不需要重新設計一套開發組織。

FlowDeck 不是 Temple roadmap 上要持續開發的產品。Pilot 的 stop condition 是第一張 work item 完成 exact-revision closeout 並留下可觀測證據。

## 已證明

- 新 private repository 可以先由使用者建立 Codex Project，再由 Temple 在同一路徑初始化，不需要 fork 中央 Toolkit。
- 第一次 init 才命名五個 Agent Identity；九個 Position assignment 與 Developer／Independent QA 分離可以被 doctor 驗證。
- Project Charter、domain language、Spec、UX flow、ADR、technical design、handoff、測試與 QA evidence 可以全部留在產品 repository，而不是只存在創始聊天。
- Build Quality pack 可以 opt-in，並在 iOS vertical slice 中保存 red／green 與 bug diagnosis 證據。
- 一張 work item 可以完整通過 Spec → Design → Build → Test → Eval → Independent QA → Release Gate。
- Developer candidate 與 post-candidate lifecycle records 可以分開提交；QA 可在 clean detached checkout 對 exact revision 重建。
- Project-facing 文件使用產品名稱；Temple 只保留在 CLI、lock、schema 與技術 namespace。

Pilot 的可觀察結果包含 14 項 unit／persistence tests、2 項 UI tests、真實 Apple Shortcuts callback、relaunch persistence、兩個 clean QA checkout 與 `doctor` 14 pass。實際程式碼和證據留在 private pilot repository，不 vendor 回本 Toolkit。

## 尚未證明

- 沒有建立新的 Codex task 從 repository canonical state 接手，因此「換新對話不讀創始聊天即可延續」尚未通過。
- Codex task registry 在 pilot 中維持空白，task title／thread ID／archive readiness 沒有被 forward-test。
- 人類 README 是依 repository 證據整理，但 Temple-native `$project-documentation` 尚未實作，因此不能把這次結果算成該 Skill 的驗證。
- 沒有驗證 physical device、最低 iOS 17 runtime 或 cancel/error 的獨立系統 fixture；這些屬於 sample app 的 residual evidence，不是繼續發展 FlowDeck 的理由。

## 流程摩擦

1. **缺少 pilot stop boundary。** Closeout 後仍自然滑向產品續作，Temple 沒有在 instructions 中阻止這種授權擴張。
2. **Unresolved 只能增加，不能正式解除。** Handoff 會累積重複或已解決項目；CLI 沒有 `resolve`／`update`，最後需要手動整理 canonical JSON。
3. **Candidate revision 在 release gate 前不夠可見。** Developer handoff 已有 exact revision，但 status 的 work-item revision 欄直到 closeout 才顯示 tested revision。
4. **目標 repository 的 CLI ergonomics 不穩定。** 未執行 `npm link` 時，必須使用中央 checkout 的完整 `node .../bin/temple.mjs` 路徑；功能可用，但日常操作成本偏高。
5. **同一 Identity 兼任 Quality 與 Independent QA 時，分離程度需要明示。** 現行精簡配置符合「Developer 與 Independent QA 不同 Identity」，但應要求不同 clean checkout／evidence pass，並在報告中披露兼任。
6. **系統整合 fixture 有平台前置條件。** iOS 首次 callback 會出現輸出分享與 custom URL 權限提示；fixture 必須記錄它，不能把等待提示誤判為產品失敗。

## Temple 改進順序

### Phase 1.5 hardening

- 已接受 ADR-0011，將 pilot stop boundary 加入 installed instructions 與 operating contract。
- 新增 work-item unresolved 的列出、解除、合併能力，避免手改 canonical JSON。
- 在 status 中投影目前 candidate revision，而不是只在 closeout 後顯示 tested revision。
- 讓 bootstrap 明確檢查 CLI 使用方式，並輸出可直接複製的 repository-local 命令。

### Phase 1.5 exit gate 仍需

- 在未繼續開發 FlowDeck 的前提下，使用另一個合適工作或 sample 驗證新 Codex task 的 read-only context recovery 與 task registry。
- 實作並 pilot `$project-documentation`，驗證 README 的 claims、commands、links 與 audience boundary。
- 完成上述 hardening 後再宣告 Phase 1.5 結束。

## Skill 結論

- `$domain-modeling` 與 Build Quality pack 在 greenfield flow 中有實際價值。
- 這次 pilot 沒有證明需要立刻導入 Architecture、Review、Exploration、Git and Improvement 或更多 Matt Pocock candidates。
- 一次性的 system permission workaround 不是新 Skill；先保留成 fixture documentation。
- `$project-documentation` 仍是下一個明確候選，但必須獨立實作和 forward-test，不能因為手動寫過 README 就宣稱已採用。
