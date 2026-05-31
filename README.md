# Unified.js Gherkin

[unified](https://github.com/unifiedjs/unified) packages to support [Markdown with Gherkin (MDG)](https://github.com/cucumber/gherkin/blob/main/MARKDOWN_WITH_GHERKIN.md) in [remark](https://github.com/remarkjs/remark).

## Packages

- [`remark-gherkin`](./packages/remark-gherkin): remark plugin.
- [`mdast-util-gherkin`](./packages/mdast-util-gherkin): mdast utility.
- `remark-lint-gherkin`: remark-lint plugins. These rules are ported from [`gherkin-lint`](https://github.com/gherkin-lint/gherkin-lint).
  - [`remark-lint-gherkin-no-tags-on-backgrounds`](./packages/remark-lint-gherkin-no-tags-on-backgrounds): Disallow tags on Backgrounds.
  - [`remark-lint-gherkin-one-feature-per-file`](./packages/remark-lint-gherkin-one-feature-per-file): Enforce one Feature per file.
  - [`remark-lint-gherkin-up-to-one-background-per-file`](./packages/remark-lint-gherkin-up-to-one-background-per-file): Enforce at most one Background per file.
  - [`remark-lint-gherkin-allowed-tags`](./packages/remark-lint-gherkin-allowed-tags): Disallow tags that are not in the allowed list.
  - [`remark-lint-gherkin-max-scenarios-per-file`](./packages/remark-lint-gherkin-max-scenarios-per-file): Limit the number of scenarios per file.
  - [`remark-lint-gherkin-name-length`](./packages/remark-lint-gherkin-name-length): Limit the length of Feature, Scenario, and Step names.
  - [`remark-lint-gherkin-no-background-only-scenario`](./packages/remark-lint-gherkin-no-background-only-scenario): Disallow background when there is just one scenario.
  - [`remark-lint-gherkin-no-duplicate-tags`](./packages/remark-lint-gherkin-no-duplicate-tags): Disallow duplicate tags.
  - [`remark-lint-gherkin-no-dupe-feature-names`](./packages/remark-lint-gherkin-no-dupe-feature-names): Disallow duplicate feature names.
  - [`remark-lint-gherkin-no-dupe-scenario-names`](./packages/remark-lint-gherkin-no-dupe-scenario-names): Disallow duplicate scenario names.
  - `no-multiline-steps` is omitted because of the difference between feature files and markdown files.
  - `file-name`, `indentation`, `new-line-at-eof` are omitted because they should be handled by other remark-lint rules.

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
