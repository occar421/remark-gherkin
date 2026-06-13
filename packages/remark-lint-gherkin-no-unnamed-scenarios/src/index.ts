import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import { getSegmentName, testGherkinNode } from "mdast-util-gherkin";

const remarkLintGherkinNoUnnamedScenarios = lintRule<Root>(
  {
    origin: "remark-lint:gherkin-no-unnamed-scenarios",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-no-unnamed-scenarios#readme",
  },
  (tree, file) => {
    visit(tree, testGherkinNode("segmentLine"), (node) => {
      if (
        node.data.gherkin.segmentKeyword === "Scenario" ||
        node.data.gherkin.segmentKeyword === "ScenarioOutline"
      ) {
        const name = getSegmentName(node);
        const segmentKeyword =
          node.data.gherkin.segmentKeyword === "ScenarioOutline"
            ? "Scenario Outline"
            : node.data.gherkin.segmentKeyword;

        if (!name || name.trim().length === 0) {
          file.message(`Missing ${segmentKeyword} name`, node);
        }
      }
    });
  },
);

export default remarkLintGherkinNoUnnamedScenarios;
