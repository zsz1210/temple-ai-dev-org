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

Management Console と継続的な Usage 観測は任意です。意味検索や Provider 実行の拡充は今後の拡張であり、中核の開発組織はこれらに依存しません。

## 公開状況

ソースリポジトリと **Alpha.30** は GitHub と npm で公開済みです。配布中のパッケージは初期 Alpha であり、安定版や企業環境での運用保証を意味しません。正確な公開バージョンと検証根拠は [Release readiness（英語）](release-readiness.md) を参照してください。

リリース後に `main` に入った変更は、別のバージョンとして検証・公開されるまで未リリースです。開発中の修正、準備中の比較、将来の機能を、npm から導入した版の挙動や結果として扱いません。現在の Adaptive Execution Routing は実行構成を提案する機能であり、モデルを自動選択して起動するものではありません。

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

限定的な比較では、観測された品質は同等でしたが、リソース消費や統合コストの増減は一様ではありませんでした。一般的な Token 削減や自動ルーティングを正当化する結果ではありません。[検証一覧（英語）](../validation/README.md) では測定済みの結果と準備中の実験を分けています。次は操作の負担を減らし、開発開始から受け渡し・検証までの全体を評価してから既定値を見直します。

### 4. 実環境での適格性確認 — 現在

- 限定的な新規 Agent の Core Path と会話履歴なしの復旧で得た成果を、代表的な既存プロジェクトの作業へ広げる
- 初回導入、同じ承認範囲内のレビュー修正、起動した実行環境の後片付けを簡素化し、版の特定と権限の境界は維持する
- Task、Model、Tool、Acceptance Test をそろえ、Temple と一般的で堅実な開発手順を比較
- 文脈や操作の簡素化が品質を保ったまま負担を減らすか測定し、効果を前提にしない
- Temple の手順を固定したまま、Adaptive Execution Route と固定 Model Route を比較
- 実際の複数人・複数マシン・複数リポジトリ開発を検証
- Correctness、Recovery、Rework、Human Intervention、Token、Latency、運用負荷を計測

この段階で必要なのは、判断に使える証拠です。改善がない、または負担が利益を上回る場合は、その仕組みの適用範囲を狭め、簡素化し、必要なら削除します。

初めて使う人による調査は将来の使いやすさの証拠になりますが、AI 支援を前提とした限定的な Alpha の必須条件ではありません。別途検証するまで、人だけで容易に導入できるとは主張しません。

既存の [実利用検証計画（英語）](../validation/post-alpha-field-validation.md) に沿って、小さな変更と新しい Task への引き継ぎから始め、既存プロジェクトへの導入、複数リポジトリの協調へ進みます。実際に観測した手順を短い User Guide の事例にまとめ、計画段階の例と検証済みの結果を区別します。

### 5. エコシステムの拡張 — 将来

- Trust、Protocol、Authority、Rollback の契約を検証した後に Provider Execution を追加
- リポジトリ規模による必要性を計測してから Semantic / Local Retrieval を追加
- 適格な比較証拠と安全な Fallback がある Task Shape だけで Automatic Routing を検討
- 任意の運用画面や Integration を、中核依存にせず改善
- 公開 Alpha を個別に検証したリリースで改善し、マージだけでは npm に公開しない

## 詳細情報

- [Core Path（英語）](../getting-started/core-path.md) — 最短の End-to-end 運用手順
- [Work Items](../../.ai-org/work-items/) — 実装の詳細状態
- [Validation records（英語）](../validation/README.md) — 検証済みの範囲と未証明の事項
- [Release readiness（英語）](release-readiness.md) — 配布に固有の条件
- [Changelog（英語）](../../CHANGELOG.md) — バージョン履歴

このロードマップが扱うのはプロダクトの方向、機能、マイルストーンです。タスク一覧、実験ログ、リリースチェックリストはそれぞれ別の文書で管理します。
