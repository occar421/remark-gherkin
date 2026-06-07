import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import { testGherkinNode } from "mdast-util-gherkin";

const remarkLintGherkinOneFeaturePerFile = lintRule<Root>(
  {
    origin: "remark-lint:gherkin-one-feature-per-file",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-one-feature-per-file#readme",
  },
  (tree, file) => {
    let featureCount = 0;

    visit(tree, testGherkinNode("segmentLine"), (node) => {
      if (node.data.gherkin.segmentKeyword === "Feature") {
        featureCount++;
        if (featureCount > 1) {
          file.message("Only one feature is allowed per file", node);
        }
      }
    });
  },
);

export default remarkLintGherkinOneFeaturePerFile;
