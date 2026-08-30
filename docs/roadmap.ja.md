# Roadmap：導入可能なフレームワークから観測可能な AI 開発組織へ

[English](roadmap.md) | **日本語** | [繁體中文](roadmap.zh-TW.md)

英語版が正本です。日本語版と繁體中文版は、より多くの方が内容を理解できるよう継続的に整備します。

ここで示すのはエンジニアリング上のフェーズと完了ゲートであり、日付の約束ではありません。前のフェーズを裏付ける証拠がそろってから、自動化の範囲を広げます。

現在実装済みのフレームワークバージョンは `0.1.0-alpha.22` です。Phase 1 から Phase 3 には範囲を限定した完了証拠があり、[Closeout-0A](validation/closeout-0a-release-integrity.md) と [Closeout-0B](validation/closeout-0b-live-and-upgrade.md) により Phase 4 前の blocker は解消済みです。Phase 4 の調査と ADR 作成を開始できますが、大規模環境および本番環境の検証は、未完了のものとして明示し続けます。

## フレームワークを横断する開発トラック

すべてのフェーズは、プロダクト意図、組織と権限、エンジニアリング手法、作業オーケストレーション、検証とデリバリー、永続状態と可観測性という同じ 6 つのレイヤーを前進させます。一つの固定プロセスがすでにあらゆるプロジェクトに適合すると主張するのではなく、証拠に基づく profile と extension を通じて規模を拡張します。

Engineering Learning Loop は全フェーズを横断するトラックです。Alpha.10 ではプロジェクト所有の Lesson と Practice を確立し、Alpha.19 では atomic な CLI mutation、再検証シグナル、明示的 migration、決定論的な retrieval 評価を追加しました。今後の自動化には引き続き実証が必要です。retrospective Skill、自動昇格、定期レビュー、設定済み semantic retrieval、privacy を守るプロジェクト横断昇格は、まだ計画段階です。

Capability トラックは、小さな core、opt-in の Build Quality pack、プロジェクト所有 Skill、そして extension の所有権を奪わず repository Skill を観測する Alpha.12 の Capability Registry から始まります。Alpha.19 では、複数ファイル構成、dependency、provenance、compatibility を扱う Pack manifest v2 と、隔離された Archify adapter lifecycle を追加しました。Architecture、review、exploration、Git と improvement、security pack、custom pack 公開、汎用的な third-party Skill 導入、model routing 自動化には、今後も範囲を限定した pilot が必要です。

UI design トラックは、明示的な UI Designer Position と、`not-applicable`、code-first、preview-first、design-led の 4 つの結果から始まります。Alpha.14 は Work Item ごとに選択を記録し、必要な場合は承認済み UI contract revision を固定します。Figma は任意です。project profile の既定値、design source adapter、token 同期、visual regression 統合は今後の検証対象です。

Product specification トラックは、Alpha.14 のプロジェクト所有 authority registry、revision 付き Work Item reference、contract-guided iterative delivery、federated／hybrid／Temple-native な文書導入から始まります。外部同期、semantic contract validation、組織固有の approval adapter は現在の実装範囲外です。

Task coordination トラックは、Alpha.15 のプロジェクト所有 tracker contract、company／Work Item／Codex task の明確な階層、設定可能な visibility と granularity、範囲を限定した GitHub Issues read adapter、正規化された手動 observation、conflict plan、証拠に基づく repository reconciliation から始まります。外部への書き込み、Jira への live access、自動双方向同期は現在の実装範囲外です。

Parallel orchestration トラックは、Alpha.16 の決定論的 group planning、dependency と conflict に対して安全な wave、任意の capacity limit、plan-only dispatch manifest、source fingerprint による stale 判定、Integration Owner の join gate から始まります。CLI は runtime に依存せず、task 作成や claim は実行しません。複数の人間・複数マシンによる実運用 dispatch と Git hosting 上の競合は、実装済みとして扱わず、保持中の検証項目とします。

## Phase 1：導入可能で運用できる組織 skeleton（基盤提供済み）

目標：chat title に依存せず、どの repository にも同じ Position、identity model、workflow、check を導入できるようにする。

成果物：

