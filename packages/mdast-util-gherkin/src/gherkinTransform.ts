import type { Position } from "unist";
import type { Transform } from "mdast-util-from-markdown";
import { visit } from "unist-util-visit";
import { findAfter } from "unist-util-find-after";
import { findAllAfter } from "unist-util-find-all-after";
import { findBefore } from "unist-util-find-before";
import { GherkinTypes, SegmentKeywords, StepKeywords, SyntaxTokens } from "./constant.ts";
import { testGherkinNode } from "./util/index.ts";
import { toString } from "mdast-util-to-string";

const gherkinTransform: Transform = (tree) => {
  // Segment Keyword
  visit(tree, "heading", (node) => {
    if (node.children.length === 0) {
      return;
    }

    const firstChild = node.children[0];
    if (firstChild.type === "text") {
      for (const [key_, values] of Object.entries(SegmentKeywords)) {
        const key = key_ as keyof typeof SegmentKeywords;
        for (const segmentKeyword of values) {
          const keyword = `${segmentKeyword}${SyntaxTokens.COLON}`;
          // e.g. ### Examples:\n
          if (firstChild.value === keyword) {
            node.children.shift();

            const segmentKeywordPosition: Position | undefined = firstChild.position && {
              start: firstChild.position.start,
              end: {
                ...firstChild.position.start,
                column: firstChild.position.start.column + segmentKeyword.length,
                offset:
                  firstChild.position.start.offset &&
                  firstChild.position.start.offset + segmentKeyword.length,
              },
            };

            const delimiterPosition: Position | undefined = firstChild.position &&
              segmentKeywordPosition && {
                start: segmentKeywordPosition.end,
                end: firstChild.position.end,
              };

            node.data = {
              ...node.data,
              gherkin: { type: GherkinTypes.SEGMENT_LINE, segmentKeyword: key },
            };
            node.children.unshift(
              {
                type: "text",
                value: segmentKeyword,
                position: segmentKeywordPosition,
                data: {
                  gherkin: {
                    type: GherkinTypes.SEGMENT_KEYWORD,
                    keyword: key,
                  },
                },
              },
              {
                type: "text",
                value: SyntaxTokens.COLON,
                position: delimiterPosition,
                data: { gherkin: { type: GherkinTypes.SEGMENT_DELIMITER } },
              },
            );
            break;
          }

          // e.g. # Feature: ???
          // require space to prevent text directive `:color[]{}`
          const match = firstChild.value.slice(keyword.length).match(/^(\s+)/);
          if (firstChild.value.startsWith(keyword) && match) {
            node.children.shift(); // === firstChild

            const separator = match[1];
            const textValue = firstChild.value.slice(keyword.length + separator.length);

            const segmentKeywordPosition: Position | undefined = firstChild.position && {
              start: firstChild.position.start,
              end: {
                ...firstChild.position.start,
                column: firstChild.position.start.column + segmentKeyword.length,
                offset:
                  firstChild.position.start.offset &&
                  firstChild.position.start.offset + segmentKeyword.length,
              },
            };

            const delimiterPosition: Position | undefined = firstChild.position &&
              segmentKeywordPosition && {
                start: segmentKeywordPosition.end,
                end: {
                  ...segmentKeywordPosition.end,
                  column: segmentKeywordPosition.end.column + SyntaxTokens.COLON.length,
                  offset:
                    segmentKeywordPosition.end.offset &&
                    segmentKeywordPosition.end.offset + SyntaxTokens.COLON.length,
                },
              };

            const spacePosition: Position | undefined = firstChild.position &&
              delimiterPosition && {
                start: delimiterPosition.end,
                end: {
                  ...delimiterPosition.end,
                  column: delimiterPosition.end.column + separator.length,
                  offset:
                    delimiterPosition.end.offset && delimiterPosition.end.offset + separator.length,
                },
              };

            const textPosition: Position | undefined = firstChild.position &&
              spacePosition && {
                start: spacePosition.end,
                end: firstChild.position.end,
              };

            node.data = {
              ...node.data,
              gherkin: { type: GherkinTypes.SEGMENT_LINE, segmentKeyword: key },
            };
            node.children.unshift(
              {
                type: "text",
                value: segmentKeyword,
                position: segmentKeywordPosition,
                data: {
                  gherkin: {
                    type: GherkinTypes.SEGMENT_KEYWORD,
                    keyword: key as keyof typeof SegmentKeywords,
                  },
                },
              },
              {
                type: "text",
                value: SyntaxTokens.COLON,
                position: delimiterPosition,
                data: { gherkin: { type: GherkinTypes.SEGMENT_DELIMITER } },
              },
              {
                type: "text",
                value: separator,
                position: spacePosition,
                data: { gherkin: { type: GherkinTypes.SEPARATOR } },
              },
              {
                type: "text",
                value: textValue,
                position: textPosition,
              },
            );
            break;
          }
        }
      }
    }
  });

  // Tags
  visit(tree, "heading", (heading, _index, parent) => {
    if (heading.data?.gherkin?.type !== GherkinTypes.SEGMENT_LINE) {
      return;
    }

    if (!parent) {
      return;
    }

    const before = findBefore(parent, heading);
    if (!before || before.type !== "paragraph") {
      return;
    }
    const paragraph = before;

    const isTagLine = paragraph.children.some(
      (child) => child.type === "inlineCode" && child.value.startsWith("@"),
    );

    if (!isTagLine) {
      return;
    }

    paragraph.data = { ...paragraph.data, gherkin: { type: GherkinTypes.TAG_LINE } };

    for (const child of paragraph.children) {
      if (child.type === "inlineCode" && child.value.startsWith("@")) {
        child.data = {
          ...child.data,
          gherkin: { type: GherkinTypes.TAG, ident: child.value.slice(1) },
        };
      }
    }
    for (const child of paragraph.children) {
      if (child.type === "text" && child.value.trim() === "") {
        const before = findBefore(paragraph, child);
        if (!before || before.data?.gherkin?.type !== GherkinTypes.TAG) {
          continue;
        }

        const after = findAfter(paragraph, child);
        if (!after || after.data?.gherkin?.type !== GherkinTypes.TAG) {
          continue;
        }

        child.data = { ...child.data, gherkin: { type: GherkinTypes.SEPARATOR } };
      }
    }
  });

  // Step Keyword
  visit(tree, "listItem", (listItemNode) => {
    if (listItemNode.children.length === 0) {
      return;
    }

    const firstChild = listItemNode.children[0];
    if (firstChild.type === "paragraph") {
      if (firstChild.children.length === 0) {
        return;
      }

      if (firstChild.children[0].type === "text") {
        const textNode = firstChild.children[0];
        for (const [key_, values] of Object.entries(StepKeywords)) {
          const key = key_ as keyof typeof StepKeywords;
          for (const stepKeyword of values) {
            const match = textNode.value.slice(stepKeyword.length).match(/^(\s+)/);
            if (textNode.value.startsWith(stepKeyword) && match) {
              listItemNode.data = {
                ...listItemNode.data,
                gherkin: { type: GherkinTypes.STEP_LINE, stepKeyword: key },
              };

              firstChild.children.shift();

              const separator = match[1];

              const keywordPosition: Position | undefined = textNode.position && {
                start: textNode.position.start,
                end: {
                  ...textNode.position.start,
                  column: textNode.position.start.column + stepKeyword.length,
                  offset:
                    textNode.position.start.offset &&
                    textNode.position.start.offset + stepKeyword.length,
                },
              };

              const spacePosition: Position | undefined = textNode.position &&
                keywordPosition && {
                  start: keywordPosition.end,
                  end: {
                    ...keywordPosition.end,
                    column: keywordPosition.end.column + separator.length,
                    offset:
                      keywordPosition.end.offset && keywordPosition.end.offset + separator.length,
                  },
                };

              const textPosition: Position | undefined = textNode.position &&
                spacePosition && {
                  start: spacePosition.end,
                  end: textNode.position.end,
                };

              firstChild.children.unshift(
                {
                  type: "text",
                  value: stepKeyword,
                  position: keywordPosition,
                  data: {
                    gherkin: {
                      type: GherkinTypes.STEP_KEYWORD,
                      keyword: key,
                    },
                  },
                },
                {
                  type: "text",
                  value: separator,
                  position: spacePosition,
                  data: { gherkin: { type: GherkinTypes.SEPARATOR } },
                },
                {
                  type: "text",
                  value: textNode.value.slice(stepKeyword.length + separator.length),
                  position: textPosition,
                },
              );
              break;
            }
          }
        }
      }
    }
  });

  // Doc String
  visit(tree, testGherkinNode("stepLine"), (stepLine) => {
    for (const child of stepLine.children) {
      if (child.type === "code") {
        child.data = { ...child.data, gherkin: { type: GherkinTypes.DOC_STRING } };
      }
    }
  });

  // Delimited Parameter
  visit(tree, "text", (node, _index, parent) => {
    if (node.data?.gherkin?.type !== GherkinTypes.STEP_KEYWORD) {
      return;
    }

    if (parent?.type !== "paragraph") {
      return;
    }
    const siblings = findAllAfter(parent, node, "html");

    for (let i = 0; i < siblings.length; i++) {
      const sibling = siblings[i];
      if (sibling.value.startsWith("<") && sibling.value.endsWith(">")) {
        sibling.data = {
          ...sibling.data,
          gherkin: {
            type: GherkinTypes.DELIMITED_PARAMETER,
            ident: sibling.value.slice(1, -1), // "<foo>" -> "foo"
          },
        };
      }
    }
  });

  // Examples Table
  visit(tree, "table", (table, _index, parent) => {
    if (!parent) {
      return;
    }

    const examplesSegment = findBefore(parent, table);

    if (
      !examplesSegment ||
      !testGherkinNode("segmentLine")(examplesSegment) ||
      examplesSegment.data.gherkin.segmentKeyword !== "Examples"
    ) {
      return;
    }

    table.data = { ...table.data, gherkin: { type: GherkinTypes.EXAMPLES_TABLE } };

    const parameters = [];

    const headerRow = table.children[0];
    for (const headerCell of headerRow.children) {
      const ident = toString(headerCell);
      parameters.push(ident);

      headerCell.data = {
        ...headerCell.data,
        gherkin: {
          type: GherkinTypes.EXAMPLE_PARAMETER,
          ident,
        },
      };
    }

    if (table.children.length <= 1) {
      return;
    }

    for (let i = 1 /* skips header */; i < table.children.length; i++) {
      const row = table.children[i];
      for (let j = 0; j < row.children.length; j++) {
        const cell = row.children[j];
        cell.data = {
          ...cell.data,
          gherkin: {
            type: GherkinTypes.EXAMPLE_ARGUMENT,
            parameterIdent: parameters[j],
          },
        };
      }
    }
  });

  return tree;
};

export default gherkinTransform;
