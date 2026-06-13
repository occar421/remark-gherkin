import { expect, suite, test } from "vite-plus/test";
import remarkGherkin from "remark-gherkin";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { unified } from "unified";
import remarkLintGherkinNoUnnamedFeatures from "../src/index.ts";

suite("remark-lint-gherkin-no-unnamed-features", () => {
  const getProcessor = () =>
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkGherkin)
      .use(remarkLintGherkinNoUnnamedFeatures)
      .use(function () {
        this.Compiler = () => "";
      });

  test("Should not report when feature has a name", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Feature Name
`);
    expect(file.messages).toHaveLength(0);
  });

  test("Should report when feature name is empty", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature:
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe("Missing Feature name");
    expect(file.messages[0].ruleId).toBe("gherkin-no-unnamed-features");
  });

  test("Should report when feature name is only whitespace", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature:   
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe("Missing Feature name");
  });
});
