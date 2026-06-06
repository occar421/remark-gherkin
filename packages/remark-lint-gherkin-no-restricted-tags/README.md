# remark-lint-gherkin-no-restricted-tags

[![npm](https://img.shields.io/npm/v/remark-lint-gherkin-no-restricted-tags.svg)](https://www.npmjs.com/package/remark-lint-gherkin-no-restricted-tags)

[remark-lint](https://github.com/remarkjs/remark-lint) plugin to disallow restricted tags in Gherkin files.
This rule is ported from [gherkin-lint](https://github.com/gherkin-lint/gherkin-lint).

## Install

```bash
npm install remark-lint-gherkin-no-restricted-tags
```

## Use

```javascript
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGherkin from "remark-gherkin";
import remarkLint from "remark-lint";
import remarkLintGherkinNoRestrictedTags from "remark-lint-gherkin-no-restricted-tags";
import remarkStringify from "remark-stringify";
import { reporter } from "vfile-reporter";

const doc = "`@restricted`\n# Feature: Eating cucumbers";

const file = await unified()
  .use(remarkParse)
  .use(remarkGherkin)
  .use(remarkLint)
  .use(remarkLintGherkinNoRestrictedTags, { tags: ["@restricted"] })
  .use(remarkStringify)
  .process(doc);

console.error(reporter(file));
```

## API

### `unified().use(remarkLintGherkinNoRestrictedTags, options?)`

Configures `remark-lint` to check for restricted tags.

#### `options`

- `tags`: `string[]` (optional) - A list of restricted tags (e.g., `["@watch", "@wip"]`).
- `patterns`: `string[]` (optional) - A list of regular expression patterns for restricted tags (e.g., `["^@todo$"]`).

## Examples

### Examples of Incorrect Code

Inlined tags `@watch` or `@todo` are restricted if configured.

```markdown
`@watch`

# Feature: Restricted Tag Example
```

### Examples of Correct Code

Tags not in the restricted list are allowed.

```markdown
`@allowed`

# Feature: Allowed Tag Example
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
