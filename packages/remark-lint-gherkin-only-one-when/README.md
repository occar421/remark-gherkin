# remark-lint-gherkin-only-one-when

[![npm](https://img.shields.io/npm/v/remark-lint-gherkin-only-one-when.svg)](https://www.npmjs.com/package/remark-lint-gherkin-only-one-when)

[remark-lint](https://github.com/remarkjs/remark-lint) plugin to enforce that only one `When` step is used per scenario.
This rule is ported from [gherkin-lint](https://github.com/gherkin-lint/gherkin-lint).

## Install

```bash
npm install remark-lint-gherkin-only-one-when
```

## Use

```javascript
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGherkin from "remark-gherkin";
import remarkLint from "remark-lint";
import remarkLintGherkinOnlyOneWhen from "remark-lint-gherkin-only-one-when";
import { reporter } from "vfile-reporter";

const doc = `
# Only one When example

## Scenario: Multiple Whens
* When step 1
* When step 2
`;

const file = await unified()
  .use(remarkParse)
  .use(remarkGherkin)
  .use(remarkLint)
  .use(remarkLintGherkinOnlyOneWhen)
  .process(doc);

console.error(reporter(file));
```

## API

### `unified().use(remarkLintGherkinOnlyOneWhen)`

Configures `remark-lint` to check that there is at most one `When` step for each scenario.

## Examples

### Incorrect

```markdown
# Multiple Whens

## Scenario

- When step 1
- When step 2
```

Triggers a lint error: `Step "When" should not appear more than once per scenario`

### Correct

```markdown
# Single When

## Scenario

- Given step 1
- When step 2
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
