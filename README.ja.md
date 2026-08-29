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
| 組織と権限 | 10の安定した Position、プロジェクト固有の Agent Identity、default Assignment、Human Principal、Agent sponsorship、Discipline 付き Position pool、明示的な人間の承認境界、Developer と Independent QA の分離 |
| 開発手法 | Core Skill と、`$tdd` および `$diagnosing-bugs` を含む opt-in の Build Quality pack |
| 作業オーケストレーション | 永続的な work item と handoff、固定の `Spec → Design → Build → Test → Eval → Independent QA → Release Gate` lifecycle、deterministic safe dispatch wave、claim-before-worker preparation、共有 runtime capacity の可視化 |
| チームと tracker の連携 | 会社 tracker、team-visible outcome、AI 内部の分解、Codex session を分離し、明示的な mapping、field ownership、限定された observation、evidence-backed reconciliation で接続 |
| 検証とデリバリー | 名前付き gate evidence、evaluation、独立再現、revision reference、approval record、rollback plan、範囲を限定した closeout |
| 永続的な状態、学習、可観測性 | リポジトリが所有する decision、Context Map、Lesson、Practice、work item、event、task registry、生成 Capability Registry、Context Capsule、status、conflict-aware upgrade |

Position は責任と承認限界を定義します。Agent Identity は、その Position に割り当てられるプロジェクト固有の実行者です。Skill は特定の仕事を行うための再利用可能な手法であり、権限を拡大したり evidence gate を置き換えたりするものではありません。

インターフェース範囲がある場合、UI Designer は正式な Position ですが、Temple はすべてのプロジェクトに事前の Figma 制作を求めません。Work Item は UI なし、担当 AI による code-first、preview-first、または承認済み設計ソースを使う design-led を選択でき、[UI delivery mode（英語）](docs/ui-design.md) により evidence をリスクに合わせます。

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

node ./templew.mjs work-item create . \
  --title "Ship one bounded outcome" \
  --scope "One verified user flow" \
  --acceptance "Independent QA verifies the candidate revision" \
  --ui-mode code-first \
  --affected-path "src/verified-flow/**"

