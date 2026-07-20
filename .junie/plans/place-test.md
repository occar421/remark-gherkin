---
sessionId: session-260720-175202-1so3
---

# Requirements

### Overview & Goals

`remark-lint-gherkin-*` のすべてのテストファイルで、`message` を検証しているエラーケースについて、同じメッセージに対応する `file.messages[n].place` の期待値も検証できるようにする。対象作業の内容を `.junie/plans/place-test.md` に記録し、実装時に漏れなく順番に反映できる状態にする。

### Scope

#### In Scope

- `packages/remark-lint-gherkin-*/tests/index.test.ts` を対象に、`message` が存在する各テストケースを棚卸しする。
- 各診断の `place` について、`start` / `end` の `line`、`column`、`offset` を期待値として追加する。
- 複数メッセージを返すケースでは、メッセージのインデックスと対応する位置を個別に検証する。
- 既に `place` を検証している `remark-lint-gherkin-allowed-tags` の書式と、既存の VFile position 表現を基準にする。
- 入力文字列（先頭改行、複数行、タグ間の空白、コードフェンス等）から位置を正確に算出し、テスト実行で確認する。
- 対象には現在存在する各 `remark-lint-gherkin-*` lint rule package のテストを含め、新規対象が増えた場合も同じ glob で確認する。

#### Out of Scope

- lint rule の実装、診断メッセージ、診断範囲の仕様変更。
- テスト入力やテストケースの意図を変えること。
- `AGENTS.md`、README、依存関係、Vite+ の設定変更。

### Acceptance Criteria

- 対象テストファイル内で `message` を期待するすべてのエラーケースに、対応する `place` の完全な期待値がある。
- 複数診断ケースで各メッセージと位置の対応が明示されている。
- 成功ケース（`file.messages` が空）には不要な位置期待値を追加しない。
- 既存のメッセージ内容・ruleId の検証と lint rule の挙動を維持する。

# Technical Design

### Current Implementation

- lint rule package ごとに `packages/remark-lint-gherkin-*/tests/index.test.ts` があり、`vite-plus/test` の `suite` / `test` / `expect` と unified processor を使っている。
- エラー診断は主に `expect(file.messages).toHaveLength(...)` の後に `file.messages[n].message`（一部は `ruleId`）を検証する構成になっている。
- `packages/remark-lint-gherkin-allowed-tags/tests/index.test.ts` では既に `file.messages[n].place` を `start` / `end` の line・column・offset 付きで `toEqual` しており、複数メッセージの参考実装となる。
- `remark-lint-gherkin-name-length/tests/index.test.ts` のように、先頭改行を含むテンプレート文字列を processor に渡すテストでは、メッセージ位置が入力上の実際の行番号・オフセットになるため、ケース単位で算出する。

### Proposed Changes

- 全対象テストを走査し、`file.messages`（および `file1` / `file2` などの派生変数）の `message` assertion を一覧化する。
- 各 assertion の直後、または同一メッセージ群の検証ブロック内に、対応する `place` の deep equality assertion を追加する。
- `place` は次の形に統一する。
  ```ts
  expect(file.messages[0].place).toEqual({
    start: { line: 1, column: 1, offset: 0 },
    end: { line: 1, column: 15, offset: 14 },
  });
  ```
- 診断がノード全体、キーワード、タグ、シナリオ、ステップ、ファイル、または関連する複数ノードを指す場合は、既存 rule の `VFileMessage` 作成箇所と AST node の位置を確認して、実装が返す範囲をそのまま期待値にする。
- 位置の検証だけを追加し、メッセージの内容・順序・入力データは変更しない。

### File Structure

- 計画書: `.junie/plans/place-test.md`（対象ファイル一覧、共通手順、位置算出方針、検証方針を記載）
- 実装対象: `packages/remark-lint-gherkin-*/tests/index.test.ts`
- 参照実装: `packages/remark-lint-gherkin-allowed-tags/tests/index.test.ts`
- 必要に応じて位置の根拠を確認する各 package の `src/index.ts` および関連 helper（テスト自体の期待値作成のための調査のみ）。

### Position Calculation Rules

- `line` は 1 始まり、`column` は 1 始まり、`offset` は入力全体の 0 始まりとする。
- 入力先頭の改行、改行コード、インラインコード記法、タグ間スペースを含め、processor に実際に渡す文字列を基準にする。
- `end` は VFile/unist の既存位置表現に合わせ、対象範囲直後の位置を記録する。
- 同一ケースで複数メッセージがある場合、`messages[0]` と `messages[1]` などを別々に検証し、順序依存の回帰も検知する。

