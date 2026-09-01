<h1 align="center">Temple</h1>

<p align="center"><strong>AI 開発組織フレームワーク</strong></p>

<p align="center">Temple は、人と AI が協働し、学びを積み重ね、根拠をもって成果を届けるための開発組織をソフトウェアプロジェクトに構築します。</p>

<p align="center"><a href="README.md">English</a> · <strong>日本語</strong> · <a href="README.zh-TW.md">繁體中文</a></p>

<p align="center">
  <a href="https://github.com/zsz1210/temple-ai-dev-org/actions/workflows/ci.yml"><img alt="CI の状態" src="https://github.com/zsz1210/temple-ai-dev-org/actions/workflows/ci.yml/badge.svg"></a>
  &nbsp;·&nbsp; Early Alpha
  &nbsp;·&nbsp; Node.js 20+
  &nbsp;·&nbsp; <a href="LICENSE">MIT License</a>
</p>

<p align="center"><a href="#how-temple-organizes-development">仕組み</a> · <a href="#quick-start">クイックスタート</a> · <a href="#maturity">現在の制約</a></p>

---

## Temple とは？

AI は計画、実装、テスト、レビューを行えます。しかし、信頼できるソフトウェア開発には、プロダクトの方向性、明確な責任と権限、再現可能なエンジニアリング手法、作業の調整、独立した検証、そして継続的に改善されるプロジェクトの記憶も必要です。

Temple は、この運営の仕組みをプロジェクトのリポジトリに残します。上司と部下を表す階層でも、固定された組織図でもありません。一人の開発者、複数の AI、より大きなチームのいずれでも、判断、分担、実行、検証、学習を同じ考え方で進めるための共通ルールです。

> [!NOTE]
> Temple は Early Alpha です。現時点では、人が監督する低リスクのローカルプロジェクトや範囲を限定した試行に適しています。大規模な複数人・複数マシン環境での十分な検証、本番環境の監視、無人での外部操作は、まだ実証済みの機能として扱っていません。

![Temple は、人による方向付け、プロジェクト内の四つの組織機能、人と AI による実行、リポジトリに残るプロジェクトの共有事実をつなぎます。](docs/assets/temple-overview.ja.svg)

<a id="how-temple-organizes-development"></a>

## Temple が開発を組織する方法

Temple は、会話、ツール、担当者の間に散らばりやすい六つの要素をつなぎます。

- **プロダクトの方向性：** どの問題が本当に重要で、どの成果が承認されているか。
- **責任と権限：** 誰が作業を担い、誰が承認できるか。
- **エンジニアリング手法：** その種類の作業をどのように進めるか。
- **作業の調整：** 何が進行中で、何が止まり、どの作業を安全に並行できるか。
- **検証とデリバリー：** 完了やリリース準備をどの記録で裏付けるか。
- **学習と記憶：** 次の作業で何を復元し、再利用し、再検証できるか。

仕組み全体を理解しやすく保つために、三つの原則があります。

1. **リポジトリをプロジェクトの共有記憶にする。** 会話は作業の場ですが、仕様、決定、作業状態、引き継ぎ、テスト、承認は会話の外からも復元できる状態にします。
2. **責任と実行者を分ける。** 人や AI が入れ替わっても、プロジェクトの運営モデルを書き直す必要はありません。
3. **完了を検証記録で示す。** 実装、テスト、評価、独立 QA、リリース準備は別々の段階であり、既知のリビジョンに結び付けます。

Temple は Jira、GitHub Projects、Figma、既存の仕様書、リポジトリの慣例を置き換えません。それぞれのシステムは担当する情報の正本であり続けられます。Temple は、範囲を定めた AI 支援の作業と検証記録をコードのそばに残します。

## 一つの依頼が Temple を通る流れ

```text
成果を明確にする
  → 範囲を承認する
  → 進め方を設計する
  → 実装する
  → テストして評価する
  → 独立して検証する
  → リリース準備を記録する
```

