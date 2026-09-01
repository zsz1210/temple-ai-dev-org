<h1 align="center">Temple</h1>

<p align="center"><strong>AI 開発組織フレームワーク</strong></p>

<p align="center">人と AI が同じプロジェクトで役割を分け、引き継ぎ、確かめながら開発を進めるための仕組みです。</p>

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

AI にコードを書かせるだけなら、以前よりずっと簡単になりました。難しいのは、会話や担当が増えたあとも「何のために作るのか」「誰が責任を持つのか」「どこまで進んだのか」「何をもって完了とするのか」を、プロジェクト全体で説明できる状態に保つことです。

Temple は、この「開発を回す仕組み」をリポジトリの中に作ります。判断、担当、進捗、検証結果、次に生かせる知見を、特定のチャットに依存しない形で残します。会社の上下関係を持ち込むものでも、固定の組織図を押し付けるものでもありません。一人で複数の AI を使うプロジェクトから、複数人のチームまで、同じ土台で運用できます。

### 開発中のプロジェクトにも、新規プロジェクトにも導入できます

Temple は、Web、モバイル、バックエンドを作るためのアプリケーションフレームワークではありません。特定のプログラミング言語、開発フレームワーク、クラウドサービス、プロジェクト管理ツールも指定しません。開発中のプロジェクトへ後から導入することも、新しいプロジェクトの立ち上げ時から使うこともできます。プロダクトのアーキテクチャ、コード、依存ライブラリ、データモデル、デプロイ方法は、これまでどおり各プロジェクトが決めます。

Temple が加えるのは、人と AI の開発を組織として運用し、あとから確認できるようにする仕組みです。誰が何を担当するのか、どの判断を人が承認するのか、作業をどう分けて引き継ぐのか、完了の根拠として何を残すのか、実績のある進め方を次の仕事でどう再利用するのかを定義します。導入時には、組織運用と協働のためのファイルがリポジトリに加わりますが、プロダクトを書き直したり、Temple 専用のアプリケーション構成へ変更したりする必要はありません。

> **つまり、プロダクトをどう作るかは各プロジェクトが決め、Temple は人と AI がどう協力して完成まで進めるかを定義します。**

> [!NOTE]
> Temple は Early Alpha です。現時点では、人が確認しながら進める低リスクのローカル開発や、範囲を絞った試行に向いています。大規模なチームでの実運用、複数マシンにまたがる十分な検証、本番監視、無人の外部操作については、まだ実証済みとは言えません。

![Temple は、人が決める方向性、プロジェクト内の分担と検証、人と AI による実行、リポジトリに残る共有情報をつなぎます。](docs/assets/temple-overview.ja.svg)

<a id="how-temple-organizes-development"></a>

## Temple が開発を整理する仕組み

AI を使った開発では、大切な情報がチャット、管理ツール、担当者の手元に分かれがちです。Temple は、それらを次の六つに整理し、同じプロジェクトからたどれるようにします。

- **何を作るか：** 解決したい問題と、今回合意した到達点。
- **誰が責任を持つか：** 実際の担当と、人の確認が必要な判断の範囲。
- **どう進めるか：** 同じ種類の作業で繰り返し使える手順や Skill。
- **今どうなっているか：** 進行中、停止中、依存関係、並行してよい作業の区別。
- **何をもって完了とするか：** テスト、評価、レビュー、リリース準備を裏付ける記録。
- **次に何を生かすか：** 今回得た知見のうち、再利用または再確認する価値があるもの。

大事にしている原則は三つです。

1. **重要な情報をチャットだけに残さない。** 仕様、判断、進捗、引き継ぎ、テスト、承認は、あとからリポジトリで確認できるようにします。
2. **役割と担当者を分けて考える。** 人や AI が入れ替わっても、プロジェクト全体の分担を設計し直す必要はありません。
3. **「終わりました」だけで完了にしない。** 実装、テスト、評価、独立 QA、リリース準備を分け、それぞれを実際のリビジョンと記録に結び付けます。

Jira、GitHub Projects、Figma、既存の仕様書、チーム固有の Git 運用を捨てる必要はありません。それぞれが得意な情報は、そのまま各ツールで管理できます。Temple が受け持つのは、AI が関わる作業の範囲、引き継ぎ、検証結果をコードの近くに残すことです。

## 一つの依頼が Temple を通る流れ

![一つの Work Item は、人による方向付け、エンジニアリング、独立した品質保証を通り、検証記録をプロジェクトのリポジトリに残します。](docs/assets/temple-delivery-path.ja.svg)

