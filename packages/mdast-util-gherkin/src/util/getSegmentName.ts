import type { GherkinSegmentLine, Heading } from "mdast";
import { findAllAfter } from "unist-util-find-all-after";
import { toString } from "mdast-util-to-string";
import { testGherkinNode } from "./testGherkinNode.ts";

/**
 * Get the name of a Gherkin segment from a heading node.
 *
 * @param node
 *   Heading node.
 * @returns
 *   Segment name or `undefined` if the node is not a Gherkin segment line.
 */
export function getSegmentName(node: Heading | GherkinSegmentLine): string | undefined {
  if (!testGherkinNode("segmentLine")(node)) {
    return undefined;
  }

  const separator = node.children.find(testGherkinNode("separator"));
  if (!separator) {
    return "";
  }

  const nameNodes = findAllAfter(node, separator);
  return toString(nameNodes).trim();
}
