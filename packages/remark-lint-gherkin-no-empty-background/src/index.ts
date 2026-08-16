import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import type { Root } from "mdast";
import { testGherkinNode } from "mdast-util-gherkin";
import { visit } from "unist-util-visit";
import { findAfterUntil } from "unist-util-find-until";

const remarkLintGherkinNoEmptyBackground = lintRule<Root>(
  {
    origin: "remark-lint:gherkin-no-empty-background",
    url: "https://github.com/occar421/remark-gherkin/tree/main/packages/remark-lint-gherkin-no-empty-background#readme",
  },
  (tree, file) => {
    visit(tree, testGherkinNode("segmentLine"), (node) => {
      if (node.data.gherkin.segmentKeyword !== "Background") {
        return;
      }

      const targets = findAfterUntil(tree, node, testGherkinNode("segmentLine"));

      if (targets.length === 0) {
        file.message("Backgrounds must not be empty", node);
      }
    });
  },
);

export default remarkLintGherkinNoEmptyBackground;
