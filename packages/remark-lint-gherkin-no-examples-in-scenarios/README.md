# remark-lint-gherkin-no-examples-in-scenarios

[![npm](https://img.shields.io/npm/v/remark-lint-gherkin-no-examples-in-scenarios.svg)](https://www.npmjs.com/package/remark-lint-gherkin-no-examples-in-scenarios)

[remark-lint](https://github.com/remarkjs/remark-lint) plugin to disallow Examples in Scenarios in Gherkin files.
This rule is ported from [gherkin-lint](https://github.com/gherkin-lint/gherkin-lint).

## Install

```bash
npm install remark-lint-gherkin-no-examples-in-scenarios
```

## Use

```javascript
import { read } from "to-vfile";
import { reporter } from "vfile-reporter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGherkin from "remark-gherkin";
import remarkLint from "remark-lint";
import remarkLintGherkinNoExamplesInScenarios from "remark-lint-gherkin-no-examples-in-scenarios";
import remarkStringify from "remark-stringify";

const file = await unified()
  .use(remarkParse)
  .use(remarkGherkin)
  .use(remarkLint)
  .use(remarkLintGherkinNoExamplesInScenarios)
  .use(remarkStringify)
  .process(await read("example.feature"));

console.error(reporter(file));
```

## Examples

### Examples of Incorrect Code

```markdown
# Feature: Test

## Scenario: Test Scenario

- Given a step

### Examples:

| col1 |
| val1 |
```

### Examples of Correct Code

```markdown
# Feature: Test

## Scenario Outline: Test Scenario Outline

- Given a step <col1>

### Examples:

| col1 |
| val1 |
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
