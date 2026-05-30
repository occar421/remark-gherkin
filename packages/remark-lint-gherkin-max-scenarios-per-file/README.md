# remark-lint-gherkin-max-scenarios-per-file

[![npm](https://img.shields.io/npm/v/remark-lint-gherkin-max-scenarios-per-file.svg)](https://www.npmjs.com/package/remark-lint-gherkin-max-scenarios-per-file)

[remark-lint](https://github.com/remarkjs/remark-lint) plugin to limit the number of scenarios in Gherkin files.
This rule is ported from [gherkin-lint](https://github.com/gherkin-lint/gherkin-lint).

## Install

```bash
npm install remark-lint-gherkin-max-scenarios-per-file
```

## Use

```javascript
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGherkin from "remark-gherkin";
import remarkLint from "remark-lint";
import remarkLintGherkinMaxScenariosPerFile from "remark-lint-gherkin-max-scenarios-per-file";
import remarkStringify from "remark-stringify";
import { reporter } from "vfile-reporter";

const doc = "# Feature: Too many scenarios\n\n## Scenario: 1\n\n## Scenario: 2\n\n## Scenario: 3";

const file = await unified()
  .use(remarkParse)
  .use(remarkGherkin)
  .use(remarkLint)
  .use(remarkLintGherkinMaxScenariosPerFile, { maxScenarios: 2 })
  .use(remarkStringify)
  .process(doc);

console.error(reporter(file));
```

## API

### `unified().use(remarkLintGherkinMaxScenariosPerFile, options?)`

Configures `remark-lint` to limit the number of scenarios.

#### `options`

- `maxScenarios`: `number` (optional, default: `10`) - The maximum number of scenarios allowed in a file.
- `countOutlineExamples`: `boolean` (optional, default: `true`) - If `true`, each row in a Scenario Outline's Examples table counts as a scenario. If `false`, each Scenario Outline counts as one scenario regardless of the number of examples.

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
