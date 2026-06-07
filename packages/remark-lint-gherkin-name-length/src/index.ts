import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import { getSegmentName, getStepName, testGherkinNode } from "mdast-util-gherkin";

export interface Options {
  Feature?: number;
  Scenario?: number;
  Step?: number;
}

const remarkLintGherkinNameLength = lintRule<Root, Options>(
  {
    origin: "remark-lint:gherkin-name-length",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-name-length#readme",
  },
  (tree, file, options) => {
    const limits = {
      feature: options?.Feature ?? 70,
      scenario: options?.Scenario ?? 70,
      step: options?.Step ?? 70,
    };

    visit(tree, testGherkinNode("segmentLine"), (node) => {
      const keyword = node.data.gherkin.segmentKeyword;

      const limitKey =
        keyword === "Feature"
          ? "feature"
          : keyword === "Scenario" || keyword === "ScenarioOutline"
            ? "scenario"
            : null;

      if (!limitKey) {
        return;
      }

      const name = getSegmentName(node) ?? "";
      const limit = limits[limitKey];
      if (name.length > limit) {
        file.message(
          `Expected ${
            {
              feature: "Feature",
              scenario: "Scenario",
            }[limitKey]
          } name to be at most ${limit} characters, but found ${name.length}`,
          node,
        );
      }
    });

    visit(tree, testGherkinNode("stepLine"), (node) => {
      const name = getStepName(node) ?? "";
      const limit = limits.step;
      if (name.length > limit) {
        file.message(
          `Expected Step name to be at most ${limit} characters, but found ${name.length}`,
          node,
        );
      }
    });
  },
);

export default remarkLintGherkinNameLength;
