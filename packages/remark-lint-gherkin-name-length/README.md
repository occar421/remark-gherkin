# remark-lint-gherkin-name-length

[![npm](https://img.shields.io/npm/v/remark-lint-gherkin-name-length.svg)](https://www.npmjs.com/package/remark-lint-gherkin-name-length)

[remark-lint](https://github.com/remarkjs/remark-lint) plugin to limit the length of names for features, scenarios, and steps in Gherkin files.
This rule is ported from [gherkin-lint](https://github.com/gherkin-lint/gherkin-lint).

## Install

```bash
npm install remark-lint-gherkin-name-length
```

## Use

```javascript
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGherkin from "remark-gherkin";
import remarkLint from "remark-lint";
import remarkLintGherkinNameLength from "remark-lint-gherkin-name-length";
import remarkStringify from "remark-stringify";
import { reporter } from "vfile-reporter";

const doc = "# Feature: This is a very long feature name that exceeds the default limit";

const file = await unified()
  .use(remarkParse)
  .use(remarkGherkin)
  .use(remarkLint)
  .use(remarkLintGherkinNameLength, { Feature: 50 })
  .use(remarkStringify)
  .process(doc);

console.error(reporter(file));
```

## API

### `unified().use(remarkLintGherkinNameLength, options?)`

Configures `remark-lint` to check name lengths.

#### `options`

- `Feature`: `number` (optional, default: `70`) - Maximum character length for Feature names.
- `Scenario`: `number` (optional, default: `70`) - Maximum character length for Scenario and Scenario Outline names.
- `Step`: `number` (optional, default: `70`) - Maximum character length for Step names.

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
