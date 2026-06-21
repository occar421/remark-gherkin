import { expect, suite, test } from "vite-plus/test";
import remarkGherkin from "remark-gherkin";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { unified } from "unified";
import remarkLintGherkinUseAnd from "../src/index.ts";

suite("remark-lint-gherkin-use-and", () => {
  const getProcessor = () =>
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkGherkin)
      .use(remarkLintGherkinUseAnd)
      .use(function () {
        this.Compiler = () => "";
      });

  test("Should not report when And is used for repeated keywords", () => {
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

  test("Should report when Given is repeated", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Test
## Scenario: Test
* Given step 1
* Given step 2
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe('Step "Given" should use And instead of Given');
    expect(file.messages[0].ruleId).toBe("gherkin-use-and");
  });

  test("Should report when When is repeated", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Test
## Scenario: Test
* When step 1
* When step 2
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe('Step "When" should use And instead of When');
  });

  test("Should report when Then is repeated", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Test
## Scenario: Test
* Then step 1
* Then step 2
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe('Step "Then" should use And instead of Then');
  });

  test("Should not report when But is used", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Test
## Scenario: Test
* Given step 1
* But step 2
* Given step 3
`);
    expect(file.messages).toHaveLength(0);
  });

  test("Should handle repeated keywords with And/But in between", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Test
## Scenario: Test
* Given step 1
* And step 2
* Given step 3
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe('Step "Given" should use And instead of Given');
  });

  test("Should reset previous keyword across scenarios", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Test
## Scenario: One
* Given step 1
## Scenario: Two
* Given step 2
`);
    expect(file.messages).toHaveLength(0);
  });

  test("Should handle Background", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Test
## Background:
* Given step 1
* Given step 2
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe('Step "Given" should use And instead of Given');
  });
});
