# remark-lint-gherkin-required-tags

[![npm](https://img.shields.io/npm/v/remark-lint-gherkin-required-tags.svg)](https://www.npmjs.com/package/remark-lint-gherkin-required-tags)

[remark-lint](https://github.com/remarkjs/remark-lint) plugin to ensure Gherkin elements contain required tags.
This rule is ported from [gherkin-lint](https://github.com/gherkin-lint/gherkin-lint).

## Install

```bash
npm install remark-lint-gherkin-required-tags
```

## Use

```javascript
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkGherkin from "remark-gherkin";
import remarkLint from "remark-lint";
import remarkLintGherkinRequiredTags from "remark-lint-gherkin-required-tags";
import remarkStringify from "remark-stringify";
import { reporter } from "vfile-reporter";

const doc = "# Feature: My Feature\n\n## Scenario: My Scenario";

const file = await unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkGherkin)
  .use(remarkLint)
  .use(remarkLintGherkinRequiredTags, { tags: ["^@issue:[1-9]\\d*$"], ignoreUntagged: false })
  .use(remarkStringify)
  .process(doc);

console.error(reporter(file));
```

## API

### `unified().use(remarkLintGherkinRequiredTags, options?)`

Configures `remark-lint` to check for required tags.

#### `options`

- `tags`: `string[]` (optional) - An array of regular expression patterns. At least one tag on the element must match one of these patterns. Defaults to `[]`.
- `ignoreUntagged`: `boolean` (optional) - If set to `true`, the rule will skip scenarios that have no tags at all. Defaults to `true`.

Note: Tags are inherited in Gherkin. A tag on a Feature is considered present on all Scenarios within that Feature. This rule takes inheritance into account. However, `ignoreUntagged: true` specifically checks if the _local_ tags of the element are empty.

## Examples

### Examples of Incorrect Code

```md
# Feature: Missing required tag

## Scenario: Scenario 1
```

When configured with `{ "tags": ["@smoke"], "ignoreUntagged": false }`.

### Examples of Correct Code

```md
`@smoke`

# Feature: Has required tag

## Scenario: Scenario 1
```

When configured with `{ "tags": ["@smoke"] }`.

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
