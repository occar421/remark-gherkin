import { expect, test, describe } from "vite-plus/test";
import {
  processor,
  filterNode,
  findPathAt,
  getNodeAtPath,
  getPositionAtPath,
} from "../src/lib/ast-utils.js";
import { getItemLabel } from "../src/components/JsonViewer/JsonItem.js";
import {
  defaultLintSettings,
  getLintRuleLabel,
  lintContent,
  lintRuleNames,
  normalizeLintOptions,
} from "../src/lib/lint-utils.js";
import { mergeStoredLintSettings } from "../src/hooks/useLintSettings.js";

const gherkin = `# Feature: Hello
## Scenario: World
* Given a step
`;

describe("logic", () => {
  test("filterNode should hide location", () => {
    const tree = processor.parse(gherkin);
    const filtered = filterNode(tree, {
      hideLocation: true,
      hideMethods: true,
      hideEmpty: false,
      hideType: false,
    });

    // root node's position should be gone
    expect(filtered.position).toBeUndefined();
  });

  test("filterNode should hide type", () => {
    const tree = processor.parse(gherkin);
    const filtered = filterNode(tree, {
      hideLocation: false,
      hideMethods: true,
      hideEmpty: false,
      hideType: true,
    });

    expect(filtered.type).toBeUndefined();
  });

  test("findPathAt should find correct path", () => {
    const tree = processor.parse(gherkin);
    // "Feature: Hello" is at line 1
    const path = findPathAt(tree, 1, 1);
    expect(path).toBeDefined();
    expect(path).toContain("children");
    expect(path).toContain("0");
  });

  test("getNodeAtPath should return the node at an AST path", () => {
    const tree = processor.parse(gherkin);
    const path = findPathAt(tree, 1, 1);
    expect(getNodeAtPath(tree, path!)).toBe(tree.children[0]);
  });

  test("getPositionAtPath should use the nearest positioned ancestor", () => {
    const tree = processor.parse(gherkin);
    const path = findPathAt(tree, 1, 1);
    const textPath = [...path!, "title", "value"];

    expect(getPositionAtPath(tree, textPath)).toEqual(tree.children[0].position);
  });

  test("getItemLabel should use node types for object items", () => {
    expect(getItemLabel("0", { type: "heading" })).toBe("heading");
    expect(getItemLabel("0", { type: "heading", data: { gherkin: { type: "segmentLine" } } })).toBe(
      "heading (segmentLine)",
    );
    expect(getItemLabel("0", "value")).toBe("0");
  });

  test("lintContent should report a warning with a source position", () => {
    const messages = lintContent("# Feature:\n", defaultLintSettings);

    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0].line).toBe(1);
    expect(messages[0].column).toBeGreaterThan(0);
    expect(messages[0].fatal).toBeFalsy();
  });

  test("lintContent should respect individual rule settings", () => {
    const settings = { ...defaultLintSettings };
    settings.preset = false;
    for (const name of lintRuleNames) {
      settings[name] = false;
    }

    expect(lintContent("# Feature:\n", settings)).toHaveLength(0);
    expect(getLintRuleLabel("remark-lint-gherkin-no-unnamed-features")).toBe("no-unnamed-features");
  });

  test("preset should run all rules regardless of child settings", () => {
    const settings = { ...defaultLintSettings, preset: true };
    for (const name of lintRuleNames) {
      settings[name] = false;
    }

    expect(lintContent("# Feature:\n", settings).length).toBeGreaterThan(0);
  });

  test("normalizes empty and invalid rule options safely", () => {
    expect(
      normalizeLintOptions("remark-lint-gherkin-allowed-tags", {
        tags: [" @smoke ", ""],
        patterns: ["[", "^@ok$"],
      }),
    ).toEqual({
      tags: ["@smoke"],
      patterns: ["^@ok$"],
    });
    expect(
      normalizeLintOptions("remark-lint-gherkin-name-length", { Feature: -1, Scenario: 20 }),
    ).toEqual({ Scenario: 20 });
    expect(
      normalizeLintOptions("remark-lint-gherkin-no-dupe-scenario-names", "invalid" as never),
    ).toBeUndefined();
  });

  test("passes individual rule options to lint", () => {
    const settings = {
      ...defaultLintSettings,
      preset: false,
      options: {
        "remark-lint-gherkin-name-length": { Feature: 3 },
      },
    };
    for (const name of lintRuleNames) {
      settings[name] = name === "remark-lint-gherkin-name-length";
    }

    const messages = lintContent("# Feature: Long\n", settings);

    expect(messages).toContainEqual(
      expect.objectContaining({
        ruleId: "gherkin-name-length",
        message: "Expected Feature name to be at most 3 characters, but found 4",
      }),
    );
  });

  test("applies individual options while preset is enabled", () => {
    const base = { ...defaultLintSettings, preset: true };
    const changed = { ...base, options: { "remark-lint-gherkin-name-length": { Feature: 0 } } };
    const messages = lintContent("# Feature: Long\n", changed);

    expect(messages).toContainEqual(
      expect.objectContaining({
        ruleId: "gherkin-name-length",
        message: "Expected Feature name to be at most 0 characters, but found 4",
      }),
    );
  });

  test("applies restricted patterns saved by the settings panel", () => {
    const settings = {
      ...defaultLintSettings,
      preset: false,
      options: {
        "remark-lint-gherkin-no-restricted-patterns": {
          patterns: { Global: ["die"] },
        },
      },
    };
    for (const name of lintRuleNames) {
      settings[name] = name === "remark-lint-gherkin-no-restricted-patterns";
    }

    const messages = lintContent("# Feature: Test\n## Rule: If you die\n", settings as never);

    expect(messages).toContainEqual(
      expect.objectContaining({
        ruleId: "gherkin-no-restricted-patterns",
        message: 'Restricted pattern match found for Global: "die"',
      }),
    );
  });

  test("applies scenario size options saved by the settings panel", () => {
    const settings = {
      ...defaultLintSettings,
      preset: false,
      options: {
        "remark-lint-gherkin-scenario-size": {
          "steps-length": { Scenario: ["1"] },
        },
      },
    };
    for (const name of lintRuleNames) {
      settings[name] = name === "remark-lint-gherkin-scenario-size";
    }

    const messages = lintContent(
      "# Feature: Test\n## Scenario: Test\n* Given step 1\n* And step 2\n",
      settings as never,
    );

    expect(messages).toContainEqual(
      expect.objectContaining({
        ruleId: "gherkin-scenario-size",
        message: "Expected Scenario to have at most 1 steps, but found 2",
      }),
    );
  });

  test("restores lint settings and normalizes stored options", () => {
    const name = "remark-lint-gherkin-name-length";
    const restored = mergeStoredLintSettings({
      preset: false,
      [name]: true,
      options: { [name]: { Feature: 3, Scenario: -1 } },
    });

    expect(restored.preset).toBe(false);
    expect(restored[name]).toBe(true);
    expect(restored.options?.[name]).toEqual({ Feature: 3 });
    expect(restored["remark-lint-gherkin-use-and"]).toBe(true);
  });

  test("falls back to defaults for malformed stored settings", () => {
    expect(mergeStoredLintSettings(null)).toEqual(defaultLintSettings);
    expect(mergeStoredLintSettings("invalid")).toEqual(defaultLintSettings);
  });
});
