import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import { findAfter } from "unist-util-find-after";
import type { Root } from "mdast";
import { testGherkinNode } from "mdast-util-gherkin";
import { findBetween } from "unist-util-find-between";
import { findAllAfter } from "unist-util-find-all-after";

export interface Options {
  "steps-length"?: {
    Background?: number;
    Scenario?: number;
  };
}

const remarkLintGherkinScenarioSize = lintRule<Root, Options>(
  {
    origin: "remark-lint:gherkin-scenario-size",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-scenario-size#readme",
  },
  (tree, file, options) => {
    const limits = {
      Background: options?.["steps-length"]?.Background ?? 15,
      Scenario: options?.["steps-length"]?.Scenario ?? 15,
    };

    visit(tree, testGherkinNode("segmentLine"), (segmentLine, _index, parent) => {
      if (!parent) {
        return;
      }

      const keyword = segmentLine.data.gherkin.segmentKeyword;
      const limitKey =
        keyword === "Background"
          ? "Background"
          : keyword === "Scenario" || keyword === "ScenarioOutline"
            ? "Scenario"
            : null;

      if (!limitKey) {
        return;
      }

      const nextSegmentLine = findAfter(parent, segmentLine, testGherkinNode("segmentLine"));

      const targetNodes = nextSegmentLine
        ? findBetween(parent, segmentLine, nextSegmentLine)
        : findAllAfter(parent, segmentLine);

      let count = 0;
      for (const node of targetNodes) {
        visit(node, testGherkinNode("stepLine"), () => {
          count++;
        });
      }

      if (count > limits[limitKey]) {
        file.message(
          `Expected ${limitKey} to have at most ${limits[limitKey]} steps, but found ${count}`,
          segmentLine,
        );
      }
    });
  },
);

export default remarkLintGherkinScenarioSize;
