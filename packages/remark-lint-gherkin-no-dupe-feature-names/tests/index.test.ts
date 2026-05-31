import { expect, suite, test } from "vite-plus/test";
import remarkGherkin from "remark-gherkin";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { unified } from "unified";
import remarkLintGherkinNoDupeFeatureNames from "../src/index.ts";

suite("remark-lint-gherkin-no-dupe-feature-names", () => {
  const getProcessor = () =>
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkGherkin)
      .use(remarkLintGherkinNoDupeFeatureNames)
      .use(function () {
        this.Compiler = () => "";
      });

  test("Should not report when feature names are unique", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Feature 1
# Feature: Feature 2
`);
    expect(file.messages).toHaveLength(0);
  });

  test("Should report when feature names are duplicated", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Feature 1
# Feature: Feature 1
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe('Feature name "Feature 1" is already used');
    expect(file.messages[0].ruleId).toBe("gherkin-no-dupe-feature-names");
  });
});
