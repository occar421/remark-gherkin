import type { GherkinStepLine, ListItem } from "mdast";
import { findAllAfter } from "unist-util-find-all-after";
import { toString } from "mdast-util-to-string";
import { testGherkinNode } from "./testGherkinNode.ts";

/**
 * Get the name of a Gherkin step from a list item node.
 *
 * @param node
 *   List item node.
 * @returns
 *   Step name or `undefined` if the node is not a Gherkin step line.
 */
export function getStepName(node: ListItem | GherkinStepLine): string | undefined {
  if (!testGherkinNode("stepLine")(node)) {
    return undefined;
  }

  const paragraph = node.children[0];
  if (!paragraph || paragraph.type !== "paragraph") {
    return undefined;
  }

  const separator = paragraph.children.find(testGherkinNode("separator"));
  if (!separator) {
    return "";
  }

  const nameNodes = findAllAfter(paragraph, separator);
  return toString(nameNodes).trim();
}
