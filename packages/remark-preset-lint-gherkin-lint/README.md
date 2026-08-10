# remark-preset-lint-gherkin-lint

[![npm](https://img.shields.io/npm/v/remark-preset-lint-gherkin-lint)](https://www.npmjs.com/package/remark-preset-lint-gherkin-lint)

remark-lint preset for [`gherkin-lint`](https://github.com/gherkin-lint/gherkin-lint) rules.

## Install

```bash
npm install remark-preset-lint-gherkin-lint
```

## Use

```javascript
import { remark } from "remark";
import remarkGherkin from "remark-gherkin";
import remarkLint from "remark-lint";
import remarkPresetLintGherkinLint from "remark-preset-lint-gherkin-lint";
import { reporter } from "vfile-reporter";

const file = await remark()
  .use(remarkGherkin)
  .use(remarkLint)
  .use(remarkPresetLintGherkinLint)
  .process("# Feature: Gherkin\n## Scenario: Empty Scenario");

console.error(reporter(file));
```

## Examples

For details on each rule, see the respective package documentation.

### Incorrect

An empty feature file or a feature without scenarios (triggers `remark-lint-gherkin-no-files-without-scenarios`).

```markdown
# Feature: Empty file
```

### Correct

A feature with at least one scenario.

```markdown
# Feature: Gherkin

## Scenario: Working

- Given a step
```

## Development

```bash
vp install
vp test
vp build
```
