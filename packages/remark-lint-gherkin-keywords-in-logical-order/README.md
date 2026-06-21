# remark-lint-gherkin-keywords-in-logical-order

[![npm](https://img.shields.io/npm/v/remark-lint-gherkin-keywords-in-logical-order.svg)](https://www.npmjs.com/package/remark-lint-gherkin-keywords-in-logical-order)

[remark-lint](https://github.com/remarkjs/remark-lint) plugin to enforce that `Given`, `When` and `Then` appear in logical sequence in Gherkin scenarios.
This rule is ported from [gherkin-lint](https://github.com/gherkin-lint/gherkin-lint).

## Install

```bash
npm install remark-lint-gherkin-keywords-in-logical-order
```

## Use

```javascript
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGherkin from "remark-gherkin";
import remarkLint from "remark-lint";
import remarkLintGherkinKeywordsInLogicalOrder from "remark-lint-gherkin-keywords-in-logical-order";
import { reporter } from "vfile-reporter";

const doc = `
# Keywords in logical order example

## Out of order keywords
- When step 1
- Given step 2
`;

const file = await unified()
  .use(remarkParse)
  .use(remarkGherkin)
  .use(remarkLint)
  .use(remarkLintGherkinKeywordsInLogicalOrder)
  .process(doc);

console.error(reporter(file));
```

## API

### `unified().use(remarkLintGherkinKeywordsInLogicalOrder)`

Configures `remark-lint` to check that `Given`, `When` and `Then` appear in logical sequence.

## Examples

### Incorrect

```markdown
# Out of order keywords

## Scenario

- When step 1
- Given step 2
```

Triggers a lint error: `Step "Given" should not appear after "When"`

### Correct

```markdown
# Logical order

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
