# remark-gherkin

Support [Markdown with Gherkin (MDG)](https://github.com/cucumber/gherkin/blob/main/MARKDOWN_WITH_GHERKIN.md) in [remark](https://github.com/remarkjs/remark).

## Getting Started

Install the remark plugin and the Gherkin lint preset with your preferred package manager:

```shell
npm install --save-dev remark-cli remark-preset-lint-gherkin-lint
```

Markdown with Gherkin represents features as headings, scenarios as subheadings, and steps as list items:

```markdown
# Feature: Eating cucumbers

## Scenario: Eat a cucumber

- Given there are 12 cucumbers
- When I eat 1 cucumber
- Then there are 11 cucumbers
```

### Command Line

Use `remark-cli` to lint Markdown with Gherkin syntax. The `--frail` flag makes lint warnings fail the command, which is useful in continuous integration:

```shell
npx remark "**/*.features.md" --frail --use remark-preset-lint-gherkin-lint
```

### npm Scripts

Add a script to `package.json` to run the same check consistently locally and in CI:

```json
{
  "scripts": {
    "lint:gherkin": "remark \"features/**/*.md\" --frail --use remark-preset-lint-gherkin-lint"
  }
}
```

Then run it with:

```shell
npm run lint:gherkin
```

### API

Use the packages directly with the unified API when Gherkin-aware processing is part of an application or build pipeline:

```javascript
import { remark } from "remark";
import remarkPresetLintGherkinLint from "remark-preset-lint-gherkin-lint";
import { reporter } from "vfile-reporter";

const file = await remark()
  .use(remarkPresetLintGherkinLint)
  .process("# Feature: Eating cucumbers\n\n## Scenario: Eat\n\n- Given there are 12 cucumbers");

console.error(reporter(file));
```

For lower-level mdast parsing, serialization, and Gherkin node utilities, use [`mdast-util-gherkin`](./packages/mdast-util-gherkin).

## Packages

- [`remark-gherkin`](./packages/remark-gherkin): remark plugin.
- [`mdast-util-gherkin`](./packages/mdast-util-gherkin): mdast utility.
- [`ast-explorer-demo`](./packages/ast-explorer-demo): AST Explorer for Markdown with Gherkin.
- `remark-lint-gherkin`: remark-lint plugins.
  - Most rules are compatible adaptations of [`gherkin-lint`](https://github.com/gherkin-lint/gherkin-lint); the three rules marked as local extensions are not present in its current `master` rule set.
    - [`remark-lint-gherkin-no-tags-on-backgrounds`](./packages/remark-lint-gherkin-no-tags-on-backgrounds): Local extension that disallows tags on Backgrounds.
    - [`remark-lint-gherkin-one-feature-per-file`](./packages/remark-lint-gherkin-one-feature-per-file): Local extension that enforces one Feature per file.
    - [`remark-lint-gherkin-up-to-one-background-per-file`](./packages/remark-lint-gherkin-up-to-one-background-per-file): Local extension that enforces at most one Background per file.
    - [`remark-lint-gherkin-allowed-tags`](./packages/remark-lint-gherkin-allowed-tags): Disallow tags that are not in the allowed list.
    - [`remark-lint-gherkin-max-scenarios-per-file`](./packages/remark-lint-gherkin-max-scenarios-per-file): Limit the number of scenarios per file.
    - [`remark-lint-gherkin-name-length`](./packages/remark-lint-gherkin-name-length): Limit the length of Feature, Scenario, and Step names.
    - [`remark-lint-gherkin-no-background-only-scenario`](./packages/remark-lint-gherkin-no-background-only-scenario): Disallow background when there is just one scenario.
    - [`remark-lint-gherkin-no-dupe-feature-names`](./packages/remark-lint-gherkin-no-dupe-feature-names): Disallow duplicate feature names.
    - [`remark-lint-gherkin-no-dupe-scenario-names`](./packages/remark-lint-gherkin-no-dupe-scenario-names): Disallow duplicate scenario names.
    - [`remark-lint-gherkin-no-duplicate-tags`](./packages/remark-lint-gherkin-no-duplicate-tags): Disallow duplicate tags.
    - [`remark-lint-gherkin-no-empty-background`](./packages/remark-lint-gherkin-no-empty-background): Disallow empty backgrounds.
    - [`remark-lint-gherkin-no-examples-in-scenarios`](./packages/remark-lint-gherkin-no-examples-in-scenarios): Disallow Examples in Scenarios.
    - [`remark-lint-gherkin-no-files-without-scenarios`](./packages/remark-lint-gherkin-no-files-without-scenarios): Disallow Gherkin files without scenarios.
    - [`remark-lint-gherkin-no-homogenous-tags`](./packages/remark-lint-gherkin-no-homogenous-tags): Disallow homogenous tags.
    - [`remark-lint-gherkin-no-partially-commented-tag-lines`](./packages/remark-lint-gherkin-no-partially-commented-tag-lines): Disallow partially commented tag lines.
    - [`remark-lint-gherkin-no-restricted-patterns`](./packages/remark-lint-gherkin-no-restricted-patterns): Disallow restricted patterns.
    - [`remark-lint-gherkin-no-restricted-tags`](./packages/remark-lint-gherkin-no-restricted-tags): Disallow restricted tags.
    - [`remark-lint-gherkin-no-scenario-outlines-without-examples`](./packages/remark-lint-gherkin-no-scenario-outlines-without-examples): Disallow Scenario Outlines without Examples.
    - [`remark-lint-gherkin-no-superfluous-tags`](./packages/remark-lint-gherkin-no-superfluous-tags): Disallow superfluous tags.
    - [`remark-lint-gherkin-no-unnamed-features`](./packages/remark-lint-gherkin-no-unnamed-features): Disallow empty Feature name.
    - [`remark-lint-gherkin-no-unnamed-scenarios`](./packages/remark-lint-gherkin-no-unnamed-scenarios): Disallow empty Scenario and Scenario Outline names.
    - [`remark-lint-gherkin-no-unused-variables`](./packages/remark-lint-gherkin-no-unused-variables): Disallows unused variables in scenario outlines.
    - [`remark-lint-gherkin-one-space-between-tags`](./packages/remark-lint-gherkin-one-space-between-tags): Ensure exactly one space between tags.
    - [`remark-lint-gherkin-required-tags`](./packages/remark-lint-gherkin-required-tags): Require tags/patterns of tags on Scenarios.
    - [`remark-lint-gherkin-scenario-size`](./packages/remark-lint-gherkin-scenario-size): Enforce maximum step count of Gherkin scenarios and backgrounds.
    - [`remark-lint-gherkin-use-and`](./packages/remark-lint-gherkin-use-and): Enforce using And instead of repeated keywords in Gherkin scenarios.
    - [`remark-lint-gherkin-keywords-in-logical-order`](./packages/remark-lint-gherkin-keywords-in-logical-order): Enforce that Given, When and Then appear in logical sequence in Gherkin scenarios.
    - [`remark-lint-gherkin-only-one-when`](./packages/remark-lint-gherkin-only-one-when): Enforce that only one When step is used per scenario.
    - `no-multiline-steps` is omitted because of the difference between feature files and markdown files.
    - `file-name`, `indentation`, `new-line-at-eof`, `no-empty-file`, `no-multiple-empty-lines`, and `no-trailing-spaces` are omitted because they should be handled by other remark-lint rules.
  - [`remark-preset-lint-gherkin-lint`](./packages/remark-preset-lint-gherkin-lint): Preset including all [`gherkin-lint`](https://github.com/gherkin-lint/gherkin-lint) rules.

## Development

This project uses [Vite+](https://viteplus.dev/) for development.

### Setup

```bash
vp install
```

### Check & Test

```bash
vp run ready
```

Or run them separately:

```bash
vp check
vp run -r test
```

### Build

```bash
vp run -r build
```
