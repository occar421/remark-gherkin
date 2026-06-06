import { expect, suite, test } from "vite-plus/test";
import remarkGherkin from "remark-gherkin";
import remarkParse from "remark-parse";
import { unified } from "unified";
import remarkLintGherkinNoHomogenousTags from "../src/index.ts";

suite("remark-lint-gherkin-no-homogenous-tags", () => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGherkin)
    .use(remarkLintGherkinNoHomogenousTags)
    .use(function () {
      // Dummy compiler
      this.Compiler = () => {
        return "";
      };
    });

  test("Should report when all scenarios in a feature have the same tag", () => {
    const file = processor.processSync(
      "# Feature: Test\n\n`@tag1`\n## Scenario: S1\n\n`@tag1`\n## Scenario: S2",
    );
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe(
      'All scenarios have the tag "@tag1", it should be moved to the parent level',
    );
    expect(file.messages[0].ruleId).toBe("gherkin-no-homogenous-tags");
  });

  test("Should report when all scenarios in a rule have the same tag", () => {
    const file = processor.processSync(
      "# Feature: Test\n\n### Rule: R1\n\n`@tag1`\n## Scenario: S1\n\n`@tag1`\n## Scenario: S2",
    );
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe(
      'All scenarios have the tag "@tag1", it should be moved to the parent level',
    );
  });

  test("Should not report when only some scenarios have the tag", () => {
    const file = processor.processSync(
      "# Feature: Test\n\n`@tag1`\n## Scenario: S1\n\n## Scenario: S2",
    );
    expect(file.messages).toHaveLength(0);
  });

  test("Should not report when there is only one scenario", () => {
    const file = processor.processSync("# Feature: Test\n\n`@tag1`\n## Scenario: S1");
    expect(file.messages).toHaveLength(0);
  });

  test("Should report multiple homogenous tags", () => {
    const file = processor.processSync(
      "# Feature: Test\n\n`@tag1` `@tag2`\n## Scenario: S1\n\n`@tag1` `@tag2`\n## Scenario: S2",
    );
    expect(file.messages).toHaveLength(2);
  });

  test("Should handle Scenario Outline", () => {
    const file = processor.processSync(
      "# Feature: Test\n\n`@tag1`\n## Scenario: S1\n\n`@tag1`\n## Scenario Outline: S2\n- Given <val>\n\nExamples:\n| val |\n| 1 |",
    );
    expect(file.messages).toHaveLength(1);
  });
});
