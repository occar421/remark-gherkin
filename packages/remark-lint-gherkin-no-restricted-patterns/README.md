# remark-lint-gherkin-no-restricted-patterns

[![npm](https://img.shields.io/npm/v/remark-lint-gherkin-no-restricted-patterns.svg)](https://www.npmjs.com/package/remark-lint-gherkin-no-restricted-patterns)

`remark-lint` rule to restrict certain patterns in Gherkin documents.

## Install

```bash
npm install remark-lint-gherkin-no-restricted-patterns
```

## Use

```javascript
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkGherkin from "remark-gherkin";
import remarkLintGherkinNoRestrictedPatterns from "remark-lint-gherkin-no-restricted-patterns";
import remarkStringify from "remark-stringify";

const file = await unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkGherkin)
  .use(remarkLintGherkinNoRestrictedPatterns, {
    Step: ["restricted word"],
    Global: ["forbidden"],
    Description: ["todo"],
  })
  .use(remarkStringify)
  .process("# Feature: Title\n* Given a restricted word");

console.log(file.messages);
```

## Examples

### Examples of Incorrect Code

#### `example.feature`

```gherkin
# Feature: This contains restricted word

## Scenario: Scenario 1
* Given a restricted word
```

When configured with `{ "Global": ["restricted word"] }`.

### Examples of Correct Code

#### `example.feature`

```gherkin
# Feature: Correct Title

## Scenario: Scenario 1
* Given a valid step
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
