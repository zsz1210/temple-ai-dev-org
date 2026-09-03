# Temple ロードマップ

[English](roadmap.md) | **日本語** | [繁體中文](roadmap.zh-TW.md)

Temple が目指すのは、人が方向を決め、AI と協力して開発するための、信頼できるリポジトリ中心の運営モデルです。いま優先するのは Dashboard や公開リリースではありません。プロジェクトの定義から実装、独立レビュー、復旧、学習まで、開発組織そのものが一貫して機能することです。

最終確認日：2026 年 9 月 3 日。このロードマップは Temple プロジェクトが管理し、新しい証拠によって方針が変わったとき、または現在のミッションが完了条件に達したときに見直します。

## Vision

個人開発者、小規模な専門混成チーム、大規模な組織のいずれでも、AI Agent に明確な責任を与え、安全に並行作業を進め、過去の会話に頼らず状況を復元し、証拠に基づいて提供可否を判断できる状態をつくります。

Temple は、作業の規模とリスクに応じて運営の厳密さを変えます。すべてのプロジェクトに常駐サービス、特定のデザインツール、Usage 観測、Management Console を要求しません。

## このロードマップの読み方

ここに書くのは成果と優先順位です。タスク一覧ではなく、証拠が不足している将来の作業に固定日を約束するものでもありません。

- **Now** は、現在取り組む一つのミッションと、その測定可能な完了条件です。
- **Next** は、現在の検証結果によって順序が変わり得る次の候補です。
- **Later** は、より強い証拠や新しい判断が必要な、確度の低い方向性です。
- 詳細な進行状態はリポジトリの [Work Item](../../.ai-org/work-items/) にあります。
- 実験結果と適用範囲は [Validation records（英語）](../validation/README.md) にあります。
- バージョンごとの変更は [Changelog（英語）](../../CHANGELOG.md) にあります。
- 公開条件は [Release readiness（英語）](release-readiness.md) に残します。削除ではなく一時停止です。

## 証拠から見た現在地

| 領域 | 現在確認できていること | 適用範囲の限界 |
| --- | --- | --- |
| 中核運営モデル | 実装済みで、範囲を限定したローカル検証を実施済み | 本番運用や企業全体での利用は未検証 |
| クリーンな導入 | install、init、bootstrap 案内、Doctor の決定論的な経路は合格 | 新しい Agent の理解や、初見の利用者による導入は未検証 |
| 既存プロジェクトと複数リポジトリ | ローカルの brownfield、復旧、複数リポジトリ演習は各条件内で合格 | 実際の複数人・複数マシン運用は未実施 |
| Workflow Profile | Lean、Standard、High-Assurance と決定論的な昇格条件を実装済み | 複数の実在人物による High-Assurance 運用は未実施 |
| Execution Route | Provider 非依存・step 単位・決定論的な解決機能を実装し、入力境界も強化済み | 読み取り専用であり、モデルの起動や提案の適用はできない |
| 対照比較 | Wave 5A / 5B で実行機構、オーバーヘッド、候補結果を取得 | 結論は未確定。Wave 5A の比較可能な組は一つだけで、Wave 5B は `inconclusive` |
| Provider trust | `WI-0033` は Spec の段階 | 信頼できないリポジトリからの Provider 実行は推奨しない |
| 公開配布 | private Alpha 候補と過去の release 証拠は存在 | `WI-0086` は blocked。公開は現在のミッションではない |

`no-go` と `inconclusive` は、有用な実験結果です。未完了の実装として扱わず、Temple の効果を証明したことにも変換せず、証拠として残します。

## Now — 中核経路を信頼できるものにする

現在のミッションは、Management Console がなくても、次の一連の経路を最初から最後まで理解し、実行できる状態にすることです。

```text
プロダクトと権限を定義する
  -> 範囲を限定した作業を作成し、担当へ渡す
  -> 設計し、実装する
  -> テストし、評価する
  -> Independent QA と release 判断を行う
  -> 状況を復旧し、学びを残す
```

### 目指す成果

1. **一つにつながった経路。** 初期化から組織上の closeout まで、リポジトリと CLI の契約だけで進められる。
2. **作業に見合ったプロセス。** 小さな作業は Lean のまま、通常作業には必要なレビューを残し、高リスク作業だけを厳格化する。
3. **信頼できる継続性。** 新しい task が、過去の chat title や会話記憶ではなく、リポジトリから担当、状態、証拠、次の行動を復元できる。
4. **説明できる実行選択。** Position の権限、Capability、Workflow Profile、モデルやツールの提案を混同しない。
5. **主張より先に証拠。** テスト、比較、導入演習は一つの問いに答え、定めた証拠の範囲で停止する。

