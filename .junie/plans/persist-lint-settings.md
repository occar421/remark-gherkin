---
sessionId: session-260811-004241-1sia
---

# Requirements

### Overview & Goals

AST Explorer の Settings パネルで変更した `LintSettings` を `localStorage` に保存し、ページを再読み込みしても同じ lint 設定を復元できるようにする。対象は `preset`、各 `lintRuleNames` の有効状態、`options` 内のルール別設定値とする。

### Scope

#### In Scope

- `SettingsPanel` から更新される `LintSettings` の保存。
- 初回表示時の保存済み設定の復元。
- `localStorage` が利用できない場合、JSON が壊れている場合、保存内容が利用できない場合の `defaultLintSettings` への安全なフォールバック。
- 既存の設定更新フローと lint 実行結果の維持。

#### Out of Scope

- エディター本文の保存方式変更（既存の `useContent.ts` の責務）。
- AST ツリー表示設定、設定パネルの開閉状態、フォーカス位置の永続化。
- lint ルールや option の仕様変更。

### Acceptance Criteria

- [x] 設定パネルで変更した任意の preset、ルール checkbox、またはルール option が `localStorage` に保存される。
- [x] 保存済みの有効な設定がある状態でアプリを再初期化すると、設定パネルの表示と lint 結果が保存前と一致する。
- [x] 保存値が不正な JSON、期待しない形、または `localStorage` の読み書き例外を起こしてもアプリはクラッシュせず、既定設定で動作する。
- [x] 既存の `useContent.ts` による本文保存と、現在の `lintContent` の option 正規化動作を壊さない。

# Technical Design

### Current Implementation

- `packages/ast-explorer-demo/src/App.tsx` は `defaultLintSettings` を初期値にした `useState` を持ち、`Header` → `SettingsPanel` に setter を渡している。
- `packages/ast-explorer-demo/src/components/SettingsPanel/SettingsPanel.tsx` は関数形式の state updater を使い、`preset`、個別ルールの boolean、`options` の number/boolean/select/array/categorized-array を更新する。
- `packages/ast-explorer-demo/src/hooks/useContent.ts` は専用 storage key、初期読み込み時の `try/catch`、setter 内の `localStorage.setItem` を使う既存パターンである。
- `packages/ast-explorer-demo/src/lib/lint-utils.ts` の `LintSettings` と `defaultLintSettings` が保存対象の型と既定値を定義し、実行時には `normalizeLintOptions` が option 値を検証する。

### Key Decisions

- `useContent.ts` を汎用化して既存の本文保存を巻き込むのではなく、lint 設定専用の `useLintSettings` hook を追加する。これにより設定の型・storage key・既定値を一箇所に保ち、変更範囲を AST Explorer に限定する。
- 保存形式は `JSON.stringify(LintSettings)` とし、`localStorage` のキーは本文用キーと衝突しない専用キーにする。
- 保存データは読み込み時に JSON とオブジェクト形状を確認し、`defaultLintSettings` を基準に現在のルール一覧を補完する。将来ルールが増えた場合も、未知の保存値で起動を壊さず既定値を利用できるようにする。
- `SettingsPanel` が渡す `SetStateAction<LintSettings>` をそのまま扱える hook setter を返し、関数形式 updater でも解決後の値を保存する。読み書きの例外は `useContent.ts` と同じく無視して UI の state 更新を優先する。

### Proposed Changes

- `packages/ast-explorer-demo/src/hooks/useLintSettings.ts` を追加する。
  - 専用 storage key を定義する。
  - 保存値を安全に読み込み、`defaultLintSettings` をフォールバックにする。
  - `useState` の初期化時に復元し、`useContent.ts` と同じく保存不可環境を許容する。
  - 値または関数形式 updater を受け取る setter で state と保存を同時に更新する。
- `packages/ast-explorer-demo/src/App.tsx` の `useState<LintSettings>(defaultLintSettings)` を新 hook に置き換え、既存の `Header` props と `lintContent` 呼び出しは変更しない。
- 保存データの検証・マージは `LintSettings` の `preset` と `lintRuleNames` を中心に行い、`options` は既存の `LintOptions` 形を保ったまま保存・復元する。実行時の値の安全性は既存の `normalizeLintOptions` に委ねる。

### File Structure

- Add: `packages/ast-explorer-demo/src/hooks/useLintSettings.ts`
- Modify: `packages/ast-explorer-demo/src/App.tsx`
- Modify: `packages/ast-explorer-demo/tests/logic.test.ts` or add a focused hook/storage test alongside it, using the repository's existing Vite+ test setup.

### Risks

- `localStorage` の値を無検証で state に戻すと checkbox の型や option の構造が壊れるため、JSON parse 失敗と基本形状の不一致を必ず既定値へフォールバックする。
- React の関数形式 updater を保存処理が扱えないと `SettingsPanel` の更新が失われるため、resolved state を保存する契約をテストする。

# Testing

### Validation Approach

- storage が空の初期化で `defaultLintSettings` が使われることを確認する。
- ルール checkbox、`preset`、`name-length` の `Feature` option など、`SettingsPanel` が生成する代表的な関数形式更新を適用し、JSON 化された値が保存されることを確認する。
- 保存済み設定を使った再初期化で全ルール状態と option が復元され、`lintContent` が復元された option を反映することを確認する。
- 不正 JSON、部分的または不正な保存データ、`localStorage` の read/write 例外でクラッシュせず既定値または現在の state を維持することを確認する。

### Test Changes

- `packages/ast-explorer-demo/tests/logic.test.ts` に既存の lint option 検証と整合する persistence の回帰ケースを追加するか、hook 専用テストに分離する。
- 実装後に `vp check`、`vp test`、必要に応じて `vp run -r build` を実行し、既存の AST Explorer と workspace パッケージへの回帰がないことを確認する。

# Delivery Steps

### Step 1: Add persisted lint settings hook

`LintSettings` を安全に読み書きする `useLintSettings` hook が追加されます。

- [x] `packages/ast-explorer-demo/src/hooks/useLintSettings.ts` に専用 `localStorage` key を定義する。
- [x] `defaultLintSettings` を基準に JSON の parse と基本形状の検証・補完を行う。
- [x] `useContent.ts` の例に合わせ、storage 例外時は UI を継続し、関数形式の state updater も解決後の値として保存する。
- [x] 保存対象は preset、全ルールの有効状態、ルール別 options とする。

### Step 2: Connect App to restored settings

AST Explorer は起動時に保存済み lint 設定を復元し、変更時に自動保存します。

- [x] `packages/ast-explorer-demo/src/App.tsx` の lint state 初期化を `useLintSettings` に置き換える。
- [x] `Header` と `SettingsPanel` の既存 props 契約を維持し、既存の設定 UI と `lintContent` の実行経路を変更しない。
- [x] 保存された `name-length` などの option が再読み込み後も現在の lint 診断に反映されることを確認する。

### Step 3: Verify storage edge cases and regressions

lint 設定の保存・復元と既存機能の互換性がテストで確認されます。

- [x] `packages/ast-explorer-demo/tests/logic.test.ts` または専用テストで、空 storage、保存・再読み込み、関数形式 updater、不正 JSON、storage 例外を検証する。
- [x] 既存の option 正規化・個別 rule 実行テストを維持し、保存値が lint 結果に反映される回帰ケースを追加する。
- [x] `vp check`、`vp test`、`vp run -r build` でフォーマット、型、テスト、ビルドを検証する。
