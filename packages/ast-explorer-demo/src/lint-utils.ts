import { unified } from "unified";
import remarkGfm from "remark-gfm";
import remarkLint from "remark-lint";
import remarkParse from "remark-parse";
import remarkGherkin from "remark-gherkin";
import remarkPresetLintGherkinLint from "remark-preset-lint-gherkin-lint";
import { VFile } from "vfile";

export const lintRuleNames = [
  "remark-lint-gherkin-no-tags-on-backgrounds",
  "remark-lint-gherkin-one-feature-per-file",
  "remark-lint-gherkin-up-to-one-background-per-file",
  "remark-lint-gherkin-allowed-tags",
  "remark-lint-gherkin-max-scenarios-per-file",
  "remark-lint-gherkin-name-length",
  "remark-lint-gherkin-no-background-only-scenario",
  "remark-lint-gherkin-no-dupe-feature-names",
  "remark-lint-gherkin-no-dupe-scenario-names",
  "remark-lint-gherkin-no-duplicate-tags",
  "remark-lint-gherkin-no-empty-background",
  "remark-lint-gherkin-no-examples-in-scenarios",
  "remark-lint-gherkin-no-files-without-scenarios",
  "remark-lint-gherkin-no-partially-commented-tag-lines",
  "remark-lint-gherkin-no-restricted-patterns",
  "remark-lint-gherkin-no-restricted-tags",
  "remark-lint-gherkin-no-scenario-outlines-without-examples",
  "remark-lint-gherkin-no-superfluous-tags",
  "remark-lint-gherkin-no-unnamed-features",
  "remark-lint-gherkin-no-unnamed-scenarios",
  "remark-lint-gherkin-no-unused-variables",
  "remark-lint-gherkin-one-space-between-tags",
  "remark-lint-gherkin-required-tags",
  "remark-lint-gherkin-scenario-size",
  "remark-lint-gherkin-use-and",
  "remark-lint-gherkin-keywords-in-logical-order",
  "remark-lint-gherkin-only-one-when",
] as const;

export type LintRuleName = (typeof lintRuleNames)[number];
export type LintSettings = { preset: boolean } & Record<LintRuleName, boolean>;

const presetPlugins = (remarkPresetLintGherkinLint.plugins ?? []) as any[];
const lintPlugins = presetPlugins.slice(1);

export const defaultLintSettings: LintSettings = {
  preset: true,
  ...Object.fromEntries(lintRuleNames.map((name) => [name, true])),
} as LintSettings;

export function getLintRuleLabel(name: LintRuleName) {
  return name.replace("remark-lint-gherkin-", "").replaceAll("-", " ");
}

export function lintContent(content: string, settings: LintSettings) {
  const file = new VFile({ value: content });
  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkGherkin);

  if (settings.preset) {
    processor.use(remarkPresetLintGherkinLint as any);
  } else {
    processor.use(remarkLint);
    lintPlugins.forEach((plugin, index) => {
      if (settings[lintRuleNames[index]]) processor.use(plugin);
    });
  }

  const tree = processor.parse(file);
  processor.runSync(tree, file);
  return file.messages;
}