### 完了条件

次のことをリポジトリの証拠で確認できたとき、このミッションは完了です。

- 初見の利用者または新しい Agent が、開発者の過去 chat を読まずに中核経路を完了できる。
- 同じ経路が、新規プロジェクトと既存プロジェクトでそれぞれ一度以上成立する。
- 並行作業、handoff、Independent QA、中断後の復旧が引き続き強制される。
- Workflow と Execution Route が選ばれた理由、人の権限が必要な境界を利用者が理解できる。
- 手間、人の介入、手戻り、経過時間、取得可能な resource 使用量を、実測値または unknown として記録する。
- Console、Usage 観測、外部 integration がなくても中核経路が壊れない。

直近では、中核経路を実際の CLI とリポジトリで端から端まで確認します。足りない判断や重複した手順を見つけ、影響の大きさで優先順位を付け、この成果を妨げる問題だけを修正します。

## Next — 実際の導入で適用範囲を確認する

以下の順序は、中核経路の確認結果によって決めます。

### 初見の利用者による導入

- Temple の開発に参加していない人が、新規プロジェクトと既存プロジェクトを一度ずつ導入する。
- 開発者の説明が必要になった場所、状態を失った場所、権限を誤読した場所、不要な手順が増えた場所を観察する。
- 繰り返し確認できた学びだけを、既存の昇格ルールに従って documentation、Practice、Skill、framework change に反映する。

### 結論を出せる対照比較

交差・対照テストは開始済みですが、比較は**未完了**です。以前の実行では fail-closed の仕組みを確認し、複数の protocol defect を発見しました。Wave 5B の四つの候補は完了して暫定的な resource 差も得られましたが、有効な blind score を確定できず、Work Item は正しく `inconclusive` で終了しています。

次にモデルを実行する前に、Temple は次を固定します。

- 実験結果を何の判断に使うのかを一つに絞る。
- 二つの synthetic case だけを繰り返さず、代表的な task family を選ぶ。
- framework 対 minimal workflow と、model 対 model を別の介入として扱う。
- input、tool、access、score range、quality gate、telemetry field、stop rule を事前に固定する。
- 使用中の Provider protocol をオフラインで適格確認する。
- どの結果なら framework を変更するか、変更しないか、仮説を破棄するかを決める。

品質条件を満たした組だけを resource 比較に使います。小さな sample は仕組みの診断には使えますが、一般的な Token、時間、費用、品質、手戻り削減の証明にはなりません。

### 組織とリポジトリ規模

- 独立して管理された環境で、実際の複数人・複数マシン協力を行う。
- 別々に保守されるリポジトリ間で federation を実行し、統合責任と conflict recovery を確認する。
- frontend、backend、infrastructure、design、QA、SRE、Security が混在するチームで、特定の人数や構成を固定せずに試す。

## Later — 証拠がある範囲だけを拡張する

- 操作者が管理する trust、正確な protocol contract、明示的な autonomy boundary がそろってから Provider execution を追加する。
- 複数の Human Principal による High-Assurance、復旧時の損失、規制・企業向け control を実環境で確認する。
- 決定論的な context routing の限界を測定してから semantic retrieval を追加する。
- 代表性のある matched evidence と安全な fallback がそろってから automatic execution routing を検討する。
- リポジトリ所有者が公開判断を再開し、同一 candidate が保存済み release gate を通過してから公開準備を再開する。

## 補助ツールであり、土台ではないもの

- **Management Console：** 人が状態を理解するための読み取り専用補助画面。なくても Temple を利用できることが前提です。
- **Usage 観測：** attribution と分析のための任意の Provider telemetry。観測できない値は 0 ではなく unknown です。
- **Local Observer / daemon：** 継続観測を行う任意機能。正式な Work Item、証拠、復旧には不要です。
- **外部 tracker / integration：** 協力のための表示・連携先であり、Temple の lifecycle authority を置き換えません。
- **Figma、RAG、local model、追加 Skill：** 選択可能な拡張であり、全プロジェクトの必須要件ではありません。

## ロードマップの方針

この構成は、ロードマップが成果と「いま行わないこと」を伝えること、delivery backlog と分けること、遠い将来ほど不確実性を明示すること、という公開ガイドを参考にしています。[UK Government Service Manual](https://www.gov.uk/service-manual/agile-delivery/developing-a-roadmap)、[GitHub Projects documentation](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects)、[Atlassian の agile roadmapping guide](https://www.atlassian.com/agile/product-management/roadmaps) を参照してください。
