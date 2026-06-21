import { expect, suite, test } from "vite-plus/test";
import remarkGherkin from "remark-gherkin";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { unified } from "unified";
import remarkLintGherkinKeywordsInLogicalOrder from "../src/index.ts";

suite("remark-lint-gherkin-keywords-in-logical-order", () => {
  const getProcessor = () =>
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkGherkin)
      .use(remarkLintGherkinKeywordsInLogicalOrder)
      .use(function () {
        this.Compiler = () => "";
      });

  test("Should not report when keywords are in logical order", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Test
## Scenario: Test
* Given step 1
* When step 2
* Then step 3
`);
    expect(file.messages).toHaveLength(0);
  });

  test("Should not report when steps are repeated with And", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Test
## Scenario: Test
* Given step 1
* And step 2
* When step 3
* And step 4
* Then step 5
* And step 6
`);
    expect(file.messages).toHaveLength(0);
  });

  test("Should report when When appears before Given", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Test
## Scenario: Test
* When step 1
* Given step 2
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe('Step "Given" should not appear after "When"');
    expect(file.messages[0].ruleId).toBe("gherkin-keywords-in-logical-order");
  });

  test("Should report when Then appears before When", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Test
## Scenario: Test
* Then step 1
* When step 2
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe('Step "When" should not appear after "Then"');
  });

  test("Should report when Then appears before Given", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Test
## Scenario: Test
* Then step 1
* Given step 2
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe('Step "Given" should not appear after "Then"');
  });

  test("Should allow repeated keywords (handled by use-and)", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Test
## Scenario: Test
* Given step 1
* Given step 2
`);
    expect(file.messages).toHaveLength(0);
  });

  test("Should handle multiple violations", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Test
## Scenario: Test
* Then step 1
* When step 2
* Given step 3
`);
    expect(file.messages).toHaveLength(2);
    expect(file.messages[0].message).toBe('Step "When" should not appear after "Then"');
    expect(file.messages[1].message).toBe('Step "Given" should not appear after "Then"');
  });

  test("Should reset state across scenarios", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Test
## Scenario: One
* When step 1
* Then step 2
## Scenario: Two
* Given step 3
* When step 4
`);
    expect(file.messages).toHaveLength(0);
  });

  test("Should handle Background", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Test
## Background:
* When step 1
* Given step 2
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe('Step "Given" should not appear after "When"');
  });
});
