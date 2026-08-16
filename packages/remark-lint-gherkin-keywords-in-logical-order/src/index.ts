import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import { findAfterUntil } from "unist-util-find-until";
import type { Root } from "mdast";
import { testGherkinNode } from "mdast-util-gherkin";

const remarkLintGherkinKeywordsInLogicalOrder = lintRule<Root>(
  {
    origin: "remark-lint:gherkin-keywords-in-logical-order",
    url: "https://github.com/occar421/remark-gherkin/tree/main/packages/remark-lint-gherkin-keywords-in-logical-order#readme",
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

      let currentStepNumber: number | undefined = undefined;
      for (const node of targetNodes) {
        visit(node, testGherkinNode("stepLine"), (stepLine) => {
          const keyword = stepLine.data.gherkin.stepKeyword;

          let newStepNumber = -1;
          switch (keyword) {
            case "And":
            case "But":
              return;
            case "Given":
              newStepNumber = 0;
              break;
            case "When":
              newStepNumber = 1;
              break;
            case "Then":
              newStepNumber = 2;
              break;
          }

          if (currentStepNumber === undefined) {
            currentStepNumber = newStepNumber;
            return;
          }

          if (newStepNumber < currentStepNumber) {
            file.message(
              `Step "${keyword}" should not appear after "${["Given", "When", "Then"][currentStepNumber]}"`,
              stepLine,
            );
          }

          currentStepNumber = Math.max(currentStepNumber, newStepNumber);
        });
      }
    });
  },
);

export default remarkLintGherkinKeywordsInLogicalOrder;