- 中央 framework repository、MIT License、third-party provenance。
- `init`、checksum-aware `upgrade`、`doctor`、`status`、`temple.lock`。
- 10 の Position、プロジェクト初回初期化時の命名、小規模な 5 Identity 構成。
- managed、project-owned、generated の境界。
- Decision interview、domain modeling、統制された project Skill authoring、Decision Ledger、ADR、handoff、QA template。
- Opt-in Archify adapter contract。
- Sample project、CI、no-overwrite test。
- 名前付き gate evidence を持つ Work Item、handoff、transition、close の CLI command。
- Codex task registry、安定した title suggestion、revision、attention signal、archive readiness。
- Project-owned Engineering Learning index と record、managed Lesson／Practice template、doctor validation、status count。
- UI Designer、tool-neutral な UI delivery-mode policy、UI design brief template、後方互換な Assignment migration。
- Project-owned Context Map、生成される Capability Registry と Work Item Context Capsule、決定論的 Retrieval Provider contract、affected-path overlap warning。
- Project-owned specification index、revision 付き product／UX／UI／API／technical reference、contract-guided iterative delivery、enterprise document adoption guide、stale reference enforcement。
- Project-owned external tracker 設定、team-visible／internal Work Item mapping、範囲を限定した observation、明示的 field ownership、reconciliation evidence、doctor／status／context projection、read-only GitHub Issues adapter。
- Safe wave、plan-only manifest、stale plan observation、runtime fallback、Integration Owner join gate を持つ group parallel plan。
- 実プロジェクトでの English Learning Inbox Safari Share Extension pilot。

完了ゲート：新規・既存の両 repository を初期化できること、10 の Position を観測できること、Developer と Independent QA が分離されること、再実行で上書きしないこと、chat を閉じた後も file から組織状態を復元できること。

## Phase 1.5：Greenfield project bootstrap pilot（完了ゲート達成済み）

目標：構造化されていない product idea から新しい private repository を作り、product と technical baseline を確立し、利用者が開発組織を再設計することなく、最初の独立検証可能な vertical slice を届ける。

AiPet `WI-0001` での既存 repository portability validation により、entry condition は満たされました。

Private FlowDeck pilot で完了した内容：

