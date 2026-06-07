import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import { testGherkinNode } from "mdast-util-gherkin";

const remarkLintGherkinNoExamplesInScenarios = lintRule<Root>(
  {
    origin: "remark-lint:gherkin-no-examples-in-scenarios",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-no-examples-in-scenarios#readme",
  },
  (tree, file) => {
    visit(tree, testGherkinNode("segmentLine"), (node, index, parent) => {
      if (!parent || index === undefined) {
        return;
      }

      if (node.data.gherkin.segmentKeyword !== "Examples") {
        return;
      }

      // Look for the preceding segment line
      for (let i = index - 1; i >= 0; i--) {
        const prevNode = parent.children[i];
        if (!testGherkinNode("segmentLine")(prevNode)) {
          continue;
        }

        if (prevNode.data.gherkin.segmentKeyword === "Scenario") {
          file.message("Examples are only allowed in Scenario Outlines, not in Scenarios", node);
        }

        // Stop at any segment line (Scenario, ScenarioOutline, Background, etc.)
        break;
      }
    });
  },
);

export default remarkLintGherkinNoExamplesInScenarios;
