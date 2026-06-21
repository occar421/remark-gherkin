import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import { findAfter } from "unist-util-find-after";
import { findBetween } from "unist-util-find-between";
import { findAllAfter } from "unist-util-find-all-after";
import type { Root } from "mdast";
import { testGherkinNode } from "mdast-util-gherkin";

const remarkLintGherkinKeywordsInLogicalOrder = lintRule<Root>(
  {
    origin: "remark-lint:gherkin-keywords-in-logical-order",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-keywords-in-logical-order#readme",
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

      const nextSegmentLine = findAfter(parent, segmentLine, testGherkinNode("segmentLine"));
      const targetNodes = nextSegmentLine
        ? findBetween(parent, segmentLine, nextSegmentLine)
        : findAllAfter(parent, segmentLine);

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