- 新しい private repository への初回導入。利用者が 5 つの Agent Identity 名と 9 つの Position Assignment を確認。
- 曖昧な idea から Project Charter、domain language、core flow、technical baseline、ADR、acceptance criteria、最初の永続 Work Item を作成。
- 最初の Work Item が Spec -> Design -> Build -> Test -> Eval -> Independent QA -> Release Gate を完了。
- Build Quality pack が実際の iOS vertical slice で red／green と diagnosis evidence を保持。
- 正確な candidate revision が automated test、Simulator system integration、Independent QA、clean checkout での closeout を通過。
- Project-facing instruction、status、artifact では project name または「this project's AI development organization」を使用。`Temple` は中央 framework brand、CLI、CLI 固有 Skill ID、schema、lock、compatibility identifier に限定。
- Pilot は [ADR-0011](adr/0011-pilot-stop-boundary.md) に基づいて凍結し、sample app を正式 product として拡張しない。
- Alpha.8 は unresolved item の exact-match list、resolve、merge、deduplication、Developer handoff の candidate revision projection、copy 可能な post-init doctor／status command を追加。
- Alpha.8 は独立実装された `$project-documentation` core Skill も導入。3 言語 public README に対する read-only forward test により、stale capability state、prerequisite、verification、repository visibility、revision wording の修正を実施。
- Alpha.9 は core `$skill-authoring` procedure、public project-extension contract、4 つの distribution class、そして未追跡 project Skill が init、pack install、upgrade によって暗黙に取り込まれない exact-path protection を追加し、forward test を実施。
- Alpha.10 は retrospective Skill や自動 promotion workflow を導入せず、最小限の Engineering Learning Loop 基盤を追加。
- Alpha.11 は UI Designer と risk-scaled かつ tool-neutral な UI delivery mode を追加し、すべての project に Figma や実装前 mockup を要求しない。
- Alpha.12 は決定論的 Progressive Context Routing、ownership を移さない project Skill discovery、範囲を限定した Context Capsule、affected-path overlap warning を追加。Semantic／hybrid retrieval は既定 dependency ではなく adapter boundary として保持。
- Alpha.12 の local／CI evidence は [Progressive Context Routing validation record](validation/alpha-12-progressive-context-routing.md) に保存。実 project の cross-task recovery、multi-maintainer behavior、大規模 repository retrieval quality、semantic provider は未検証。
- Alpha.13 は Collaborative 基盤を追加：Human Principal、Agent sponsorship、Discipline を持つ Position pool、衝突しにくい Collaborative Work Item ID、parent／dependency／contract field、決定論的 parallel readiness、Principal-backed claim、upgrade migration、status／doctor observability。
- Alpha.13 の範囲を限定した local evidence は [Collaborative foundation validation record](validation/alpha-13-collaborative-foundation.md) に保存。
- Alpha.13 の local automated evidence は、保持中の [large-scale real-environment test](validation/collaborative-large-scale-test-plan.md) を代替しない。複数の人間・複数マシン・Git hosting behavior は明示的に `not_run` のまま。
- Alpha.14 は product specification authority と revision contract、enterprise document adoption mode、Work Item specification reference、明示的 no-UI handling、tool-neutral interaction contract、doctor／status／context observability、upgrade-safe な project-owned seed を追加。
- Alpha.15 は task／tracker coordination model を追加：company planning、repository Work Item、Codex session を分離し、AI-only child decomposition を保持し、mapping granularity を設定し、GitHub Issue または supplied observation を inspect し、conflict を plan し、外部書き込みなしで evidence-backed repository reconciliation を記録。
- Alpha.16 は group-level parallel planning、決定論的 safe wave、明示的 runtime capacity handling、plan-only dispatch manifest、source-fingerprint staleness、Context Capsule routing、Integration Owner join gate を追加し、CLI を task runtime にはしない。
- 保持中の IdeaDock test は、構造化されていない idea から新しい private product を作成し、実装前に起点 task を停止し、過去 chat の summary を渡さず新しい Codex task に repository state からの復元を依頼。
- 新しい task は product intent、organization、specification、Work Item、plan、acceptance、ownership、stop boundary を再構築し、実際の 3-worker first wave を使用し、正確な candidate revision を join し、stale plan を再構築し、同じ revision に対して別々の Quality Evaluation と Independent QA を完了。
- IdeaDock は 5 つすべての Work Item を close。Developer、Quality Evaluation、Independent QA は 28/28、doctor は 27/27、active claim なし、production release なし。Product は first slice 後に凍結。
- 範囲を限定した結果は [Greenfield cold-task recovery result](validation/greenfield-cold-task-recovery-result.md) に保存。clean-host CLI bootstrap、internal subagent に対する user-owned task record、stage-specific discipline rule、共有 Simulator scheduling、複数の人間・複数マシン実行は検証しない。

Phase 1.5 の完了ゲートは達成済みです：

- 新しい非 example product が idea から first-slice closeout まで進み、Developer と Independent QA が同じ正確な revision を検証し、新しい会話が起点 chat なしで継続し、利用者は Position、handoff、observation mechanism を手動で再構築しなかった。
- FlowDeck は凍結を維持。IdeaDock も新しい明示的 product request がない限り、宣言済み experiment boundary で凍結。
- 保持中の [large-scale real-environment test](validation/collaborative-large-scale-test-plan.md) は `not_run` のままであり、Phase 1.5 完了によって実施済みとは見なさない。

完了ゲート：production に触れない、新しい非 example かつ復元可能な product repository が idea から最初の Work Item closeout まで進むこと。Developer と Independent QA が同じ revision を検証すること。新しい会話が起点 chat なしで継続できること。利用者が Position、handoff、observation mechanism を手動で再構築しないこと。

完全な結果と gap は [FlowDeck Greenfield Pilot Retrospective](pilots/flowdeck-greenfield-retrospective.md) を参照してください。AiPet と FlowDeck はどちらも opt-in Build Quality pack を保持できますが、この pilot は他の candidate Skill を直接追加する根拠にはなりません。

## Phase 2：Operational MVP

