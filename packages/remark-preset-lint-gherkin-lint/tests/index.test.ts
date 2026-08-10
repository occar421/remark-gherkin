import { expect, suite, test } from "vite-plus/test";
import remarkGherkin from "remark-gherkin";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import remarkPresetLintGherkinLint from "../src/index.ts";

const process = (value: string, options?: Parameters<typeof remarkPresetLintGherkinLint>[0]) =>
  unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkGherkin)
    .use(remarkPresetLintGherkinLint, options)
    .use(function () {
      this.Compiler = () => "";
    })
    .processSync(value);

const messagesFor = (
  value: string,
  ruleId: string,
  options?: Parameters<typeof remarkPresetLintGherkinLint>[0],
) => process(value, options).messages.filter((message) => message.ruleId === ruleId);

suite("remark-preset-lint-gherkin-lint", () => {
  test("forwards options to the matching rules independently", () => {
    const value = `
# Feature: A feature name that is longer than ten characters
## Scenario: A scenario name that is longer than ten characters
* Given a step
## Scenario: Another scenario
`;

    expect(
      messagesFor(value, "gherkin-max-scenarios-per-file", {
        rules: { "remark-lint-gherkin-max-scenarios-per-file": { maxScenarios: 1 } },
      }),
    ).toHaveLength(1);
    expect(
      messagesFor(value, "gherkin-name-length", {
        rules: { "remark-lint-gherkin-name-length": { Feature: 10, Scenario: 10, Step: 10 } },
      }),
    ).toHaveLength(3);
  });

  test("uses rule defaults when options are omitted", () => {
    const value = `# Feature: Short\n## Scenario: Short\n* Given a short step\n`;

    expect(messagesFor(value, "gherkin-max-scenarios-per-file")).toHaveLength(0);
    expect(messagesFor(value, "gherkin-name-length")).toHaveLength(0);
  });

  test("does not let an empty rules map disable other rules", () => {
    const value = `# Feature: Short\n## Scenario: One\n## Scenario: Two\n`;

    expect(messagesFor(value, "gherkin-max-scenarios-per-file", { rules: {} })).toHaveLength(0);
    expect(messagesFor(value, "gherkin-name-length", { rules: {} })).toHaveLength(0);
  });
});
