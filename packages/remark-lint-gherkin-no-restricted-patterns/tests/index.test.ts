import { expect, suite, test } from "vite-plus/test";
import remarkGherkin from "remark-gherkin";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { unified } from "unified";
import remarkLintGherkinNoRestrictedPatterns, { type RestrictedPatterns } from "../src/index.ts";

suite("remark-lint-gherkin-no-restricted-patterns", () => {
  const getProcessor = (options: RestrictedPatterns) =>
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkGherkin)
      .use(remarkLintGherkinNoRestrictedPatterns, options)
      .use(function () {
        this.Compiler = () => "";
      });

  test("Should report when global restricted pattern is found", () => {
    const processor = getProcessor({ Global: ["restricted"] });
    const file = processor.processSync(`
# Feature: This has restricted word
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe(
      'Restricted pattern match found for Global: "restricted"',
    );
    expect(file.messages[0].ruleId).toBe("gherkin-no-restricted-patterns");
  });

  test("Should report when Feature specific restricted pattern is found", () => {
    const processor = getProcessor({ Feature: ["validate"] });
    const file = processor.processSync(`
# Feature: validate something
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe('Restricted pattern match found for Feature: "validate"');
  });

  test("Should report when Scenario specific restricted pattern is found", () => {
    const processor = getProcessor({ Scenario: ["debug"] });
    const file = processor.processSync(`
# Feature: Feature 1

## Scenario: debug this
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe('Restricted pattern match found for Scenario: "debug"');
  });

  test("Should report when Step specific restricted pattern is found", () => {
    const processor = getProcessor({ Step: ["regex"] });
    const file = processor.processSync(`
# Feature: Feature 1

## Scenario: Scenario 1
* Given a step with regex
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe('Restricted pattern match found for Step: "regex"');
  });

  test("Should be case-insensitive", () => {
    const processor = getProcessor({ Feature: ["VALIDATE"] });
    const file = processor.processSync(`
# Feature: validate something
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe('Restricted pattern match found for Feature: "VALIDATE"');
  });

  test("Should not report when no patterns match", () => {
    const processor = getProcessor({ Feature: ["restricted"], Global: ["forbidden"] });
    const file = processor.processSync(`
# Feature: A safe title
* Given a safe step
`);
    expect(file.messages).toHaveLength(0);
  });

  test("Should support Scenario Outline and Examples", () => {
    const processor = getProcessor({ ScenarioOutline: ["template"], Examples: ["data"] });
    const file = processor.processSync(`
# Feature: Feature 1

## Scenario Outline: a template
* Given <val>

### Examples: some data
  | val |
  | --- |
  | 1   |
`);
    expect(file.messages).toHaveLength(2);
    expect(file.messages.some((m) => m.message.includes('ScenarioOutline: "template"'))).toBe(true);
    expect(file.messages.some((m) => m.message.includes('Examples: "data"'))).toBe(true);
  });

  test("Should support regex patterns", () => {
    const processor = getProcessor({ Global: ["re[gx]ex", "num \\d+"] });
    const file = processor.processSync(`
# Feature: Testing regex
* Given a step with regex
* And another step with num 123
`);
    // 3 matches expected because "Testing regex" matches "re[gx]ex"
    expect(file.messages).toHaveLength(3);
    expect(file.messages.filter((m) => m.message.includes('Global: "re[gx]ex"'))).toHaveLength(2);
    expect(file.messages.filter((m) => m.message.includes('Global: "num \\d+"'))).toHaveLength(1);
  });

  test("Should not include Step keywords (Given, When, Then, And) in the pattern matching for steps", () => {
    const processor = getProcessor({ Step: ["Given", "When", "Then", "And"] });
    const file = processor.processSync(`
# Feature: Feature 1

## Scenario: Scenario 1
* Given a step
* When I do something
* Then I see something
* And another thing
`);
    // If keywords are included in the text being checked, this would report 4 messages.
    // If they are excluded, it should report 0 (assuming the step content doesn't contain the keywords).
    expect(file.messages).toHaveLength(0);
  });

  test("Should match step content excluding the keyword", () => {
    const processor = getProcessor({ Step: ["^a step$"] });
    const file = processor.processSync(`
# Feature: Feature 1

## Scenario: Scenario 1
* Given a step
`);
    // If the keyword "Given " is included, "^a step$" would NOT match "Given a step".
    // If it's excluded, it SHOULD match.
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe('Restricted pattern match found for Step: "^a step$"');
  });

  test("Should report when restricted pattern is found in Description", () => {
    const processor = getProcessor({ Description: ["restricted"] });
    const file = processor.processSync(`
# Feature: Feature 1
This is a restricted description.

## Scenario: Scenario 1
This also has restricted content.
`);
    expect(file.messages).toHaveLength(2);
    expect(file.messages[0].message).toBe(
      'Restricted pattern match found for Description: "restricted"',
    );
    expect(file.messages[1].message).toBe(
      'Restricted pattern match found for Description: "restricted"',
    );
  });
});
