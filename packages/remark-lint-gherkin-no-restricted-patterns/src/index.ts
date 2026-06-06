import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import { getSegmentName, getStepName } from "mdast-util-gherkin";

export type RestrictedPatterns = {
  Global?: string[];
  Feature?: string[];
  Rule?: string[];
  Background?: string[];
  Scenario?: string[];
  ScenarioOutline?: string[];
  Examples?: string[];
  Step?: string[];
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

    visit(tree, (node) => {
      let text: string | undefined;
      let keyword: string | undefined;

      if (node.type === "heading" && node.data?.gherkin?.type === "segmentLine") {
        text = getSegmentName(node);
        keyword = node.data.gherkin.segmentKeyword;
      } else if (node.type === "listItem" && node.data?.gherkin?.type === "stepLine") {
        text = getStepName(node);
        keyword = "Step";
      }

      if (!text || !keyword) return;

      const check = (label: string) => {
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

      check("Global");
      check(keyword);
    });
  },
);

export default remarkLintGherkinNoRestrictedPatterns;
