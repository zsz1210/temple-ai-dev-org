# Temple プロダクトロードマップ

[English](roadmap.md) | **日本語** | [繁體中文](roadmap.zh-TW.md)

Temple は、AI を活用したソフトウェア開発を組織として運営するためのフレームワークです。人と AI Agent の責任を明確にし、プロダクト目標を範囲の定まった作業へ分解し、判断・証拠・復旧に必要な状態をリポジトリに残します。

## プロダクトの目標

プロジェクトの規模を問わず、複数 Agent による開発を安定して運営できる状態を目指します。

- 個人開発者は、文脈の消失や作業の重複を避けながら複数の AI Agent を扱える。
- 複数分野からなるチームは、責任を分け、安全に並行作業を進められる。
- 大規模な組織は、既存のリポジトリ、仕様書、タスク管理、承認経路を維持したまま導入できる。

Temple は作業に合わせて運用の重さを変えます。小さく可逆的な変更は軽量に、通常の開発には必要なレビューを残し、影響の大きい作業だけに強い保証を求めます。

## 現在のプロダクト機能

| 領域 | Temple が現在提供するもの |
| --- | --- |
| 開発組織 | Position、Agent Identity、Assignment、権限、作業 Claim の分離 |
| デリバリー | 範囲を定めた Work Item、段階別 Workflow、Handoff、Evidence Gate、Independent QA、Closeout |
| 継続性 | リポジトリに保存する状態、Context Routing、Task の関連付け、Backup、Recovery、Engineering Learning |
| チーム拡張 | 安全な並行計画、複数人の Governance、外部 Tracker との境界、複数リポジトリの Federation |
| 拡張性 | プロジェクト固有の Specification、UI Delivery Mode、Skill、Capability、任意 Integration |
| 実行支援 | 責任や実行権限と分離した、Step 単位で説明可能なモデル・ツールの提案 |

Management Console、継続的な Usage 観測、Semantic Retrieval、Provider 実行は任意の層です。中核の開発組織はこれらに依存しません。

## マイルストーン

### 1. 開発組織の基盤 — 完了

- Position、Agent Identity、Assignment の契約
- リポジトリを正本とする Work Item と Lifecycle
- Handoff、Evidence、Independent QA、Closeout の境界
- Install、Upgrade、Backup、Restore、Cold-task Recovery

### 2. チームとプロジェクト規模への対応 — 範囲を限定した検証まで完了

- Product、UX、UI、API、Technical Specification の権威管理
- Lean、Standard、High-Assurance の Workflow Profile
- 安全な並行計画と Runtime Coordination
- 複数人の Collaboration、外部 Tracker 対応、Multi-repository Federation
- 管理された Skill と Engineering Learning Loop

実際の複数企業・複数マシン・規制環境での運用は、今後の代表的な検証対象です。

### 3. Adaptive Execution — 基盤は完了、限定的な比較証拠を取得

- 責任とモデル選択を分離
- 一つの Work Item 内で Step ごとに異なる Execution Profile を解決
- Capability、Privacy、Risk、Provider、Resource 制約を Preference より先に評価
- 提案値と実際に観測した Model / Reasoning を別々に記録
- Route 解決は Advisory に限定し、Provider 起動や Project State の変更を行わない

修正後の最初の比較から得られた運用上の結論は限定的です。範囲の明確な作業では、モデルを強くする前に Acceptance Contract を明示します。低リスクの 2 ケースは Terra medium で完了し、上位 Route による客観的な正解の増加はありませんでした。この結果だけでは Automatic Routing を正当化できません。

その後、同じ Fixture に対する Temple Lean の静的 Context を約 39% 削減し、Authority Contract を維持しました。4 Candidate の比較確認は準備済みですが、まだ実行していません。次はこの改善を確認し、異なる Task Shape に証拠を広げてから Default を変更します。

### 4. 実環境での適格性確認 — 現在

- 初見の利用者と新しい Agent が、過去の会話なしで Core Path を完了できるか確認
- Task、Model、Tool、Acceptance Test をそろえ、Temple と一般的で堅実な開発手順を比較
- 小さくした Lean Context が、品質を落とさず Token と Latency の負担を減らすか確認
- Temple の手順を固定したまま、Adaptive Execution Route と固定 Model Route を比較
- 実際の複数人・複数マシン・複数リポジトリ開発を検証
- Correctness、Recovery、Rework、Human Intervention、Token、Latency、運用負荷を計測

この段階で必要なのは、判断に使える証拠です。改善がない、または負担が利益を上回る場合は、その仕組みの適用範囲を狭め、簡素化し、必要なら削除します。

### 5. エコシステムと公開配布 — 将来

- Trust、Protocol、Authority、Rollback の契約を検証した後に Provider Execution を追加
- リポジトリ規模による必要性を計測してから Semantic / Local Retrieval を追加
- 適格な比較証拠と安全な Fallback がある Task Shape だけで Automatic Routing を検討
- 任意の運用画面や Integration を、中核依存にせず改善
- Owner が公開判断を再開し、Candidate が Release Gate を通過した後に公開配布を準備

## 詳細情報

- [Core Path（英語）](../getting-started/core-path.md) — 最短の End-to-end 運用手順
- [Work Items](../../.ai-org/work-items/) — 実装の詳細状態
- [Validation records（英語）](../validation/README.md) — 検証済みの範囲と未証明の事項
- [Release readiness（英語）](release-readiness.md) — 配布に固有の条件
- [Changelog（英語）](../../CHANGELOG.md) — バージョン履歴

このロードマップが扱うのはプロダクトの方向、機能、マイルストーンです。タスク一覧、実験ログ、リリースチェックリストはそれぞれ別の文書で管理します。
