<h1 align="center">Temple</h1>

<p align="center"><strong>AI Development Organization Framework</strong></p>

<p align="center">分断された AI coding session を、記憶し、連携し、検証し、学習できる開発組織へ。</p>

<p align="center"><a href="README.md">English</a> · <strong>日本語</strong> · <a href="README.zh-TW.md">繁體中文</a></p>

<p align="center">
  <a href="https://github.com/zsz1210/temple-ai-dev-org/actions/workflows/ci.yml"><img alt="CI status" src="https://github.com/zsz1210/temple-ai-dev-org/actions/workflows/ci.yml/badge.svg"></a>
  &nbsp;·&nbsp; Early Alpha
  &nbsp;·&nbsp; Node.js 20+
  &nbsp;·&nbsp; <a href="LICENSE">MIT License</a>
</p>

Temple は、新規または既存 project に repository-native な operating framework を導入します。Solo developer から multi-team organization まで、人と AI Agent に安定した責任、永続的な project context、再利用可能な engineering method、境界の明確な work、evidence-based release gate を提供します。

> [!NOTE]
> Temple は現在、human supervision のある low-risk local project と bounded pilot 向けの early alpha です。Distributed enterprise operation、production monitoring、無人の external action はまだ実証済み capability として主張しません。

---

## アイデアから、信頼できるソフトウェアへ

![人が方向を決め、Temple が共同作業を整え、人と AI が協力し、repository の evidence が信頼できる成果を支える流れ。](docs/assets/temple-overview.ja.svg)

Temple は作業を囲む共通の operating layer です。人が目的と承認を担い、人と AI が境界のある責任を分担し、別の task や teammate が検証・継続できる事実を repository に残します。

## なぜ Temple が必要なのか

Agent の数を増やすだけでは、優れた engineering team にはなりません。

共通の operating model がなければ、別 task が同じ作業を繰り返し、product decision は chat の中に消え、Agent は同じ file を編集し、implementation claim と approval が混同されます。Repository、specialist、tracker、conversation が増えるほど問題は大きくなります。

Temple は coordination layer を repository に残します。

- **責任が conversation を越えて残る。** 一つの AI が複数 Position を担当しても、product、design、architecture、implementation、evaluation、QA、release、observation の責任を分離します。
- **Context に参照先がある。** Specification、decision、Work Item、handoff、learning、evidence を、過去の chat を再構築せず回復できます。
- **Parallel work に境界がある。** Dispatch 前に dependency、affected path、shared contract、resource、Integration Owner を定義します。
- **Method を成長させられる。** Review されていない prompt を増やすのではなく、governed extension contract の下で Skill を使用、追加、作成します。
- **Completion が evidence を意味する。** Developer verification、evaluation、Independent QA、human approval、release readiness は exact revision に結び付く別々の step です。

Temple は shared chat log でも prompt 集でもありません。Product intent と、それを届ける人・Agent の間にある operating layer です。

## 一つの request が Temple を通る流れ

1. 人が一つの bounded outcome を提示し、priority と重要な approval の authority を持ち続けます。
2. Product と design の責任が scope、language、state、acceptance criteria を明確にします。
3. Temple が owner、必要な context と method、安全な coordination boundary を割り当てます。Dependency と affected path が許す independent work だけを parallel に進めます。
4. Implementation は exact candidate revision に結び付く evidence とともに、test、evaluation、Independent QA へ進みます。
5. Release Gate が readiness を記録し、decision、evidence、再利用可能な learning は次の task のため repository に残ります。

Project が成長してもこの流れは共通です。変わるのは各 Position を担う Agent Identity と specialist の数、risk に応じた evidence の深さ、そしてどの外部 system を authority として維持するかです。

---

## Temple は誰のためのもの？

<details>
<summary><strong>個人開発者</strong></summary>

一人で複数の AI に同じプロジェクトの計画、開発、レビュー、継続を任せるとき、Temple は要件、決定、Work Item、引き継ぎ、検証記録をリポジトリに残します。情報がつながらない会話に散らばらないため、タスクや会話が変わっても AI はプロジェクトに記録された状態から作業を再開できます。

