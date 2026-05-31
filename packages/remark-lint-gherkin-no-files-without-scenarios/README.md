# remark-lint-gherkin-no-files-without-scenarios

[![npm](https://img.shields.io/npm/v/remark-lint-gherkin-no-files-without-scenarios.svg)](https://www.npmjs.com/package/remark-lint-gherkin-no-files-without-scenarios)

[remark-lint](https://github.com/remarkjs/remark-lint) plugin to disallow Gherkin files without scenarios.
This rule is ported from [gherkin-lint](https://github.com/gherkin-lint/gherkin-lint).

## Install

```bash
npm install remark-lint-gherkin-no-files-without-scenarios
```

## Use

```javascript
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGherkin from "remark-gherkin";
import remarkLint from "remark-lint";
import remarkLintGherkinNoFilesWithoutScenarios from "remark-lint-gherkin-no-files-without-scenarios";
import remarkStringify from "remark-stringify";
import { reporter } from "vfile-reporter";

const doc = "# Feature: Eating cucumbers\n\n- Given a step";

const file = await unified()
  .use(remarkParse)
  .use(remarkGherkin)
  .use(remarkLint)
  .use(remarkLintGherkinNoFilesWithoutScenarios)
  .use(remarkStringify)
  .process(doc);

console.error(reporter(file));
```

## Examples

### Examples of Incorrect Code

```markdown
# Feature: Eating cucumbers

- Given a step
```

### Examples of Correct Code

```markdown
# Feature: Eating cucumbers

## Scenario: eating

- Given a step
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
