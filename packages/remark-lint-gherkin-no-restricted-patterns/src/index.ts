import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import type { Node, Root } from "mdast";
import { getSegmentName, getStepName, testGherkinNode } from "mdast-util-gherkin";
import { toString } from "mdast-util-to-string";

export type RestrictedPatterns = {
  Global?: string[];
  Feature?: string[];
  Rule?: string[];
  Background?: string[];
  Scenario?: string[];
  ScenarioOutline?: string[];
  Examples?: string[];
  Step?: string[];
  Description?: string[];
};

const remarkLintGherkinNoRestrictedPatterns = lintRule<Root, RestrictedPatterns>(
  {
    origin: "remark-lint:gherkin-no-restricted-patterns",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-no-restricted-patterns#readme",
  },
  (tree, file, options) => {
    if (!options || Object.keys(options).length === 0) {
      return;
    }

    const patternsMap = new Map<string, RegExp[]>();
    for (const [label, patterns] of Object.entries(options)) {
      if (patterns) {
        patternsMap.set(
          label,
          patterns.map((p) => new RegExp(p, "i")),
        );
      }
    }

    const check = (node: Node, text: string, label: string) => {
      const regexes = patternsMap.get(label);
      const originalPatterns = options[label as keyof RestrictedPatterns];
      if (!regexes || !originalPatterns) return;

      regexes.forEach((regex, index) => {
        if (regex.test(text!)) {
          file.message(
            `Restricted pattern match found for ${label}: "${originalPatterns[index]}"`,
            node,
          );
        }
      });
    };

    visit(tree, testGherkinNode("segmentLine"), (node) => {
      const text = getSegmentName(node);
      if (!text) return;

      check(node, text, "Global");
      check(node, text, node.data.gherkin.segmentKeyword);
    });

    visit(tree, testGherkinNode("stepLine"), (node) => {
      const text = getStepName(node);
      if (!text) return;

      check(node, text, "Global");
      check(node, text, "Step");
    });

    visit(tree, testGherkinNode("description"), (node) => {
      console.log(node);
      const text = toString(node);
      if (!text) return;

      check(node, text, "Global");
      check(node, text, "Description");
    });
  },
);

export default remarkLintGherkinNoRestrictedPatterns;
