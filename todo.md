`remark-lint-gherkin-*` パッケージとオリジナルの [`gherkin-lint`](https://github.com/gherkin-lint/gherkin-lint/blob/master/README.md#rule-configuration) の設定（Config）を比較した結果、以下のギャップを確認しました。

### 1. オプションのデータ構造の相違

いくつかのルールで、オリジナルの `gherkin-lint` がサポートしている柔軟な設定形式が、`remark-lint-gherkin` 版では制限されています。

- **`allowed-tags` / `no-restricted-tags`**
  - **オリジナル**: `["on", {"tags": ["@a"], "patterns": ["^@b$"]}]` というオブジェクト形式に加え、`["on", ["@a", "@b"]]` のような単純な配列形式も受け入れる可能性があります（ドキュメント例はオブジェクト形式が主ですが、歴史的に配列も許容されるケースが多いです）。
  - **現状**: `Options` 型が `{ tags?: string[]; patterns?: string[]; }` となっており、オブジェクト形式のみを想定しています。
- **`max-scenarios-per-file`**
  - **オリジナル**: デフォルト値は `maxScenarios: 10`, `countOutlineExamples: true` です。
  - **現状**: 実装コード（`packages/remark-lint-gherkin-max-scenarios-per-file/src/index.ts`）ではデフォルト値が正しく反映されていますが、ドキュメントとの整合性を再確認する価値があります。
- **`no-dupe-scenario-names`**
  - **オリジナル**: `"in-feature"` または `"anywhere"`（デフォルト）という文字列オプションを指定して、重複チェックのスコープを制御できます。
  - **現状**: オプションを受け取る実装になっておらず、ファイル内（`in-feature` 相当）のチェックのみに限定されています。

### 2. 未実装のルール

オリジナルの `gherkin-lint` に存在する以下のルールが、`remark-lint-gherkin` パッケージとしてリストに含まれていない、あるいは意図的に除外されています。

- **`file-name`**
  - **現状**: Markdown ファイル内の Gherkin セクションを対象とする性質上、ファイル名自体のチェックは他の `remark-lint` ルールに委ねる方針で除外されています（READMEに明記あり）。
- **`indentation`**
  - **現状**: 同様に、Markdown 全体のインデントルールに委ねる方針で除外されています。
- **`new-line-at-eof`**
  - **現状**: 除外されています。

### 3. 実装上の制約によるギャップ

- **`no-restricted-patterns`**
  - **オリジナル**: `Description`（説明文）内のパターンマッチもチェック対象となります。
  - **現状**: `mdast-util-gherkin` の制約により、名前（Name）やステップ（Step）のチェックは行っていますが、説明文（Description）のパース結果へのアクセスが不十分な場合、チェックが漏れている可能性があります。
- **`no-multiline-steps`**
  - **現状**: Markdown ファイルの特性上、除外されています。

### まとめ

主な修正・改善推奨ポイントは以下の通りです：

1. `no-dupe-scenario-names` にスコープ選択オプション（`in-feature` / `anywhere`）を追加する。
2. `allowed-tags` 等のオプション型を、より柔軟な入力（配列直接指定など）に対応させる。