目標：Alpha.16 の collaboration、routing、specification、tracker、group orchestration 基盤を超えて、scope coordination、external evidence adapter、Observer を強化する。

利用可能な基盤：

- Non-terminal Work Item 間の affected-path overlap warning。
- Project／third-party Skill の ownership を奪わず観測する project Capability Registry。
- Project-owned Context Map、生成される Context Capsule、将来の semantic adapter contract を持つ決定論的 Retrieval Provider。
- Solo／Collaborative profile 選択、Human Principal sponsorship、technical Discipline を持つ Position pool、範囲を限定した work claim、決定論的 parallel-readiness check。
- Safe wave、plan-only dispatch manifest、stale-plan detection、Integration Owner join gate を持つ決定論的 group planning。
- Revision-pinned Work Item contract と stale reference blocking を持つ project-owned specification authority registry。
- Team-visible Work Item mapping、保護された field ownership、範囲を限定した GitHub Issues observation adapter、生成される conflict plan、明示的 repository reconciliation。

提供済み increment：

### Phase 2A — Recoverable runtime coordination（`0.1.0-alpha.17`）

- 正確で clean な source の Git recovery metadata を持ち、version 未指定の global fallback を使わない、repository-visible かつ version-pinned な CLI launcher を提供。
- Stage-specific Discipline と shared-resource requirement、capacity-aware wave、観測可能な reservation を提供。
- Rollback 付き atomic claim-before-worker preparation、検証済み first wave の entry 単位 continuation、stale／edited plan rejection を提供。
- Internal subagent と user-owned Codex task の runtime correlation を分離。Worker completion は resource を解放するが、lifecycle progress を偽造しない。
- Local test は宣言済み process boundary を対象とする。実際の multi-machine Git と pull-request contention は `not_run` のまま。

### Phase 2B — Evidence and Observer surface（`0.1.0-alpha.18`）

- 正確な Git revision、supplied test／runtime observation、明示的 unverified claim、risk、rollback に対する local evidence adapter を提供。
- Lifecycle timeline、evidence staleness、pending approval、recovery-oriented attention signal の Observer projection を提供。
- Active、blocked、QA-pending、approval-pending、queued work の local read-only overview を提供。
- External write、command execution、live production action を明示的 authorization boundary として維持。

### Phase 2C — Extension and retrieval maturity（`0.1.0-alpha.19`）

- Reference、script、asset、declared dependency、provenance、compatibility metadata を扱う Pack manifest v2 を提供。
- Draft 2020-12 runtime validation と、既存 project-owned data を暗黙に書き換えない明示的 migration registry を提供。
- Atomic Learning CLI mutation、明示的 v1-to-v2 migration、Practice revalidation signal、Observer attention、決定論的 retrieval-quality evaluation を提供。
- 隔離された clean local source からの Archify install、正確な provenance、file 単位の閉じた digest set、drift detection、未導入時の graceful degradation を提供。
- Human-accountability prerequisite と risk-scaled artifact／UI／normalized evidence／rollback／approval gate を持つ selectable High-Assurance risk contract を、10 の Position responsibility を維持したまま提供。既存 High-Assurance Work Item は後の profile change 後も contract を保持。
- Deterministic fallback を持つ privacy-preserving かつ injectable な local-hybrid Retrieval Provider boundary を提供。既定では model、embedding、vector database、daemon、remote retrieval service を導入しない。

保持中の evidence work：

- 実際の multi-machine Git／pull-request contention 下で affected-path coordination と resolution state を検証する。
- Production readiness を主張する前に、実 project corpus を使って大規模 repository retrieval quality と local hybrid provider を評価する。

Local 完了ゲート：recoverable lifecycle pilot、決定論的 parallel regression case、normalized evidence、exact-revision High-Assurance closeout により達成済み。上記の実 multi-machine case と大規模 repository case は、より広い production-readiness claim の前に引き続き必要。

## Phase 3：Real-time control plane

目標：各 Codex task を個別に開かなくても、進捗、失敗、pending approval を確認できるようにする。

