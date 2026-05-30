import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";

const remarkLintGherkinOneFeaturePerFile = lintRule<Root>(
  {
    origin: "remark-lint:gherkin-one-feature-per-file",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-one-feature-per-file#readme",
  },
  (tree, file) => {
    let featureCount = 0;

    visit(tree, "heading", (heading) => {
      const isFeature =
        heading.data?.gherkin?.type === "segmentLine" &&
        heading.children.some(
          (child) =>
            child.data?.gherkin?.type === "segmentKeyword" &&
            child.data?.gherkin?.keyword === "Feature",
        );

      if (isFeature) {
        featureCount++;
        if (featureCount > 1) {
          file.message("Only one feature is allowed per file", heading);
        }
      }
    });
  },
);

export default remarkLintGherkinOneFeaturePerFile;
