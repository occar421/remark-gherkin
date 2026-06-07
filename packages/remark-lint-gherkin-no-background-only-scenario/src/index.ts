import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import type { GherkinSegmentLine, Root } from "mdast";
import { testGherkinNode } from "mdast-util-gherkin";

const remarkLintGherkinNoBackgroundOnlyScenario = lintRule<Root>(
  {
    origin: "remark-lint:gherkin-no-background-only-scenario",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-no-background-only-scenario#readme",
  },
  (tree, file) => {
    let backgroundNode: GherkinSegmentLine | undefined;
    let scenarioCount = 0;

    visit(tree, testGherkinNode("segmentLine"), (node) => {
      for (const child of node.children) {
        if (testGherkinNode("segmentKeyword")(child)) {
          const keyword = child.data.gherkin.keyword;

          if (keyword === "Background") {
            backgroundNode = node;
          } else if (keyword === "Scenario" || keyword === "ScenarioOutline") {
            scenarioCount++;
          }
          return;
        }
      }
    });

    if (backgroundNode && scenarioCount === 1) {
      file.message(
        "Backgrounds are only allowed when there is more than one scenario",
        backgroundNode,
      );
    }
  },
);

export default remarkLintGherkinNoBackgroundOnlyScenario;
