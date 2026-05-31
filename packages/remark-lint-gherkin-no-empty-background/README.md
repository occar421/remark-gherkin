# remark-lint-gherkin-no-empty-background

[![npm](https://img.shields.io/npm/v/remark-lint-gherkin-no-empty-background.svg)](https://www.npmjs.com/package/remark-lint-gherkin-no-empty-background)

remark-lint plugin to disallow empty background in Gherkin files.

## Install

```bash
npm install remark-lint-gherkin-no-empty-background
```

## Use

```javascript
import { remark } from "remark";
import remarkGherkin from "remark-gherkin";
import remarkLintGherkinNoEmptyBackground from "remark-lint-gherkin-no-empty-background";
import { reporter } from "vfile-reporter";

const file = await remark()
  .use(remarkGherkin)
  .use(remarkLintGherkinNoEmptyBackground)
  .process("# Feature: Test\n\n## Background:\n\n## Scenario: Test Scenario\n- Given a step");

console.error(reporter(file));
```
