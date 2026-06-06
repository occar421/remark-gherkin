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
