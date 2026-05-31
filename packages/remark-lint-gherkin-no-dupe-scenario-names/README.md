# remark-lint-gherkin-no-dupe-scenario-names

[![npm](https://img.shields.io/npm/v/remark-lint-gherkin-no-dupe-scenario-names.svg)](https://www.npmjs.com/package/remark-lint-gherkin-no-dupe-scenario-names)

[remark-lint](https://github.com/remarkjs/remark-lint) plugin to disallow duplicate scenario names in Gherkin files.
This rule is ported from [gherkin-lint](https://github.com/gherkin-lint/gherkin-lint).

## Install

```bash
npm install remark-lint-gherkin-no-dupe-scenario-names
```

## Use

```javascript
import { read } from "to-vfile";
import { reporter } from "vfile-reporter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGherkin from "remark-gherkin";
import remarkLint from "remark-lint";
import remarkLintGherkinNoDupeScenarioNames from "remark-lint-gherkin-no-dupe-scenario-names";
import remarkStringify from "remark-stringify";

const file = await unified()
  .use(remarkParse)
  .use(remarkGherkin)
  .use(remarkLint)
  .use(remarkLintGherkinNoDupeScenarioNames)
  .use(remarkStringify)
  .process(await read("example.feature"));

console.error(reporter(file));
```

## Examples

### Examples of Incorrect Code

```markdown
# Feature: Test

## Scenario: Scenario 1

## Scenario: Scenario 1
```

### Examples of Correct Code

```markdown
# Feature: Test

## Scenario: Scenario 1

## Scenario: Scenario 2
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