十個の異なる AI を用意する必要はありません。小さなプロジェクトでは同じ AI が複数の Position を兼任できますが、開発と独立検証は分離し、実装者が自分の成果を承認しないようにします。現在、これは Temple でもっとも検証が進んでいる、個人開発者主導かつ人の監督下での利用方法です。

</details>

<details>
<summary><strong>開発チーム</strong></summary>

プロダクト、デザイン、フロントエンド、バックエンド、インフラ、フルスタックの各メンバーは、チーム全体を一つの会話に押し込まず、それぞれの AI と作業できます。Temple は Work Item ごとに担当者、依存関係、影響範囲、共有契約を明確にします。競合しない作業を並行して進め、最後に Integration Owner が各成果の正確な revision を統合します。

Jira、GitHub Projects、または既存の作業管理ツールはチームの進捗管理に使い続け、Temple はリポジトリ内の細かな AI 作業と検証記録を残します。この協調フローは実装済みですが、保留している複数人・複数マシンでの大規模検証はまだ完了していません。

</details>

<details>
<summary><strong>企業</strong></summary>

Temple の導入にあわせて Jira、GitHub Projects、Figma、既存の仕様書、リポジトリの慣例を置き換える必要はありません。各プロジェクトは現在の情報源と管理方法を維持し、Temple はリポジトリ内に AI が行った作業、その検証方法、既存システムとの対応を記録します。複数リポジトリの全体表示は状態を集約しても、各リポジトリの管理権限を奪いません。

将来の企業向け拡張では、SRE、Security、本番環境の read-only telemetry、インシデントと脆弱性の連携、ポリシー証跡、運用リスクレビューを検討します。これらは roadmap の方向であり、現在提供している本番監視機能ではありません。

</details>

## 再設計せず assignment で scale する

Temple は十個の安定した Position を定義します。

| Product と design | Engineering と delivery | Assurance と visibility |
|---|---|---|
| Product Manager | Engineering Manager | Quality & Evaluation Engineer |
| UX Designer | Tech Lead | Independent QA |
| UI Designer | Developer | Release Manager |
|  |  | Observer |

**Position** は責任の contract、**Agent Identity** は project-specific な executor です。**Discipline** は frontend、backend、infrastructure、full-stack、data、SRE、Security などの specialization を表します。**Skill** は再利用可能な method であり、authority を与えたり gate を迂回したりできません。

| Profile | Typical shape | 追加される safeguard |
|---|---|---|
| **Solo** | 少数の Identity が複数 Position を担当 | Durable context と責任分離の可視化 |
| **Collaborative** | Human が specialist Agent と Position pool を sponsor | Claim、discipline、dependency、resource、integration ownership |
| **High-Assurance** | Sensitive work で厳格に Identity を分離 | Risk-scaled evidence、rollback、distinct approval、human accountability |

Template には character name を固定しません。Initialization が project ごとの Agent Identity 名を提案または受け取り、後から Position contract を変えずに Identity を追加・分割できます。

---

## Quick start

Requirements: Git、Node.js 20 以降、Codex、target project directory。

### 1. Source から Temple を install

```bash
git clone https://github.com/zsz1210/temple-ai-dev-org.git
cd temple-ai-dev-org
npm ci
npm run verify
npm link
```

### 2. Project を initialize

Temple を Codex で開き、次のように依頼します。

> `$temple-init` を使って `/absolute/path/to/my-project` を initialize してください。Agent Identity の英語名を提案し、file を書く前に私の確認を待ってください。

Initialization によって、project 内の operating layer が見える形で追加されます。

- `TEMPLE.md` と Position configuration は責任の分離方法を定義します。
- `.ai-org/` は project-owned な identity、Work Item、context、evidence、learning、再生成可能な view を保持します。
- `templew.mjs` と `temple.lock` は framework の実行と managed-file ownership を install 済み version に結び付けます。
- Core Skills は反復可能な method を提供し、project は Position authority を変えずに独自の governed Skill を追加できます。

