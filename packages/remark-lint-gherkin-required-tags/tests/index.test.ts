import { expect, suite, test } from "vite-plus/test";
import remarkGherkin from "remark-gherkin";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { unified } from "unified";
import remarkLintGherkinRequiredTags from "../src/index.ts";

suite("remark-lint-gherkin-required-tags", () => {
  const getProcessor = (options?: { tags?: string[]; ignoreUntagged?: boolean }) =>
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkGherkin)
      .use(remarkLintGherkinRequiredTags, options)
      .use(function () {
        this.Compiler = () => "";
      });

  suite("Scenario", () => {
    test("Should not report when scenario has required tag", () => {
      const processor = getProcessor({ tags: ["@smoke"] });
      const file = processor.processSync("# Feature: F\n`@smoke`\n## Scenario: S");
      expect(file.messages).toHaveLength(0);
    });

    test("Should not report when scenario inherits required tag from Feature", () => {
      const processor = getProcessor({ tags: ["@smoke"] });
      const file = processor.processSync("`@smoke` \n# Feature: F\n## Scenario: S");
      expect(file.messages).toHaveLength(0);
    });

    test("Should report when scenario is missing required tag (not even inherited) and ignoreUntagged is false", () => {
      const processor = getProcessor({ tags: ["@smoke"], ignoreUntagged: false });
      const file = processor.processSync("# Feature: F\n## Scenario: S");
      expect(file.messages).toHaveLength(1);
      expect(file.messages[0].message).toBe("No tag found matching @smoke for Scenario");
      expect(file.messages[0].place).toEqual({
        start: { line: 2, column: 1, offset: 13 },
        end: { line: 2, column: 15, offset: 27 },
      });
    });

    test("Should not report when scenario is missing required tag but ignoreUntagged is true", () => {
      const processor = getProcessor({ tags: ["@smoke"], ignoreUntagged: true });
      const file = processor.processSync("# Feature: F\n## Scenario: S");
      expect(file.messages).toHaveLength(0);
    });

    test("Should report when scenario has tags but none match required tag", () => {
      const processor = getProcessor({ tags: ["@smoke"] });
      const file = processor.processSync("# Feature: F\n`@wip`\n## Scenario: S");
      expect(file.messages).toHaveLength(1);
      expect(file.messages[0].message).toBe("No tag found matching @smoke for Scenario");
      expect(file.messages[0].place).toEqual({
        start: { line: 3, column: 1, offset: 20 },
        end: { line: 3, column: 15, offset: 34 },
      });
    });
  });

  suite("Regex patterns", () => {
    test("Should not report when tag matches pattern", () => {
      const processor = getProcessor({ tags: ["^@issue:[1-9]\\d*$"] });
      const file = processor.processSync("# Feature: F\n`@issue:123`\n## Scenario: S");
      expect(file.messages).toHaveLength(0);
    });

    test("Should report when tag does not match pattern", () => {
      const processor = getProcessor({ tags: ["^@issue:[1-9]\\d*$"] });
      const file = processor.processSync("# Feature: F\n`@issue:abc`\n## Scenario: S");
      expect(file.messages).toHaveLength(1);
      expect(file.messages[0].message).toBe(
        "No tag found matching ^@issue:[1-9]\\d*$ for Scenario",
      );
      expect(file.messages[0].place).toEqual({
        start: { line: 3, column: 1, offset: 26 },
        end: { line: 3, column: 15, offset: 40 },
      });
    });
  });

  suite("Multiple tags", () => {
    test("Should report when one of the required tags is missing", () => {
      const processor = getProcessor({ tags: ["@smoke", "@fast"] });
      const file = processor.processSync("# Feature: F\n`@smoke`\n## Scenario: S");
      expect(file.messages).toHaveLength(1);
      expect(file.messages[0].message).toBe("No tag found matching @fast for Scenario");
      expect(file.messages[0].place).toEqual({
        start: { line: 3, column: 1, offset: 22 },
        end: { line: 3, column: 15, offset: 36 },
      });
    });

    test("Should not report when all required tags are present", () => {
      const processor = getProcessor({ tags: ["@smoke", "@fast"] });
      const file = processor.processSync("# Feature: F\n`@smoke` `@fast`\n## Scenario: S");
      expect(file.messages).toHaveLength(0);
    });
  });

  suite("Scenario Outline", () => {
    test("Should check Scenario Outline", () => {
      const processor = getProcessor({ tags: ["@smoke"] });
      const file = processor.processSync(
        "# Feature: F\n`@wip`\n## Scenario Outline: S\n### Examples: E\n|a|\n|1|",
      );
      expect(file.messages).toHaveLength(1);
      expect(file.messages[0].message).toBe("No tag found matching @smoke for Scenario Outline");
      expect(file.messages[0].place).toEqual({
        start: { line: 3, column: 1, offset: 20 },
        end: { line: 3, column: 23, offset: 42 },
      });
    });
  });

  suite("Inheritance from Rule", () => {
    test("Should not report when scenario inherits required tag from Rule", () => {
      const processor = getProcessor({ tags: ["@smoke"] });
      const file = processor.processSync("# Feature: F\n`@smoke` \n## Rule: R\n### Scenario: S");
      expect(file.messages).toHaveLength(0);
    });
  });
});
