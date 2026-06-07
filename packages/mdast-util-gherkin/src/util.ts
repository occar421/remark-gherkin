import type { Heading, ListItem, Node } from "mdast";
import { GherkinTypes } from "./constant.ts";
import { findAllAfter } from "unist-util-find-all-after";
import { toString } from "mdast-util-to-string";
import type { GherkinNodes } from "./types.ts";

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

type GherkinKeywords = (typeof GherkinTypes)[keyof typeof GherkinTypes];

type GherkinNodeMap = {
  [K in GherkinKeywords]: Extract<GherkinNodes, { data: { gherkin: { type: K } } }>;
};

/**
 * Test if a node is a Gherkin node.
 * @returns
 *   Function that tests if a node is a Gherkin node.
 */
export function testGherkinNode(): (node: Node) => node is GherkinNodes;
/**
 * Test if a node is a Gherkin node of a specific type.
 * @param type
 *   Type of Gherkin node to test for.
 * @returns
 *   Function that tests if a node is a Gherkin node of the specified type.
 */
export function testGherkinNode<T extends GherkinKeywords>(
  type: T,
): (node: Node) => node is GherkinNodeMap[T];

export function testGherkinNode<T extends GherkinKeywords>(type?: T) {
  if (!type) {
    return (node: Node) => Object.values(GherkinTypes).some((t) => node.data?.gherkin?.type === t);
  }

  return (node: Node) => {
    return node.data?.gherkin?.type === type;
  };
}
