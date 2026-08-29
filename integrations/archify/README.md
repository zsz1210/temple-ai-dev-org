# Archify adapter contract

Phase 1 將 Archify 定位為選配的 read-only visualization adapter，而不是 Temple 核心依賴。

目前狀態是 `contract-only`：

- 已核對 MIT license。
- 釘選 upstream `v2.15.0` 與 resolved commit。
- 已定義可讀輸入、只可寫 generated artifact、provenance 與禁止權限。
- 尚未 vendor、安裝或執行 upstream 程式碼。

後續啟用前必須補齊：

1. 以固定 checksum 取得 release artifact。
2. 在隔離 sample repository 驗證輸入 schema 與 HTML 輸出。
3. 加入 supply-chain、license、visual QA 與失敗降級測試。
4. 以顯式 `temple integration enable archify` 啟用，不得由 init 預設開啟。

無論 adapter 是否存在，Temple 的 `doctor`、`status`、工作流與決策紀錄都必須可正常運作。
