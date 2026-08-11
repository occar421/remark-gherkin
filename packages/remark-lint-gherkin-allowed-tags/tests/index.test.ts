import { expect, suite, test } from "vite-plus/test";
import remarkGherkin from "remark-gherkin";
import remarkParse from "remark-parse";
import { unified } from "unified";
import remarkLintGherkinAllowedTags from "../src/index.ts";

suite("remark-lint-gherkin-allowed-tags", () => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGherkin)
    .use(remarkLintGherkinAllowedTags, { tags: ["@allowed"] })
    .use(function () {
      // Dummy compiler
      this.Compiler = () => {
        return "";
      };
    });

  test("Should not report when tag is allowed via tags", () => {
    const file = processor.processSync("`@allowed`\n# Feature: Test");
    expect(file.messages).toHaveLength(0);
  });

  test("Should report when tag is not allowed", () => {
    const file = processor.processSync("`@not-allowed`\n# Feature: Test");
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe("Tag `@not-allowed` is not allowed");
    expect(file.messages[0].ruleId).toBe("gherkin-allowed-tags");
    expect(file.messages[0].place).toEqual({
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 15, offset: 14 },
    });
  });

  test("Should report when some tags are not allowed", () => {
    const file = processor.processSync("`@allowed` `@not-allowed`\n# Feature: Test");
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe("Tag `@not-allowed` is not allowed");
    expect(file.messages[0].place).toEqual({
      start: { line: 1, column: 12, offset: 11 },
      end: { line: 1, column: 26, offset: 25 },
    });
  });

  test("Should report all not allowed tags", () => {
    const file = processor.processSync("`@not-allowed1` `@not-allowed2`\n# Feature: Test");
    expect(file.messages).toHaveLength(2);
    expect(file.messages[0].message).toBe("Tag `@not-allowed1` is not allowed");
    expect(file.messages[1].message).toBe("Tag `@not-allowed2` is not allowed");
    expect(file.messages[0].place).toEqual({
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 16, offset: 15 },
    });
    expect(file.messages[1].place).toEqual({
      start: { line: 1, column: 17, offset: 16 },
      end: { line: 1, column: 32, offset: 31 },
    });
  });

  test("Should work with multiple tags allowed", () => {
    const multiProcessor = unified()
      .use(remarkParse)
      .use(remarkGherkin)
      .use(remarkLintGherkinAllowedTags, { tags: ["@a", "@b"] })
      .use(function () {
        this.Compiler = () => "";
      });

    const file = multiProcessor.processSync("`@a` `@b` `@c`\n# Feature: Test");
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe("Tag `@c` is not allowed");
    expect(file.messages[0].place).toEqual({
      start: { line: 1, column: 11, offset: 10 },
      end: { line: 1, column: 15, offset: 14 },
    });
  });

  test("Should not report when tag is allowed via patterns", () => {
    const patternProcessor = unified()
      .use(remarkParse)
      .use(remarkGherkin)
      .use(remarkLintGherkinAllowedTags, { patterns: ["^@todo$"] })
      .use(function () {
        this.Compiler = () => "";
      });

    const file = patternProcessor.processSync("`@todo`\n# Feature: Test");
    expect(file.messages).toHaveLength(0);

    const file2 = patternProcessor.processSync("`@todo-not`\n# Feature: Test");
    expect(file2.messages).toHaveLength(1);
    expect(file2.messages[0].place).toEqual({
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 12, offset: 11 },
    });
  });

  test("Should work with both tags and patterns", () => {
    const combinedProcessor = unified()
      .use(remarkParse)
      .use(remarkGherkin)
      .use(remarkLintGherkinAllowedTags, {
        tags: ["@watch", "@wip"],
        patterns: ["^@todo$"],
      })
      .use(function () {
        this.Compiler = () => "";
      });

    const file1 = combinedProcessor.processSync("`@watch` `@wip` `@todo`\n# Feature: Test");
    expect(file1.messages).toHaveLength(0);

    const file2 = combinedProcessor.processSync("`@other`\n# Feature: Test");
    expect(file2.messages).toHaveLength(1);
    expect(file2.messages[0].message).toBe("Tag `@other` is not allowed");
    expect(file2.messages[0].place).toEqual({
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 9, offset: 8 },
    });
  });

  test("Should not report when options are empty", () => {
    const noAllowProcessor = unified()
      .use(remarkParse)
      .use(remarkGherkin)
      .use(remarkLintGherkinAllowedTags)
      .use(function () {
        this.Compiler = () => "";
      });

    const file = noAllowProcessor.processSync("`@any`\n# Feature: Test");
    expect(file.messages).toHaveLength(0);
  });

  test("Should report disallowed tags on Scenario, Scenario Outline, and Examples", () => {
    const file = processor.processSync(`
# Feature: Feature

\`@not-allowed\`
## Scenario: Scenario

\`@not-allowed\`
## Scenario Outline: Outline

\`@not-allowed\`
### Examples: Examples
| value |
| ----- |
| one   |
`);
    expect(file.messages).toHaveLength(3);
    expect(file.messages.map((message) => message.message)).toEqual([
      "Tag `@not-allowed` is not allowed",
      "Tag `@not-allowed` is not allowed",
      "Tag `@not-allowed` is not allowed",
    ]);
  });
});
