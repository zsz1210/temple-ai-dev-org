# Security

- 不要把 API key、GitHub token、私密 prompt 或客戶資料提交到本 repository。
- 初始化設定檔只應包含 Agent 顯示名稱與職位配置，不應包含模型憑證。
- `temple init` 不會覆蓋不同內容的 managed 檔案；既有 `AGENTS.md` 也不會在未明確指定整合時被改寫。
- Archify 是選配的視覺化 Adapter，不得取得 release approval 或改寫 canonical state 的權限。
