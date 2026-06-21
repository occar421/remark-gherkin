# remark-lint-gherkin-scenario-size

[![npm](https://img.shields.io/npm/v/remark-lint-gherkin-scenario-size.svg)](https://www.npmjs.com/package/remark-lint-gherkin-scenario-size)

[remark-lint](https://github.com/remarkjs/remark-lint) plugin to enforce maximum step count of Gherkin scenarios and backgrounds.
This rule is ported from [gherkin-lint](https://github.com/gherkin-lint/gherkin-lint).

## Install

```bash
npm install remark-lint-gherkin-scenario-size
```

## Use

```javascript
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGherkin from "remark-gherkin";
import remarkLint from "remark-lint";
import remarkLintGherkinScenarioSize from "remark-lint-gherkin-scenario-size";
import { reporter } from "vfile-reporter";

const doc = `
# Scenario size example

## Too many steps
- Given step 1
- And step 2
- And step 3
- And step 4
- And step 5
- And step 6
`;

const file = await unified()
  .use(remarkParse)
  .use(remarkGherkin)
  .use(remarkLint)
  .use(remarkLintGherkinScenarioSize, { "steps-length": { Scenario: 5 } })
  .process(doc);

console.error(reporter(file));
```

## API

### `unified().use(remarkLintGherkinScenarioSize, options?)`

Configures `remark-lint` to check scenario and background sizes.

#### `options`

- `steps-length`: `object` (optional)
  - `Background`: `number` (optional, default: `15`) - Maximum number of steps in a Background.
  - `Scenario`: `number` (optional, default: `15`) - Maximum number of steps in a Scenario and Scenario Outline.

## Examples

### Incorrect

```markdown
# Large scenario

## Too many steps

- Given step 1
- And step 2
- And step 3
- And step 4
- And step 5
- And step 6
```

When configured with `{ "steps-length": { Scenario: 5 } }`, this triggers a lint error.

### Correct

```markdown
# Small scenario

## Acceptable number of steps

- Given step 1
- And step 2
- Then step 3
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
