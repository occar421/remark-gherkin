import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import { getSegmentName, testGherkinNode } from "mdast-util-gherkin";

export type Options = "in-feature" | "anywhere-in-file";

const remarkLintGherkinNoDupeScenarioNames = lintRule<Root, Options>(
  {
    origin: "remark-lint:gherkin-no-dupe-scenario-names",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-no-dupe-scenario-names#readme",
  },
  (tree, file, options?: Options) => {
    const names = new Set<string>();

    visit(tree, testGherkinNode("segmentLine"), (node) => {
      switch (node.data.gherkin.segmentKeyword) {
        case "Feature":
          if (options === "in-feature") {
            names.clear();
          }
          break;
        case "Scenario":
        case "ScenarioOutline":
          const name = getSegmentName(node);
          if (name === undefined) return;

          if (names.has(name)) {
            file.message(`Scenario name "${name}" is already used`, node);
          } else {
            names.add(name);
          }
          break;
      }
    });
  },
);

export default remarkLintGherkinNoDupeScenarioNames;
