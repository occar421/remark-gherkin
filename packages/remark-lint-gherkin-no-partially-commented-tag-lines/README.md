# remark-lint-gherkin-no-partially-commented-tag-lines

[![npm](https://img.shields.io/npm/v/remark-lint-gherkin-no-partially-commented-tag-lines.svg)](https://www.npmjs.com/package/remark-lint-gherkin-no-partially-commented-tag-lines)

[remark-lint](https://github.com/remarkjs/remark-lint) plugin to disallow partially commented tag lines in Gherkin.
This rule is ported from [gherkin-lint](https://github.com/gherkin-lint/gherkin-lint).

## Install

```bash
npm install remark-lint-gherkin-no-partially-commented-tag-lines
```

## Use

```javascript
import { read } from "to-vfile";
import { reporter } from "vfile-reporter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGherkin from "remark-gherkin";
import remarkLint from "remark-lint";
import remarkLintGherkinNoPartiallyCommentedTagLines from "remark-lint-gherkin-no-partially-commented-tag-lines";
import remarkStringify from "remark-stringify";

const file = await unified()
  .use(remarkParse)
  .use(remarkGherkin)
  .use(remarkLint)
  .use(remarkLintGherkinNoPartiallyCommentedTagLines)
  .use(remarkStringify)
  .process(await read("example.feature"));

console.error(reporter(file));
```

## Examples

### Examples of Incorrect Code

```markdown
`@tag1` <!-- `@tag2` -->

# Feature: Test
```

```markdown
`@tag1` <!-- comment -->

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
