import { expect, suite, test } from "vite-plus/test";
import remarkGherkin from "remark-gherkin";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { unified } from "unified";
import remarkLintGherkinNoUnusedVariables from "../src/index.ts";

suite("remark-lint-gherkin-no-unused-variables", () => {
  const getProcessor = () =>
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkGherkin)
      .use(remarkLintGherkinNoUnusedVariables)
      .use(function () {
        this.Compiler = () => "";
      });

  test("Should not report when all variables are used", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Feature Name
## Scenario Outline: Scenario Outline Name
* Given a <variable1>
* When I use <variable2>
* Then I should see <variable1> and <variable2>

### Examples:
  | variable1 | variable2 |
  | --------- | --------- |
  | value1    | value2    |
`);
    expect(file.messages).toHaveLength(0);
  });

  test("Should report when a variable is unused", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Feature Name
## Scenario Outline: Scenario Outline Name
* Given a <variable1>
* When I use another variable

### Examples:
  | variable1 | variable2 |
  | --------- | --------- |
  | value1    | value2    |
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe("Unused variable in Examples: 'variable2'");
    expect(file.messages[0].ruleId).toBe("gherkin-no-unused-variables");
    expect(file.messages[0].place).toMatchObject({
      start: { line: 8, column: 15 },
      end: { line: 8, column: 28 },
    });
  });

  test("Should report when a delimited variable is missing from examples", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Feature Name
## Scenario Outline: Scenario Outline Name
* Given a <variable1>
* When I use <variable2>

### Examples:
  | variable1 |
  | --------- |
  | value1    |
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe("Unused variable in Outline: '<variable2>'");
    expect(file.messages[0].ruleId).toBe("gherkin-no-unused-variables");
    expect(file.messages[0].place).toMatchObject({
      start: { line: 5, column: 14 },
      end: { line: 5, column: 25 },
    });
  });

  test("Should report variables unused in either direction", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Feature Name
## Scenario Outline: Scenario Outline Name
* Given a <used>
* When I use <missing>

### Examples:
  | used | unused |
  | ---- | ------ |
  | value | value |
`);
    expect(file.messages).toHaveLength(2);
    expect(file.messages.map((message) => message.message)).toEqual([
      "Unused variable in Examples: 'unused'",
      "Unused variable in Outline: '<missing>'",
    ]);
  });

  test("Should not report with no examples", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Feature Name
## Scenario Outline: Scenario Outline Name
* Given a <variable1>
`);
    expect(file.messages).toHaveLength(0);
  });

  test("Should handle multiple example tables", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Feature Name
## Scenario Outline: Scenario Outline Name
* Given a <variable1>
* When I use <variable3>

### Examples:
  | variable1 | variable2 |
  | --------- | --------- |
  | value1    | value2    |

### Examples:
  | variable3 | variable4 |
  | --------- | --------- |
  | value3    | value4    |
`);
    expect(file.messages).toHaveLength(2);
    expect(file.messages[0].message).toBe("Unused variable in Examples: 'variable2'");
    expect(file.messages[0].place).toMatchObject({
      start: { line: 8, column: 15 },
      end: { line: 8, column: 28 },
    });
    expect(file.messages[1].message).toBe("Unused variable in Examples: 'variable4'");
    expect(file.messages[1].place).toMatchObject({
      start: { line: 13, column: 15 },
      end: { line: 13, column: 28 },
    });
  });

  test("Should handle variables in different steps", () => {
    const processor = getProcessor();
    const file = processor.processSync(`
# Feature: Feature Name
## Scenario Outline: Scenario Outline Name
* Given <param1>
* When <param2>
* Then <param3>

### Examples:
  | param1 | param2 | param3 | param4 |
  | ------ | ------ | ------ | ------ |
  | val1   | val2   | val3   | val4   |
`);
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].message).toBe("Unused variable in Examples: 'param4'");
    expect(file.messages[0].place).toMatchObject({
      start: { line: 9, column: 30 },
      end: { line: 9, column: 40 },
    });
  });
});
