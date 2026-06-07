import type { Node } from "mdast";
import { GherkinTypes } from "../constant.ts";
import type { GherkinNodes } from "../types.ts";

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
