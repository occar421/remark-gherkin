---
sessionId: session-260810-225124-uent
---

# 要件

### 目的

- [ ] `remark-preset-lint-gherkin-lint` を利用する側が、lint rule ごとに異なる option を指定できるようにする。
- [ ] 既存の `.use(remarkPresetLintGherkinLint)` と各 rule を単体で `.use(rule, options)` する利用方法の動作を維持する。

### 対象範囲

- [ ] `packages/remark-preset-lint-gherkin-lint/src/index.ts` の preset 登録方式と公開 option 型を拡張する。
- [ ] preset に登録されている全 `remark-lint-gherkin-*` rule について、個別設定を受け付けるスロットを用意する。
- [ ] 既に option 型を公開している `allowed-tags`、`max-scenarios-per-file`、`name-length`、`no-dupe-scenario-names`、`no-restricted-patterns`、`no-restricted-tags`、`required-tags`、`scenario-size` は既存の型・既定値・単体利用時の挙動を維持する。
- [ ] option を持たない rule は設定を受け取っても既存の挙動を変えず、将来の option 追加に対応できる構造にする。
- [ ] 未指定の rule option は従来どおりの既定値で動作し、未指定と空の設定を安全に扱う。
- [ ] preset の README に設定形式、代表的な rule option、既定値、単体利用との違いを記載する。

### 想定する利用例

- [ ] `unified().use(remarkPresetLintGherkinLint, { rules: { ... } })` で preset を登録できる。
- [ ] rule 名をキーにして、例えば `remark-lint-gherkin-max-scenarios-per-file` と `remark-lint-gherkin-name-length` に別々の option を渡せる。
- [ ] 片方の rule だけ設定した場合、他の rule は設定なしの既定動作で実行される。

# 技術設計

### 現状

- [ ] `packages/remark-preset-lint-gherkin-lint/src/index.ts` は `Preset` オブジェクトの `plugins` 配列に全 rule を引数なしで登録しているため、利用者から rule ごとの option を渡す経路がない。
- [ ] 各 rule は `unified-lint-rule` の `lintRule<Root, Options>` を使い、実行時 option を受け取る設計になっている。option の具体例は `packages/remark-lint-gherkin-max-scenarios-per-file/src/index.ts`、`packages/remark-lint-gherkin-name-length/src/index.ts`、`packages/remark-lint-gherkin-scenario-size/src/index.ts` にある。
- [ ] `packages/ast-explorer-demo/src/lib/lint-utils.ts` は preset 利用時に option を渡さず、個別利用時も plugin の有効・無効だけを制御している。
- [ ] preset の `tests/` は空で、preset 全体の option 伝播を検証するテストがない。

### 採用する設定契約

- [ ] preset を `unified` の attacher として実装し、既存の `.use(remarkPresetLintGherkinLint)` を維持したまま第二引数を受け取れるようにする。
- [ ] 公開型を `PresetOptions` として定義し、`rules` 配下を rule の package/origin 名から対応する option 型への map にする。
- [ ] option の map は次のような形に統一する。
  ```ts
  type PresetOptions = {
    rules?: {
      "remark-lint-gherkin-allowed-tags"?: AllowedTagsOptions;
      "remark-lint-gherkin-max-scenarios-per-file"?: MaxScenariosPerFileOptions;
      "remark-lint-gherkin-name-length"?: NameLengthOptions;
      // 他の登録 rule も同じキー体系で定義する
    };
  };
  ```
- [ ] preset 内では `remarkLint` と各 Gherkin rule を既存の順序で `this.use(plugin, options.rules?.[ruleName])` に登録し、設定のない rule には `undefined` を渡す。
- [ ] plugin の識別子は既存の `origin`、package 名、`ast-explorer-demo/src/lib/lint-utils.ts` の `lintRuleNames` と一致させ、表記揺れを作らない。
- [ ] 各 package の `src/index.ts` で option 型が必要な rule は型を named export として公開し、preset package から型を再利用する。option が不要な rule は無理に設定項目を追加せず、設定 map では `undefined` を許容する。
- [ ] 設定オブジェクトを rule 間で共有・変更せず、各 plugin に独立した option オブジェクトを渡す。
- [ ] preset の export 形状を変える場合は、既存の default export と README の基本利用例が有効なままになるよう互換アダプターを置く。

### 変更対象

- [ ] `packages/remark-preset-lint-gherkin-lint/src/index.ts`
  - preset option 型、rule 名と option の対応表、各 plugin への option 伝播を実装する。
  - plugin の登録順序と `remarkLint` の登録を変更しない。
- [ ] option を持つ各 rule の `src/index.ts`
  - 公開 option 型の名称・形状を揃え、preset から import できるようにする。
  - `options || {}`、nullish coalescing、既定値など既存のフォールバックを維持する。
