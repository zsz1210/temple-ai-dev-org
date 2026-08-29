# Contributing

這個 repository 是中央 Toolkit，不應放入任何實際專案的 Agent 名字、產品規格、工作項目或驗證證據。

變更流程：

1. 先更新 Spec 或 ADR。
2. 更新 `project-overlay/`、中央文件或 CLI。
3. 執行 `npm run verify`。
4. 在暫存目錄執行一次 `init → doctor → status`。
5. 更新 Changelog 後才建立版本標籤。

新增或修改 Skill 時同時遵守 `docs/skill-design.md`，並更新 `docs/capability-catalog.md` 的採用狀態與第三方 provenance。

任何升級功能都必須遵守：Managed 可以更新；Project-owned 不得覆蓋；Generated 可以重建。