Temple では、まず依頼を範囲の明確な [Work Item](docs/concepts/terminology.md#work-item) にまとめます。必要な仕様や資料、使う Skill、現在の担当、引き継いだ内容、次へ進むための確認事項を、この Work Item にひも付けます。

互いに依存しない作業は並行して進められます。依存関係がある成果は、正確なリビジョンと統合担当者を明示して合流させます。次の人や AI、別のタスクやマシンも、過去の会話を読み直さずに、リポジトリから現在地を確認できます。

## 一人でも、チームでも、同じ土台で使えます

| プロファイル | 適している状況 | 主な違い |
|---|---|---|
| **[Solo](docs/concepts/terminology.md#solo)** | 一人が中心になり、複数の AI と開発する | 一人で複数の役割を見られますが、開発と独立 QA は別の実行者 ID にします。 |
| **[Collaborative](docs/concepts/terminology.md#collaborative)** | 複数のメンバーが、それぞれ自分の AI を使って参加する | 誰が誰の AI に責任を持つか、どの役割を担当できるか、作業を誰が確保し、誰が統合するかを明示します。 |
| **[High-Assurance](docs/concepts/terminology.md#high-assurance)** | 失敗したときの影響が大きく、より厳しい確認が必要 | リスクに応じて、担当の分離、必要な証拠、復旧準備、複数人による承認を強化します。 |

現時点でもっとも検証が進んでいるのは Solo です。Collaborative と High-Assurance も実装され、ローカルテストを通過しています。ただし、大規模なチームや複数マシンを使った実運用での検証は、まだ十分ではありません。

### 人が増えても、役割の仕組みは変わりません

Temple では、ソフトウェア開発で必要になりやすい責任を十個の Position に分けています。

| プロダクトと体験 | エンジニアリングとデリバリー | 品質保証とリリース |
|---|---|---|
| Product Manager | Engineering Manager | Quality & Evaluation Engineer |
| UX Designer | Tech Lead | Independent QA |
| UI Designer | Developer | Release Manager |
|  |  | Observer |

Position は一時的に空席でも構いません。一人の既定担当を置くことも、担当可能な人や AI を複数登録することもできます。同じ人や AI が複数の Position を兼任できますが、同じ作業の Developer と Independent QA だけは、必ず別の実行者 ID にします。

### 最初に知っておきたい四つの用語

| Temple の用語 | 平易な意味 |
|---|---|
| **[役割（Position）](docs/concepts/terminology.md#position)** | 継続して使う責任範囲です。会社の肩書や上下関係とは別に扱います。 |
| **[実行者 ID（Agent Identity）](docs/concepts/terminology.md#agent-identity)** | 誰、またはどの AI が作業したかを、プロジェクト内で区別するための ID です。 |
| **[作業単位（Work Item）](docs/concepts/terminology.md#work-item)** | 範囲、担当、状態、完了条件をまとめた、追跡可能な一件の作業です。 |
| **[根拠となる記録（Evidence）](docs/concepts/terminology.md#evidence)** | テストやレビューの結論を裏付け、対象のリビジョンも確認できる記録です。 |

Skill は、特定の作業を進めるための再利用可能な手順書に近いものです。AI の進め方は案内できますが、権限を与える許可証ではありません。依存パッケージの承認や、確認工程の省略もできません。

<a id="quick-start"></a>

## クイックスタート

事前に Git、Node.js 20 以降、Codex、Temple を導入したいプロジェクトのディレクトリを用意してください。

### 1. ソースから Temple をインストールする

```bash
git clone https://github.com/zsz1210/temple-ai-dev-org.git
cd temple-ai-dev-org
npm ci
npm run verify
npm link
```

### 2. プロジェクトを初期化する

Codex で Temple のリポジトリを開き、導入先を伝えます。プロンプトに書く `$name` は、「この [Temple Core Skill（英語）](docs/getting-started/core-skills.md)を使ってください」という指定です。ターミナルで実行するコマンドではありません。

> [`$temple-init`](docs/getting-started/core-skills.md#temple-init) を使って `/absolute/path/to/my-project` を初期化してください。Agent Identity の英語名を提案し、ファイルを書き込む前に私の確認を待ってください。

初期化すると、導入先に開発運営用のファイル一式が追加されます。

- [`TEMPLE.md`](docs/concepts/terminology.md#temple-md) と Position 設定には、各役割の責任と権限の境界が書かれます。
- [`.ai-org/`](docs/concepts/terminology.md#ai-org) には、プロジェクト固有の実行者 ID、Work Item、参照すべき資料、検証記録、学習、再生成できる表示が保存されます。
- [`templew.mjs`](docs/concepts/terminology.md#templew) と [`temple.lock`](docs/concepts/terminology.md#temple-lock) は、使用する Temple のバージョンと、フレームワークが管理するファイルを固定します。
- [Core Skills（英語）](docs/getting-started/core-skills.md)は繰り返し使える作業手順を提供します。プロジェクト独自の Skill は、そのプロジェクトの所有物です。

### 3. 最初の作業項目を始める

初期化したプロジェクト内で、次のように依頼します。

> [`$decision-interview`](docs/getting-started/core-skills.md#decision-interview) でこの変更を明確にし、[`$temple-work`](docs/getting-started/core-skills.md#temple-work) で独立して検証できる最小の Work Item を作成してください。

続けて、ローカル環境でプロジェクトを確認します。

```bash
node ./templew.mjs doctor .
node ./templew.mjs status .
node ./templew.mjs observe .
```

製品ごとに Temple を fork する必要はありません。それぞれのプロジェクトへ導入して使います。最初からすべての仕組みを有効にせず、まずは Solo で範囲のはっきりした作業を一件だけ進めてください。AI の数、専門分野、外部連携、厳しい確認工程は、必要になってから追加できます。

導入、アップグレード、セルフホスティング、並行作業、外部トラッカー、UI モード、トラブルシューティングについては、[英語の Usage guide](docs/getting-started/usage.md) を参照してください。

<a id="maturity"></a>

## 現在できること・まだできないこと

| 状態 | 現在の範囲 |
|---|---|
| **利用できる** | 人が確認する Solo のワークフロー、柔軟に担当を割り当てられる十個の Position、Work Item と工程ごとの確認、リポジトリからの資料・Skill の参照、学習と検証記録、ローカルでの状態確認、アップグレードと復旧の保護。 |
| **限定的に検証済み** | Collaborative、High-Assurance、安全な並行計画、プロバイダーと利用量の観測、読み取り専用の外部トラッカーと複数プロジェクト表示、ローカル管理画面。自動テストや小規模な検証はありますが、一般的な組織での実運用を証明するものではありません。 |
| **まだ前提にできない** | 大規模チームと複数マシンでの実運用、本番環境の自動監視・修復、無人の外部書き込み、設定済みの意味検索、規制対象での利用、幅広い企業導入の実績。 |

ここで示している成熟度は、自動テストと範囲を絞った検証記録に基づきます。あらゆる企業構成、規制監査、分散環境の競合、本番導入まで検証済みという意味ではありません。実測できる比較基準がない段階で、時間や Token を一定割合削減できるとも主張しません。

## 目的別の詳しい資料

| 知りたいこと | 最初に読む資料 |
|---|---|
| Temple 固有の用語を理解したい | [Temple terminology（英語）](docs/concepts/terminology.md) |
| プロンプト内の `$name` という手法を理解したい | [Temple Core Skills（英語）](docs/getting-started/core-skills.md) |
| 運営モデル全体を理解したい | [Vision（英語）](docs/concepts/vision.md) |
| システムとエンジニアリング上の境界を確認したい | [Architecture（英語）](docs/concepts/architecture.md) |
| Temple をインストール、導入、アップグレードしたい | [Usage guide（英語）](docs/getting-started/usage.md) |
| 複数の人と各自の AI を連携させたい | [Collaborative development（英語）](docs/operations/collaboration.md) |
| テスト、検証記録、リリース準備を理解したい | [Evidence and Observer（英語）](docs/operations/evidence-and-observer.md) |
| エンジニアリング手法を追加、作成したい | [Capability catalog（英語）](docs/extensions/capability-catalog.md)と[Skill authoring（英語）](docs/extensions/skill-authoring.md) |
| 学習と意図的な Skill への昇格を理解したい | [Engineering Learning Loop（英語）](docs/extensions/engineering-learning.md) |
| 現在の制約と未完了の検証を確認したい | [Roadmap](docs/planning/roadmap.ja.md)と[検証記録（英語）](docs/validation/README.md) |

完全な[ドキュメント一覧（英語）](docs/README.md)には、アーキテクチャ上の決定、コントリビューション、安全方針、変更履歴、調査、試行の検証記録へのリンクもあります。

## 最終判断は人が行います

Temple が扱うのは、リポジトリ内の作業と、その進め方です。事業上の判断、優先順位、認証情報、多額の支出、取り消せない外部操作、本番環境の修復、高リスク作業の承認を、Temple が勝手に決めることはありません。外部システムから情報を取り込んでも、そのシステムに工程やリリースの決定権が移るわけではありません。

## License

[MIT](LICENSE)。第三者由来の資料と導入上の境界は [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) に記録しています。
