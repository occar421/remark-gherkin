import { expect, suite, test } from "vite-plus/test";
import remarkGherkin from "remark-gherkin";
import remarkParse from "remark-parse";
import { unified } from "unified";
import remarkLintGherkinOneFeaturePerFile from "../src/index.ts";

suite("remark-lint-gherkin-one-feature-per-file", () => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGherkin)
    .use(remarkLintGherkinOneFeaturePerFile)
    .use(function () {
      // Dummy compiler
      this.Compiler = () => {
        return "";
      };
    });

  test("Should not report when there is one feature", () => {
    const file = processor.processSync(
      "# Feature: Test\n\n## Scenario: Test Scenario\n- Given a step",
    );
    expect(file.messages).toHaveLength(0);
  });

  test("Should report when there are two features", () => {
    const file = processor.processSync("# Feature: Feature 1\n\n# Feature: Feature 2");
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe("Only one feature is allowed per file");
    expect(file.messages[0].ruleId).toBe("gherkin-one-feature-per-file");
  });

  test("Should report when there are three features", () => {
    const file = processor.processSync(
      "# Feature: Feature 1\n\n# Feature: Feature 2\n\n# Feature: Feature 3",
    );
    expect(file.messages).toHaveLength(2);
    expect(file.messages[0].message).toBe("Only one feature is allowed per file");
    expect(file.messages[1].message).toBe("Only one feature is allowed per file");
  });

  test("Should not report when there is zero features", () => {
    const file = processor.processSync("Just some text");
    expect(file.messages).toHaveLength(0);
  });

  test("Should handle other Feature keywords (Ability)", () => {
    const file = processor.processSync("# Feature: Feature 1\n\n# Ability: Ability 1");
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe("Only one feature is allowed per file");
  });

  test("Should handle other Feature keywords (Business Need)", () => {
    const file = processor.processSync("# Feature: Feature 1\n\n# Business Need: Need 1");
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe("Only one feature is allowed per file");
  });
});
