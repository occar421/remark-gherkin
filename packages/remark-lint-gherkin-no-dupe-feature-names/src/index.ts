import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import { getSegmentName, testGherkinNode } from "mdast-util-gherkin";

const remarkLintGherkinNoDupeFeatureNames = lintRule<Root>(
  {
    origin: "remark-lint:gherkin-no-dupe-feature-names",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-no-dupe-feature-names#readme",
  },
  (tree, file) => {
    const names = new Set<string>();

    visit(tree, testGherkinNode("segmentLine"), (node) => {
      if (node.data.gherkin.segmentKeyword === "Feature") {
        const name = getSegmentName(node);
        if (name === undefined) return;

        if (names.has(name)) {
          file.message(`Feature name "${name}" is already used`, node);
        } else {
          names.add(name);
        }
      }
    });
  },
);

export default remarkLintGherkinNoDupeFeatureNames;
