import { expect, suite, test } from "vite-plus/test";
import remarkGherkin from "remark-gherkin";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { unified } from "unified";
import remarkLintGherkinNoDupeScenarioNames from "../src/index.ts";

suite("remark-lint-gherkin-no-dupe-scenario-names", () => {
  const getProcessor = () =>
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkGherkin)
      .use(remarkLintGherkinNoDupeScenarioNames)
      .use(function () {
        this.Compiler = () => "";
      });

  test("Should not report when scenario names are unique", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Feature 1
## Scenario: Scenario 1
## Scenario: Scenario 2
`);
    expect(file.messages).toHaveLength(0);
  });

  test("Should report when scenario names are duplicated", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Feature 1
## Scenario: Scenario 1
## Scenario: Scenario 1
`);
    console.log(file.messages);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe('Scenario name "Scenario 1" is already used');
    expect(file.messages[0].ruleId).toBe("gherkin-no-dupe-scenario-names");
  });

  test("Should report when scenario names are duplicated including Scenario Outline", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Feature 1
## Scenario: Scenario 1
### Scenario Outline: Scenario 1
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe('Scenario name "Scenario 1" is already used');
  });

  test("Should report duplicates across features by default (anywhere)", () => {
    const processor = getProcessor(); // defaults to anywhere
    const file = processor.processSync(`
# Feature: Feature 1
## Scenario: Duplicate Name

# Feature: Feature 2
## Scenario: Duplicate Name
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe('Scenario name "Duplicate Name" is already used');
  });

  test("Should not report duplicates across features when using 'in-feature' option", () => {
    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkGherkin)
      .use(remarkLintGherkinNoDupeScenarioNames, "in-feature")
      .use(function () {
        this.Compiler = () => "";
      });

    const file = processor.processSync(`
# Feature: Feature 1
## Scenario: Duplicate Name

# Feature: Feature 2
## Scenario: Duplicate Name
`);
    expect(file.messages).toHaveLength(0);
  });

  test("Should report duplicates within same feature even when using 'in-feature' option", () => {
    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkGherkin)
      .use(remarkLintGherkinNoDupeScenarioNames, "in-feature")
      .use(function () {
        this.Compiler = () => "";
      });

    const file = processor.processSync(`
# Feature: Feature 1
## Scenario: Duplicate Name
## Scenario: Duplicate Name
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe('Scenario name "Duplicate Name" is already used');
  });
});
