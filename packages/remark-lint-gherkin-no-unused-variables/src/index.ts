import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import { testGherkinNode } from "mdast-util-gherkin";
import { findAfter } from "unist-util-find-after";
import { findBetween } from "unist-util-find-between";

const remarkLintGherkinNoUnusedVariables = lintRule<Root>(
  {
    origin: "remark-lint:gherkin-no-unused-variables",
    url: "https://github.com/occar421/unifiedjs-gherkin/tree/main/packages/remark-lint-gherkin-no-unused-variables#readme",
  },
  (tree, file) => {
    visit(tree, testGherkinNode("segmentLine"), (scenarioOutlineNode, _index, parent) => {
      if (scenarioOutlineNode.data.gherkin.segmentKeyword !== "ScenarioOutline") {
        return;
      }

      if (!parent) {
        return;
      }

      const delimitedParameter = new Set<string>();
      const exampleParameter = new Set<string>();

      const firstExamplesNode = findAfter(
        parent,
        scenarioOutlineNode,
        testGherkinNode("segmentLine"),
      );
      if (!firstExamplesNode || firstExamplesNode.data.gherkin.segmentKeyword !== "Examples") {
        return;
      }

      const outlineContents = findBetween(parent, scenarioOutlineNode, firstExamplesNode);
      for (const child of outlineContents) {
        visit(child, testGherkinNode("delimitedParameter"), (stepNode) => {
          delimitedParameter.add(stepNode.data.gherkin.ident);
        });
      }

      let lastIndex = parent.children.indexOf(firstExamplesNode) - 1;
      while (lastIndex < parent.children.length) {
        const examplesNode = findAfter(parent, lastIndex, testGherkinNode("segmentLine"));
        if (!examplesNode || examplesNode.data.gherkin.segmentKeyword !== "Examples") {
          break;
        }

        const examplesTableNode = findAfter(parent, examplesNode);
        if (!examplesTableNode || !testGherkinNode("examplesTable")(examplesTableNode)) {
          break;
        }

        visit(examplesTableNode, testGherkinNode("exampleParameter"), (exampleParameterNode) => {
          exampleParameter.add(exampleParameterNode.data.gherkin.ident);
        });

        lastIndex = parent.children.indexOf(examplesTableNode);
      }

      // Report unused variables
      exampleParameter.forEach((variable) => {
        if (!delimitedParameter.has(variable)) {
          file.message(`Unused variable: '<${variable}>'`, scenarioOutlineNode);
        }
      });
    });
  },
);

export default remarkLintGherkinNoUnusedVariables;
