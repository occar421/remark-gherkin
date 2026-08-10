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

### Rule options

The preset accepts an optional `rules` map. Each key is the package name of a
Gherkin rule, and its value is passed only to that rule. Omitted rules keep
their normal defaults.

```typescript
import remarkPresetLintGherkinLint from "remark-preset-lint-gherkin-lint";

processor.use(remarkPresetLintGherkinLint, {
  rules: {
    "remark-lint-gherkin-max-scenarios-per-file": {
      maxScenarios: 5,
      countOutlineExamples: false,
    },
    "remark-lint-gherkin-name-length": {
      Feature: 80,
      Scenario: 60,
      Step: 100,
    },
    "remark-lint-gherkin-required-tags": {
      tags: ["@component"],
      ignoreUntagged: false,
    },
  },
});
```

The same form is available for `allowed-tags`, `no-dupe-scenario-names`,
`no-restricted-patterns`, `no-restricted-tags`, and `scenario-size`. Their
option shapes and defaults are documented in each rule package. This differs
from using a rule directly with `.use(rule, options)`: the preset lets one
processor configure several rules independently while retaining the preset's
default rule set and order.

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
