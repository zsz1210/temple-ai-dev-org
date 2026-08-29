# 使用手冊

## 1. 安裝中央 Toolkit

```bash
git clone git@github.com:zsz1210/temple-ai-dev-org.git
cd temple-ai-dev-org
npm run verify
# Optional: expose the local CLI as `temple`
npm link
temple --version
```

中央 Toolkit 只需要 clone 一次；每個產品 repository 透過 `temple init` 安裝，不需要 fork。`project-overlay/` 只是中央 repository 內的安裝來源；它的內容會直接進入產品 repository 根目錄。

## 2. 第一次初始化

### 建議：由 Codex 協助

第一次先在中央 Toolkit repository 開啟 Codex，並提供目標 repository 的絕對路徑：

> 使用 temple-init，讀取 `/absolute/path/to/target`，替五個 assignment slots 建議英文名字，等我確認後初始化。

AI 必須先顯示 Position 對應與名字提案，取得確認後才建立設定檔並執行 `init`。安裝後，目標 repository 會取得 `$temple-init`、`$temple-work`、`$decision-interview`、`$evidence-backed-decision-interview` 與 `$domain-modeling`。中央 repository 本身沒有任何預設名字。

### 手動設定檔

建立一份不需要提交 Git 的 JSON：

```json
{
  "schema_version": "temple.init/v1",
  "project": { "id": "product-id", "name": "Product Name" },
  "naming_mode": "manual",
  "agents": [
    { "display_name": "Name One", "positions": ["engineering_manager", "release_manager", "observer"] },
    { "display_name": "Name Two", "positions": ["product_manager", "ux_designer"] },
    { "display_name": "Name Three", "positions": ["tech_lead"] },
    { "display_name": "Name Four", "positions": ["developer"] },
    { "display_name": "Name Five", "positions": ["quality_evaluator", "independent_qa"] }
  ]
}
```

預演與正式執行：

```bash
temple init . --config /path/to/config.json --dry-run
temple init . --config /path/to/config.json
```

若目標已有 `AGENTS.md`，Temple 預設不改寫它，並在 doctor 顯示待整合警告。確認允許附加 Temple 管理區塊後，可加上 `--integrate-agents`。

## 3. 建立 Work Item

```bash
temple work-item create . \
  --title "Verify the bounded user outcome" \
  --scope "One local flow" \
  --scope "No production release" \
  --acceptance "The result is visible at runtime" \
  --acceptance "Independent QA reproduces the exact revision"
```

Temple 會配發下一個 `WI-####`、解析目前 owner Position 與 Agent，附加 event，重建 status，並輸出建議的 Codex task 標題，例如：

```text
WI-0002 · Engineering Manager · Clara
```

標題只是可讀 projection。Work item ID 與後續登錄的 thread ID 才是 identifier。

## 4. 登錄 Codex Task

Temple CLI 不會直接建立 Codex App task。由使用者或 Codex App 建立 task 後，把實際 ID 登錄：

```bash
temple task register . \
  --work-item WI-0002 \
  --position developer \
  --thread-id 01example \
  --host-id local \
  --revision abc123
```

`task register` 預設把登錄動作歸給 Engineering Manager；也可用 `--actor` 明確指定持有該 Position 的 Agent 或 `human`。`task update` 預設由 task 的 Agent 執行，Engineering Manager 與 `human` 也可更新 registry metadata。Task owner 與「誰執行登錄」會分開保存。

進度變更：

```bash
temple task update . --task-id task-0001 --status waiting --revision def456
temple task update . --task-id task-0001 --status completed --revision fedcba
temple task list .
```

合法狀態：`setup`、`active`、`waiting`、`attention`、`completed`、`archived`。當 work item 已 terminal 且 task 為 completed，status 會顯示 archive-ready；真正封存仍需明確的 Codex App 操作。

## 5. Handoff 與 Transition

Handoff 保存精確 revision、完成內容、evidence 與 unresolved：

