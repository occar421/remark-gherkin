import { expect, suite, test } from "vite-plus/test";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gherkinFromMarkdown } from "../src/index.ts";

suite("gherkin", () => {
  const getTree = (text: string, _options: {} = {}) =>
    fromMarkdown(text, undefined, { mdastExtensions: [gherkinFromMarkdown()] });

  suite("keyword", () => {
    suite("No degradation", () => {
      test.each([1, 2, 3, 4, 5, 6])("Normal header should pass through in h%i", (level) => {
        const tree = getTree(`${"#".repeat(level)} Hello`);
        expect(tree.children).toHaveLength(1);
        expect(tree.children[0]).toMatchObject({
          type: "heading",
          depth: level,
          children: [{ type: "text", value: "Hello" }],
        });
      });
    });

    suite("Feature", () => {
      test.each([1, 2, 3, 4, 5, 6])("`Feature:` is parsed as GherkinKeyword in h%i", (level) => {
        const tree = getTree(`${"#".repeat(level)} Feature: Hello`);
        expect(tree.children).toHaveLength(1);
        expect(tree.children[0]).toMatchObject({
          type: "heading",
          depth: level,
          children: [
            { type: "gherkinKeyword", value: "Feature:" },
            { type: "text", value: "Hello" },
          ],
        });
      });
    });
  });
});
