import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import type { Root, GherkinSegmentLine, GherkinTag } from "mdast";
import { testGherkinNode } from "mdast-util-gherkin";

export type Options = {
  tags?: string[];
  ignoreUntagged?: boolean;
};

const remarkLintGherkinRequiredTags = lintRule<Root, Options>(
  {
    origin: "remark-lint:gherkin-required-tags",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-required-tags#readme",
  },
  (tree, file, options) => {
    const { tags = [], ignoreUntagged = true } = options || {};

    if (tags.length === 0) {
      return;
    }

    const tagRegexps = tags.map((t) => ({ pattern: t, regexp: new RegExp(t) }));

    let featureTags: string[] = [];
    let ruleTags: string[] = [];

    visit(tree, testGherkinNode("segmentLine"), (node) => {
      const keyword = node.data.gherkin.segmentKeyword;
      const localTags = getTagsBefore(tree, node).map((tag) => `@${tag.data.gherkin.ident}`);

      switch (keyword) {
        case "Feature":
          featureTags = localTags;
          ruleTags = [];
          return;
        case "Rule":
          ruleTags = localTags;
          return;
        case "Scenario":
        case "ScenarioOutline": {
          const currentElementTags = [...featureTags, ...ruleTags, ...localTags];

          if (ignoreUntagged && localTags.length === 0) {
            return;
          }

          for (const { pattern, regexp } of tagRegexps) {
            const matches = currentElementTags.some((tagName) => regexp.test(tagName));

            if (!matches) {
              file.message(
                `No tag found matching ${pattern} for ${
                  keyword === "ScenarioOutline" ? "Scenario Outline" : "Scenario"
                }`,
                node,
              );
            }
          }
        }
      }
    });
  },
);

function getTagsBefore(tree: Root, node: GherkinSegmentLine): GherkinTag[] {
  const index = tree.children.indexOf(node);
  if (index <= 0) return [];

  const previous = tree.children[index - 1];
  if (testGherkinNode("tagLine")(previous)) {
    return previous.children.filter(testGherkinNode("tag"));
  }
  return [];
}

export default remarkLintGherkinRequiredTags;
