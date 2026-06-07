import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import type { Root, GherkinSegmentLine } from "mdast";
import { testGherkinNode } from "mdast-util-gherkin";

const remarkLintGherkinNoSuperfluousTags = lintRule<Root>(
  {
    origin: "remark-lint:gherkin-no-superfluous-tags",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-no-superfluous-tags#readme",
  },
  (tree, file) => {
    let featureTags: string[] = [];
    let ruleTags: string[] = [];

    visit(tree, testGherkinNode("segmentLine"), (node) => {
      switch (node.data.gherkin.segmentKeyword) {
        // When we hit a Feature, clear everything
        case "Feature":
          featureTags = getTagsBefore(tree, node);
          ruleTags = [];
          return;
        case "Rule":
          ruleTags = getTagsBefore(tree, node);
          checkSuperfluous(ruleTags, featureTags, tree, node, file);
          return;
        case "Scenario":
        case "ScenarioOutline":
          const scenarioTags = getTagsBefore(tree, node);
          checkSuperfluous(scenarioTags, [...featureTags, ...ruleTags], tree, node, file);
          return;
      }
    });
  },
);

function getTagsBefore(tree: Root, node: GherkinSegmentLine): string[] {
  const index = tree.children.indexOf(node);
  if (index <= 0) return [];

  const previous = tree.children[index - 1];
  if (testGherkinNode("tagLine")(previous)) {
    return previous.children
      .filter(testGherkinNode("tag"))
      .map((child) => child.data.gherkin.ident);
  }
  return [];
}

function checkSuperfluous(
  currentTags: string[],
  parentTags: string[],
  tree: Root,
  node: GherkinSegmentLine,
  file: any,
) {
  if (currentTags.length === 0 || parentTags.length === 0) return;

  const index = tree.children.indexOf(node);
  const tagLine = tree.children[index - 1];
  if (!testGherkinNode("tagLine")(tagLine)) return;

  const parentTagsSet = new Set(parentTags);

  for (const child of tagLine.children) {
    if (testGherkinNode("tag")(child)) {
      const tag = child.data.gherkin.ident;
      if (parentTagsSet.has(tag)) {
        file.message(`Tag "@${tag}" is already present on a parent Gherkin element`, child);
      }
    }
  }
}

export default remarkLintGherkinNoSuperfluousTags;