Temple は依頼ごとに、範囲を定めた一つの作業単位、必要なコンテキストと手法、担当者、引き継ぎ、次の段階に必要な検証記録を保持します。互いに独立した安全な作業は並行できます。依存する作業は、正確なリビジョンと明確な統合責任者を通じて合流します。

決定、検証記録、再利用できる学びはリポジトリに残ります。次の人、AI、タスク、マシンは、古い会話を正本として扱わずに、プロジェクトの現在の状態を復元できます。

## 規模とリスクに合わせて使える一つの運営モデル

| プロファイル | 適している状況 | 主な違い |
|---|---|---|
| **Solo** | 一人が AI 支援の開発を指揮する | 少数の実行者 ID が複数の責任を担えますが、開発と独立 QA は分離します。 |
| **Collaborative** | 複数のメンバーがそれぞれの AI を利用する | 人による担当、対応可能な責任の範囲、作業の確保、専門領域、共有資源、統合責任を明示します。 |
| **High-Assurance** | 運用上または事業上のリスクが高い | 実行者の分離、リスクに応じた検証記録、復旧準備、異なる人による承認を厳格にします。 |

現時点でもっとも検証が進んでいるのは Solo です。Collaborative と High-Assurance のルールは実装され、ローカルテストを通過していますが、大規模な複数人・複数マシン環境での十分な実証は今後の課題です。

### 組織を作り直さずに担当者を増減できます

Temple は、責任を表す十個の安定した Position を定義します。

| プロダクトと体験 | エンジニアリングとデリバリー | 品質保証とリリース |
|---|---|---|
| Product Manager | Engineering Manager | Quality & Evaluation Engineer |
| UX Designer | Tech Lead | Independent QA |
| UI Designer | Developer | Release Manager |
|  |  | Observer |

各 Position は、一時的に実行者がいない状態、一人の既定実行者、またはプロファイルとプロジェクト方針に応じた複数の候補者を持てます。同じ人や AI が複数の Position を兼任できますが、同じ作業の Developer と Independent QA には異なる実行者 ID が必要です。

### 最初に知っておきたい四つの用語

| Temple の用語 | 平易な意味 |
|---|---|
| **責任上の役割（Position）** | 責任の範囲と承認の境界を定める、安定した契約です。 |
| **実行者 ID（Agent Identity）** | プロジェクト内で実際に作業する人または AI を識別します。 |
| **作業項目（Work Item）** | 範囲、担当、状態、受け入れに必要な検証記録を持つ一つの成果です。 |
| **検証記録（Evidence）** | テスト、レビュー、承認、デリバリーに関する主張を裏付け、特定のリビジョンに結び付く記録です。 |

Skill は再利用可能なエンジニアリング手法です。作業の進め方を案内できますが、権限を与えたり、依存関係を承認したり、ライフサイクルの確認段階を省略したりすることはできません。

<a id="quick-start"></a>

## クイックスタート

必要なもの：Git、Node.js 20 以降、Codex、導入先のプロジェクトディレクトリ。

### 1. ソースから Temple をインストールする

```bash
git clone https://github.com/zsz1210/temple-ai-dev-org.git
cd temple-ai-dev-org
npm ci
npm run verify
npm link
```

### 2. プロジェクトを初期化する

Codex で Temple のリポジトリを開き、次のように依頼します。

> `$temple-init` を使って `/absolute/path/to/my-project` を初期化してください。Agent Identity の英語名を提案し、ファイルを書き込む前に私の確認を待ってください。

Temple は導入先のプロジェクトに、目で確認できる運営レイヤーを追加します。

- `TEMPLE.md` と Position の設定は、責任と権限の境界を定義します。
- `.ai-org/` は、プロジェクトが所有する実行者 ID、作業項目、コンテキストの参照先、検証記録、学習、再生成可能な表示を保存します。
- `templew.mjs` と `temple.lock` は、フレームワークの実行バージョンと管理対象ファイルの正確な所有範囲を固定します。
- Core Skills は再現可能な手法を提供し、プロジェクト固有の Skill はそのプロジェクトが所有します。

