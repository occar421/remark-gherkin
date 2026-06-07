import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import { testGherkinNode } from "mdast-util-gherkin";

const remarkLintGherkinUpToOneBackgroundPerFile = lintRule<Root>(
  {
    origin: "remark-lint:gherkin-up-to-one-background-per-file",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-up-to-one-background-per-file#readme",
  },
  (tree, file) => {
    let backgroundCount = 0;

    visit(tree, testGherkinNode("segmentLine"), (node) => {
      if (node.data.gherkin.segmentKeyword === "Background") {
        backgroundCount++;
        if (backgroundCount > 1) {
          file.message("Only one background is allowed per file", node);
        }
      }
    });
  },
);

export default remarkLintGherkinUpToOneBackgroundPerFile;
