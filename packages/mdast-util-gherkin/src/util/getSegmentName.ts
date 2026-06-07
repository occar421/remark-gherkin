import type { Heading } from "mdast";
import { findAllAfter } from "unist-util-find-all-after";
import { toString } from "mdast-util-to-string";
import { GherkinTypes } from "../constant.ts";

/**
 * Get the name of a Gherkin segment from a heading node.
 *
 * @param node
 *   Heading node.
 * @returns
 *   Segment name or `undefined` if the node is not a Gherkin segment line.
 */
export function getSegmentName(node: Heading): string | undefined {
  if (node.data?.gherkin?.type !== GherkinTypes.SEGMENT_LINE) {
    return undefined;
  }

  const separator = node.children.find((child) => child.data?.gherkin?.type === "separator");
  if (!separator) {
    return "";
  }

  const nameNodes = findAllAfter(node, separator);
  return toString(nameNodes).trim();
}
