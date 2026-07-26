import "mdast-util-gherkin";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import type { Root, GherkinDelimitedParameter, GherkinExampleParameter } from "mdast";
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

      const delimitedParameter = new Map<string, GherkinDelimitedParameter>();
      const exampleParameter = new Map<string, GherkinExampleParameter>();

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
        visit(child, testGherkinNode("delimitedParameter"), (paramNode) => {
          delimitedParameter.set(paramNode.data.gherkin.ident, paramNode);
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

        visit(examplesTableNode, testGherkinNode("exampleParameter"), (paramNode) => {
          exampleParameter.set(paramNode.data.gherkin.ident, paramNode);
        });

        lastIndex = parent.children.indexOf(examplesTableNode);
      }

      // Report variables defined in Examples but not used in the outline
      exampleParameter.forEach((_node, variable) => {
        if (!delimitedParameter.has(variable)) {
          const paramNode = exampleParameter.get(variable);

          const minStartPosition = getMinStartPosition(paramNode);
          const maxEndPosition = getMaxEndPosition(paramNode);

          file.message(
            `Unused variable in Examples: '${variable}'`,
            minStartPosition && maxEndPosition
              ? {
                  type: "",
                  position: {
                    start: minStartPosition,
                    end: maxEndPosition,
                  },
                }
              : undefined,
          );
        }
      });

      // Report variables used in the outline but not defined in Examples
      delimitedParameter.forEach((_node, variable) => {
        if (!exampleParameter.has(variable)) {
          file.message(
            `Unused variable in Outline: '<${variable}>'`,
            delimitedParameter.get(variable),
          );
        }
      });
    });
  },
);

type Position = {
  line: number;
  column: number;
  offset?: number;
};

function getMinStartPosition(node?: GherkinExampleParameter): Position | undefined {
  if (!node) {
    return undefined;
  }

  return node.children.reduce(
    (prev, curr) => {
      const currStart = curr.position?.start;

      if (!prev?.offset) {
        return currStart;
      }

      if (!currStart?.offset) {
        return prev;
      }

      return prev.offset > currStart.offset ? currStart : prev;
    },
    {
      line: Number.MAX_SAFE_INTEGER,
      column: Number.MAX_SAFE_INTEGER,
      offset: Number.MAX_SAFE_INTEGER,
    } as Position | undefined,
  );
}

function getMaxEndPosition(node?: GherkinExampleParameter): Position | undefined {
  if (!node) {
    return undefined;
  }

  return node.children.reduce(
    (prev, curr) => {
      const currEnd = curr.position?.end;

      if (!prev?.offset) {
        return currEnd;
      }

      if (!currEnd?.offset) {
        return prev;
      }

      return prev.offset < currEnd.offset ? currEnd : prev;
    },
    {
      line: Number.MIN_SAFE_INTEGER,
      column: Number.MIN_SAFE_INTEGER,
      offset: Number.MIN_SAFE_INTEGER,
    } as Position | undefined,
  );
}

export default remarkLintGherkinNoUnusedVariables;
