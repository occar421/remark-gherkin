import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import type { Root, Heading, Paragraph, InlineCode } from "mdast";

const remarkLintGherkinNoSuperfluousTags = lintRule<Root>(
  {
    origin: "remark-lint:gherkin-no-superfluous-tags",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-no-superfluous-tags#readme",
  },
  (tree, file) => {
    let featureTags: string[] = [];
    let ruleTags: string[] = [];

    visit(tree, "heading", (heading) => {
      if (heading.data?.gherkin?.type === "segmentLine") {
        const keyword = heading.data.gherkin.segmentKeyword;

        // When we hit a Feature, clear everything
        if (keyword === "Feature") {
          featureTags = getTagsBefore(tree, heading);
          ruleTags = [];
        } else if (keyword === "Rule") {
          ruleTags = getTagsBefore(tree, heading);
          checkSuperfluous(ruleTags, featureTags, tree, heading, file);
        } else if (keyword === "Scenario" || keyword === "ScenarioOutline") {
          const scenarioTags = getTagsBefore(tree, heading);
          checkSuperfluous(scenarioTags, [...featureTags, ...ruleTags], tree, heading, file);
        }
      }
    });
  },
);

function getTagsBefore(tree: Root, heading: Heading): string[] {
  const index = tree.children.indexOf(heading);
  if (index <= 0) return [];

  const previous = tree.children[index - 1];
  if (previous.type === "paragraph" && previous.data?.gherkin?.type === "tagLine") {
    const paragraph = previous as Paragraph;
    return paragraph.children
      .filter(
        (child): child is InlineCode =>
          child.type === "inlineCode" && child.data?.gherkin?.type === "tag",
      )
      .map((child) => child.value);
  }
  return [];
}

function checkSuperfluous(
  currentTags: string[],
  parentTags: string[],
  tree: Root,
  heading: Heading,
  file: any,
) {
  if (currentTags.length === 0 || parentTags.length === 0) return;

  const index = tree.children.indexOf(heading);
  const tagLine = tree.children[index - 1] as Paragraph;

  const parentTagsSet = new Set(parentTags);

  for (const child of tagLine.children) {
    if (child.type === "inlineCode" && child.data?.gherkin?.type === "tag") {
      const tag = child.value;
      if (parentTagsSet.has(tag)) {
        file.message(`Tag "${tag}" is already present on a parent Gherkin element`, child);
      }
    }
  }
}

export default remarkLintGherkinNoSuperfluousTags;
