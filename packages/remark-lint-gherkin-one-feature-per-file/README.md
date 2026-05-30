# remark-lint-gherkin-one-feature-per-file

[![npm](https://img.shields.io/npm/v/remark-lint-gherkin-one-feature-per-file.svg)](https://www.npmjs.com/package/remark-lint-gherkin-one-feature-per-file)

[`remark-lint`](https://github.com/remarkjs/remark-lint) plugin to enforce one feature per file in Gherkin files.

## Install

```bash
npm install remark-lint-gherkin-one-feature-per-file
```

## Use

```javascript
import { read } from "to-vfile";
import { reporter } from "vfile-reporter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGherkin from "remark-gherkin";
import remarkLint from "remark-lint";
import remarkLintGherkinOneFeaturePerFile from "remark-lint-gherkin-one-feature-per-file";
import remarkStringify from "remark-stringify";

const file = await unified()
  .use(remarkParse)
  .use(remarkGherkin)
  .use(remarkLint)
  .use(remarkLintGherkinOneFeaturePerFile)
  .use(remarkStringify)
  .process(await read("example.feature"));

console.error(reporter(file));
```

## Examples

### Examples of Incorrect Code

```markdown
# Feature: Feature 1

# Feature: Feature 2
```

### Examples of Correct Code

```markdown
# Feature: Feature 1
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
