import { expect, suite, test } from "vite-plus/test";
import remarkGherkin from "remark-gherkin";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { unified } from "unified";
import remarkLintGherkinNoPartiallyCommentedTagLines from "../src/index.ts";

suite("remark-lint-gherkin-no-partially-commented-tag-lines", () => {
  const getProcessor = () =>
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkGherkin)
      .use(remarkLintGherkinNoPartiallyCommentedTagLines)
      .use(function () {
        this.Compiler = () => "";
      });

  test("Should not report when tag line is correct", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
\`@tag1\` \`@tag2\`
# Feature: Feature 1
`);
    expect(file.messages).toHaveLength(0);
  });

  test("Should report when tag line is partially commented", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
\`@tag1\` <!-- \`@tag2\` -->
# Feature: Feature 1
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe("Tag lines must not be partially commented.");
    expect(file.messages[0].ruleId).toBe("gherkin-no-partially-commented-tag-lines");
  });

  test("Should report when tag line has comment at the end", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
\`@tag1\` <!-- comment -->
# Feature: Feature 1
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe("Tag lines must not be partially commented.");
  });

  test("Should not report when '#' is inside a tag", () => {
    // In Gherkin, tags usually don't contain '#', but in MDG they are just inline code.
    // If it's inside inline code, it's not a comment in the tag line's context.
    const processor = getProcessor();
    const file = processor.processSync(`
\`@tag#1\`
# Feature: Feature 1
`);
    expect(file.messages).toHaveLength(0);
  });
});