承認済みの [Phase 3 design](phase-3-control-plane.md) と [Work Item breakdown](phase-3-work-items.md) は、canonical project state、generated local telemetry、disposable view を分離し、provider capability を正直に表示し、runtime permission、business fact、governance approval の authority を分離します。Phase 3A、3B、3C は、明示的な retained limit とともに local で提供済みです。

提供済み increment：

- **Phase 3A — Event spine and provider foundation（`0.1.0-alpha.20`、local 提供済み）：** versioned normalized event、Git-common-dir replay journal、cursor／checkpoint recovery、provider capability contract、repository／fixture provider、redaction、single-writer lease、rebuild archive、read-only HTTP／SSE。
- **Phase 3B — Live Observer, Codex adapter, and alerts（`0.1.0-alpha.21`、local 提供済み）：** provenance-aware live view、capability を pin して検証した Codex App Server adapter、disconnect reconciliation、stateful actionable condition。
- **Phase 3C — Human Inbox and GitHub evidence（`0.1.0-alpha.22`、local 提供済み）：** authority-separated request、policy-checked idempotent command gateway、runtime-request bridge、明示的 business-fact incorporation、revision-bound Human Principal approval、explicit evidence capture を持つ exact-SHA read-only GitHub PR／Checks adapter。

Phase 3 は、Codex Desktop で実行中のすべての task へ live access できるとは約束しません。Registered または unsupported な task は、documented／tested provider がより強い capability を証明しない限り、snapshot-only、registered-only、unknown として正直に表示されます。

Local 完了ゲート：replay、reconnect、authority separation、exact revision、idempotency、provider failure、browser、deterministic GitHub adapter の evidence により達成済み。明示的に authorization された live GitHub PR run、long-duration soak、全 persistence boundary での crash test、remote access、大規模 multi-machine operation は、production readiness として暗黙に含めず、保持中の作業とします。

## Phase 4：Reliability and everyday multi-project use

目標：単一 pilot から、日常的に信頼して使える個人向け enterprise-grade development organization へ進化させる。

Closeout-0 は完了済みです。Release reproducibility、範囲を限定した live Phase 3 check、data-bearing upgrade rehearsal は通過しました。Phase 4 の調査と ADR 作成を開始できます。Durability／recovery と multi-repository authority contract は、対応する schema や feature を実装する前に承認されなければなりません。保持中の大規模／production check を完了済みと表現してはいけません。

計画中の成果物：

- Backup／restore、event checksum、migration、crash recovery。
- False completion、wrong revision、self-approval、unauthorized external operation、rework を対象とする policy／evaluation suite。
- 各 project が project-local canonical truth を保持する multi-repository registry。
- Capacity と cost aggregation を持つ read-only portfolio view。
- Secret redaction、data retention、audit export、notification throttling。
- Framework `upgrade` の migration rehearsal と rollback。

完了ゲート：異なる種類の Work Item を少なくとも 10 件完了すること。すべての policy violation test が block または escalation されること。Clean environment が backup から復元できること。利用者が Overview と Human Inbox を通じて日常作業を管理できること。

## Phase 5：Enterprise-system integration（任意）

Phase 4 で workflow が実証された後にのみ、承認済み issue tracker write action、より豊富な provider adapter、CI/CD write action、organizational RBAC、remote worker、centralized audit store、Slack／email notification、cross-team portfolio を追加します。外部 system が project-local truth や Human Approval boundary を置き換えてはいけません。

## 最初の pilot 選定基準

- 観測可能な acceptance criteria が 1〜3 個。
- Local、test environment、Simulator のいずれかで検証可能。
- Billing、production data、production deployment、external notification を含まない。
- Affected path が明確で、変更を復元でき、正確な revision を保存できる。
- Spec -> Design -> Build -> Test -> Eval -> Independent QA -> Release Gate を完了するのに十分な scope。
- Specification が experiment purpose、stop condition、自動的には authorization されない follow-on work を明記する。Closeout 後は ADR-0011 に従って停止する。

## 各フェーズで追跡する metric

- 重複する active scope の件数。
- Lost context による rework incident の件数。
- Evidence のない completion claim の割合。
- Handoff 後に作業を理解するまでの時間。
- Blocked／approval-pending state が可視化されたままの時間。
- Developer と Independent QA の Identity separation 率。
