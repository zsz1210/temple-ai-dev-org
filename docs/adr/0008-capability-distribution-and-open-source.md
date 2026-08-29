# ADR-0008：Skill 分層與開源發佈

- Status: Accepted
- Date: 2026-08-29

## Context

外部 Skill catalogs 包含許多有價值的開發能力，但把整個 catalog 複製進每個專案，會增加重疊 trigger、持續上下文成本、依賴與授權維護。Temple 同時預計公開發佈，因此需要讓使用者分清楚自有實作、外部靈感、vendored code 與選配整合。

## Decision

Temple 將能力分為三層：所有專案都需要的 core Skills、經實證後才安裝的 optional packs，以及只存在中央 repository 的 maintainer guidance。

本版本把獨立實作的 `domain-modeling` 納入 core；把 TDD、診斷、prototype、code review 與架構改善保存在 capability catalog；把 Skill 寫作原則放在中央維護文件。外部來源必須記錄 URL、pin、license 與採用狀態。除非另有明確決策，不直接 vendor 外部 Skill。

Repository 採 MIT License。若未來複製或修改第三方程式碼，必須保留其授權要求與 notice，不能只用本 repository 的 LICENSE 取代。

## Consequences

- 重要候選能力不會因暫緩安裝而遺失。
- 新專案的預設上下文維持精簡，Skill trigger 比較不會互相競爭。
- 第三方靈感、自有實作與未來 vendoring 有可稽核邊界。
- Optional pack 需要真實 pilot、license review、測試與 ADR，導入速度會比直接複製慢，但可避免長期升級與來源不明問題。
