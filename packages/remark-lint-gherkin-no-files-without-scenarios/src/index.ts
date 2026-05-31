import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";

const remarkLintGherkinNoFilesWithoutScenarios = lintRule<Root>(
  {
    origin: "remark-lint:gherkin-no-files-without-scenarios",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-no-files-without-scenarios#readme",
  },
  (tree, file) => {
    let scenarioCount = 0;
    let featureFound = false;

    visit(tree, "heading", (heading) => {
      if (heading.data?.gherkin?.type !== "segmentLine") {
        return;
      }

      const segmentKeyword = heading.data.gherkin.segmentKeyword;

      switch (segmentKeyword) {
        case "Feature":
          featureFound = true;
          return;
        case "Scenario":
        case "ScenarioOutline":
          scenarioCount++;
          return;
        default:
          return;
      }
    });

    if (featureFound && scenarioCount === 0) {
      file.message("Feature files must have at least one scenario");
    }
  },
);

export default remarkLintGherkinNoFilesWithoutScenarios;
