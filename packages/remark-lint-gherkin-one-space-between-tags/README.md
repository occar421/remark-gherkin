# remark-lint-gherkin-one-space-between-tags

[![npm](https://img.shields.io/npm/v/remark-lint-gherkin-one-space-between-tags.svg)](https://www.npmjs.com/package/remark-lint-gherkin-one-space-between-tags)

`remark-lint` plugin to ensure exactly one space between Gherkin tags.

## Install

```bash
npm install remark-lint-gherkin-one-space-between-tags
```

## Use

```javascript
import { remark } from "remark";
import remarkGherkin from "remark-gherkin";
import remarkLintGherkinOneSpaceBetweenTags from "remark-lint-gherkin-one-space-between-tags";

remark()
  .use(remarkGherkin)
  .use(remarkLintGherkinOneSpaceBetweenTags)
  .process("`@tag1`  `@tag2`\n# Feature: My Feature")
  .then((file) => {
    console.log(file.messages);
  });
```

## Examples

### Examples of Incorrect Code

```markdown
`@tag1` `@tag2` `@tag3`

# Feature: A feature with too many spaces between tags
```

### Examples of Correct Code

```markdown
`@tag1` `@tag2` `@tag3`

# Feature: A feature with correctly spaced tags
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
