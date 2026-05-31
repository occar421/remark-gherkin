import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import type { Heading } from "mdast";

const remarkLintGherkinNoBackgroundOnlyScenario = lintRule<Root>(
  {
    origin: "remark-lint:gherkin-no-background-only-scenario",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-no-background-only-scenario#readme",
  },
  (tree, file) => {
    let backgroundNode: Heading | undefined;
    let scenarioCount = 0;

    visit(tree, "heading", (heading) => {
      const gherkinData = heading.data?.gherkin;
      if (gherkinData?.type !== "segmentLine") {
        return;
      }

      for (const child of heading.children) {
        if (child.data?.gherkin?.type === "segmentKeyword") {
          const keyword = child.data?.gherkin.keyword;

          if (keyword === "Background") {
            backgroundNode = heading;
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
