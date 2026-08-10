import { type Preset, type Plugin } from "unified";
import remarkLint from "remark-lint";
import remarkPresetLintGherkinLint from "remark-preset-lint-gherkin-lint";
import { processor } from "./ast-utils.js";
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

const presetPlugins = remarkPresetLintGherkinLint.plugins ?? [];
const lintPlugins = presetPlugins.slice(1);

export const defaultLintSettings: LintSettings = {
  preset: true,
  ...Object.fromEntries(lintRuleNames.map((name) => [name, true])),
} as LintSettings;

export function getLintRuleLabel(name: LintRuleName) {
  return name.replace("remark-lint-gherkin-", "");
}

export function lintContent(content: string, settings: LintSettings) {
  const file = new VFile({ value: content });
  const lintProcessor = processor();
  if (settings.preset) {
    lintProcessor.use(remarkPresetLintGherkinLint as Preset);
  } else {
    lintProcessor.use(remarkLint);
    lintPlugins.forEach((plugin, index) => {
      if (settings[lintRuleNames[index]]) {
        lintProcessor.use(plugin as Plugin);
      }
    });
  }

  const tree = lintProcessor.parse(file);
  lintProcessor.runSync(tree, file);
  return file.messages;
}

type Position = {
  line: number;
  column: number;
};

type Range = {
  start: Position;
  end: Position;
};

export type Marker = {
  range: Range;
  source: string;
  reason: string;
  ruleId: string;
  fatal: boolean;
};

export function transformMessageToMarker(message: VFile["messages"][number]): Marker {
  return {
    range: transformRange(message.place),
    ruleId: message.ruleId ?? "",
    source: message.source ?? "",
    reason: message.reason,
    fatal: !!message.fatal,
  };
}

const emptyRange = { start: { line: 1, column: 1 }, end: { line: 1, column: 2 } };

function transformRange(range: ReturnType<typeof lintContent>[number]["place"]): Marker["range"] {
  if (!range) {
    return emptyRange;
  }

  if ("start" in range) {
    return range;
  }

  if ("offset" in range) {
    return {
      start: { line: range.line, column: range.column },
      end: { line: range.line, column: range.column + 1 },
    };
  }

  return emptyRange;
}
