import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import type { Root } from "mdast";

const remarkLintGherkinNoEmptyBackground = lintRule<Root>(
  {
    origin: "remark-lint:gherkin-no-empty-background",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-no-empty-background#readme",
  },
  (tree, file) => {
    for (let i = 0; i < tree.children.length; i++) {
      const node = tree.children[i];
      if (node.type !== "heading") {
        continue;
      }

      const gherkinData = node.data?.gherkin;
      if (gherkinData?.type !== "segmentLine" || gherkinData.segmentKeyword !== "Background") {
        continue;
      }

      const nextNode = tree.children[i + 1];
      const isEmpty =
        !nextNode ||
        nextNode.type !== "list" ||
        nextNode.children.every((item) => item.data?.gherkin?.type !== "stepLine");

      if (isEmpty) {
        file.message("Backgrounds must not be empty", node);
      }
    }
  },
);

export default remarkLintGherkinNoEmptyBackground;
