# remark-lint-gherkin-no-background-only-scenario

[![npm](https://img.shields.io/npm/v/remark-lint-gherkin-no-background-only-scenario.svg)](https://www.npmjs.com/package/remark-lint-gherkin-no-background-only-scenario)

remark-lint plugin to disallow background when there is just one scenario in Gherkin files.

## Install

```bash
npm install remark-lint-gherkin-no-background-only-scenario
```

## Use

```javascript
import { remark } from "remark";
import remarkGherkin from "remark-gherkin";
import remarkLintGherkinNoBackgroundOnlyScenario from "remark-lint-gherkin-no-background-only-scenario";
import { reporter } from "vfile-reporter";

const file = await remark()
  .use(remarkGherkin)
  .use(remarkLintGherkinNoBackgroundOnlyScenario)
  .process(
    "# Feature: Test\n\n## Background:\n- Given a step\n\n## Scenario: Test Scenario\n- Given a step",
  );

console.error(reporter(file));
```
