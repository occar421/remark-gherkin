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

    expect(() => lintContent("# Feature: Long\n", settings)).not.toThrow();
  });

  test("keeps preset behavior independent from individual options", () => {
    const base = { ...defaultLintSettings, preset: true };
    const changed = { ...base, options: { "remark-lint-gherkin-name-length": { Feature: 0 } } };
    expect(
      lintContent("# Feature: A reasonably long feature name\n", changed).map(
        (message) => message.ruleId,
      ),
    ).toEqual(
      lintContent("# Feature: A reasonably long feature name\n", base).map(
        (message) => message.ruleId,
      ),
    );
  });
});
