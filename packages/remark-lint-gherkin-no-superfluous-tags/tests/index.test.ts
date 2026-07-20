import { expect, suite, test } from "vite-plus/test";
import remarkGherkin from "remark-gherkin";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { unified } from "unified";
import remarkLintGherkinNoSuperfluousTags from "../src/index.ts";

suite("remark-lint-gherkin-no-superfluous-tags", () => {
  const getProcessor = () =>
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkGherkin)
      .use(remarkLintGherkinNoSuperfluousTags)
      .use(function () {
        this.Compiler = () => "";
      });

  test("Should not report when tags are not duplicated from parent", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
\`@feature_tag\`
# Feature: Feature 1

\`@scenario_tag\`
## Scenario: Scenario 1
`);
    expect(file.messages).toHaveLength(0);
  });

  test("Should report when tag on Scenario is duplicated from Feature", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
\`@tag1\`
# Feature: Feature 1

\`@tag1\`
## Scenario: Scenario 1
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe(
      'Tag "@tag1" is already present on a parent Gherkin element',
    );
    expect(file.messages[0].place).toEqual({
      start: { line: 5, column: 1, offset: 31 },
      end: { line: 5, column: 8, offset: 38 },
    });
    expect(file.messages[0].ruleId).toBe("gherkin-no-superfluous-tags");
  });

  test("Should report when tag on Scenario is duplicated from Rule", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Feature 1

\`@rule_tag\`
### Rule: Rule 1

\`@rule_tag\`
#### Scenario: Scenario 1
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe(
      'Tag "@rule_tag" is already present on a parent Gherkin element',
    );
    expect(file.messages[0].place).toEqual({
      start: { line: 7, column: 1, offset: 53 },
      end: { line: 7, column: 12, offset: 64 },
    });
  });

  test("Should report when tag on Rule is duplicated from Feature", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
\`@feature_tag\`
# Feature: Feature 1

\`@feature_tag\`
## Rule: Rule 1
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe(
      'Tag "@feature_tag" is already present on a parent Gherkin element',
    );
    expect(file.messages[0].place).toEqual({
      start: { line: 5, column: 1, offset: 38 },
      end: { line: 5, column: 15, offset: 52 },
    });
  });

  test("Should handle multiple tags and report all superfluous ones", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
\`@tag1\` \`@tag2\`
# Feature: Feature 1

\`@tag1\` \`@tag2\` \`@tag3\`
## Scenario: Scenario 1
`);
    expect(file.messages).toHaveLength(2);
    expect(file.messages[0].message).toBe(
      'Tag "@tag1" is already present on a parent Gherkin element',
    );
    expect(file.messages[1].message).toBe(
      'Tag "@tag2" is already present on a parent Gherkin element',
    );
    expect(file.messages[0].place).toEqual({
      start: { line: 5, column: 1, offset: 39 },
      end: { line: 5, column: 8, offset: 46 },
    });
    expect(file.messages[1].place).toEqual({
      start: { line: 5, column: 9, offset: 47 },
      end: { line: 5, column: 16, offset: 54 },
    });
  });

  test("Should report when tag on Scenario is duplicated from both Feature and Rule", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
\`@tag1\`
# Feature: Feature 1

\`@tag2\`
## Rule: Rule 1

\`@tag1\` \`@tag2\`
### Scenario: Scenario 1
`);
    expect(file.messages).toHaveLength(2);
    expect(file.messages[0].place).toEqual({
      start: { line: 8, column: 1, offset: 56 },
      end: { line: 8, column: 8, offset: 63 },
    });
    expect(file.messages[1].place).toEqual({
      start: { line: 8, column: 9, offset: 64 },
      end: { line: 8, column: 16, offset: 71 },
    });
  });
});
