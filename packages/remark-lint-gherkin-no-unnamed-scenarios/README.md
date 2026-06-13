# remark-lint-gherkin-no-unnamed-scenarios

[![npm](https://img.shields.io/npm/v/remark-lint-gherkin-no-unnamed-scenarios.svg)](https://www.npmjs.com/package/remark-lint-gherkin-no-unnamed-scenarios)

[remark-lint](https://github.com/remarkjs/remark-lint) plugin to disallow empty Scenario and Scenario Outline names in Gherkin files.
This rule is ported from [gherkin-lint](https://github.com/gherkin-lint/gherkin-lint).

## Install

```bash
npm install remark-lint-gherkin-no-unnamed-scenarios
```

## Use

```javascript
import { read } from "to-vfile";
import { reporter } from "vfile-reporter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGherkin from "remark-gherkin";
import remarkLint from "remark-lint";
import remarkLintGherkinNoUnnamedScenarios from "remark-lint-gherkin-no-unnamed-scenarios";
import remarkStringify from "remark-stringify";

const file = await unified()
  .use(remarkParse)
  .use(remarkGherkin)
  .use(remarkLint)
  .use(remarkLintGherkinNoUnnamedScenarios)
  .use(remarkStringify)
  .process(await read("example.feature"));

console.error(reporter(file));
```

## Examples

### Examples of Incorrect Code

```markdown
# Feature: Feature Name

## Scenario:
```

```markdown
# Feature: Feature Name

## Scenario Outline:
```

### Examples of Correct Code

```markdown
# Feature: Feature Name

## Scenario: My Scenario Name
```

## Development

- Install dependencies:

```bash
vp install
```

- Run the unit tests:

```bash
vp test
```

- Build the library:

```bash
vp pack
```
