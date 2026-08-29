# ADR-0001：中央模板以 init 安裝，不以 fork 為主要流程

- Status: Accepted
- Date: 2026-08-29

## Context

若每個產品都 fork 模板，產品歷史與模板歷史會混在一起，上游升級、專案客製與權限管理都更困難。

## Decision

中央 private repository 發布版本。產品 repository 使用 `temple init` 安裝，並以 `temple.lock` 記錄來源與 managed checksums。GitHub 的「Use this template」只作為全新 repository 的次要入口。

## Consequences

未來必須提供明確的 upgrade/migration 工具；同時可以保持每個產品自己的乾淨 Git 歷史。
