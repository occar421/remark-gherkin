import { expect, suite, test } from "vite-plus/test";
import remarkGherkin from "remark-gherkin";
import remarkParse from "remark-parse";
import { unified } from "unified";
import remarkLintGherkinNoRestrictedTags from "../src/index.ts";

suite("remark-lint-gherkin-no-restricted-tags", () => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGherkin)
    .use(remarkLintGherkinNoRestrictedTags, { tags: ["@restricted"] })
    .use(function () {
      // Dummy compiler
      this.Compiler = () => {
        return "";
      };
    });

  test("Should not report when tag is not restricted", () => {
    const file = processor.processSync("`@allowed`\n# Feature: Test");
    expect(file.messages).toHaveLength(0);
  });

  test("Should report when tag is restricted via tags", () => {
    const file = processor.processSync("`@restricted`\n# Feature: Test");
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe("Tag `@restricted` is restricted");
    expect(file.messages[0].ruleId).toBe("gherkin-no-restricted-tags");
    expect(file.messages[0].place).toEqual({
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 14, offset: 13 },
    });
  });

  test("Should report all restricted tags", () => {
    const multiProcessor = unified()
      .use(remarkParse)
      .use(remarkGherkin)
      .use(remarkLintGherkinNoRestrictedTags, { tags: ["@restricted", "@other-restricted"] })
      .use(function () {
        this.Compiler = () => "";
      });
    const multiFile = multiProcessor.processSync(
      "`@restricted` `@other-restricted`\n# Feature: Test",
    );
    expect(multiFile.messages).toHaveLength(2);
    expect(multiFile.messages[0].message).toBe("Tag `@restricted` is restricted");
    expect(multiFile.messages[1].message).toBe("Tag `@other-restricted` is restricted");
    expect(multiFile.messages[0].place).toEqual({
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 14, offset: 13 },
    });
    expect(multiFile.messages[1].place).toEqual({
      start: { line: 1, column: 15, offset: 14 },
      end: { line: 1, column: 34, offset: 33 },
    });
  });

  test("Should report when tag is restricted via patterns", () => {
    const patternProcessor = unified()
      .use(remarkParse)
      .use(remarkGherkin)
      .use(remarkLintGherkinNoRestrictedTags, { patterns: ["^@todo$"] })
      .use(function () {
        this.Compiler = () => "";
      });

    const file1 = patternProcessor.processSync("`@todo`\n# Feature: Test");
    expect(file1.messages).toHaveLength(1);
    expect(file1.messages[0].message).toBe("Tag `@todo` is restricted");
    expect(file1.messages[0].place).toEqual({
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 8, offset: 7 },
    });

    const file2 = patternProcessor.processSync("`@todo-not`\n# Feature: Test");
    expect(file2.messages).toHaveLength(0);
  });

  test("Should work with both tags and patterns", () => {
    const combinedProcessor = unified()
      .use(remarkParse)
      .use(remarkGherkin)
      .use(remarkLintGherkinNoRestrictedTags, {
        tags: ["@watch", "@wip"],
        patterns: ["^@todo$"],
      })
      .use(function () {
        this.Compiler = () => "";
      });

    const file1 = combinedProcessor.processSync(
      "`@watch` `@wip` `@todo` `@allowed`\n# Feature: Test",
    );
    expect(file1.messages).toHaveLength(3);
    expect(file1.messages[0].place).toEqual({
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 9, offset: 8 },
    });
    expect(file1.messages[1].place).toEqual({
      start: { line: 1, column: 10, offset: 9 },
      end: { line: 1, column: 16, offset: 15 },
    });
    expect(file1.messages[2].place).toEqual({
      start: { line: 1, column: 17, offset: 16 },
      end: { line: 1, column: 24, offset: 23 },
    });

    const file2 = combinedProcessor.processSync("`@allowed`\n# Feature: Test");
    expect(file2.messages).toHaveLength(0);
  });

  test("Should not report when options are empty", () => {
    const noOptionProcessor = unified()
      .use(remarkParse)
      .use(remarkGherkin)
      .use(remarkLintGherkinNoRestrictedTags)
      .use(function () {
        this.Compiler = () => "";
      });

    const file = noOptionProcessor.processSync("`@any`\n# Feature: Test");
    expect(file.messages).toHaveLength(0);
  });
});
