import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import type { Root } from "mdast";
import { testGherkinNode } from "mdast-util-gherkin";

const remarkLintGherkinNoEmptyBackground = lintRule<Root>(
  {
    origin: "remark-lint:gherkin-no-empty-background",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-no-empty-background#readme",
  },
  (tree, file) => {
    for (let i = 0; i < tree.children.length; i++) {
      const node = tree.children[i];
      if (!testGherkinNode("segmentLine")(node)) {
        continue;
      }

      if (node.data.gherkin.segmentKeyword !== "Background") {
        continue;
      }

      const nextNode = tree.children[i + 1];
      const isEmpty =
        !nextNode ||
        nextNode.type !== "list" ||
        nextNode.children.every((item) => !testGherkinNode("stepLine")(item));

      if (isEmpty) {
        file.message("Backgrounds must not be empty", node);
      }
    }
  },
);

export default remarkLintGherkinNoEmptyBackground;
