# Temple roadmap

[English](roadmap.md) | **日本語** | [繁體中文](roadmap.zh-TW.md)

Temple は、local で実証された AI Development Organization Framework から、複数の実プロジェクトで日常的に信頼して使える段階へ進んでいます。この roadmap は方向と exit evidence を示します。Version ごとの履歴は [Changelog（英語）](../../CHANGELOG.md)、詳細な証拠は [Validation records（英語）](../validation/README.md) に置きます。

## 現在地

- **現在の release line:** `0.1.0-alpha.25`
- **現在の段階:** Phase 4A local recovery と Phase 4B policy / usage foundation は実装済み。Longitudinal reliability evidence は未完了
- **現在適している用途:** 人間が監督する低リスクの local project と bounded pilot
- **まだ主張しないもの:** production-grade の distributed coordination、regulated operation、無人の外部操作

## 提供済みの基盤

最初の3 phase で framework の運用モデルを確立しました。

- Framework を fork せず、新規または既存プロジェクトへ導入。
- 10個の安定した Position と、project-specific な Agent Identity／Assignment を分離。
- Product specification、decision、Work Item、handoff、learning、evidence を repository-owned state として保存。
- `Spec → Design → Build → Test → Eval → Independent QA → Release Gate` lifecycle を可視化。
- Human accountability の境界を持つ Solo、Collaborative、High-Assurance profile。
- Repository 全体を読み込まず、semantic retrieval を標準化せずに bounded context と関連 Skill を routing。
- Dependency-safe な parallel wave、affected path、claim、shared resource、runtime worker、integration join を調整。
- Company tracker、Temple Work Item、Codex task を別 layer として保持し、明示的に reconciliation。
- Exact-revision evidence、stale claim、approval、risk、recovery を static view と local live view で観測。
- Project-owned Skill と optional Pack を ownership、provenance、migration、rollback 境界付きで拡張。

詳細な release 順序はここでは繰り返しません。[Changelog（英語）](../../CHANGELOG.md)、[ADR index（英語）](../adr/README.md)、[Validation index（英語）](../validation/README.md) を参照してください。

## Now — 理解しやすく、信頼できる Temple にする

直近の優先事項は、実証済みの local foundation を、開発者が履歴を読まずに導入・運用できる形にすることです。

### Public usability と release integrity

- Human-first の3言語 README と、分類された documentation map を維持。
- Roadmap は方向に集中し、history は changelog と validation record に保存。
- Change-aware CI：documentation change は repository check、behavioral change は complete suite を実行。
- Lockfile-strict dependency と clean-source recovery による再現可能な install。
- Public package 公開前に、対応 Node.js／OS matrix を定義。
- Package contents、security reporting、contribution guide、public branch protection を review。

### Durability と recovery

- Alpha.24 は project-owned Temple state を対象に、local versioned backup manifest、完全な payload verification、stale-safe restore preview、recoverable な multi-file apply を提供します。
- Generated view は rebuildable のまま維持し、framework-managed file、application source / data、external system、control-plane telemetry はこの backup 境界に含めません。
- Automated interruption test は新しい human change を保護し、clean environment での AiPet restore と forward migration も1回通過しました。Post-upgrade rollback、real interruption、より広範な crash evidence と追加 environment は未完了です。

### 日常運用の signal

- Alpha.25 は Solo、Collaborative、High-Assurance fixture 向けの7 scenario adversarial policy scorecard を提供します。Real operation と longitudinal evidence は未完了です。
- Provider usage を証明可能な Work Item、Position、observed stage、task、attempt、provider、model、outcome に attribution し、不明な data と monetary cost は unknown のまま保持。
- Duplicate scope、lost context、stale evidence、rework、blocked time、verification quality の低ノイズな historical measure を定義。
- Framework に spending authority や automatic model switching を与えず、usage と cost を可視化。
- Human Inbox と Observer attention を、第二の tracker にせず actionable にする。

## Next — 日常的な multi-project use を証明

Phase 4 は、別の feature を追加しただけでは終了しません。繰り返し運用できる evidence が必要です。

- 種類と規模が異なる Work Item を最低10件完了。
- Clean environment で documented backup から1 project を recovery。
- Project-owned multi-repository registry と read-only portfolio view を追加し、各 project が自分の state の authority を維持。
- Credential や business truth を中央集約せず、project 横断の capacity、shared resource、evidence、cost signal を表示。
- Real data-bearing project で upgrade と rollback を実行。
- False completion、wrong revision、self-approval、unauthorized external action、notification noise を評価。
- Real branch、pull request、protected rule、CI、conflict、integration ownership を使った大規模 multi-human／multi-machine test を実行。
- Production-readiness を主張する前に、明示的に承認された live provider、soak、disconnect、crash-recovery validation を実行。

## Later — optional enterprise integration

Phase 4 exit evidence の後にのみ検討します。

- Jira、GitHub、Linear、Asana などへの承認済み write action。
- 明示的な authorization、preview、rollback、audit evidence を持つ CI/CD と deployment action。
- Organizational RBAC、remote worker、centralized audit export、cross-team portfolio。
- Production observability、incident coordination、vulnerability handling、policy evidence、operational risk review を担う optional な SRE / Security responsibility。
- Remediation や deployment action より先に導入する read-only production telemetry / alert-provider adapter。
- Throttling、privacy、responsibility boundary を持つ Slack、email などの notification。
- Deterministic routing では不十分な repository に対する semantic／local-model retrieval の評価。

External system は project-local truth や Human Approval boundary を置き換えてはいけません。

## 意図的に default にしないもの

人気があるという理由だけで、次のものを core にしません。

- すべての candidate engineering Skill の導入。
- Figma など特定 design vendor の必須化。
- 小規模 project への RAG、vector database、local model、daemon の必須化。
- External tracker status を release authority として扱うこと。
- Clean task boundary なしに無制限の Agent task や parallel work を作ること。
- Validation question が解決した pilot app を、そのまま product として開発し続けること。

## 成功指標

次の状態が増えるほど Temple は改善しています。

- 新しい Agent が元の chat なしで current project state を回復できる。
- Work Item overlap と unsafe parallel plan が編集衝突前に検出される。
- Completion claim が再現可能な exact-revision evidence を参照する。
- Developer と Independent QA が実質的に分離される。
- Project-owned files が init、upgrade、extension install、rollback、failure を越えて保持される。
- Human がすべての Agent conversation を読まず、active work、decision、risk、approval を理解できる。
- Framework が artifact 数ではなく rework と coordination cost を減らす。
