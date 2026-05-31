import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import { getSegmentName } from "mdast-util-gherkin";

const remarkLintGherkinNoDupeScenarioNames = lintRule<Root>(
  {
    origin: "remark-lint:gherkin-no-dupe-scenario-names",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-no-dupe-scenario-names#readme",
  },
  (tree, file) => {
    const names = new Set<string>();

    visit(tree, "heading", (node) => {
      if (
        node.data?.gherkin?.type === "segmentLine" &&
        ["Scenario", "ScenarioOutline"].includes(node.data.gherkin.segmentKeyword)
      ) {
        const name = getSegmentName(node);
        if (name === undefined) return;

        if (names.has(name)) {
          file.message(`Scenario name "${name}" is already used`, node);
        } else {
          names.add(name);
        }
      }
    });
  },
);

export default remarkLintGherkinNoDupeScenarioNames;
