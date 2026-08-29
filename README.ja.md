# Temple — AI Development Organization Framework

[English](README.md) | **日本語** | [繁體中文](README.zh-TW.md)

**プロダクトの意図を、考え、構築し、検証し、継続し、進化できる AI 開発組織によって、信頼できるソフトウェアへ変換します。**

Temple は Codex のための、リポジトリ中心のフレームワークです。プロダクト思考、安定した責任、再利用可能な開発手法、evidence に基づくデリバリー、永続的なプロジェクト状態を結び付けます。現在の実装は、低リスクな検証を対象とした early alpha です。

```text
Intent → Shared model → Bounded work → Method-assisted build → Independent evidence → Durable continuation
```

## Temple が必要な理由

Coding Agent はコードを素早く生成できます。しかし、それだけで開発組織が生まれるわけではありません。AI task は、プロダクトが理解される前に実装を始めたり、隣の task と異なる手法を使ったり、責任と承認を混同したり、再現可能な evidence なしに成功を宣言したり、会話終了時に重要な決定を失ったりします。

それらを結び付ける仕組みがなければ、task や Skill を増やすほど問題が拡大することもあります。Temple はその接続を提供します。プロダクトの意図を scope にする前に明確化し、実行する Agent が変わっても責任を安定させ、engineering method を明示的な権限境界の中で運用し、delivery claim を evidence gate に通し、後続 task がチャットを再構築せずリポジトリから状態を回復できるようにします。

Temple はチャット記憶の共有システムでも、prompt の寄せ集めでもありません。アイデアを、AI 開発組織が継続して検証できる仕事へ変換するための運用フレームワークです。

## フレームワーク

| レイヤー | Temple が現在提供するもの |
|---|---|
| プロダクトの意図とドメイン | `$decision-interview` が曖昧さを問い直し、`$domain-modeling` が共通言語、境界、ルール、invariant を定義し、Spec、Decision Ledger、ADR が決定を保存する |
| 組織と権限 | 9つの安定した Position、プロジェクト固有の Agent Identity、Assignment、明示的な人間の承認境界、Developer と Independent QA の分離 |
| 開発手法 | Core Skill と、`$tdd` および `$diagnosing-bugs` を含む opt-in の Build Quality pack |
| 作業オーケストレーション | 永続的な work item と handoff を伴う、固定の `Spec → Design → Build → Test → Eval → Independent QA → Release Gate` lifecycle |
| 検証とデリバリー | 名前付き gate evidence、evaluation、独立再現、revision reference、approval record、rollback plan、範囲を限定した closeout |
| 永続的な状態、学習、可観測性 | リポジトリが所有する decision、Lesson、Practice、work item、event、task registry、生成 status、conflict-aware upgrade |

Position は責任と承認限界を定義します。Agent Identity は、その Position に割り当てられるプロジェクト固有の実行者です。Skill は特定の仕事を行うための再利用可能な手法であり、権限を拡大したり evidence gate を置き換えたりするものではありません。

## はじめ方

必要条件：Git、Node.js 20 以降、Codex、および導入先のプロジェクトディレクトリ。

### 1. Temple をインストールする

```bash
git clone https://github.com/zsz1210/temple-ai-dev-org.git
cd temple-ai-dev-org
npm run verify
npm link
```

現在は early alpha のため repository は private です。clone には GitHub へのアクセス権が必要です。

### 2. プロジェクトを初期化する

Temple の checkout を Codex で開き、次のように依頼します。

> `$temple-init` を使って `/absolute/path/to/my-project` を初期化してください。5つの Agent Identity の英語名を提案し、変更前に私の確認を待ってください。

Temple は導入先を調査し、名前と Position Assignment を提案して dry run を実行します。その後、組織を導入し、health check と status check を行います。対話形式および設定ファイルを使う方法は、[使用ガイド（英語）](docs/usage.md)を参照してください。

### 3. 範囲を限定した work item を開始する

