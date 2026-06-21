# remark-lint-gherkin-use-and

[![npm](https://img.shields.io/npm/v/remark-lint-gherkin-use-and.svg)](https://www.npmjs.com/package/remark-lint-gherkin-use-and)

[remark-lint](https://github.com/remarkjs/remark-lint) plugin to enforce using `And` instead of repeated keywords in Gherkin scenarios.
This rule is ported from [gherkin-lint](https://github.com/gherkin-lint/gherkin-lint).

## Install

```bash
npm install remark-lint-gherkin-use-and
```

## Use

```javascript
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGherkin from "remark-gherkin";
import remarkLint from "remark-lint";
import remarkLintGherkinUseAnd from "remark-lint-gherkin-use-and";
import { reporter } from "vfile-reporter";

const doc = `
# Use And example

## Repeated keyword
- Given step 1
- Given step 2
`;

const file = await unified()
  .use(remarkParse)
  .use(remarkGherkin)
  .use(remarkLint)
  .use(remarkLintGherkinUseAnd)
  .process(doc);

console.error(reporter(file));
```

## API

### `unified().use(remarkLintGherkinUseAnd)`

Configures `remark-lint` to check for repeated keywords that should be replaced with `And`.

## Examples

### Incorrect

```markdown
# Repeated keywords

## Scenario

- Given step 1
- Given step 2
```

Triggers a lint error: `Step "Given" should use And instead of Given`

### Correct

```markdown
# Using And

## Scenario

- Given step 1
- And step 2
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
