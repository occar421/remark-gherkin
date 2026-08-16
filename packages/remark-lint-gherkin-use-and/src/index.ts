import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import { findAfterUntil } from "unist-util-find-until";
import type { Root } from "mdast";
import { testGherkinNode } from "mdast-util-gherkin";

const remarkLintGherkinUseAnd = lintRule<Root>(
  {
    origin: "remark-lint:gherkin-use-and",
    url: "https://github.com/occar421/remark-gherkin/tree/main/packages/remark-lint-gherkin-use-and#readme",
  },
  (tree, file) => {
    visit(tree, testGherkinNode("segmentLine"), (segmentLine, _index, parent) => {
      if (!parent) {
        return;
      }

      const segmentKeyword = segmentLine.data.gherkin.segmentKeyword;
      if (
        segmentKeyword !== "Background" &&
        segmentKeyword !== "Scenario" &&
        segmentKeyword !== "ScenarioOutline"
      ) {
        return;
      }

      const targetNodes = findAfterUntil(parent, segmentLine, testGherkinNode("segmentLine"));

      let previousKeyword: string | undefined = undefined;
      for (const node of targetNodes) {
        if (testGherkinNode("stepLine")(node)) {
          break;
        }

        visit(node, testGherkinNode("stepLine"), (stepLine) => {
          const keyword = stepLine.data.gherkin.stepKeyword;

          if (keyword === "And") {
            return;
          }

          if (keyword === "But") {
            previousKeyword = undefined;
            return;
          }

          if (keyword === previousKeyword) {
            file.message(`Step "${keyword}" should use And instead of ${keyword}`, stepLine);
          }

          previousKeyword = keyword;
        });
      }
    });
  },
);

export default remarkLintGherkinUseAnd;
