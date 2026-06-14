import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import type { GherkinTag, Root } from "mdast";
import { testGherkinNode } from "mdast-util-gherkin";
import { findBetween } from "unist-util-find-between";

const remarkLintGherkinOneSpaceBetweenTags = lintRule<Root>(
  {
    origin: "remark-lint:gherkin-one-space-between-tags",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-one-space-between-tags#readme",
  },
  (tree, file) => {
    visit(tree, testGherkinNode("tagLine"), (tagLine) => {
      let lastTag: GherkinTag | undefined = undefined;
      for (const tag of tagLine.children) {
        if (testGherkinNode("tag")(tag)) {
          if (lastTag) {
            const between = findBetween(tagLine, lastTag, tag);
            if (between.length === 0) {
              file.message("There should be exactly one space between tags", tag);
            } else if (between.length > 1) {
              file.message("There should be exactly one space between tags", between[0]);
            } else {
              const mid = between[0];
              if (!testGherkinNode("separator")(mid) || mid.value !== " ") {
                file.message("There should be exactly one space between tags", mid);
              }
            }
          }
          lastTag = tag;
        }
      }
    });
  },
);

export default remarkLintGherkinOneSpaceBetweenTags;
