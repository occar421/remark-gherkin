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
});