- [ ] `packages/remark-preset-lint-gherkin-lint/tests/index.test.ts`
  - preset の option 伝播、rule 間の独立性、未指定時の既定値を追加する。
- [ ] `packages/remark-preset-lint-gherkin-lint/README.md`
  - `rules` map の TypeScript/JavaScript 例と、複数 rule に別々の option を指定する例を追加する。
- [ ] 必要に応じて `packages/ast-explorer-demo/src/lib/lint-utils.ts` と設定 UI
  - preset 経由の設定を利用する場合だけ、既存の lint 設定モデルから option map を渡せるようにする。
  - UI を対象外とする場合は、ライブラリ API の検証に限定し、既存の boolean rule 切り替えを変更しない。

### リスクと対策

- [ ] `Preset` オブジェクトから attacher への変更による型・実行時互換性を、既存 README 例と preset 経由の回帰テストで確認する。
- [ ] heterogeneous な option 型を `any` に逃がさず、各 rule package の公開型から map を構成して誤設定を型検査で検出する。
- [ ] rule key の不一致で option が silently ignored にならないよう、定数化した rule 名とテスト用 fixture を共有する。

# 検証

### テスト方針

- [ ] preset package に `unified`、`remark-parse`、`remark-gherkin`、`remark-lint`、`vfile-reporter` を用いた統合テストを追加する。
- [ ] 既存 rule package の単体テストは変更後も実行し、preset を介さない option API の回帰を確認する。

### 必須シナリオ

- [ ] option なしの `.use(remarkPresetLintGherkinLint)` が従来と同じ lint message を生成する。
- [ ] `max-scenarios-per-file` に `maxScenarios` を渡すと、既定値では通る入力だけが違反になる。
- [ ] `name-length` に `Feature`、`Scenario`、`Step` の異なる上限を渡すと、それぞれ独立して適用される。
- [ ] `allowed-tags`、`required-tags`、`no-restricted-tags` に異なる tag/pattern option を渡すと、対象 rule だけの message が変化する。
- [ ] `no-restricted-patterns` と `scenario-size` のネストした option が正しい plugin に伝わる。
- [ ] 一つの rule の設定を変更しても、他の rule の設定・既定値・message が変わらない。
- [ ] preset の `rules` に未知のキーや `undefined` を含めても、他の rule の実行を壊さない。

### Vite+ 検証

- [ ] `vp check` で format、lint、型検査を実行する。
- [ ] `vp test` で全 workspace のテストを実行する。
- [ ] `vp run -r build` または対象 package の `vp pack` で公開型と build 成果物を確認する。

# Delivery Steps

### Step 1: preset option 契約を定義する

`remark-preset-lint-gherkin-lint` が rule ごとの option map を型安全に受け取れる契約を持つ状態にする。

- `packages/remark-preset-lint-gherkin-lint/src/index.ts` の preset API と公開型を設計・実装する。
- 既存の rule 登録順序、default export、option 未指定時の動作を維持する。
- 各 rule の `Options` 型を preset から参照できるよう、必要な `src/index.ts` の named export を整える。

### Step 2: 各 lint rule へ option を伝播する

preset に指定した option が対応する rule にだけ渡り、既存の各 rule の既定値が維持される状態にする。

- `allowed-tags`、`max-scenarios-per-file`、`name-length`、`no-dupe-scenario-names`、`no-restricted-patterns`、`no-restricted-tags`、`required-tags`、`scenario-size` の既存 option を map に接続する。
- option を持たない rule は従来どおり実行し、将来拡張可能な登録経路を統一する。
- `ast-explorer-demo/src/lib/lint-utils.ts` を変更する場合は、既存の rule 有効・無効設定を壊さず preset option map を渡す。

### Step 3: preset の統合テストと利用ドキュメントを追加する

複数 rule の個別設定、未指定時の回帰、設定同士の独立性がテストと README で確認できる状態にする。

- `packages/remark-preset-lint-gherkin-lint/tests/index.test.ts` に実際の Gherkin fixture を使った統合テストを追加する。
- 複数の異なる option 型、ネストした option、既定値、未知・未指定設定を検証する。
- `packages/remark-preset-lint-gherkin-lint/README.md` に設定 map のコード例、各 rule の option 参照方法、後方互換の利用方法を追記する。

### Step 4: workspace 全体を Vite+ で検証する

option 対応後の全 package が型検査・lint・テスト・build を通過する状態にする。

- `vp check` で変更した TypeScript、README、設定型の問題を解消する。
- `vp test` で新規 preset テストと既存 lint rule テストを実行する。
- `vp run -r build` または対象 package の `vp pack` で declaration と package build を確認する。
