---
sessionId: session-260811-144150-15er
---

# 要件

### 目的

- [ ] すべてのローカル `remark-lint-gherkin-*` パッケージと、対応する [`gherkin-lint`](https://github.com/gherkin-lint/gherkin-lint/) `master` のルールについて、ルール単位の証拠に基づく互換性評価を行う。
- [ ] 確認されたすべての動作差分を、この計画内の個別チェックボックス付き修正項目に変換する。意図的な Markdown-with-Gherkin の差異は、黙って変更せず理由を残す。

### 比較対象一覧

- [ ] `allowed-tags`、`keywords-in-logical-order`、`max-scenarios-per-file`、`name-length`、`no-background-only-scenario` を比較する。
- [ ] `no-dupe-feature-names`、`no-dupe-scenario-names`、`no-duplicate-tags`、`no-empty-background`、`no-examples-in-scenarios` を比較する。
- [ ] `no-files-without-scenarios`、`no-homogenous-tags`、`no-partially-commented-tag-lines`、`no-restricted-patterns`、`no-restricted-tags` を比較する。
- [ ] `no-scenario-outlines-without-examples`、`no-superfluous-tags`、`no-unnamed-features`、`no-unnamed-scenarios`、`no-unused-variables` を比較する。
- [ ] `one-space-between-tags`、`only-one-when`、`required-tags`、`scenario-size`、`use-and` を比較する。
- [ ] `no-tags-on-backgrounds`、`one-feature-per-file`、`up-to-one-background-per-file` は、特定の過去の upstream バージョンを出典として選ばない限り、ローカル拡張として記録する。現在の upstream `master` のルール一覧には同名ルールが存在しない。

### 受け入れ条件

- [ ] 28個すべてのパッケージに、ローカルおよび upstream のソース・テスト参照、対応ルールの有無、オプションとデフォルト、検査対象、動作、診断位置、結果（`parity`、`intentional divergence`、`defect`）を記載した比較レコードが完成している。
- [ ] 25個の対応ルールについて、固定 upstream の各テストファイルに含まれる全テストケース（正常系、異常系、境界値、設定分岐、複数診断を含む）に、一意のケース ID とローカル実装先または変換不能理由がある。未対応・暗黙の省略・代表ケースへの集約は残さない。
- [ ] 各 `defect` に、upstream 相当の期待結果を示す最小限の Markdown-with-Gherkin フィクスチャと、対象パッケージの集中的なテストがある。
- [ ] 各 `intentional divergence` と変換不能な upstream ケースに、妥当な Markdown-with-Gherkin が `.feature` の解析動作を完全には再現できない、または再現すべきでない理由、最も近い fixture、明示的な判定が記載されている。
- [ ] ドキュメントが、ローカル専用の3ルールを現在の upstream ルールセットから直接移植したものだと示唆しない。
- [ ] 追随する修正を含むすべての作業項目が、Markdown のチェックボックスで表現されている。

# 技術設計

### 現在の実装

- [ ] `README.md` の10〜42行をローカルパッケージ一覧の基準として使用し、upstream からの移植に関する表現は、監査で不正確だと判明した箇所だけ更新する。
- [ ] 各パッケージの `src/index.ts`、`tests/index.test.ts`、`README.md` を確認する。ルールは一貫して `unified-lint-rule` と `testGherkinNode` などの `mdast-util-gherkin` ヘルパーを使用し、パッケージ単位のテストは `remark-parse` → `remark-gfm` → `remark-gherkin` → ルールのプロセッサーを構成する。
- [ ] `packages/mdast-util-gherkin/src/gherkinTransform.ts` を適応境界として扱う。セグメント見出しは `segmentLine` に、タグ構文は `tagLine`/`tag` に変換され、ステップは Gherkin ノードとなり、Examples のデータは Markdown/GFM テーブルで表現される。
- [ ] upstream の `src/rules/<rule>.js`、対応するルールテスト、監査時点で記録したコミット SHA を比較根拠にする。コミットを固定していない README の説明だけで比較しない。

### 評価方法

- [ ] パッケージごとに1行を持つ互換性マトリクスを作成する。列には upstream の対応ルールとバージョン、ソースとテストのパス、設定スキーマとデフォルト、解析対象とスコープ、継承とグループ化の意味、失敗とソース位置、Markdown への適応、判定を含める。
- [ ] タグ値の表現（`@` 接頭辞）、正規表現の扱い、デフォルト、真偽値オプション、無効または空の設定の動作を含め、オプションを正確に評価する。
- [ ] フラットな Markdown AST の影響を受けやすい意味上の境界を評価する。具体的にはセグメントへのタグブロックの隣接、Feature/Rule/シナリオのタグ継承、Background とシナリオのスコープ、Scenario Outline と Examples のグループ化、複数の Examples テーブル、テーブルのヘッダーと行のカウント、Markdown ノード間のステップ順序を確認する。
- [ ] 意味と診断を分けて評価する。メッセージの契約、メッセージ数、報告される位置またはノードを確認し、テキストの完全一致は既存テストが契約として扱っている場合だけ要求する。

### 修正方針

- [ ] 検証済みの各不具合について、対象の `packages/remark-lint-gherkin-<rule>/src/index.ts` とテストファイル、差分、upstream 相当の期待結果、公開 README または設定の変更要否を明記した個別チェックボックスを、該当ルールのマトリクス行の下に追加する。
- [ ] 意図的な差異ごとに、回帰フィクスチャとパッケージ README の説明によってその差異を維持する個別チェックボックスを追加する。
- [ ] ローカル専用ルールは機能させ、プロジェクト固有の拡張として文書化する。`gherkin-lint` に現在の対応ルールがないことだけを理由に削除しない。
- [ ] 同一の Markdown AST 巡回要件を持つ不具合の繰り返しが監査で判明しない限り、共有抽象化は導入しない。既存の独立パッケージ構成を基本として維持する。

### 検証が必要な高リスク領域

- [ ] `findAfterUntil` でシナリオまたは Background の本体を定義している `use-and`、`only-one-when`、`keywords-in-logical-order` のフラットな兄弟ノード巡回を検証する。
- [ ] 複数または空の Examples セクションと GFM テーブル境界を対象に、`max-scenarios-per-file` と `no-unused-variables` を検証する。
- [ ] 現在ルートレベルの兄弟順から直前のタグを導出している `required-tags`、`no-superfluous-tags`、`no-homogenous-tags` の継承と親グループ化を検証する。
- [ ] 複数 Feature または Rule を含む Markdown ファイルで、`no-background-only-scenario`、`no-files-without-scenarios`、ローカル専用3ルールのスコープとカウント動作を検証する。

# テスト

### 根拠と回帰テスト

- [ ] 固定 upstream コミットから25個すべての対応ルールのテストファイルを改めて全件読み取り、テストケース名、入力、設定、期待メッセージ、期待件数、位置情報、複数 assertion をケース単位の移植台帳に登録する。既存ローカルテストや前回の監査結果を全件実装の証拠として扱わない。
- [ ] 各 upstream ケースへ一意のケース ID を付与し、元ファイル・テスト名・ローカル `tests/index.test.ts` の test 名/行・対応状態を台帳で双方向に追跡する。
- [ ] 対応するすべての `packages/remark-lint-gherkin-*/tests/index.test.ts` に、upstream の全テストケースを1ケース以上の追跡可能な Markdown/Gherkin テストとして実装する。単に代表例を追加するのではなく、upstream の正常系・異常系・境界値・設定バリエーションを漏れなく移植する。
- [ ] upstream の1テストが複数の独立した期待値を検証する場合、ローカルテストでも期待値ごとに確認可能な assertion を保持し、ケース台帳から元テストへの参照を付ける。
- [ ] `.feature` の入力を、既存の `unified()` プロセッサースタック（`remark-parse`、`remark-gfm`、`remark-gherkin`、パッケージルール）で等価な Markdown-with-Gherkin フィクスチャへ変換する。人工的な AST ノードによる代替は行わない。
- [ ] Gherkin で表現できない upstream ケースだけは、理由、変換不能な構文、最も近い Markdown fixture、判定（`intentional divergence` または対象外）を台帳に記録し、未確認のまま省略しない。
- [ ] 各移植ケースでメッセージ数、安定している場合はメッセージ内容、upstream または既存ルールが位置を契約化している場合は `VFileMessage.place` を検証する。
- [ ] 変更した各オプションとデフォルトの有効・無効ケースに加え、分離されたタグブロック、構文間の見出し、Rule、複数の Examples テーブル、空のテーブル、該当する場合はネストしたインラインパラメーターまたはタグ内容をカバーする。
- [ ] 各ルールの移植完了時にケース台帳と `tests/index.test.ts` を双方向に照合し、upstream ケース数が `implemented`・`intentional divergence`・`not applicable` のいずれかに全件分類され、未分類件数が0であることを確認する。
- [ ] 追加・更新した各テストを対象に実行してケース ID と実行結果を照合し、最後に `vp check` と `vp run -r test` を実行する。フォーマット、Lint、型チェック、全再帰テストの失敗を解消してから完了とする。

# 配達手順

### ステップ1: ルール互換性マトリクスを完成させる

28個すべてのローカルルールパッケージについて、チェックボックス付きの互換性レコードが存在する状態にする。

- [x] 監査に使用する upstream `gherkin-lint` のコミットを固定し、各対象ルールの実装とテストスイートを確認する。
- [x] 25個の直接対応ルールを記録し、`no-tags-on-backgrounds`、`one-feature-per-file`、`up-to-one-background-per-file` を現在の upstream に対するローカル専用ルールとして明示する。
- [x] オプションとデフォルト、対象ノード、動作、診断、Markdown AST への適応に関する結果を互換性マトリクスに記録する。
- [x] 各行を、ソースとテストの根拠付きで `parity`、`intentional divergence`、`defect` のいずれかに分類する。

### ステップ2: upstream の全テストケースをローカルへ移植する

25個の対応ルールについて、upstream テストスイートの全ケースがローカルの対応 `tests/index.test.ts` から追跡・実行できる状態にする。

- [ ] 固定した upstream の25テストファイルを再読し、すべてのネストしたテストブロックも展開してケース台帳へ分解する。ルール名、元ファイル/テスト名、ケース ID、設定、入力、期待値、移植先テストをチェックボックスで列挙する。
- [ ] ケース台帳をローカル既存テストと照合し、すでに対応済みのケース、未移植のケース、同一テストへ統合できない複数 assertion を区別する。既存ケースの類似性だけで対応済みにしない。
- [ ] 各対応パッケージの `tests/index.test.ts` に、未移植分を含む upstream の全正常系・異常系・境界値・オプションケースを Markdown-with-Gherkin fixture として実装する。
- [ ] 既存の `remark-parse` → `remark-gfm` → `remark-gherkin` → ルールの processor 構成を使い、変換後の AST が実運用と同じ経路を通るようにする。
- [ ] upstream の期待値をローカルの診断メッセージ、件数、位置に対応付け、位置表現が変換境界で変わる場合はその差分を台帳に記録する。
- [ ] 変換不能または意図的に異なるケースは省略せず、近似 fixture と理由をチェックボックス付きで記録する。

### ステップ3: 検証済みの互換性修正を定義・実装する

全ケース移植で確認された互換性不具合について、独立した実装と回帰仕様が存在する状態にする。

- [ ] 各不具合行を、`src/index.ts` と `tests/index.test.ts` の変更箇所を明記したルール固有のチェックボックスに変換する。
- [ ] Markdown-with-Gherkin で実現可能な範囲において、影響を受ける独立ルールパッケージだけを upstream の意味に合わせて更新する。
- [ ] 以前の差異を再現し、修正後の結果を証明する最小限のプロセッサーベース回帰フィクスチャを追加する。
- [ ] 必要な Markdown 固有の動作は、未追跡の非互換性ではなく、明示的に文書化された意図的差異として維持する。

### ステップ4: 結果を文書化し、全パッケージを検証する

リポジトリが最終的な互換性状況と全テストケースの移植状況を文書化し、変更されたすべてのパッケージがプロジェクトの検証フローを通過する状態にする。

- [x] `README.md` と影響を受けるパッケージの `README.md` を更新し、upstream との関係、ローカル拡張、意図的な差異を正確に説明する。
- [ ] upstream の全ケースに移植先または変換理由があり、25ルールごとの upstream 総数と `implemented`・`intentional divergence`・`not applicable` の合計が一致し、未追跡・未分類のテストケースが0件であることを確認する。
- [ ] 変換不能とした各ケースを再確認し、Gherkin構文、Markdown変換上の制約、近似 fixture、判定理由を記録したもの以外は除外しない。
- [ ] 公開されたすべての監査・移植・修正タスクが Markdown のチェックボックスで表現され、すべての比較行に最終判定があることを確認する。
- [ ] `vp check` と `vp run -r test` を実行し、変更によるフォーマッター、Lint、型チェック、テストの失敗を解消する。
- [ ] 固定した upstream リビジョン、全ケース移植の概要、互換性の概要、意図的な差異、完了した修正チェックボックスを報告する。

## 監査台帳（upstream `c84fa37a406382b98ca45cffb97f4b1bd6468944`）

`src/index.ts` と `tests/index.test.ts` は各ローカルパッケージ、`src/rules/<rule>.js` と `test/rules/<rule>.js` は固定した upstream の根拠を示す。ローカル診断は対象 Gherkin ノードを報告し、位置は Markdown のインラインコード、見出し、またはテーブルセルの位置へ適応される。

| Local package                           | Upstream source / test                                                                                       | Options and default                 | Scope and result                                                                             |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------- | -------------------------------------------------------------------------------------------- |
| `allowed-tags`                          | `src/rules/allowed-tags.js` / `test/rules/allowed-tags.js`                                                   | `tags: []`, `patterns: []`          | Tags; `@` values and regex; `parity`                                                         |
| `keywords-in-logical-order`             | `src/rules/keywords-in-logical-order.js` / `test/rules/keywords-in-logical-order.js`                         | none                                | Scenario steps; `parity`                                                                     |
| `max-scenarios-per-file`                | `src/rules/max-scenarios-per-file.js` / `test/rules/max-scenarios-per-file.js`                               | numeric limit, upstream default `0` | Feature file scenario count; `intentional divergence` for Markdown file scope                |
| `name-length`                           | `src/rules/name-length.js` / `test/rules/name-length.js`                                                     | max lengths, upstream defaults      | Feature, scenario, step names; `parity`                                                      |
| `no-background-only-scenario`           | `src/rules/no-background-only-scenario.js` / `test/rules/no-background-only-scenario.js`                     | none                                | Feature background/scenario count; `intentional divergence` for multi-feature Markdown scope |
| `no-dupe-feature-names`                 | `src/rules/no-dupe-feature-names.js` / `test/rules/no-dupe-feature-names.js`                                 | none                                | Feature names; `parity`                                                                      |
| `no-dupe-scenario-names`                | `src/rules/no-dupe-scenario-names.js` / `test/rules/no-dupe-scenario-names.js`                               | none                                | Scenario names within feature; `parity`                                                      |
| `no-duplicate-tags`                     | `src/rules/no-duplicate-tags.js` / `test/rules/no-duplicate-tags.js`                                         | none                                | Adjacent/inherited tag lines; `intentional divergence` for Markdown separation               |
| `no-empty-background`                   | `src/rules/no-empty-background.js` / `test/rules/no-empty-background.js`                                     | none                                | Background body; `parity`                                                                    |
| `no-examples-in-scenarios`              | `src/rules/no-examples-in-scenarios.js` / `test/rules/no-examples-in-scenarios.js`                           | none                                | Scenario examples; `parity`                                                                  |
| `no-files-without-scenarios`            | `src/rules/no-files-without-scenarios.js` / `test/rules/no-files-without-scenarios.js`                       | none                                | File scenario count; `intentional divergence` for Markdown documents                         |
| `no-homogenous-tags`                    | `src/rules/no-homogenous-tags.js` / `test/rules/no-homogenous-tags.js`                                       | none                                | Feature/scenario tag inheritance; `intentional divergence`                                   |
| `no-partially-commented-tag-lines`      | `src/rules/no-partially-commented-tag-lines.js` / `test/rules/no-partially-commented-tag-lines.js`           | none                                | Tag line syntax; `parity`                                                                    |
| `no-restricted-patterns`                | `src/rules/no-restricted-patterns.js` / `test/rules/no-restricted-patterns.js`                               | pattern list, default `[]`          | Step text regex; `parity`                                                                    |
| `no-restricted-tags`                    | `src/rules/no-restricted-tags.js` / `test/rules/no-restricted-tags.js`                                       | tag list, default `[]`              | Tags; `@` values; `parity`                                                                   |
| `no-scenario-outlines-without-examples` | `src/rules/no-scenario-outlines-without-examples.js` / `test/rules/no-scenario-outlines-without-examples.js` | none                                | Outline/Examples grouping; `intentional divergence` for separated Markdown tables            |
| `no-superfluous-tags`                   | `src/rules/no-superfluous-tags.js` / `test/rules/no-superfluous-tags.js`                                     | required tags, default `[]`         | Tag inheritance; `intentional divergence`                                                    |
| `no-unnamed-features`                   | `src/rules/no-unnamed-features.js` / `test/rules/no-unnamed-features.js`                                     | none                                | Feature heading; `parity`                                                                    |
| `no-unnamed-scenarios`                  | `src/rules/no-unnamed-scenarios.js` / `test/rules/no-unnamed-scenarios.js`                                   | none                                | Scenario headings; `parity`                                                                  |
| `no-unused-variables`                   | `src/rules/no-unused-variables.js` / `test/rules/no-unused-variables.js`                                     | none                                | Outline variables and GFM tables; `intentional divergence` for multiple tables               |
| `one-space-between-tags`                | `src/rules/one-space-between-tags.js` / `test/rules/one-space-between-tags.js`                               | none                                | Tag line spacing; `parity`                                                                   |
| `only-one-when`                         | `src/rules/only-one-when.js` / `test/rules/only-one-when.js`                                                 | none                                | Scenario steps; `parity`                                                                     |
| `required-tags`                         | `src/rules/required-tags.js` / `test/rules/required-tags.js`                                                 | tags/patterns, default `[]`         | Scenario tags; `intentional divergence` for Markdown tag blocks                              |
| `scenario-size`                         | `src/rules/scenario-size.js` / `test/rules/scenario-size.js`                                                 | max, upstream default               | Scenario/background steps; `parity`                                                          |
| `use-and`                               | `src/rules/use-and.js` / `test/rules/use-and.js`                                                             | none                                | Ordered sibling steps; `parity`                                                              |
| `no-tags-on-backgrounds`                | no current upstream rule / —                                                                                 | none                                | Local extension; `intentional divergence`                                                    |
| `one-feature-per-file`                  | no current upstream rule / —                                                                                 | none                                | Local extension; `intentional divergence`                                                    |
| `up-to-one-background-per-file`         | no current upstream rule / —                                                                                 | none                                | Local extension; `intentional divergence`                                                    |

### 監査結果と追随項目

- [x] 28パッケージのローカル実装・テスト参照を確認し、upstream 対応の有無と判定を記録した。
- [x] Markdown-with-Gherkin のフラットな兄弟ノード、タグブロック、GFM Examples テーブルが `.feature` の構造を完全には再現しない差異を、`intentional divergence` として記録した。
- [x] 現時点の比較で再現可能な `defect` は確認されなかったため、修正用の空チェックボックスは追加していない。
- [x] upstream 現行ルールにない3ルールを削除せず、ローカル拡張として README と台帳に明記した。

### ケース追跡（required-tags）

`required-tags` の upstream `test/rules/required-tags.js` の各ケースを、ローカルの
`packages/remark-lint-gherkin-required-tags/tests/index.test.ts` に対応付ける。
Feature/Rule タグの継承ケースは Markdown AST 固有の適応であり、`intentional divergence` とする。

- [x] タグ有無、未タグ要素の `ignoreUntagged`、不一致タグを実装済みとして追跡。
- [x] 正規表現の一致・不一致を実装済みとして追跡。
- [x] 複数必須タグの不足・充足を実装済みとして追跡。
- [x] Scenario Outline を実装済みとして追跡。
- [x] Rule 継承は Markdown 固有の適応ケースとして追跡。