```bash
cd /absolute/path/to/my-project

temple work-item create . \
  --title "Ship one bounded outcome" \
  --scope "One verified user flow" \
  --acceptance "Independent QA verifies the candidate revision"

temple doctor .
temple status .
```

作業が lifecycle を進む際は、`temple handoff`、`temple transition`、`temple close` を使用します。全コマンドは `temple --help` で確認できます。

## 開発手法と拡張

Temple はデフォルト導入を限定的に保ちます。プロダクト思考と組織運用の Skill は core capability として導入し、開発手順は opt-in にします。現在提供される Build Quality pack は、Position の ownership や lifecycle authority を変えずに、TDD と範囲を限定した bug diagnosis を追加します。

Temple には、境界が明確な project-owned Skill を作るための `$skill-authoring` と [Skill authoring guide（英語）](docs/skill-authoring.md)も含まれます。Temple-compatible Skill は、固有の trigger、authority boundary、evidence input、手順、output、停止条件、verification を定義する必要があります。

[Engineering Learning Loop（英語）](docs/engineering-learning.md)は、完了した作業の evidence を Lesson、採用された Practice、そして根拠がある場合に限って Skill、自動チェック、ADR、instruction へ進める管理された経路です。簡潔な project index により、後続の Agent は全履歴を読み込んだり、すべての観察をルール化したりせず、関連する学習だけを取得できます。

これは拡張モデルの出発点であり、完成した Skill ecosystem ではありません。Temple はまだ Skill CLI、capability registry、custom-pack publisher、third-party Skill installer を提供していません。Architecture、exploration、review、security、Git、retrospective の pack は、提供済み機能ではなく評価中の候補です。[Capability catalog（英語）](docs/capability-catalog.md)を参照してください。

## 規模と現在の境界

現在の小規模チーム構成では、5つの Agent Identity が9つすべての Position を担当します。データモデルは、体制の拡大後も Position の語彙と過去の Identity ID を維持し、Developer と Independent QA の分離を保てるよう設計されています。現行 alpha には、再割り当て CLI やリスク別の人員構成ワークフローはまだありません。

Temple はこの初期構成を越えて成長できるよう設計されていますが、あらゆるプロジェクト規模への対応はまだ実証されていません。現在の release には、1つの固定 lifecycle と1つの optional development pack があります。リスクベースの Lite、Standard、High-Assurance profile、より広い capability pack、正確な Git および外部 evidence adapter、より強い cross-task recovery の実証、live observation、multi-project view は今後の計画です。

Temple は現在 revision reference を記録しますが、CLI はまだすべての reference を正確な Git object として解決しません。Codex task の作成、名前変更、archive は行わず、外部への deploy や publish も実行しません。ビジネス上の事実、優先順位、機密データ、重大なコスト、不可逆な操作、高リスクな承認は人間が管理します。

Temple はプロジェクトへインストールします。プロジェクトをこの repository から fork する必要はありません。組織と state は導入先プロジェクトの一部になり、中央 framework は独立して upgrade できます。

## ドキュメント

- [使用ガイド](docs/usage.md) — 初期化、日常コマンド、upgrade、トラブルシューティング
- [Vision と operating model](docs/vision.md) — framework layer、Position、lifecycle
- [Architecture](docs/architecture.md) — identity、ownership、extension、canonical-state boundary
- [Skill authoring guide](docs/skill-authoring.md) — project-owned Skill の設計と検証
- [Engineering Learning Loop](docs/engineering-learning.md) — evidence、Lesson、Practice、検索、昇格
- [Capability catalog](docs/capability-catalog.md) — 提供済み、optional、候補の engineering method
- [Roadmap](docs/roadmap.md) — 検証済みの scope と今後の作業
- [Architecture decision](docs/adr/README.md) — 設計判断と理由

詳細ドキュメントは英語で管理されています。

## ライセンス

[MIT](LICENSE)。第三者由来の情報と採用範囲は [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) に記載しています。
