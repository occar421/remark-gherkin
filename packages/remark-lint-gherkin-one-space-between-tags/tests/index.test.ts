import { expect, suite, test } from "vite-plus/test";
import remarkGherkin from "remark-gherkin";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { unified } from "unified";
import remarkLintGherkinOneSpaceBetweenTags from "../src/index.ts";

suite("remark-lint-gherkin-one-space-between-tags", () => {
  const getProcessor = () =>
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkGherkin)
      .use(remarkLintGherkinOneSpaceBetweenTags)
      .use(function () {
        this.Compiler = () => "";
      });

  test("Should not report when tags are separated by exactly one space", () => {
    const processor = getProcessor();
    const file = processor.processSync("`@tag1` `@tag2` `@tag3`\n# Feature: My Feature");
    expect(file.messages).toHaveLength(0);
  });

  test("Should report when tags are separated by multiple spaces", () => {
    const processor = getProcessor();
    const file = processor.processSync("`@tag1`  `@tag2`\n# Feature: My Feature");
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe("There should be exactly one space between tags");
    expect(file.messages[0].ruleId).toBe("gherkin-one-space-between-tags");
  });

  test("Should report when tags are separated by a tab", () => {
    const processor = getProcessor();
    const file = processor.processSync("`@tag1`	`@tag2`\n# Feature: My Feature");
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe("There should be exactly one space between tags");
  });

  test("Should report multiple violations", () => {
    const processor = getProcessor();
    const file = processor.processSync("`@tag1`  `@tag2`   `@tag3`\n# Feature: My Feature");
    expect(file.messages).toHaveLength(2);
  });

  test("Should not report leading or trailing spaces (outside the scope of this rule)", () => {
    const processor = getProcessor();
    const file = processor.processSync("  `@tag1` `@tag2`  \n# Feature: My Feature");
    expect(file.messages).toHaveLength(0);
  });
});
