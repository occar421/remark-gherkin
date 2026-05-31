# remark-lint-gherkin-no-duplicate-tags

[![npm](https://img.shields.io/npm/v/remark-lint-gherkin-no-duplicate-tags.svg)](https://www.npmjs.com/package/remark-lint-gherkin-no-duplicate-tags)

[remark-lint](https://github.com/remarkjs/remark-lint) plugin to disallow duplicate tags in Gherkin files.
This rule is ported from [gherkin-lint](https://github.com/gherkin-lint/gherkin-lint).

## Install

```bash
npm install remark-lint-gherkin-no-duplicate-tags
```

## Use

```javascript
import { read } from "to-vfile";
import { reporter } from "vfile-reporter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGherkin from "remark-gherkin";
import remarkLint from "remark-lint";
import remarkLintGherkinNoDuplicateTags from "remark-lint-gherkin-no-duplicate-tags";
import remarkStringify from "remark-stringify";

const file = await unified()
  .use(remarkParse)
  .use(remarkGherkin)
  .use(remarkLint)
  .use(remarkLintGherkinNoDuplicateTags)
  .use(remarkStringify)
  .process(await read("example.feature"));

console.error(reporter(file));
```

## Examples

### Examples of Incorrect Code

```markdown
`@tag1` `@tag1`

# Feature: Test
```

### Examples of Correct Code

```markdown
`@tag1` `@tag2`

# Feature: Test
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
