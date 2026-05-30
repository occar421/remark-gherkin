# remark-lint-gherkin-allowed-tags

[![npm](https://img.shields.io/npm/v/remark-lint-gherkin-allowed-tags.svg)](https://www.npmjs.com/package/remark-lint-gherkin-allowed-tags)

[remark-lint](https://github.com/remarkjs/remark-lint) plugin to only permit specified tags in Gherkin files.
This rule is ported from [gherkin-lint](https://github.com/gherkin-lint/gherkin-lint).

## Install

```bash
npm install remark-lint-gherkin-allowed-tags
```

## Use

```javascript
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGherkin from "remark-gherkin";
import remarkLint from "remark-lint";
import remarkLintGherkinAllowedTags from "remark-lint-gherkin-allowed-tags";
import remarkStringify from "remark-stringify";
import { reporter } from "vfile-reporter";

const doc = "`@not-allowed`\n# Feature: Eating cucumbers";

const file = await unified()
  .use(remarkParse)
  .use(remarkGherkin)
  .use(remarkLint)
  .use(remarkLintGherkinAllowedTags, { tags: ["@allowed"] })
  .use(remarkStringify)
  .process(doc);

console.error(reporter(file));
```

## API

### `unified().use(remarkLintGherkinAllowedTags, options?)`

Configures `remark-lint` to check if tags are allowed.

#### `options`

- `tags`: `string[]` (optional) - A list of allowed tags (e.g., `["@wip", "@smoke"]`).
- `patterns`: `string[]` (optional) - A list of regular expression patterns for allowed tags (e.g., `["^@user-.*$"]`).

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
