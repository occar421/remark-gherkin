import { expect, suite, test } from "vite-plus/test";
import remarkGherkin from "remark-gherkin";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { unified } from "unified";
import remarkLintGherkinRequiredTags from "../src/index.ts";

suite("remark-lint-gherkin-required-tags", () => {
  const getProcessor = (options?: any) =>
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
    });
  });

  suite("Multiple tags", () => {
    test("Should report when one of the required tags is missing", () => {
      const processor = getProcessor({ tags: ["@smoke", "@fast"] });
      const file = processor.processSync("# Feature: F\n`@smoke`\n## Scenario: S");
      expect(file.messages).toHaveLength(1);
      expect(file.messages[0].message).toBe("No tag found matching @fast for Scenario");
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
