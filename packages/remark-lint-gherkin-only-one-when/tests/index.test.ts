import { expect, suite, test } from "vite-plus/test";
import remarkGherkin from "remark-gherkin";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { unified } from "unified";
import remarkLintGherkinOnlyOneWhen from "../src/index.ts";

suite("remark-lint-gherkin-only-one-when", () => {
  const getProcessor = () =>
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkGherkin)
      .use(remarkLintGherkinOnlyOneWhen)
      .use(function () {
        this.Compiler = () => "";
      });

  test("Should not report when there is only one When step", () => {
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

  test("Should not report when there are no When steps", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Test
## Scenario: Test
* Given step 1
* Then step 2
`);
    expect(file.messages).toHaveLength(0);
  });

  test("Should report when there are multiple When steps", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Test
## Scenario: Test
* When step 1
* When step 2
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe(
      'Step "When" should not appear more than once per scenario',
    );
    expect(file.messages[0].ruleId).toBe("gherkin-only-one-when");
  });

  test("Should report when there are more than two When steps", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Test
## Scenario: Test
* When step 1
* When step 2
* When step 3
`);
    expect(file.messages).toHaveLength(2);
    expect(file.messages[0].message).toBe(
      'Step "When" should not appear more than once per scenario',
    );
    expect(file.messages[1].message).toBe(
      'Step "When" should not appear more than once per scenario',
    );
  });

  test("Should report multiple When steps in Scenario Outline", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Test
## Scenario Outline: Test
* When step 1
* When step 2

| col |
| --- |
| val |
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe(
      'Step "When" should not appear more than once per scenario',
    );
  });

  test("Should reset state across scenarios", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Test
## Scenario: One
* When step 1
## Scenario: Two
* When step 2
`);
    expect(file.messages).toHaveLength(0);
  });

  test("Should not report And/But after When", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Test
## Scenario: Test
* When step 1
* And step 2
* But step 3
`);
    expect(file.messages).toHaveLength(0);
  });

  test("Should handle multiple scenarios with violations", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Test
## Scenario: One
* When step 1
* When step 2
## Scenario: Two
* When step 3
* When step 4
`);
    expect(file.messages).toHaveLength(2);
  });
});
