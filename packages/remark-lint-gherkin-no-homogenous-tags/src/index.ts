import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import type { Root, Heading, Paragraph } from "mdast";
import { toString } from "mdast-util-to-string";

const remarkLintGherkinNoHomogenousTags = lintRule<Root>(
  {
    origin: "remark-lint:gherkin-no-homogenous-tags",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-no-homogenous-tags#readme",
  },
  (tree, file) => {
    interface ScenarioInfo {
      node: Heading;
      tags: string[];
    }

    interface Container {
      scenarios: ScenarioInfo[];
    }

    const featureContainer: Container = { scenarios: [] };
    const ruleContainers: Map<unknown, Container> = new Map();

    // If it's flat, we need to handle Rule grouping.
    // Let's first try to see if it's flat.
    let currentContainer = featureContainer;
    let pendingTags: string[] = [];

    for (const node of tree.children) {
      if (node.type === "paragraph") {
        const text = toString(node);
        if (
          node.data?.gherkin?.type === "tagLine" ||
          (text.startsWith("@") && !node.data?.gherkin)
        ) {
          const tags: string[] = [];
          for (const child of (node as Paragraph).children) {
            if (child.type === "inlineCode" && child.data?.gherkin?.type === "tag") {
              tags.push(toString(child).slice(1)); // Remove the leading '@'
            }
          }
          if (tags.length > 0) {
            pendingTags = tags;
          }
          continue;
        }
      }

      if (node.type === "heading" && node.data?.gherkin?.type === "segmentLine") {
        const segmentKeyword = node.data.gherkin.segmentKeyword;
        if (segmentKeyword === "Rule") {
          const ruleContainer: Container = { scenarios: [] };
          ruleContainers.set(node, ruleContainer);
          currentContainer = ruleContainer;
          pendingTags = [];
        } else if (segmentKeyword === "Scenario" || segmentKeyword === "ScenarioOutline") {
          currentContainer.scenarios.push({ node: node as Heading, tags: pendingTags });
          pendingTags = [];
        } else if (segmentKeyword === "Feature") {
          currentContainer = featureContainer;
          pendingTags = [];
        } else {
          pendingTags = [];
        }
      } else if (
        node.type === "text" ||
        (node.type === "paragraph" && toString(node).trim() === "")
      ) {
        // Skip whitespace/empty lines
      } else {
        pendingTags = [];
      }
    }

    const checkHomogenous = (scenarios: ScenarioInfo[]) => {
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
            `All scenarios have the tag "@${tag}", it should be moved to the parent level`,
            scenarios[0].node,
          );
        }
      }
    };

    checkHomogenous(featureContainer.scenarios);
    for (const container of ruleContainers.values()) {
      checkHomogenous(container.scenarios);
    }
  },
);

export default remarkLintGherkinNoHomogenousTags;
