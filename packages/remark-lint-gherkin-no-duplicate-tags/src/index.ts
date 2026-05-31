import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import type { Root, Paragraph } from "mdast";
import { toString } from "mdast-util-to-string";

const remarkLintGherkinNoDuplicateTags = lintRule<Root>(
  {
    origin: "remark-lint:gherkin-no-duplicate-tags",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-no-duplicate-tags#readme",
  },
  (tree, file) => {
    visit(tree, "paragraph", (node) => {
      if (node.data?.gherkin?.type === "tagLine") {
        const paragraph = node as Paragraph;
        const tags = new Set<string>();

        for (const child of paragraph.children) {
          if (child.type === "inlineCode" && child.data?.gherkin?.type === "tag") {
            const tag = toString(child);
            if (tags.has(tag)) {
              file.message(`Duplicate tag "${tag}"`, child);
            } else {
              tags.add(tag);
            }
          }
        }
      }
    });
  },
);

export default remarkLintGherkinNoDuplicateTags;
