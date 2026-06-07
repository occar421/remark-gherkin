import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import { testGherkinNode } from "mdast-util-gherkin";

const remarkLintGherkinNoScenarioOutlinesWithoutExamples = lintRule<Root>(
  {
    origin: "remark-lint:gherkin-no-scenario-outlines-without-examples",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-no-scenario-outlines-without-examples#readme",
  },
  (tree, file) => {
    visit(tree, testGherkinNode("segmentLine"), (node, index, parent) => {
      if (!parent || index === undefined) {
        return;
      }

      if (node.data.gherkin.segmentKeyword !== "ScenarioOutline") {
        return;
      }

      // Check if the next segment line is "Examples"
      let hasExamples = false;
      for (let i = index + 1; i < parent.children.length; i++) {
        const nextNode = parent.children[i];
        if (!testGherkinNode("segmentLine")(nextNode)) {
          continue;
        }

        if (nextNode.data.gherkin.segmentKeyword === "Examples") {
          hasExamples = true;
        }

        // Stop at any segment line
        break;
      }

      if (!hasExamples) {
        file.message(`Scenario Outline must have at least one Examples section`, node);
      }
    });
  },
);

export default remarkLintGherkinNoScenarioOutlinesWithoutExamples;
