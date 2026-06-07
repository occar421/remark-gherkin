import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import { testGherkinNode } from "mdast-util-gherkin";

export type Options = {
  tags?: string[];
  patterns?: string[];
};

const remarkLintGherkinAllowedTags = lintRule<Root, Options>(
  {
    origin: "remark-lint:gherkin-allowed-tags",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-allowed-tags#readme",
  },
  (tree, file, options) => {
    const { tags = [], patterns = [] } = options || {};

    if (tags.length === 0 && patterns.length === 0) {
      return;
    }

    const regexps = patterns.map((p) => new RegExp(p));

    visit(tree, testGherkinNode("tag"), (node) => {
      const tagValue = `@${node.data.gherkin.ident}`;

      const isAllowed = tags.includes(tagValue) || regexps.some((re) => re.test(tagValue));
      if (!isAllowed) {
        file.message(`Tag \`${tagValue}\` is not allowed`, node);
      }
    });
  },
);

export default remarkLintGherkinAllowedTags;
