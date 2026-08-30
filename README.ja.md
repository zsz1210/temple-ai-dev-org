# Temple — AI Development Organization Framework

[English](README.md) | **日本語** | [繁體中文](README.zh-TW.md)

**複数の AI Agent を使っても、プロジェクトを分断されたチャットの山にしないための開発フレームワークです。**

Temple は、新規または既存のプロジェクトに、リポジトリ中心の小さな開発組織を導入します。AI Agent に安定した責任、共有されたプロジェクト状態、再利用可能な開発手法、範囲を限定した作業、evidence に基づく delivery を与え、別の Agent が元の会話を再構築せずに作業を継続できるようにします。

> Temple は低リスクのプロジェクトとフレームワーク検証を対象とした early alpha です。まだ npm release や production control plane ではありません。

## なぜ Temple が必要なのか

Coding Agent は高速ですが、速さだけではチームになりません。

共通の運用モデルがなければ、Agent はプロダクトを理解する前に実装を始め、別の会話と同じ作業を繰り返し、同じファイルを編集し、実装と承認を混同し、再現可能な evidence なしで完了を宣言します。重要な決定もチャットの終了とともに失われます。

Temple は、継続に必要なものをリポジトリへ残します。

- **責任:** Product、architecture、development、quality、integration、release、observation を分離します。1つの AI が複数の役割を担当しても責任は混ざりません。
- **共有された真実:** Spec、decision、Work Item、handoff、learning、evidence が1つの task を越えて残ります。
- **開発手法:** Skill が interview、domain modeling、documentation、testing、diagnosis、組織拡張を再利用可能な手順にします。
- **安全な協調:** Agent を並列実行する前に、依存関係、affected path、ownership、共有 resource で作業を分離します。
- **検証:** Developer の主張、evaluation、Independent QA、approval、release を exact revision に結び付けた別の段階として扱います。

Temple は共有チャット memory でも prompt 集でもありません。プロダクトのアイデアと、それを構築する Agent の間にある運用レイヤーです。

## 仕組み

```text
Idea
  ↓ product intent と shared language を明確化
Specification
  ↓ bounded Work Item を作り責任を割り当てる
Build
  ↓ engineering Skill と安全な parallel work を使う
Verification
  ↓ evaluation、独立再現、approval、close
Repository state
  → 次の人または Agent が継続できる
```

たとえば guest checkout を追加する場合、Product Manager が最初にアイデアを承認可能な outcome に変えます。Architect と UI／UX の責任者が影響する contract を定義し、Developer は重複しない別々の Work Item を受け取ります。Quality が behavior を評価し、Independent QA が candidate revision から再現し、Release が evidence が十分か判断します。各段階は1つの長い chat に依存せず、repository を読み書きして継続します。

Temple には、Product Manager、UX Designer、UI Designer、Software Architect、Developer、Quality & Evaluation Engineer、Independent QA、Release Manager、Integration Owner、Observer の10個の安定した Position があります。初期化時に、これらをプロジェクト固有の Agent Identity に割り当てます。小規模プロジェクトは5つの Identity から開始でき、大規模チームは組織を作り直さず専門家を追加できます。

**Position** は責任を定義します。**Agent Identity** はプロジェクト固有の実行者です。**Skill** は再利用可能な手法です。Skill は仕事の進め方を改善しますが、権限を追加したり verification gate を回避したりしません。

## クイックスタート

必要条件：Git、Node.js 20 以降、Codex、導入先のプロジェクトディレクトリ。

### 1. Source からインストール

```bash
git clone https://github.com/zsz1210/temple-ai-dev-org.git
cd temple-ai-dev-org
npm ci
npm run verify
npm link
```

Early alpha の間は private repository のため、clone にはアクセス権が必要です。

### 2. プロジェクトを初期化

このリポジトリを Codex で開き、次のように依頼します。

> `$temple-init` を使って `/absolute/path/to/my-project` を初期化してください。Agent Identity の英語名を提案し、ファイルを書き込む前に私の確認を待ってください。

Temple は導入先を調査し、組織を提案し、dry run を表示し、project-owned state と framework-managed files を導入して health check を行います。Product ごとに Temple を fork するのではありません。Temple はその product repository に導入され、framework 自体は独立して upgrade できます。

### 3. 範囲を限定した outcome を開始

初期化済みプロジェクトで Codex に依頼します。

> `$decision-interview` で変更内容を明確にし、`$temple-work` で独立検証できる最小の Work Item を作成してください。

基本的な確認コマンド：

```bash
node ./templew.mjs doctor .
node ./templew.mjs status .
node ./templew.mjs observe .
```

既存プロジェクトへの導入、CLI、upgrade、並列作業、tracker、UI mode、troubleshooting は [Usage guide（英語）](docs/usage.md) を参照してください。

## 必要な組織レベルを選ぶ

| Profile | 適している状況 | 追加されるもの |
|---|---|---|
| **Solo** | 1人が複数の AI Agent を使う | 10 Position を標準で5 Agent Identity に割り当て、責任と Independent QA を可視化 |
| **Collaborative** | 複数の人や専門家がプロジェクトを共有する | Human Principal、agent sponsorship、Position pool、Discipline、claim、dependency、integration ownership |
| **High-Assurance** | リスクにより強い人間の説明責任が必要 | リスクに応じた evidence、rollback、独立承認、より厳格な職務分離 |

UI work は `not-applicable`、`code-first`、`preview-first`、`design-led` を選択できます。Figma は任意であり、特定ツールではなくプロジェクト規模とリスクに応じて必要 evidence を変えます。

## プロジェクトとともに成長する手法

Core installation には、初期化、bounded work、decision interview、domain modeling、project documentation、Skill authoring の Skill が含まれます。Optional Build Quality pack は TDD と体系的な bug diagnosis を追加します。

プロジェクトは、Temple に ownership を渡さず独自 Skill を追加できます。Engineering Learning Loop は最初に Lesson と Practice を保存し、繰り返し evidence が得られた場合だけ Skill、check、ADR、instruction へ昇格します。Context routing により、リポジトリ全体を読み込まず関連する手法と知識を取得できます。

Temple は、すべての engineering Skill、semantic search、external tracker integration、model を標準では導入しません。Optional capability は明示的で、review 可能かつ削除可能でなければなりません。

## 人間に残る責任

Temple は repository work を調整しますが、business truth、priority、credential、material spending、不可逆な外部操作、高リスク承認を所有しません。Jira、GitHub Projects などを人間の planning surface として維持し、Temple Work Item で repository 内の AI execution と evidence を管理できます。

現在の alpha が証明しているのは local と fixture-backed の behavior です。あらゆる企業構成、distributed race、regulated audit、production deployment を証明したものではありません。

## ドキュメント

[Documentation map（英語）](docs/README.md) から始めてください。この README に実装履歴を並べるのではなく、読者と目的ごとに guide を整理しています。

- [Usage（英語）](docs/usage.md) — install、initialize、operate、upgrade
- [Vision（英語）](docs/vision.md) — responsibility、lifecycle、設計思想
- [Roadmap](docs/roadmap.ja.md) — delivered、now、next、later
- [Testing strategy（英語）](docs/testing.md) — local、CI、release、live validation
- [Architecture decisions（英語）](docs/adr/README.md) — 重要な選択の理由
- [Validation records（英語）](docs/validation/README.md) — 限定された evidence と残る gap
- [Changelog（英語）](CHANGELOG.md) — release history

## ライセンス

[MIT](LICENSE)。Third-party source と採用境界は [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) に記録しています。
