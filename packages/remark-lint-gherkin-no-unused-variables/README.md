# remark-lint-gherkin-no-unused-variables

[![npm](https://img.shields.io/npm/v/remark-lint-gherkin-no-unused-variables.svg)](https://www.npmjs.com/package/remark-lint-gherkin-no-unused-variables)

[remark-lint](https://github.com/remarkjs/remark-lint) plugin to disallow unused variables in Gherkin files.
This rule is ported from [`gherkin-lint`](https://github.com/gherkin-lint/gherkin-lint).

## Install

```bash
npm install remark-lint-gherkin-no-unused-variables
```

## Use

```javascript
import { read } from "to-vfile";
import { reporter } from "vfile-reporter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGherkin from "remark-gherkin";
import remarkLint from "remark-lint";
import remarkLintGherkinNoUnusedVariables from "remark-lint-gherkin-no-unused-variables";

unified()
  .use(remarkParse)
  .use(remarkGherkin)
  .use(remarkLint)
  .use(remarkLintGherkinNoUnusedVariables)
  .process(await read("example.md"))
  .then((file) => {
    console.error(reporter(file));
  });
```

## Examples

### Examples of Incorrect Code

Variables defined in the `Examples` table but not used in any step.

```gherkin
Scenario Outline: eating
  Given there are <start> cucumbers
  When I eat <eat> cucumbers
  Then I should have <left> cucumbers

  Examples:
    | start | eat | left | unused |
    |  12   |  5  |  7   |  foo   |
```

### Examples of Correct Code

All variables defined in the `Examples` table are used in at least one step.

```gherkin
Scenario Outline: eating
  Given there are <start> cucumbers
  When I eat <eat> cucumbers
  Then I should have <left> cucumbers

  Examples:
    | start | eat | left |
    |  12   |  5  |  7   |
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
