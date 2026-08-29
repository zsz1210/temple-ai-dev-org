# Temple

[English](README.md) | **日本語** | [繁體中文](README.zh-TW.md)

**Codex を利用する AI 開発チームのための、リポジトリ中心で導入可能な運用モデルです。**

Temple は、別々の Codex タスクがひとつの観測可能なワークフローに参加できるよう支援します。各タスクがコンテキストを復元するためのリポジトリ状態、作業時の明確な Position、そして記録された revision reference に結び付いた evidence ベースの handoff を提供します。

```text
Goal → Spec → Design → Build → Test → Eval → Independent QA → Release Gate
```

Temple は Agent 同士にチャットの記憶を共有させる仕組みではありません。リポジトリを唯一の信頼できる情報源にします。

## Temple が必要な理由

複数の Codex タスクは便利ですが、会話は状態の保存先として不安定です。共通の運用モデルがないと、次の問題が起こります。

- タスクをまたいで同じ作業が繰り返されたり、途中で放置されたりする
- 決定事項や未解決の質問がチャット履歴に埋もれる
- タスクのタイトルが、本来の識別子の代わりになってしまう
- テスト済み revision や再現可能な evidence がなくても「完了」と判断される

Temple は work item、assignment、decision、handoff、revision、検証 evidence をプロジェクト内に保存し、新しいタスクが作業再開に使える永続的な状態を提供します。

## はじめ方

必要条件：Git、Node.js 20 以降、および導入先となるプロジェクトディレクトリ。

### 1. Toolkit をインストールする

```bash
git clone https://github.com/zsz1210/temple-ai-dev-org.git
cd temple-ai-dev-org
npm run verify
npm link
```

現在は early alpha のため repository は private です。clone コマンドの実行には GitHub へのアクセス権が必要です。公開化は別の release step として扱います。

### 2. プロジェクトを初期化する

推奨方法は、Temple の checkout を Codex で開き、次のように依頼することです。

> `$temple-init` を使って `/absolute/path/to/my-project` を初期化してください。5つの Agent Identity に付ける英語名を提案し、変更を行う前に私の確認を待ってください。

初期化ワークフローは、導入先を調査し、名前と Position assignment を提案してから dry run を実行します。その後、プロジェクト組織を導入し、health check と status check を行います。

対話形式または設定ファイルを使う方法は、[使用ガイド（英語）](docs/usage.md)を参照してください。

### 3. 観測可能な作業を始める

```bash
cd /absolute/path/to/my-project

temple work-item create . \
  --title "Ship one bounded outcome" \
  --scope "One verified user flow" \
  --acceptance "Independent QA verifies the exact revision"

temple doctor .
temple status .
```

作業の進行に合わせて `temple handoff`、`temple transition`、`temple close` を使用します。全コマンドは `temple --help` で確認できます。

## 提供されるもの

| 機能 | 内容 |
|---|---|
| 永続的なコンテキスト | リポジトリが所有する work item、decision、event、evidence |
| 明確な責任分担 | プロジェクト固有の Agent Identity に割り当てる、9つの安定した Position |
| Evidence に基づく handoff | 記録された revision reference、完了内容、evidence、未解決項目 |
| 観測可能な status | 生成されるプロジェクト view と Codex task registry |
| 安全な保守 | conflict を検出する init／upgrade と、任意で導入する managed Skill pack |

小規模なプロジェクトでは、5つの Agent Identity で9つすべての Position を担当します。チームが成長したら、ワークフローや履歴を書き換えずに Position を再割り当てできます。Developer と Independent QA は常に別の Identity です。

## プロジェクトへの組み込み方

Temple はプロジェクトにインストールします。このリポジトリからプロジェクトを fork する必要はありません。導入された組織は、そのプロジェクト自身の instructions と state の一部になり、中央 Toolkit は独立してアップグレードできます。

Temple は Codex task の作成、名前変更、archive を自動実行せず、外部 release も行いません。高リスクな承認、ビジネス上の優先順位、機密データ、不可逆な操作は人間が管理します。

Temple は現在 early alpha です。重要な開発に利用する前に、低リスクなプロジェクトで試してください。

## ドキュメント

- [使用ガイド](docs/usage.md) — 初期化、日常コマンド、upgrade、トラブルシューティング
- [Vision と operating model](docs/vision.md) — Position、責任、lifecycle
- [Architecture](docs/architecture.md) — identity model、ownership boundary、canonical state
- [Capability catalog](docs/capability-catalog.md) — core Skill と optional Skill
- [Roadmap](docs/roadmap.md) — 現在の方向性と今後の validation
- [Architecture decision](docs/adr/README.md) — 設計判断と理由

詳細ドキュメントは英語で管理されています。

## ライセンス

[MIT](LICENSE)。第三者由来の情報と採用範囲は [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) に記載しています。
