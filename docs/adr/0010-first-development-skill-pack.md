# ADR-0010：第一個開發 Optional Skill Pack

- Status: Accepted
- Date: 2026-08-29

## Context

Temple 的 core Skills 處理初始化、決策、domain language 與 lifecycle mutation，但日常開發還需要可重複的 implementation procedure。Matt Pocock catalog 同時包含 TDD、bug diagnosis、architecture、review、prototype、git 與 retrospective 能力；一次全部安裝會造成 trigger 重疊和固定上下文成本。

AiPet `WI-0001` 提供了第一個可觀察的開發案例：新的 UI vertical-slice test 先在長期記憶驗證失敗。排名假設與檢查畫面結構後，確認是 `ScrollView + LazyVStack` 的 below-fold accessibility node 尚未建立，而不是產品記憶遺失。測試改由公開 UI 捲動後轉綠；同一 candidate revision 接著通過六項測試、畫面附件檢查，以及 clean detached worktree 的 Independent QA。

## Decision

第一個 optional development pack 定義為 **Build Quality**，由 Temple-native `tdd` 與 `diagnosing-bugs` 組成。

- `tdd` 要求預先選定 public seam、觀察到 red、進行最小更動、取得 green，並保存 exact command/result evidence。
- `diagnosing-bugs` 要求可重現問題、提出排名假設、建立 red-capable feedback loop、修正最小原因、加入 regression evidence，並清除臨時 instrumentation。
- Pack 不取代 Developer、Tech Lead、Quality Evaluator 或 Independent QA Position，也不自動改變 work-item state。
- 實作必須獨立撰寫；Matt Pocock Skills 保持 pinned MIT inspiration，不 vendor、不 runtime load。
- 在 pack 有自己的 registry、installer boundary、scenario tests、upgrade tests 和另一個真實 project pilot 前，不加入預設 `project-overlay/`。

Architecture、Review、Exploration、Git and Improvement 保留為後續 packs。`implement`、`implement-spec`、`setup-pre-commit`、`git-guardrails-claude-code` 與 `wizard` 不作為通用核心採用。

## Consequences

- 開發能力不再和組織流程混成同一層，專案可按需要安裝。
- AiPet 的真實 friction 決定第一個 pack，而不是 catalog popularity。
- 現階段候選仍不會被複製到每個專案；下一步需要實作與安裝機制，不能只改文件後宣稱已提供 Skill。
- Phase 1.5 greenfield pilot 可以繼續使用精簡 core，同時在第一個 vertical slice 評估是否需要啟用 Build Quality pack。
