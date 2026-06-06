# remark-lint-gherkin-no-homogenous-tags

[![npm](https://img.shields.io/npm/v/remark-lint-gherkin-no-homogenous-tags.svg)](https://www.npmjs.com/package/remark-lint-gherkin-no-homogenous-tags)

[remark-lint](https://github.com/remarkjs/remark-lint) plugin to disallow homogenous tags in Gherkin files.
This rule is ported from [gherkin-lint](https://github.com/gherkin-lint/gherkin-lint).

## Install

```bash
npm install remark-lint-gherkin-no-homogenous-tags
```

## Use

```javascript
import { read } from "to-vfile";
import { reporter } from "vfile-reporter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGherkin from "remark-gherkin";
import remarkLint from "remark-lint";
import remarkLintGherkinNoHomogenousTags from "remark-lint-gherkin-no-homogenous-tags";
import remarkStringify from "remark-stringify";

const file = await unified()
  .use(remarkParse)
  .use(remarkGherkin)
  .use(remarkLint)
  .use(remarkLintGherkinNoHomogenousTags)
  .use(remarkStringify)
  .process(await read("example.feature"));

console.error(reporter(file));
```

## Examples

### Examples of Incorrect Code

All scenarios have the same tag. It should be moved to the Feature level.

```markdown
# Feature: Homogenous tags

`@tag`

## Scenario: Scenario 1

`@tag`

## Scenario: Scenario 2
```

### Examples of Correct Code

The tag is at the Feature level, so it applies to all scenarios without repetition.

```markdown
`@tag`

# Feature: Homogenous tags

## Scenario: Scenario 1

## Scenario: Scenario 2
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
