import { expect, suite, test } from "vite-plus/test";
import remarkGherkin from "remark-gherkin";
import remarkParse from "remark-parse";
import { unified } from "unified";
import remarkLintGherkinNoExamplesInScenarios from "../src/index.ts";

suite("remark-lint-gherkin-no-examples-in-scenarios", () => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGherkin)
    .use(remarkLintGherkinNoExamplesInScenarios)
    .use(function () {
      // Dummy compiler
      this.Compiler = () => {
        return "";
      };
    });

  test("Should report when Examples are in Scenario", () => {
    const file = processor.processSync(
      "# Feature: Test\n\n## Scenario: Test Scenario\n- Given a step\n\n### Examples:\n| col1 |\n| val1 |",
    );
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe(
      "Examples are only allowed in Scenario Outlines, not in Scenarios",
    );
    expect(file.messages[0].ruleId).toBe("gherkin-no-examples-in-scenarios");
  });

  test("Should not report when Examples are in Scenario Outline", () => {
    const file = processor.processSync(
      "# Feature: Test\n\n## Scenario Outline: Test Scenario Outline\n- Given a step <col1>\n\n### Examples:\n| col1 |\n| val1 |",
    );
    expect(file.messages).toHaveLength(0);
  });

  test("Should not report when Scenario has no Examples", () => {
    const file = processor.processSync(
      "# Feature: Test\n\n## Scenario: Test Scenario\n- Given a step",
    );
    expect(file.messages).toHaveLength(0);
  });

  test("Should not report when Scenario Template is used (alias for Scenario Outline)", () => {
    const file = processor.processSync(
      "# Feature: Test\n\n## Scenario Template: Test Scenario Template\n- Given a step <col1>\n\n### Examples:\n| col1 |\n| val1 |",
    );
    expect(file.messages).toHaveLength(0);
  });

  test("Should report when Scenarios is used (alias for Examples) in Scenario", () => {
    const file = processor.processSync(
      "# Feature: Test\n\n## Scenario: Test Scenario\n- Given a step\n\n### Scenarios:\n| col1 |\n| val1 |",
    );
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe(
      "Examples are only allowed in Scenario Outlines, not in Scenarios",
    );
  });
});
