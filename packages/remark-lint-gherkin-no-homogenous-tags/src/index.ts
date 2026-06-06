import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import type { Root, Heading } from "mdast";

interface ScenarioInfo {
  node: Heading;
  tags: string[];
}

interface Container {
  scenarios: ScenarioInfo[];
}

const remarkLintGherkinNoHomogenousTags = lintRule<Root>(
  {
    origin: "remark-lint:gherkin-no-homogenous-tags",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-no-homogenous-tags#readme",
  },
  (tree, file) => {
    const featureContainer: Container = { scenarios: [] };
    const ruleContainers: Map<unknown, Container> = new Map();

    // If it's flat, we need to handle Rule grouping.
    // Let's first try to see if it's flat.
    let currentContainer = featureContainer;
    let pendingTags: string[] = [];

    for (const node of tree.children) {
      if (node.type === "paragraph" && node.data?.gherkin?.type === "tagLine") {
        const tags = node.children
          .filter((x) => x.type === "inlineCode")
          .filter((x) => x.data?.gherkin?.type === "tag")
          .map((x) => x.value) as string[];
        if (tags.length > 0) {
          pendingTags = tags;
        }
        continue;
      }

      if (node.type === "heading" && node.data?.gherkin?.type === "segmentLine") {
        const segmentKeyword = node.data.gherkin.segmentKeyword;
        if (segmentKeyword === "Rule") {
          const ruleContainer: Container = { scenarios: [] };
          ruleContainers.set(node, ruleContainer);
          currentContainer = ruleContainer;
          pendingTags = [];
        } else if (segmentKeyword === "Scenario" || segmentKeyword === "ScenarioOutline") {
          currentContainer.scenarios.push({ node: node, tags: pendingTags });
          pendingTags = [];
        } else if (segmentKeyword === "Feature") {
          currentContainer = featureContainer;
          pendingTags = [];
        } else {
          pendingTags = [];
        }
      } else {
        pendingTags = [];
      }
    }

    checkHomogenous(file, featureContainer.scenarios);
    for (const container of ruleContainers.values()) {
      checkHomogenous(file, container.scenarios);
    }
  },
);

type Rule = Parameters<typeof lintRule>[1];
type VFile = Parameters<Rule>[1];

const checkHomogenous = (file: VFile, scenarios: ScenarioInfo[]) => {
  if (scenarios.length <= 1) return;

  const tagCounts = new Map<string, number>();
  for (const scenario of scenarios) {
    const uniqueTags = new Set(scenario.tags);
    for (const tag of uniqueTags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }

  for (const [tag, count] of tagCounts) {
    if (count === scenarios.length) {
      file.message(
        `All scenarios have the tag "${tag}", it should be moved to the parent level`,
        scenarios[0].node,
      );
    }
  }
};

export default remarkLintGherkinNoHomogenousTags;
