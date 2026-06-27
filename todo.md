`remark-lint-gherkin-*` パッケージとオリジナルの [`gherkin-lint`](https://github.com/gherkin-lint/gherkin-lint/blob/master/README.md#rule-configuration) の設定（Config）を比較した結果、以下のギャップを確認しました。

### 1. オプションのデータ構造の相違

いくつかのルールで、オリジナルの `gherkin-lint` がサポートしている柔軟な設定形式が、`remark-lint-gherkin` 版では制限されています。

- **`no-dupe-scenario-names`**
  - **オリジナル**: `"in-feature"` または `"anywhere"`（デフォルト）という文字列オプションを指定して、重複チェックのスコープを制御できます。
  - **現状**: オプションを受け取る実装になっておらず、ファイル内（`in-feature` 相当）のチェックのみに限定されています。

### 2. 実装上の制約によるギャップ

- **`no-restricted-patterns`**
  - **オリジナル**: `Description`（説明文）内のパターンマッチもチェック対象となります。
  - **現状**: `mdast-util-gherkin` の制約により、名前（Name）やステップ（Step）のチェックは行っていますが、説明文（Description）のパース結果へのアクセスが不十分な場合、チェックが漏れている可能性があります。