node ./templew.mjs capability find . --query "verify one user flow"
node ./templew.mjs context resolve . --work-item WI-0001 --no-write
node ./templew.mjs doctor .
node ./templew.mjs status .
```

作業が lifecycle を進む際は、repository launcher 経由で `handoff`、`transition`、`close` を使用します。launcher は導入済み framework version を固定するため、後続 task が偶然存在する global CLI に依存しません。全コマンドは `node ./templew.mjs --help` で確認できます。

1つの parent outcome が明確な child Work Item に分解されたら、`node ./templew.mjs parallel plan . --parent <WI-ID>` で fresh かつ capacity-aware な dispatch manifest を生成できます。この操作は Codex task や claim を作成しません。各 first-wave runtime を作る前に、`parallel prepare` が適格な claim、希少 resource の reservation、runtime-worker correlation を一体として記録します。internal subagent と別の user-owned Codex task は区別され、指定された Integration Owner は引き続き exact evidence を join してから再計画します。[Parallel orchestration（英語）](docs/parallel-orchestration.md)と[runtime coordination（英語）](docs/runtime-coordination.md)を参照してください。

Alpha.19 で Phase 2C が完了しました。Pack v2 は version、provenance、reference、script、asset を扱い、runtime JSON Schema と migration plan を検査できます。Learning は atomic capture、revalidation、retrieval evaluation を提供します。High-Assurance は人間の accountability と risk gate を満たした場合に選択でき、optional Archify adapter は exact local source のみを隔離導入して digest を検証します。semantic model、vector database、daemon、第三者 download、外部 action はデフォルトで導入されません。

## 開発手法と拡張

Temple はデフォルト導入を限定的に保ちます。プロダクト思考と組織運用の Skill は core capability として導入し、開発手順は opt-in にします。現在提供される Build Quality pack は、Position の ownership や lifecycle authority を変えずに、TDD と範囲を限定した bug diagnosis を追加します。

Temple には、境界が明確な project-owned Skill を作るための `$skill-authoring` と [Skill authoring guide（英語）](docs/skill-authoring.md)も含まれます。Temple-compatible Skill は、固有の trigger、authority boundary、evidence input、手順、output、停止条件、verification を定義する必要があります。

[Engineering Learning Loop（英語）](docs/engineering-learning.md)は、完了した作業の evidence を Lesson、採用された Practice、そして根拠がある場合に限って Skill、自動チェック、ADR、instruction へ進める管理された経路です。簡潔な project index により、後続の Agent は全履歴を読み込んだり、すべての観察をルール化したりせず、関連する学習だけを取得できます。

生成される Capability Registry は、core、optional-pack、project-owned の repository Skill を、extension の ownership を奪わずに一覧化します。`temple capability find` と work-item Context Capsule は、Agent が範囲を限定した evidence と利用候補の method を選ぶ助けになりますが、選択によって権限が増えたり dependency が導入されたりすることはありません。Pack v2 は複数ファイルの official pack を規定し、project-owned Skill は中央 framework に所有されず拡張できます。Temple はまだ Skill mutation command、custom-pack publisher、third-party Skill installer を提供していません。[Capability catalog（英語）](docs/capability-catalog.md)、[extension contract（英語）](docs/extension-and-migrations.md)、[context routing guide（英語）](docs/context-routing.md)を参照してください。

## 規模と現在の境界

既定の Solo 構成では、5つの Agent Identity が10の Position すべてを担当します。Product Design Identity は当初、Product Manager、UX Designer、UI Designer を兼任します。Collaborative foundation では、Human Principal、追加の Agent Identity、sponsorship、frontend、backend、full-stack、infrastructure、UI、UX などの Discipline を持つ複数メンバーの Position pool を追加できます。既存の default Assignment は互換性を保ち、範囲を限定した Work Item は別の適格な pool member が claim できます。

Solo、Collaborative、High-Assurance はすべて選択可能です。Collaborative mode は衝突しにくい Work Item ID、dependency、parallel readiness、Principal-backed claim を提供します。High-Assurance は少なくとも2人の active Human Principal、すべての active Agent Identity の sponsor、Developer と Independent QA／Release Manager の分離を要求し、Work Item の risk に応じて exact-revision evidence、rollback、approval gate を強化します。大規模な複数人・複数マシンの実機テストは `not_run` のため、すべての企業構成、regulated audit、production release への対応済みとは主張しません。[Collaborative development model（英語）](docs/collaboration.md)、[High-Assurance（英語）](docs/high-assurance.md)、[Evidence and Observer（英語）](docs/evidence-and-observer.md)を参照してください。

Temple は normalized Git、test、runtime、rollback と High-Assurance handoff/closeout の scope を exact commit に解決します。その他の軽量 reference は caller-supplied のままの場合があります。Codex task の作成、名前変更、archive は行わず、外部への deploy や publish も実行しません。ビジネス上の事実、優先順位、機密データ、重大なコスト、不可逆な操作、高リスクな承認は人間が管理します。

会社のチームは Jira、GitHub Issues、または別の tracker を計画面として維持し、Temple は AI の実行と evidence を repository Work Item に保持できます。Team-visible parent だけを外部項目へ対応させ、内部 child item を会社ボードへ大量に出さずに済みます。外部の完了状態が QA や Release Gate を迂回することもありません。Alpha.15 は限定された GitHub Issue 読み取りまたは supplied observation と reconciliation evidence を扱いますが、外部への書き込みは行いません。

Temple はプロジェクトへインストールします。プロジェクトをこの repository から fork する必要はありません。組織と state は導入先プロジェクトの一部になり、中央 framework は独立して upgrade できます。

## ドキュメント

- [使用ガイド](docs/usage.md) — 初期化、日常コマンド、upgrade、トラブルシューティング
- [Vision と operating model](docs/vision.md) — framework layer、Position、lifecycle
- [Architecture](docs/architecture.md) — identity、ownership、extension、canonical-state boundary
- [Collaborative development model](docs/collaboration.md) — Human Principal、Position pool、task slicing、parallel readiness、claim、diagram
- [Parallel orchestration](docs/parallel-orchestration.md) — safe wave、runtime dispatch、staleness、Integration Owner join gate
- [Runtime coordination and recovery](docs/runtime-coordination.md) — pinned launcher、stage requirement、shared resource、worker/task correlation
- [Task and external tracker coordination](docs/task-and-tracker-coordination.md) — 会社ボード、AI 内部作業、field ownership、mapping、reconciliation
- [Product specification system](docs/product-specifications.md) — product truth、revision 付き Work Item reference、iterative delivery
- [Enterprise document adoption](docs/enterprise-document-adoption.md) — 二重の authority を作らず既存ドキュメントを維持・接続・移行する方法
- [UI interaction contracts](docs/ui-interaction-contracts.md) — interface behavior、design artifact、implementation、backend contract の接続
- [Skill authoring guide](docs/skill-authoring.md) — project-owned Skill の設計と検証
- [Engineering Learning Loop](docs/engineering-learning.md) — evidence、Lesson、Practice、検索、昇格
- [Progressive context routing](docs/context-routing.md) — Context Map、Context Capsule、deterministic evaluation、local-hybrid boundary
- [Extension and migration contracts](docs/extension-and-migrations.md) — Pack v2、runtime schema、compatibility、明示的 migration
- [High-Assurance profile](docs/high-assurance.md) — 前提条件、risk tier、exact evidence、rollback、approval
- [Archify adapter](docs/archify-adapter.md) — pinned local installation、isolation、provenance、graceful degradation
- [UI design modes](docs/ui-design.md) — UI なしの記録、code-first、preview-first、design-led、tool policy
- [Capability catalog](docs/capability-catalog.md) — 提供済み、optional、候補の engineering method
- [Roadmap](docs/roadmap.md) — 検証済みの scope と今後の作業
- [Architecture decision](docs/adr/README.md) — 設計判断と理由

詳細ドキュメントは英語で管理されています。

## ライセンス

[MIT](LICENSE)。第三者由来の情報と採用範囲は [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) に記載しています。