### Risks and Mitigations

- 手計算した offset の誤りは、入力文字列の行・文字数を確認し、`vp test` で実測して修正する。
- rule ごとに意図的な診断範囲が異なるため、共通の推測で一括置換せず、各 rule の visitor と既存の place assertion を参照する。
- 診断に `place` が存在しないケースがないかを先に確認し、対象条件（`message` があるケース）と実際の VFileMessage 契約が一致することを確認する。

# Testing

### Validation Approach

- 変更対象を `remark-lint-gherkin-*` パッケージのテスト glob で網羅的に検索し、`message` assertion に対応しない `place` assertion が残っていないか確認する。
- Vite+ のプロジェクト方針に従い、`vp check` と `vp test` を実行してフォーマット、lint、型検査、全テストを検証する。
- 必要な場合は対象パッケージまたは対象テストを絞って再実行し、位置値の不一致を個別に修正する。

### Key Scenarios

- 単一の診断を返す各 lint rule のエラーケースで、メッセージと `place` が同時に一致する。
- 複数診断を返すケースで、各メッセージの順序と対応位置が一致する。
- 複数行入力、先頭改行、タグやインライン記法を含む入力で line / column / offset が正しい。
- エラーを返さないケースは従来どおり `messages` が空である。

### Test Changes

- 各 `index.test.ts` の既存エラーケースに `place` の期待値を追加する。
- 新しい独立テストや本番コードは、既存ケースだけで要件を十分に検証できる限り追加しない。

# Delivery Steps

### Step 1: 対象テストと位置仕様を棚卸しする

対象となる全 lint rule テストと、既存の `place` 検証パターンを一覧化する。

- `packages/remark-lint-gherkin-*/tests/index.test.ts` を走査する。
- `message` を検証する全エラーケースと複数メッセージケースを記録する。
- 各 case の入力文字列、診断生成元、期待する start/end 位置を rule 実装と AST 位置から確定する。
- 結果を `.junie/plans/place-test.md` に、実装順序とともに記載する。

### Step 2: 各 lint rule テストへ place 期待値を追加する

棚卸し結果に基づき、全対象テストのメッセージ検証へ正確な位置期待値を追加する。

- `file.messages[n].place` を `start` / `end` の line・column・offset 付きで検証する。
- 複数診断では各 message index に対応する place を個別に検証する。
- 既存の `allowed-tags` の書式とテスト構成を踏襲する。
- メッセージ内容、ruleId、入力、lint rule 実装は変更しない。

### Step 3: Vite+ 検証で全位置期待値を確定する

追加した位置アサーションが全パッケージで安定して通る状態にする。

- `vp test` を実行し、失敗した位置値を入力文字列と実装の node range に照らして修正する。
- `vp check` を実行し、フォーマット、lint、型検査の問題を解消する。
- 最終的に、`message` がある対象ケースすべてに `place` があることを検索で確認する。

# Targets

- [x] remark-lint-gherkin-allowed-tags
- [x] remark-lint-gherkin-keywords-in-logical-order
- [x] remark-lint-gherkin-max-scenarios-per-file
- [x] remark-lint-gherkin-name-length
- [x] remark-lint-gherkin-no-background-only-scenario
- [x] remark-lint-gherkin-no-dupe-feature-names
- [x] remark-lint-gherkin-no-dupe-scenario-names
- [x] remark-lint-gherkin-no-duplicate-tags
- [x] remark-lint-gherkin-no-empty-background
- [x] remark-lint-gherkin-no-examples-in-scenarios
- [x] remark-lint-gherkin-no-files-without-scenarios
- [x] remark-lint-gherkin-no-homogenous-tags
- [x] remark-lint-gherkin-no-partially-commented-tag-lines
- [x] remark-lint-gherkin-no-restricted-patterns
- [x] remark-lint-gherkin-no-restricted-tags
- [x] remark-lint-gherkin-no-scenario-outlines-without-examples
- [x] remark-lint-gherkin-no-superfluous-tags
- [x] remark-lint-gherkin-no-tags-on-backgrounds
- [x] remark-lint-gherkin-no-unnamed-features
- [x] remark-lint-gherkin-no-unnamed-scenarios
- [x] remark-lint-gherkin-no-unused-variables
- [x] remark-lint-gherkin-one-feature-per-file
- [x] remark-lint-gherkin-one-space-between-tags
- [x] remark-lint-gherkin-only-one-when
- [x] remark-lint-gherkin-required-tags
- [x] remark-lint-gherkin-scenario-size
- [x] remark-lint-gherkin-up-to-one-background-per-file
- [x] remark-lint-gherkin-use-and
