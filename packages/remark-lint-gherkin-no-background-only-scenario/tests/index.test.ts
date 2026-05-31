import { expect, suite, test } from "vite-plus/test";
import remarkGherkin from "remark-gherkin";
import remarkParse from "remark-parse";
import { unified } from "unified";
import remarkLintGherkinNoBackgroundOnlyScenario from "../src/index.ts";

suite("remark-lint-gherkin-no-background-only-scenario", () => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGherkin)
    .use(remarkLintGherkinNoBackgroundOnlyScenario)
    .use(function () {
      // Dummy compiler
      this.Compiler = () => {
        return "";
      };
    });

  test("Should not report when no background and one scenario", () => {
    const file = processor.processSync(
      "# Feature: Test\n\n## Scenario: Test Scenario\n- Given a step",
    );
    expect(file.messages).toHaveLength(0);
  });

  test("Should not report when background and two scenarios", () => {
    const file = processor.processSync(
      "# Feature: Test\n\n## Background:\n- Given a step\n\n## Scenario: S1\n- Given a step\n\n## Scenario: S2\n- Given a step",
    );
    expect(file.messages).toHaveLength(0);
  });

  test("Should report when background and one scenario", () => {
    const file = processor.processSync(
      "# Feature: Test\n\n## Background:\n- Given a step\n\n## Scenario: Test Scenario\n- Given a step",
    );
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe(
      "Backgrounds are only allowed when there is more than one scenario",
    );
    expect(file.messages[0].ruleId).toBe("gherkin-no-background-only-scenario");
  });

  test("Should report when background and one scenario outline", () => {
    const file = processor.processSync(
      "# Feature: Test\n\n## Background:\n- Given a step\n\n## Scenario Outline: Test Scenario\n- Given a step\n\nExamples:\n| a |\n| 1 |",
    );
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe(
      "Backgrounds are only allowed when there is more than one scenario",
    );
  });
});
