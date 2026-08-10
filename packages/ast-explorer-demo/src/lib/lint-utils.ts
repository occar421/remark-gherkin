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

export type LintRuleOptions = {
  "remark-lint-gherkin-allowed-tags": { tags?: string[]; patterns?: string[] };
  "remark-lint-gherkin-max-scenarios-per-file": {
    maxScenarios?: number;
    countOutlineExamples?: boolean;
  };
  "remark-lint-gherkin-name-length": {
    Feature?: number;
    Scenario?: number;
    Step?: number;
  };
  "remark-lint-gherkin-no-dupe-scenario-names": "in-feature" | "anywhere-in-file";
  "remark-lint-gherkin-no-restricted-patterns": Partial<
    Record<
      | "Global"
      | "Feature"
      | "Rule"
      | "Background"
      | "Scenario"
      | "ScenarioOutline"
      | "Examples"
      | "Step"
      | "Description",
      string[]
    >
  >;
  "remark-lint-gherkin-no-restricted-tags": { tags?: string[]; patterns?: string[] };
  "remark-lint-gherkin-required-tags": { tags?: string[]; ignoreUntagged?: boolean };
  "remark-lint-gherkin-scenario-size": {
    "steps-length"?: { Background?: number; Scenario?: number };
  };
};

export type LintOptions = Partial<{ [Name in keyof LintRuleOptions]: LintRuleOptions[Name] }>;
export type LintSettings = { preset: boolean; options?: LintOptions } & Record<
  LintRuleName,
  boolean
>;

export type LintOptionDescriptor = {
  label: string;
  description: string;
  type: "number" | "boolean" | "select" | "array" | "categorized-array";
  default?: string | number | boolean;
  choices?: readonly string[];
};

export const lintRuleOptionDescriptors: Partial<
  Record<LintRuleName, Record<string, LintOptionDescriptor>>
> = {
  "remark-lint-gherkin-allowed-tags": {
    tags: { label: "Allowed tags", description: "Tags accepted by the rule.", type: "array" },
    patterns: {
      label: "Allowed patterns",
      description: "Regular expressions accepted by the rule.",
      type: "array",
    },
  },
  "remark-lint-gherkin-max-scenarios-per-file": {
    maxScenarios: {
      label: "Maximum scenarios",
      description: "Maximum number of scenarios in a file.",
      type: "number",
      default: 10,
    },
    countOutlineExamples: {
      label: "Count outline examples",
      description: "Count each Examples row as a scenario.",
      type: "boolean",
      default: true,
    },
  },
  "remark-lint-gherkin-name-length": Object.fromEntries(
    ["Feature", "Scenario", "Step"].map((name) => [
      name,
      {
        label: `${name} name length`,
        description: `Maximum ${name} name length.`,
        type: "number",
        default: 70,
      },
    ]),
  ),
  "remark-lint-gherkin-no-dupe-scenario-names": {
    scope: {
      label: "Scope",
      description: "Where duplicate names are compared.",
      type: "select",
      default: "anywhere-in-file",
      choices: ["in-feature", "anywhere-in-file"],
    },
  },
  "remark-lint-gherkin-no-restricted-patterns": {
    patterns: {
      label: "Restricted patterns",
      description: "Regular expressions by Gherkin element.",
      type: "categorized-array",
    },
  },
  "remark-lint-gherkin-no-restricted-tags": {
    tags: { label: "Restricted tags", description: "Tags rejected by the rule.", type: "array" },
    patterns: {
      label: "Restricted patterns",
      description: "Regular expressions for rejected tags.",
      type: "array",
    },
  },
  "remark-lint-gherkin-required-tags": {
    tags: {
      label: "Required tags",
      description: "Regular expressions that required tags must match.",
      type: "array",
    },
    ignoreUntagged: {
      label: "Ignore untagged scenarios",
      description: "Do not report scenarios without local tags.",
      type: "boolean",
      default: true,
    },
  },
  "remark-lint-gherkin-scenario-size": {
    "steps-length": {
      label: "Step limits",
      description: "Maximum steps in Background and Scenario.",
      type: "categorized-array",
      default: 15,
    },
  },
};