### 3. 最初の作業項目を始める

初期化したプロジェクト内で、次のように依頼します。

> `$decision-interview` でこの変更を明確にし、`$temple-work` で独立して検証できる最小の Work Item を作成してください。

続けて、ローカル環境でプロジェクトを確認します。

```bash
node ./templew.mjs doctor .
node ./templew.mjs status .
node ./templew.mjs observe .
```

製品ごとにフレームワークを fork するのではなく、各プロジェクトに Temple を導入します。まずは Solo と、範囲を明確にした一つの成果から始めてください。AI、専門領域、外部連携、厳格な確認段階は、プロジェクトで必要になったときに追加します。

導入、アップグレード、セルフホスティング、並行作業、外部トラッカー、UI モード、トラブルシューティングについては、[英語の Usage guide](docs/getting-started/usage.md) を参照してください。

<a id="maturity"></a>

## 現在どこまで利用できますか？

| 状態 | 現在の範囲 |
|---|---|
| **現在利用可能** | 人が監督する Solo の作業フロー、柔軟に担当を割り当てられる十個の安定した Position、作業項目とライフサイクルの確認段階、決定的に復元できるコンテキストと能力の参照、管理された Skill と学習、検証記録、ローカルの状態表示、アップグレードと復旧の境界。 |
| **実験的または限定的** | Collaborative と High-Assurance のルール、安全な並行計画、プロバイダーと利用量の観測、読み取り専用の外部トラッカーと複数プロジェクトの調整、ローカル管理画面にはリポジトリテストまたは限定的なローカル検証がありますが、一般的な組織運用の実証ではありません。 |
| **計画中または未検証** | 大規模な複数人・複数マシン環境での実運用、本番環境の監視と修復、無人での外部書き込み、構成済みの意味検索、規制対象での受け入れ、広範な企業利用の実証。 |

現在の主張は、自動化されたリポジトリ検査と範囲を限定した検証記録に基づきます。あらゆる企業構成、規制監査、分散環境の競合、本番展開を証明するものではありません。比較基準を実測していない段階で、時間やトークンを特定の割合だけ削減できるとは主張しません。

## 目的別の詳しい資料

| 知りたいこと | 最初に読む資料 |
|---|---|
| 運営モデル全体を理解したい | [Vision（英語）](docs/concepts/vision.md) |
| システムとエンジニアリング上の境界を確認したい | [Architecture（英語）](docs/concepts/architecture.md) |
| Temple をインストール、導入、アップグレードしたい | [Usage guide（英語）](docs/getting-started/usage.md) |
| 複数の人と各自の AI を連携させたい | [Collaborative development（英語）](docs/operations/collaboration.md) |
| テスト、検証記録、リリース準備を理解したい | [Evidence and Observer（英語）](docs/operations/evidence-and-observer.md) |
| エンジニアリング手法を追加、作成したい | [Capability catalog（英語）](docs/extensions/capability-catalog.md)と[Skill authoring（英語）](docs/extensions/skill-authoring.md) |
| 学習と意図的な Skill への昇格を理解したい | [Engineering Learning Loop（英語）](docs/extensions/engineering-learning.md) |
| 現在の制約と未完了の検証を確認したい | [Roadmap](docs/planning/roadmap.ja.md)と[検証記録（英語）](docs/validation/README.md) |

完全な[ドキュメント一覧（英語）](docs/README.md)には、アーキテクチャ上の決定、コントリビューション、安全方針、変更履歴、調査、試行の検証記録へのリンクもあります。

## 人による権限を明確に保つ

Temple はリポジトリ内の作業を調整しますが、事業上の事実、優先順位、認証情報、多額の支出、取り消せない外部操作、本番環境の修復、高リスク作業の承認を所有しません。外部システムは作業フローに情報を提供できますが、ライフサイクルやリリースの決定権を自動的に得ることはありません。

## License

[MIT](LICENSE)。第三者由来の資料と導入上の境界は [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) に記録しています。
