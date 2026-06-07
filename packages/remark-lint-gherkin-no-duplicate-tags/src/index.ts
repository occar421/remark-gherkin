import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import { testGherkinNode } from "mdast-util-gherkin";

const remarkLintGherkinNoDuplicateTags = lintRule<Root>(
  {
    origin: "remark-lint:gherkin-no-duplicate-tags",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-no-duplicate-tags#readme",
  },
  (tree, file) => {
    visit(tree, testGherkinNode("tagLine"), (node) => {
      const tags = new Set<string>();

      for (const child of node.children) {
        if (testGherkinNode("tag")(child)) {
          const tag = child.data.gherkin.ident;
          if (tags.has(tag)) {
            file.message(`Duplicate tag "@${tag}"`, child);
          } else {
            tags.add(tag);
          }
        }
      }
    });
  },
);

export default remarkLintGherkinNoDuplicateTags;