const presetPlugins = (remarkPresetLintGherkinLint as Preset).plugins ?? [];
const lintPlugins: Plugin[] = presetPlugins.slice(1) as Plugin[];

export const defaultLintSettings: LintSettings = {
  preset: true,
  ...Object.fromEntries(lintRuleNames.map((name) => [name, true])),
} as LintSettings;

export function getLintRuleLabel(name: LintRuleName) {
  return name.replace("remark-lint-gherkin-", "");
}

function normalizePatterns(patterns: unknown) {
  if (!Array.isArray(patterns)) {
    return undefined;
  }
  return patterns.filter((pattern): pattern is string => {
    if (typeof pattern !== "string" || pattern.trim() === "") {
      return false;
    }
    try {
      new RegExp(pattern);
      return true;
    } catch {
      return false;
    }
  });
}

function normalizeStrings(value: unknown) {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string" && item.trim() !== "")
        .map((item) => item.trim())
    : undefined;
}

function normalizeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : undefined;
}

export function normalizeLintOptions<Name extends keyof LintRuleOptions>(
  name: Name,
  options: LintRuleOptions[Name] | undefined,
): LintRuleOptions[Name] | undefined {
  if (options === undefined) {
    return undefined;
  }
  if (name === "remark-lint-gherkin-no-dupe-scenario-names") {
    return options === "in-feature" || options === "anywhere-in-file" ? options : undefined;
  }
  if (name === "remark-lint-gherkin-no-restricted-patterns") {
    return Object.fromEntries(
      Object.entries(options)
        .map(([key, value]) => [key, normalizePatterns(value)])
        .filter(([, value]) => value !== undefined),
    ) as LintRuleOptions[Name];
  }
  const source = options as Record<string, unknown>;
  if (
    name === "remark-lint-gherkin-allowed-tags" ||
    name === "remark-lint-gherkin-no-restricted-tags" ||
    name === "remark-lint-gherkin-required-tags"
  ) {
    return {
      ...source,
      tags: normalizeStrings(source.tags),
      patterns: normalizePatterns(source.patterns),
    } as LintRuleOptions[Name];
  }
  if (
    name === "remark-lint-gherkin-max-scenarios-per-file" ||
    name === "remark-lint-gherkin-name-length"
  ) {
    return Object.fromEntries(
      Object.entries(source)
        .map(([key, value]) => [
          key,
          key === "countOutlineExamples"
            ? typeof value === "boolean"
              ? value
              : undefined
            : normalizeNumber(value),
        ])
        .filter(([, value]) => value !== undefined),
    ) as LintRuleOptions[Name];
  }
  if (name === "remark-lint-gherkin-scenario-size") {
    const limits = source["steps-length"] as Record<string, unknown> | undefined;
    return {
      "steps-length":
        limits &&
        Object.fromEntries(
          Object.entries(limits)
            .map(([key, value]) => [key, normalizeNumber(value)])
            .filter(([, value]) => value !== undefined),
        ),
    } as LintRuleOptions[Name];
  }
  return undefined;
}

export function lintContent(content: string, settings: LintSettings) {
  const file = new VFile({ value: content });
  const lintProcessor = processor();
  if (settings.preset) {
    lintProcessor.use(remarkPresetLintGherkinLint as Preset);
  } else {
    lintProcessor.use(remarkLint);
    lintPlugins.forEach((plugin, index) => {
      const name = lintRuleNames[index];
      if (settings[name]) {
        const options = normalizeLintOptions(
          name as keyof LintRuleOptions,
          settings.options?.[name as keyof LintRuleOptions],
        );
        lintProcessor.use(plugin, options as never);
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
