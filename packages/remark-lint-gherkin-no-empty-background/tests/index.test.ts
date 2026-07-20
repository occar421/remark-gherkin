import { expect, suite, test } from "vite-plus/test";
import remarkGherkin from "remark-gherkin";
import remarkParse from "remark-parse";
import { unified } from "unified";
import remarkLintGherkinNoEmptyBackground from "../src/index.ts";

suite("remark-lint-gherkin-no-empty-background", () => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGherkin)
    .use(remarkLintGherkinNoEmptyBackground)
    .use(function () {
      // Dummy compiler
      this.Compiler = () => {
        return "";
      };
    });

  test("Should not report when background has steps", () => {
    const file = processor.processSync(
      "# Feature: Test\n\n## Background:\n- Given a step\n\n## Scenario: S1\n- Given a step",
    );
    expect(file.messages).toHaveLength(0);
  });

  test("Should report when background is empty (no list)", () => {
    const file = processor.processSync(
      "# Feature: Test\n\n## Background:\n\n## Scenario: S1\n- Given a step",
    );
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe("Backgrounds must not be empty");
    expect(file.messages[0].ruleId).toBe("gherkin-no-empty-background");
    expect(file.messages[0].place).toEqual({
      start: { line: 3, column: 1, offset: 17 },
      end: { line: 3, column: 15, offset: 31 },
    });
  });

  test("Should report when background is empty (at end of file)", () => {
    const file = processor.processSync("# Feature: Test\n\n## Background:");
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe("Backgrounds must not be empty");
    expect(file.messages[0].place).toEqual({
      start: { line: 3, column: 1, offset: 17 },
      end: { line: 3, column: 15, offset: 31 },
    });
  });

  test("Should report when background has only non-step list items", () => {
    const file = processor.processSync(
      "# Feature: Test\n\n## Background:\n* Item 1\n\n## Scenario: S1\n- Given a step",
    );
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe("Backgrounds must not be empty");
    expect(file.messages[0].place).toEqual({
      start: { line: 3, column: 1, offset: 17 },
      end: { line: 3, column: 15, offset: 31 },
    });
  });
});
