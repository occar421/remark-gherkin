import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import { findBefore } from "unist-util-find-before";
import type { Root } from "mdast";
import { testGherkinNode } from "mdast-util-gherkin";

const remarkLintGherkinNoTagsOnBackgrounds = lintRule<Root>(
  {
    origin: "remark-lint:gherkin-no-tags-on-backgrounds",
    url: "https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-gherkin-no-tags-on-backgrounds#readme",
  },
  (tree, file) => {
    visit(tree, testGherkinNode("segmentLine"), (node) => {
      if (node.data.gherkin.segmentKeyword !== "Background") {
        return;
      }

      const nodeJustBefore = findBefore(tree, node);
      if (nodeJustBefore && testGherkinNode("tagLine")(nodeJustBefore)) {
        file.message("Tags on backgrounds are not allowed", nodeJustBefore);
      }
    });
  },
);

export default remarkLintGherkinNoTagsOnBackgrounds;