```bash
temple handoff . \
  --work-item WI-0002 \
  --to quality_evaluator \
  --input-revision fedcba \
  --completed "Implemented the accepted scope" \
  --evidence .ai-org/artifacts/WI-0002/developer-tests.md \
  --unresolved "Physical device remains out of scope"
```

Transition 只允許 `.ai-org/core/workflow.json` 既有 edge。每個 `requires` 必須用具名 evidence reference 滿足：

```bash
temple transition . \
  --work-item WI-0002 \
  --to design \
  --satisfy approved_scope=docs/spec.md \
  --satisfy acceptance_criteria=docs/spec.md
```

缺少 requirement、跳過 state 或 actor 不持有目前 Position 時，CLI 會在寫入前拒絕。

## 6. Release Gate 與 Closeout

`temple close` 只完成組織 closeout，不會 deploy、發布、傳送外部訊息或取得高風險批准：

```bash
temple close . \
  --work-item WI-0002 \
  --decision go \
  --tested-revision fedcba \
  --approval not-required \
  --rollback "Use git revert for the bounded candidate" \
  --satisfy accepted_scope=docs/spec.md \
  --satisfy test_evidence=.ai-org/artifacts/WI-0002/test.md \
  --satisfy evaluation_report=.ai-org/artifacts/WI-0002/evaluation.md \
  --satisfy independent_qa_report=.ai-org/artifacts/WI-0002/independent-qa.md
```

只有 policies 中沒有 production change、external message、irreversible action、material cost 或 sensitive data trigger 時，才能寫 `--approval not-required`。否則必須引用人類 approval record。

`--decision no-go` 需要至少一個 `--reason`，並把 work item 交回 Engineering Manager 的 `blocked` 狀態。

## 7. 觀測與健康檢查

```bash
temple status .
temple status . --json --no-write
temple doctor .
```

`status.md` 包含：

- work item state、owner、Agent、latest revision、evidence 與 unresolved；
- Codex task/thread、建議標題、status、revision 與 archive readiness；
- blocked、attention 與 archive-ready 訊號；
- 最近八筆 canonical event；
- Position assignments 與 optional integration 狀態。

## 8. 從舊版本升級

```bash
temple upgrade /absolute/path/to/project --dry-run
temple upgrade /absolute/path/to/project
temple doctor /absolute/path/to/project
temple status /absolute/path/to/project
```

Upgrade 規則：

- 先依舊 `temple.lock` 驗證全部 managed checksum。
- 只更新未被專案修改的 managed files。
- 新 managed path 必須不存在或已與中央內容相同。
- `.ai-org/project/**`、work items、events、decisions、artifacts、Agent 名字與產品檔案都保留。
- 任一 conflict 會在寫入前停止，不進行部分升級。

## 9. 使用 Decision 與 Domain Skills

- `$decision-interview`：把模糊想法拆成已知事實、選項、決策與未知，不需要 repository 文件也能使用。
- `$evidence-backed-decision-interview`：先讀 repository 的相關文件與程式碼，再針對衝突、缺口、術語與 ADR 做訪談。
- `$domain-modeling`：整理 ubiquitous language、bounded contexts、規則與 invariants，將已確認術語保存到 project-owned glossary。

Decision interview Skills 都應將已確認決策保存到 Decision Ledger，不得只留在聊天中。它們的預設行為是訪談與提案，不會直接開始實作。

## 10. 故障處理

- `managed file changed`：先查看 diff；不要用重跑 init 或手改 lock 繞過。確認要保留成 project extension，或把變更提交回中央 Toolkit。
- `missing gate evidence`：補齊真正 evidence，再使用 `--satisfy requirement=reference`；不要填虛構路徑。
- `actor does not hold Position`：回到 assignments，使用正確 Agent/Position 或記錄明確 human action。
- `agents_md_pending_merge`：檢視 `.ai-org/project/AGENTS.temple.md`，再由人類批准整合。
- `developer_qa_not_independent`：更改 Assignment，讓 Developer 與 Independent QA 使用不同 `agent_id`。
- `task registry` 錯誤：確認 work item、Position、Agent、thread ID 與 status 都存在且唯一。
