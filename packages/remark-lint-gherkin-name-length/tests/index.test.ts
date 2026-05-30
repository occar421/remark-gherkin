import { expect, suite, test } from "vite-plus/test";
import remarkGherkin from "remark-gherkin";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { unified } from "unified";
import remarkLintGherkinNameLength from "../src/index.ts";

suite("remark-lint-gherkin-name-length", () => {
  const getProcessor = (options?: { Feature?: number; Scenario?: number; Step?: number }) =>
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkGherkin)
      .use(remarkLintGherkinNameLength, options)
      .use(function () {
        this.Compiler = () => "";
      });

  test("Should not report when names are within limit", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Short Feature Name
## Scenario: Short Scenario Name
* Given a short step
`);
    expect(file.messages).toHaveLength(0);
  });

  test("Should report when Feature name exceeds limit", () => {
    const processor = getProcessor({ Feature: 10 });
    const file = processor.processSync(`
# Feature: This is a very long feature name
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe(
      "Expected Feature name to be at most 10 characters, but found 32",
    );
    expect(file.messages[0].ruleId).toBe("gherkin-name-length");
  });

  test("Should report when Scenario name exceeds limit", () => {
    const processor = getProcessor({ Scenario: 10 });
    const file = processor.processSync(`
# Feature: Test
## Scenario: This is a long scenario name
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe(
      "Expected Scenario name to be at most 10 characters, but found 28",
    );
  });

  test("Should report when Step name exceeds limit", () => {
    const processor = getProcessor({ Step: 10 });
    const file = processor.processSync(`
# Feature: Test
## Scenario: Test
* Given this is a very long step name
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe(
      "Expected Step name to be at most 10 characters, but found 29",
    );
  });

  test("Should use default limit of 70", () => {
    const processor = getProcessor();
    const longName = "A".repeat(71);
    const file = processor.processSync(`
# Feature: ${longName}
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe(
      `Expected Feature name to be at most 70 characters, but found 71`,
    );
  });

  test("Should handle Scenario Outlines", () => {
    const processor = getProcessor({ Scenario: 10 });
    const file = processor.processSync(`
# Feature: Test
### Scenario Outline: Long name here
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe(
      "Expected Scenario name to be at most 10 characters, but found 14",
    );
  });
});
