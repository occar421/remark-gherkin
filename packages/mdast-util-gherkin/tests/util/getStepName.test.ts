import { expect, suite, test } from "vite-plus/test";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gherkinFromMarkdown, getStepName } from "../../src/index.ts";
import type { GherkinStepLine, ListItem } from "mdast";

suite("getStepName", () => {
  const getTree = (text: string) =>
    fromMarkdown(text, undefined, { mdastExtensions: [gherkinFromMarkdown()] });

  test("should return step name from list item", () => {
    const tree = getTree("* Given there are <start> cucumbers");
    const list = tree.children[0] as any;
    const listItem = list.children[0] as GherkinStepLine;
    expect(getStepName(listItem)).toBe("there are <start> cucumbers");
  });

  test("should return undefined for non-gherkin list item", () => {
    const tree = getTree("* Normal list item");
    const list = tree.children[0] as any;
    const listItem = list.children[0] as ListItem;
    expect(getStepName(listItem)).toBeUndefined();
  });
});