### 3. 最初の Work Item を開始

Initialized project 内では次のように依頼します。

> `$decision-interview` でこの change を明確にし、`$temple-work` で independently verify できる最小の Work Item を作成してください。

```bash
node ./templew.mjs doctor .
node ./templew.mjs status .
node ./templew.mjs observe .
```

Product ごとに framework を fork するのではなく、各 project に Temple を install します。Installed project state はその product に属し、framework-managed file は独立して upgrade できます。

> [!TIP]
> Solo profile と一つの bounded outcome から始めてください。Agent、discipline、integration、厳格な gate は、project が本当に必要とした時に追加します。

Adoption、upgrade、self-hosting、parallel work、tracker、UI mode、troubleshooting は [Usage guide（英語）](docs/getting-started/usage.md) を参照してください。

## 現在、どこまで使えるのか？

| Status | 現在の boundary |
|---|---|
| **現在利用可能** | Human-supervised Solo workflow、柔軟な Assignment を持つ十個の安定した Position、Work Item と lifecycle gate、決定的な context / capability routing、governed Skill と learning、evidence record、local status、upgrade / recovery boundary。 |
| **Experimental / bounded** | Collaborative と High-Assurance の contract、安全な parallel planning、provider / usage observation、read-only tracker / portfolio coordination、local control plane は repository test または限定的な local validation を持ちますが、一般的な組織運用の実証ではありません。 |
| **Planned / unverified** | 大規模な multi-human / multi-machine の実運用、production monitoring / remediation、無人の external write、構成済み semantic retrieval、regulated acceptance、広範な enterprise proof。 |

## Project とともに成長する engineering method

Core には initialization、bounded delivery、decision interview、domain modeling、project documentation、Skill authoring の Skill が含まれます。Optional pack は test-driven development や systematic debugging などの method を追加できます。

[Engineering Learning Loop（英語）](docs/extensions/engineering-learning.md) は Lesson と Practice を記録し、繰り返し得られた evidence を Skill、check、ADR、instruction へ昇格させます。[Skill authoring contract（英語）](docs/extensions/skill-authoring.md) は trigger、authority、provenance、scenario、validation を定義し、framework が local method の ownership を奪わずに project を拡張できるようにします。

Temple は、すべての engineering Skill、design tool、tracker integration、model、RAG system、daemon を default では導入しません。

---

## Marketing より先に evidence

現在の claim は automated repository check と bounded validation record に基づきます。すべての enterprise topology、regulated audit、distributed race、production deployment を証明するものではありません。

将来の比較 test では、明示的な baseline に対する context-recovery time、duplicate scope、rework、blocked time、verification defect、token usage、coordination effort を測定します。それまでは時間や token の削減率を主張しません。

- [Roadmap と retained gap（英語）](docs/planning/roadmap.md)
- [Testing strategy（英語）](docs/getting-started/testing.md)
- [Validation records（英語）](docs/validation/README.md)

## Human authority を明示的に残す

Temple は repository work を coordinate しますが、business truth、priority、credential、material spending、irreversible external action、production remediation、high-risk approval の ownership を持ちません。External tracker と operational system は workflow に情報を与えられますが、自動的な release authority にはなりません。

---

## Documentation

[Documentation map（英語）](docs/README.md) から始めてください。

- [Vision（英語）](docs/concepts/vision.md)
- [Architecture（英語）](docs/concepts/architecture.md)
- [Collaborative development（英語）](docs/operations/collaboration.md)
- [Capability catalog（英語）](docs/extensions/capability-catalog.md)
- [Architecture decisions（英語）](docs/adr/README.md)
- [Contributing（英語）](CONTRIBUTING.md)
- [Security policy（英語）](SECURITY.md)
- [Changelog（英語）](CHANGELOG.md)

## License

[MIT](LICENSE)。Third-party source と adoption boundary は [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) に記録します。
