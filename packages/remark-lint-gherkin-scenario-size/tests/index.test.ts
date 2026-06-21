import { expect, suite, test } from "vite-plus/test";
import remarkGherkin from "remark-gherkin";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { unified } from "unified";
import remarkLintGherkinScenarioSize, { type Options } from "../src/index.ts";

suite("remark-lint-gherkin-scenario-size", () => {
  const getProcessor = (options?: Options) =>
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkGherkin)
      .use(remarkLintGherkinScenarioSize, options)
      .use(function () {
        this.Compiler = () => "";
      });

  test("Should not report when step counts are within limit", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Test
## Background:
* Given a step
## Scenario: Test
* Given step 1
* And step 2
`);
    expect(file.messages).toHaveLength(0);
  });

  test("Should report when Background step count exceeds limit", () => {
    const processor = getProcessor({ "steps-length": { Background: 1 } });
    const file = processor.processSync(`
# Feature: Test
## Background:
* Given step 1
* And step 2
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe(
      "Expected Background to have at most 1 steps, but found 2",
    );
    expect(file.messages[0].ruleId).toBe("gherkin-scenario-size");
  });

  test("Should report when Scenario step count exceeds limit", () => {
    const processor = getProcessor({ "steps-length": { Scenario: 2 } });
    const file = processor.processSync(`
# Feature: Test
## Scenario: Test
* Given step 1
* And step 2
* Then step 3
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe("Expected Scenario to have at most 2 steps, but found 3");
  });

  test("Should handle Scenario Outlines", () => {
    const processor = getProcessor({ "steps-length": { Scenario: 1 } });
    const file = processor.processSync(`
# Feature: Test
## Scenario Outline: Test
* Given step 1
* And step 2
### Examples:
  | col |
  | --- |
  | val |
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe("Expected Scenario to have at most 1 steps, but found 2");
  });

  test("Should use default limit of 15", () => {
    const processor = getProcessor();
    const manySteps = Array.from({ length: 16 }, (_, i) => `* And step ${i + 1}`).join("\n");
    const file = processor.processSync(`
# Feature: Test
## Scenario: Test
${manySteps}
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe(
      "Expected Scenario to have at most 15 steps, but found 16",
    );
  });

  test("Should count only stepLine nodes", () => {
    const processor = getProcessor({ "steps-length": { Scenario: 1 } });
    const file = processor.processSync(`
# Feature: Test
## Scenario: Test
  * Given step 1
  <!-- This is a comment, not a step -->
  * And step 2
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe("Expected Scenario to have at most 1 steps, but found 2");
  });
});
