import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import { findAfterUntil } from "unist-util-find-until";
import type { Root } from "mdast";
import { testGherkinNode } from "mdast-util-gherkin";

const remarkLintGherkinOnlyOneWhen = lintRule<Root>(
  {
    origin: "remark-lint:gherkin-only-one-when",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-only-one-when#readme",
  },
  (tree, file) => {
    visit(tree, testGherkinNode("segmentLine"), (segmentLine, _index, parent) => {
      if (!parent) {
        return;
      }

      const segmentKeyword = segmentLine.data.gherkin.segmentKeyword;
      if (segmentKeyword !== "Scenario" && segmentKeyword !== "ScenarioOutline") {
        return;
      }

      const targetNodes = findAfterUntil(parent, segmentLine, testGherkinNode("segmentLine"));

      let whenCount = 0;
      for (const node of targetNodes) {
        visit(node, testGherkinNode("stepLine"), (stepLine) => {
          const keyword = stepLine.data.gherkin.stepKeyword;

          if (keyword === "When") {
            whenCount++;
            if (whenCount > 1) {
              file.message('Step "When" should not appear more than once per scenario', stepLine);
            }
          }
        });
      }
    });
  },
);

export default remarkLintGherkinOnlyOneWhen;
