# remark-lint-gherkin-no-scenario-outlines-without-examples

[![npm](https://img.shields.io/npm/v/remark-lint-gherkin-no-scenario-outlines-without-examples)](https://www.npmjs.com/package/remark-lint-gherkin-no-scenario-outlines-without-examples)

remark-lint plugin to disallow Scenario Outlines without Examples in Gherkin files.

## Install

```bash
npm install remark-lint-gherkin-no-scenario-outlines-without-examples
```

## Use

```javascript
import { remark } from "remark";
import remarkGherkin from "remark-gherkin";
import remarkLint from "remark-lint";
import remarkLintGherkinNoScenarioOutlinesWithoutExamples from "remark-lint-gherkin-no-scenario-outlines-without-examples";
import { reporter } from "vfile-reporter";

const file = await remark()
  .use(remarkGherkin)
  .use(remarkLint)
  .use(remarkLintGherkinNoScenarioOutlinesWithoutExamples)
  .process("# Feature: Test\n\n## Scenario Outline: Test\n- Given a step");

console.error(reporter(file));
```

## Examples

### Examples of Incorrect Code

#### Scenario Outline without Examples

```gherkin
# Feature: Test

## Scenario Outline: Eating
- Given there are <start> cucumbers
- When I eat <eat> cucumbers
- Then I should have <left> cucumbers
```

### Examples of Correct Code

#### Scenario Outline with Examples

```gherkin
# Feature: Test

## Scenario Outline: Eating
- Given there are <start> cucumbers
- When I eat <eat> cucumbers
- Then I should have <left> cucumbers

### Examples:
| start | eat | left |
| 12    | 5   | 7    |
```

## Development

```bash
vp install
vp test
vp pack
```
