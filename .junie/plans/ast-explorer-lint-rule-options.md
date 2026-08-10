---
sessionId: session-260811-010116-1u33
---

# 要件

### 目的

- [ ] `packages/ast-explorer-demo` の Lint 設定画面で、各 Gherkin lint rule が公開している option を rule 単位で設定できるようにする。
- [ ] 設定値をリアルタイム lint に反映し、入力を変更すると Monaco の marker が更新されるようにする。

### 対象範囲

- [ ] 対象は `ast-explorer-demo` の UI、設定モデル、lint processor 呼び出し、demo のテストに限定する。
- [ ] `packages/remark-preset-lint-gherkin-lint` およびその他の preset package のソース、設定、公開 API は変更しない。
- [ ] preset が有効な場合は現状どおり preset の固定 option なしの動作を維持し、個別 option は preset を無効にして rule を個別実行する場合に適用する。
- [ ] option を公開していない rule は、既存どおり有効・無効の切り替えのみを提供する。

### 機能要件

- [ ] `remark-lint-gherkin-allowed-tags`: 許可タグ配列と許可パターン配列を設定できる。
- [ ] `remark-lint-gherkin-max-scenarios-per-file`: `maxScenarios` と `countOutlineExamples` を設定できる。
- [ ] `remark-lint-gherkin-name-length`: `Feature`、`Scenario`、`Step` の最大文字数を個別に設定できる。
- [ ] `remark-lint-gherkin-no-dupe-scenario-names`: `in-feature` / `anywhere-in-file` を選択できる。
- [ ] `remark-lint-gherkin-no-restricted-patterns`: `Global`、`Feature`、`Rule`、`Background`、`Scenario`、`ScenarioOutline`、`Examples`、`Step`、`Description` ごとのパターン配列を設定できる。
- [ ] `remark-lint-gherkin-no-restricted-tags`: 制限タグ配列と制限パターン配列を設定できる。
- [ ] `remark-lint-gherkin-required-tags`: 必須タグ配列と `ignoreUntagged` を設定できる。
- [ ] `remark-lint-gherkin-scenario-size`: `Background` と `Scenario` の step 上限を設定できる。
- [ ] 未入力値は各 package が持つデフォルト値を利用できるようにし、不正な数値・JSON・正規表現の入力でアプリ全体が壊れないようにする。
- [ ] preset 有効時は個別 rule の checkbox と option editor を無効化または非表示にし、preset 固定動作との混同を防ぐ。

# 技術設計

### 現状と既存パターン

- [ ] `packages/ast-explorer-demo/src/App.tsx` が `LintSettings` を保持し、`lintContent(content, lintSettings)` の結果を marker に変換している流れを維持する。
- [ ] `packages/ast-explorer-demo/src/components/Header/Header.tsx` は設定パネルを表示するだけの既存責務を維持し、設定編集は `SettingsPanel` に閉じ込める。
- [ ] `packages/ast-explorer-demo/src/components/SettingsPanel/SettingsPanel.tsx` の既存 checkbox と `SettingsPanel.css` の BEM スタイルを拡張し、rule ごとの option editor を配置する。
- [ ] `packages/ast-explorer-demo/src/lib/lint-utils.ts` の `lintRuleNames` と preset plugin の順序が対応している現状を踏まえ、rule 名・plugin・option schema の対応を一か所で管理する。

### 設定モデルと lint 接続

- [ ] boolean の有効・無効設定と rule option 設定を分離した型モデルにし、各 rule の option の number、boolean、string union、string 配列、カテゴリ別配列、ネストした数値を型で表現する。
- [ ] UI 表示用の option 定義または rule descriptor を `lint-utils.ts` 側に用意し、label、入力種別、デフォルト未入力状態、変換処理が `SettingsPanel` に散らばらないようにする。
- [ ] preset 無効時の `lintContent` で、現在の `lintPlugins.forEach` に rule ごとの option を第2引数として渡し、未選択 rule は登録しない。
- [ ] 配列 option は改行区切りの入力から空行を除いて配列化し、`no-restricted-patterns` はカテゴリごとの入力を object に変換する。
- [ ] number option は空欄を `undefined` として扱い、入力途中の値による `NaN` の plugin 渡しを避ける。select/checkbox は package の option 値に限定する。
- [ ] option の正規表現は lint 実行前に安全に扱い、`new RegExp` 由来の例外は既存の `App.tsx` の marker fallback だけに依存せず、設定値のエラーとして表示または無効化できる設計にする。
- [ ] preset 分岐は変更せず、preset package の `plugins` を option 付きに置き換えない。これにより preset package を編集せず、preset の既存挙動を保つ。

### UI 構成

