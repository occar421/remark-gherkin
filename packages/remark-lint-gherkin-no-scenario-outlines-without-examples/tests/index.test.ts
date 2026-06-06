import { expect, suite, test } from "vite-plus/test";
import remarkGherkin from "remark-gherkin";
import remarkParse from "remark-parse";
import { unified } from "unified";
import remarkLintGherkinNoScenarioOutlinesWithoutExamples from "../src/index.ts";

suite("remark-lint-gherkin-no-scenario-outlines-without-examples", () => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGherkin)
    .use(remarkLintGherkinNoScenarioOutlinesWithoutExamples)
    .use(function () {
      // Dummy compiler
      this.Compiler = () => {
        return "";
      };
    });

  test("Should report when Scenario Outline has no Examples", () => {
    const file = processor.processSync(
      "# Feature: Test\n\n## Scenario Outline: Test Scenario Outline\n- Given a step <col1>",
    );
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe(
      "Scenario Outline must have at least one Examples section",
    );
    expect(file.messages[0].ruleId).toBe("gherkin-no-scenario-outlines-without-examples");
  });

  test("Should report when Scenario Template has no Examples", () => {
    const file = processor.processSync(
      "# Feature: Test\n\n## Scenario Template: Test Scenario Template\n- Given a step <col1>",
    );
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe(
      "Scenario Outline must have at least one Examples section",
    );
  });

  test("Should not report when Scenario Outline has Examples", () => {
    const file = processor.processSync(
      "# Feature: Test\n\n## Scenario Outline: Test Scenario Outline\n- Given a step <col1>\n\n### Examples:\n| col1 |\n| val1 |",
    );
    expect(file.messages).toHaveLength(0);
  });

  test("Should not report when Scenario Outline has Scenarios (alias for Examples)", () => {
    const file = processor.processSync(
      "# Feature: Test\n\n## Scenario Outline: Test Scenario Outline\n- Given a step <col1>\n\n### Scenarios:\n| col1 |\n| val1 |",
    );
    expect(file.messages).toHaveLength(0);
  });

  test("Should not report for normal Scenario", () => {
    const file = processor.processSync(
      "# Feature: Test\n\n## Scenario: Test Scenario\n- Given a step",
    );
    expect(file.messages).toHaveLength(0);
  });

  test("Should report when multiple Scenario Outlines missing Examples", () => {
    const file = processor.processSync(
      "# Feature: Test\n\n## Scenario Outline: First\n- Given a step\n\n## Scenario Outline: Second\n- Given another step",
    );
    expect(file.messages).toHaveLength(2);
  });
});
