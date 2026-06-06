import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";

const remarkLintGherkinNoPartiallyCommentedTagLines = lintRule<Root>(
  {
    origin: "remark-lint:gherkin-no-partially-commented-tag-lines",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-no-partially-commented-tag-lines#readme",
  },
  (tree, file) => {
    visit(tree, "paragraph", (paragraph) => {
      if (paragraph.data?.gherkin?.type === "tagLine") {
        for (const child of paragraph.children) {
          if (child.type === "html" || (child.type === "text" && child.value.includes("<!--"))) {
            file.message("Tag lines must not be partially commented.", child);
          }
        }
      }
    });
  },
);

export default remarkLintGherkinNoPartiallyCommentedTagLines;
