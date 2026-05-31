import { expect, suite, test } from "vite-plus/test";
import remarkGherkin from "remark-gherkin";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { unified } from "unified";
import remarkLintGherkinNoDuplicateTags from "../src/index.ts";

suite("remark-lint-gherkin-no-duplicate-tags", () => {
  const getProcessor = () =>
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkGherkin)
      .use(remarkLintGherkinNoDuplicateTags)
      .use(function () {
        this.Compiler = () => "";
      });

  test("Should not report when tags are unique", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
\`@tag1\` \`@tag2\`
# Feature: Feature 1
\`@tag3\`
## Scenario: Scenario 1
`);
    expect(file.messages).toHaveLength(0);
  });

  test("Should report when tags are duplicated on Feature", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
\`@tag1\` \`@tag1\`
# Feature: Feature 1
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe('Duplicate tag "@tag1"');
    expect(file.messages[0].ruleId).toBe("gherkin-no-duplicate-tags");
  });

  test("Should report when tags are duplicated on Scenario", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Feature 1
\`@tag1\` \`@tag1\`
## Scenario: Scenario 1
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe('Duplicate tag "@tag1"');
  });

  test("Should not report duplicate tags across different elements", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
\`@tag1\`
# Feature: Feature 1
\`@tag1\`
## Scenario: Scenario 1
`);
    expect(file.messages).toHaveLength(0);
  });
});