- [ ] 各 rule の checkbox の直下に、option を持つ rule だけ折りたたみ可能な option editor を表示する。
- [ ] number は number input、boolean は checkbox、union は select、単純配列は複数行 textarea、カテゴリ別配列はカテゴリ単位の複数行 textarea として実装する。
- [ ] option のラベルと説明に package README/API の意味とデフォルト値を反映し、preset が有効なときの disabled 状態を明示する。
- [ ] `SettingsPanel.css` に既存の `.settings-panel` 名前空間と BEM 命名規則で入力、説明、エラー、折りたたみ状態のスタイルを追加する。
- [ ] 設定更新は immutable update とし、`App.tsx` の `lintSettings` 変更検知で既存のリアルタイム lint 更新を利用する。

### 変更対象候補

- [ ] `packages/ast-explorer-demo/src/lib/lint-utils.ts` — option 型、初期値、rule descriptor、入力値変換、plugin への option 渡しを追加する。
- [ ] `packages/ast-explorer-demo/src/components/SettingsPanel/SettingsPanel.tsx` — rule ごとの option editor、入力更新、disabled/error 表示を追加する。
- [ ] `packages/ast-explorer-demo/src/components/SettingsPanel/SettingsPanel.css` — option editor のレイアウトと既存 UI に沿ったスタイルを追加する。
- [ ] `packages/ast-explorer-demo/tests/logic.test.ts` — option の変換・各 plugin への反映・preset 非干渉を検証する。
- [ ] `packages/remark-preset-lint-gherkin-lint/**` — **変更禁止**。demo からの利用方法だけを変更する。

# 検証

### 自動検証

- [ ] `packages/ast-explorer-demo/tests/logic.test.ts` に、option を指定しない場合の既存デフォルト動作を確認するテストを残す。
- [ ] option 対応 8 rule について、代表的な最小値・切り替え値・配列値が lint 結果に反映される parameterized または rule 別テストを追加する。
- [ ] `no-dupe-scenario-names` の2つの string option、`max-scenarios-per-file` と `required-tags` の boolean option、数値 option、配列 option、カテゴリ別 option をそれぞれ検証する。
- [ ] preset 有効時に個別 option/checkbox を変更しても preset の結果が変わらないことを確認する。
- [ ] preset 無効時に全 rule を無効化した場合に警告が出ない既存テストを維持する。
- [ ] 空欄、空行、無効な数値、無効な正規表現などの入力で例外を投げず、lint が継続または明示的な設定エラーになることを確認する。
- [ ] demo package で `vp check`、`vp test`、`vp build` を実行し、Oxlint/Oxfmt、TypeScript、Vitest、Vite build を通過させる。
- [ ] 差分に `packages/remark-preset-lint-gherkin-lint` 配下の変更が含まれていないことを確認する。

# Delivery Steps

### Step 1: lint-option-model

demo 側に全 lint rule の option 契約と個別実行時の plugin option 伝達を実装する。

- `packages/ast-explorer-demo/src/lib/lint-utils.ts` に option 型、初期設定、rule descriptor、入力値の正規化を追加する。
- option 対応8 ruleの設定を、各 package の既存 `Options` 契約に合わせて表現する。
- preset 分岐と `packages/remark-preset-lint-gherkin-lint/**` は変更せず、preset 無効時だけ `.use(plugin, options)` を使う。
- 空値・不正値・正規表現エラーを安全に扱い、既存の boolean rule 選択と realtime lint 更新を維持する。

### Step 2: settings-panel-options

Lint 設定パネルで rule ごとの option を編集できる UI を提供する。

- `packages/ast-explorer-demo/src/components/SettingsPanel/SettingsPanel.tsx` に rule descriptor に基づく option editor を追加する。
- number、boolean、select、複数行配列、カテゴリ別配列の入力を実装し、設定 state を immutable に更新する。
- preset 有効時の disabled 表示、option の説明・デフォルト値・入力エラーを追加する。
- `packages/ast-explorer-demo/src/components/SettingsPanel/SettingsPanel.css` を BEM 規約に沿って拡張する。

### Step 3: option-regression-validation

option 設定、preset 非干渉、既存 lint 選択の動作を自動テストと Vite+ 検証で保証する。

- `packages/ast-explorer-demo/tests/logic.test.ts` に各 option 種別と option 対応 rule の lint 結果を検証するケースを追加する。
- preset 有効時の固定動作、preset 無効時の全 rule 無効化、未入力時の package デフォルトを検証する。
- 空欄・不正数値・不正正規表現などの境界値を確認する。
- `packages/ast-explorer-demo` で `vp check`、`vp test`、`vp build` を実行し、preset package に変更がないことを確認する。
