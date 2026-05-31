import { expect, suite, test } from "vite-plus/test";
import remarkGherkin from "remark-gherkin";
import remarkParse from "remark-parse";
import { unified } from "unified";
import remarkLintGherkinNoFilesWithoutScenarios from "../src/index.ts";

suite("remark-lint-gherkin-no-files-without-scenarios", () => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGherkin)
    .use(remarkLintGherkinNoFilesWithoutScenarios)
    .use(function () {
      // Dummy compiler
      this.Compiler = () => {
        return "";
      };
    });

  test("Should report when feature has no scenarios", () => {
    const file = processor.processSync("# Feature: Test\n\n- Given a step");
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe("Feature files must have at least one scenario");
    expect(file.messages[0].ruleId).toBe("gherkin-no-files-without-scenarios");
  });

  test("Should not report when feature has a scenario", () => {
    const file = processor.processSync(
      "# Feature: Test\n\n## Scenario: Test Scenario\n- Given a step",
    );
    expect(file.messages).toHaveLength(0);
  });

  test("Should not report when feature has a scenario outline", () => {
    const file = processor.processSync(
      "# Feature: Test\n\n## Scenario Outline: Test Scenario\n- Given a step\n\nExamples:\n| a |\n| 1 |",
    );
    expect(file.messages).toHaveLength(0);
  });

  test("Should not report when there is no feature", () => {
    const file = processor.processSync("Just some text");
    expect(file.messages).toHaveLength(0);
  });
});
