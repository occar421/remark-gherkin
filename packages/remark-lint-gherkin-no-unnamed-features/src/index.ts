import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import { getSegmentName, testGherkinNode } from "mdast-util-gherkin";

const remarkLintGherkinNoUnnamedFeatures = lintRule<Root>(
  {
    origin: "remark-lint:gherkin-no-unnamed-features",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-no-unnamed-features#readme",
  },
  (tree, file) => {
    visit(tree, testGherkinNode("segmentLine"), (node) => {
      if (node.data.gherkin.segmentKeyword === "Feature") {
        const name = getSegmentName(node);

        if (!name || name.trim().length === 0) {
          file.message("Missing Feature name", node);
        }
      }
    });
  },
);

export default remarkLintGherkinNoUnnamedFeatures;
