import { expect, suite, test } from "vite-plus/test";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gherkinFromMarkdown } from "../src/index.ts";

suite("Gherkin Whitespace Variations", () => {
  const getTree = (text: string) =>
    fromMarkdown(text, undefined, { mdastExtensions: [gherkinFromMarkdown()] });

  test("Feature with tab character should be parsed as Gherkin", () => {
    const tree = getTree("# Feature:\tHello");
    expect(tree.children[0]).toMatchObject({
      type: "heading",
      children: [
        { type: "text", value: "Feature", data: { gherkin: { type: "segmentKeyword" } } },
        { type: "text", value: ":", data: { gherkin: { type: "segmentDelimiter" } } },
        { type: "text", value: "\t", data: { gherkin: { type: "separator" } } },
        { type: "text", value: "Hello" },
      ],
    });
  });

  test("Given with tab character should be parsed as Gherkin", () => {
    const tree = getTree("* Given\tthere are cucumbers");
    const listItem = (tree.children[0] as any).children[0];
    const paragraph = listItem.children[0];
    expect(paragraph.children[0]).toMatchObject({
      type: "text",
      value: "Given",
      data: { gherkin: { type: "stepKeyword" } },
    });
    expect(paragraph.children[1]).toMatchObject({
      type: "text",
      value: "\t",
      data: { gherkin: { type: "separator" } },
    });
  });

  test("Feature with multiple spaces should be parsed as Gherkin", () => {
    const tree = getTree("# Feature:  Hello");
    expect(tree.children[0]).toMatchObject({
      type: "heading",
      children: [
        { type: "text", value: "Feature", data: { gherkin: { type: "segmentKeyword" } } },
        { type: "text", value: ":", data: { gherkin: { type: "segmentDelimiter" } } },
        { type: "text", value: "  ", data: { gherkin: { type: "separator" } } },
        { type: "text", value: "Hello" },
      ],
    });
  });

  test("Given with mixed multiple whitespaces should be parsed as Gherkin", () => {
    const tree = getTree("* Given \t there are cucumbers");
    const listItem = (tree.children[0] as any).children[0];
    const paragraph = listItem.children[0];
    expect(paragraph.children[0]).toMatchObject({
      type: "text",
      value: "Given",
      data: { gherkin: { type: "stepKeyword" } },
    });
    expect(paragraph.children[1]).toMatchObject({
      type: "text",
      value: " \t ",
      data: { gherkin: { type: "separator" } },
    });
    expect(paragraph.children[2]).toMatchObject({
      type: "text",
      value: "there are cucumbers",
    });
  });
});
