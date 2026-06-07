import type { ListItem } from "mdast";
import { findAllAfter } from "unist-util-find-all-after";
import { toString } from "mdast-util-to-string";
import { GherkinTypes } from "../constant.ts";

/**
 * Get the name of a Gherkin step from a list item node.
 *
 * @param node
 *   List item node.
 * @returns
 *   Step name or `undefined` if the node is not a Gherkin step line.
 */
export function getStepName(node: ListItem): string | undefined {
  if (node.data?.gherkin?.type !== GherkinTypes.STEP_LINE) {
    return undefined;
  }

  const paragraph = node.children[0];
  if (!paragraph || paragraph.type !== "paragraph") {
    return undefined;
  }

  const separator = paragraph.children.find((child) => child.data?.gherkin?.type === "separator");
  if (!separator) {
    return "";
  }

  const nameNodes = findAllAfter(paragraph, separator);
  return toString(nameNodes).trim();
}
