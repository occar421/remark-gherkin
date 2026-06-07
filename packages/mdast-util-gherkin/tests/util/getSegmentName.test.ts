import { expect, suite, test } from "vite-plus/test";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gherkinFromMarkdown, getSegmentName } from "../../src/index.ts";
import type { Heading } from "mdast";

suite("getSegmentName", () => {
  const getTree = (text: string) =>
    fromMarkdown(text, undefined, { mdastExtensions: [gherkinFromMarkdown()] });

  test("should return segment name from heading", () => {
    const tree = getTree("# Feature: Hello world");
    const heading = tree.children[0] as Heading;
    expect(getSegmentName(heading)).toBe("Hello world");
  });

  test("should return segment name from heading without name", () => {
    const tree = getTree("# Examples:");
    const heading = tree.children[0] as Heading;
    expect(getSegmentName(heading)).toBe("");
  });

  test("should return undefined for non-gherkin heading", () => {
    const tree = getTree("# Normal heading");
    const heading = tree.children[0] as Heading;
    expect(getSegmentName(heading)).toBeUndefined();
  });
});
