# remark-lint-gherkin-no-restricted-patterns

[![npm](https://img.shields.io/npm/v/remark-lint-gherkin-no-restricted-patterns.svg)](https://www.npmjs.com/package/remark-lint-gherkin-no-restricted-patterns)

remark-lint plugin to disallow restricted patterns in Gherkin.

## Install

```bash
npm install remark-lint-gherkin-no-restricted-patterns
```

## Use

```javascript
import { remark } from "remark";
import remarkGherkin from "remark-gherkin";
import remarkLintGherkinNoRestrictedPatterns from "remark-lint-gherkin-no-restricted-patterns";

const processor = remark()
  .use(remarkGherkin)
  .use(remarkLintGherkinNoRestrictedPatterns, {
    Feature: ["poor description"],
    Step: ["debug"],
  });

// ...
```

## Examples

### Examples of Incorrect Code

```gherkin
# Feature: poor description
```

```gherkin
# Feature: Feature 1

## Scenario: Scenario 1
* Given a step for debug
```

### Examples of Correct Code

```gherkin
# Feature: Good title
```

```gherkin
# Feature: Feature 1

## Scenario: Scenario 1
* Given a normal step
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
