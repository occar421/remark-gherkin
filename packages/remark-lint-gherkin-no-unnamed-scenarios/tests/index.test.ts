import { expect, suite, test } from "vite-plus/test";
import remarkGherkin from "remark-gherkin";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { unified } from "unified";
import remarkLintGherkinNoUnnamedScenarios from "../src/index.ts";

suite("remark-lint-gherkin-no-unnamed-scenarios", () => {
  const getProcessor = () =>
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkGherkin)
      .use(remarkLintGherkinNoUnnamedScenarios)
      .use(function () {
        this.Compiler = () => "";
      });

  test("Should not report when scenario has a name", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Feature Name
## Scenario: Scenario Name
`);
    expect(file.messages).toHaveLength(0);
  });

  test("Should report when scenario name is empty", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Feature Name
## Scenario:
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe("Missing Scenario name");
    expect(file.messages[0].ruleId).toBe("gherkin-no-unnamed-scenarios");
  });

  test("Should report when scenario outline name is empty", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Feature Name
## Scenario Outline:
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe("Missing Scenario Outline name");
    expect(file.messages[0].ruleId).toBe("gherkin-no-unnamed-scenarios");
  });

  test("Should report when scenario name is only whitespace", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Feature Name
## Scenario:   
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe("Missing Scenario name");
  });
});
