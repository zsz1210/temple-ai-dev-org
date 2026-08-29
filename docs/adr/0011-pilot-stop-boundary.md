# ADR-0011：Pilot 完成後預設停止

- Status: Accepted
- Date: 2026-08-29

## Context

FlowDeck greenfield pilot 的目的，是驗證 Temple 能否從模糊點子建立新 repository、完成產品與技術基線，並讓第一張 work item 經過完整 lifecycle。當 callback、測試、exact-revision QA 與 closeout 都成立後，實驗目的已達成；但對話仍把 sample app 當成需要繼續發展的產品，讓「release gate 通過」被誤讀成「可以繼續做下一階段」。

這種範圍漂移不只浪費時間，也會讓使用者誤以為 Temple 自動取得了建立新 work item、擴張產品 roadmap 或準備發布的授權。

## Decision

當 work item 被定義為 pilot、example、proof 或 template validation 時：

- Spec 必須寫明 experiment purpose、observable stop condition 與 excluded follow-on work。
- Release-gate `go` 只接受該次 bounded experiment，不授權下一張產品 work item。
- Stop condition 達成後，預設動作是凍結 sample、回到 Engineering Manager／使用者、整理 retrospective。
- 新功能、第二張 work item、distribution 或把 sample 升格成正式產品，都需要新的明確要求。
- Toolkit 可以保存匿名化或不含產品私有內容的學習，但不得把 private pilot repository 的程式碼或資料複製回開源模板。

此規則加入專案 operating contract 與共用 instructions。後續 CLI／status 可以增加 pilot projection，但不是本決策生效的前提。

## Consequences

- 完成 lifecycle 不再被當成無限延伸產品的授權。
- Pilot closeout 後會有清楚的停止點與回顧時機。
- 使用者若真的想把 sample 變成產品，需要明確說明新的目標與風險範圍。
- Greenfield pilot 可以成功驗證 Temple，同時仍保持 disposable、private、non-production 的定位。
