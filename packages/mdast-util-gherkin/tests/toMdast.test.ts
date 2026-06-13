import { expect, suite, test } from "vite-plus/test";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gherkinFromMarkdown } from "../src/index.ts";
import { readFileSync } from "fs";
import { gfmTable } from "micromark-extension-gfm-table";
import { gfmTableFromMarkdown } from "mdast-util-gfm-table";
import type { Table } from "mdast";

suite("Markdown with Gherkin to mdast", () => {
  const getTree = (text: string, _options: {} = {}) =>
    fromMarkdown(text, undefined, {
      extensions: [gfmTable()],
      mdastExtensions: [gfmTableFromMarkdown(), gherkinFromMarkdown()],
    });

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

      test("Normal list item should pass through", () => {
        const tree = getTree(`* Hello`);
        expect(tree.children).toHaveLength(1);
        expect(tree.children[0]).toMatchObject({
          type: "list",
          ordered: false,
          spread: false,
          children: [
            {
              type: "listItem",
              spread: false,
              children: [{ type: "paragraph", children: [{ type: "text", value: "Hello" }] }],
            },
          ],
        });
      });
    });

    suite.each([
      ["Feature", "Feature"],
      ["Business Need", "Feature"],
      ["Ability", "Feature"],
      ["Background", "Background"],
      ["Rule", "Rule"],
      ["Scenario", "Scenario"],
      ["Example", "Scenario"],
      ["Scenario Outline", "ScenarioOutline"],
      ["Scenario Template", "ScenarioOutline"],
      ["Examples", "Examples"],
      ["Scenarios", "Examples"],
    ] as const)("%s", (keyword, key) => {
      test.each([1, 2, 3, 4, 5, 6])(
        `"${keyword}: ???" is parsed as Gherkin segment keyword in h%i`,
        (level) => {
          const tree = getTree(`${"#".repeat(level)} ${keyword}: Hello`);
          expect(tree.children).toHaveLength(1);
          expect(tree.children[0]).toMatchObject({
            type: "heading",
            depth: level,
            children: [
              {
                type: "text",
                value: `${keyword}`,
                data: { gherkin: { type: "segmentKeyword", keyword: key } },
              },
              { type: "text", value: `:`, data: { gherkin: { type: "segmentDelimiter" } } },
              { type: "text", value: " ", data: { gherkin: { type: "separator" } } },
              { type: "text", value: "Hello" },
            ],
            data: { gherkin: { type: "segmentLine", segmentKeyword: key } },
          });
        },
      );
    });

    suite.each([
      ["Examples", "Examples"],
      ["Scenarios", "Examples"],
    ] as const)("%s with Table", (keyword, key) => {
      test.each([1, 2, 3, 4, 5, 6])(
        `"${keyword}:" is parsed as Gherkin segment keyword in h%i`,
        (level) => {
          const tree = getTree(`
${"#".repeat(level)} ${keyword}:

  | a | b |
  | - | - |
  | 1 | 2 |
`);
          expect(tree.children).toHaveLength(2);
          expect(tree.children[0]).toMatchObject({
            type: "heading",
            depth: level,
            children: [
              {
                type: "text",
                value: `${keyword}`,
                data: { gherkin: { type: "segmentKeyword", keyword: key } },
              },
              { type: "text", value: `:`, data: { gherkin: { type: "segmentDelimiter" } } },
            ],
            data: { gherkin: { type: "segmentLine", segmentKeyword: key } },
          });
          expect(tree.children[1]).toMatchObject({
            type: "table",
            data: { gherkin: { type: "examplesTable" } },
          });
          // header
          expect((tree.children[1] as Table).children[0]).toMatchObject({
            type: "tableRow",
            children: [
              {
                type: "tableCell",
                children: [{ type: "text", value: "a" }],
                data: { gherkin: { type: "exampleParameter", ident: "a" } },
              },
              {
                type: "tableCell",
                children: [{ type: "text", value: "b" }],
                data: { gherkin: { type: "exampleParameter", ident: "b" } },
              },
            ],
          });
          // rows
          expect((tree.children[1] as Table).children[1]).toMatchObject({
            type: "tableRow",
            children: [
              {
                type: "tableCell",
                children: [{ type: "text", value: "1" }],
                data: { gherkin: { type: "exampleArgument", parameterIdent: "a" } },
              },
              {
                type: "tableCell",
                children: [{ type: "text", value: "2" }],
                data: { gherkin: { type: "exampleArgument", parameterIdent: "b" } },
              },
            ],
          });
        },
      );
    });

    suite.each(["Given", "When", "Then", "And", "But"] as const)("%s", (keyword) => {
      test.each(["*", "-"])(
        `"${keyword} " is parsed as Gherkin step keyword in list item "%s"`,
        (bulletSign) => {
          const tree = getTree(`${bulletSign} ${keyword} there are <start> cucumbers`);

          expect(tree.children).toHaveLength(1);
          expect(tree.children[0]).toMatchObject({
            type: "list",
            ordered: false,
            spread: false,
            children: [
              {
                type: "listItem",
                spread: false,
                children: [
                  {
                    type: "paragraph",
                    children: [
                      {
                        type: "text",
                        value: keyword,
                        data: { gherkin: { type: "stepKeyword", keyword: keyword } },
                      },
                      { type: "text", value: " ", data: { gherkin: { type: "separator" } } },
                      { type: "text", value: "there are " },
                      {
                        type: "html",
                        value: "<start>",
                        data: {
                          gherkin: {
                            type: "delimitedParameter",
                            ident: "start",
                          },
                        },
                      },
                      { type: "text", value: " cucumbers" },
                    ],
                  },
                ],
                data: { gherkin: { type: "stepLine", stepKeyword: keyword } },
              },
            ],
          });
        },
      );

      test(`"${keyword}" can handle doc strings`, () => {
        const tree = getTree(`
* ${keyword} a blog post named "Random" with Markdown body
  ${"```"}
  Some Title, Eh?
  ===============
  Here is the first paragraph of my blog post. Lorem ipsum dolor sit amet,
  consectetur adipiscing elit.
  ${"```"}
`);

        expect(tree.children).toHaveLength(1);
        expect(tree.children[0]).toMatchObject({
          type: "list",
          children: [
            {
              type: "listItem",
              children: [
                {
                  type: "paragraph",
                },
                {
                  type: "code",
                  data: { gherkin: { type: "docString" } },
                },
              ],
              data: { gherkin: { type: "stepLine", stepKeyword: keyword } },
            },
          ],
        });
      });

      test(`"${keyword}" can handle data tables`, () => {
        const tree = getTree(`
* ${keyword} the following users exist:
  | a | b |
  | - | - |
  | 1 | 2 |
`);

        expect(tree.children).toHaveLength(1);
        expect(tree.children[0]).toMatchObject({
          type: "list",
          children: [
            {
              type: "listItem",
              children: [
                {
                  type: "paragraph",
                },
                {
                  type: "table",
                  children: [
                    {
                      // header row
                      type: "tableRow",
                      children: [
                        {
                          type: "tableCell",
                          children: [{ type: "text", value: "a" }],
                          data: { gherkin: { type: "dataParameter", ident: "a" } },
                        },
                        {
                          type: "tableCell",
                          children: [{ type: "text", value: "b" }],
                          data: { gherkin: { type: "dataParameter", ident: "b" } },
                        },
                      ],
                    },
                    {
                      type: "tableRow",
                      children: [
                        {
                          type: "tableCell",
                          children: [{ type: "text", value: "1" }],
                          data: { gherkin: { type: "dataArgument", parameterIdent: "a" } },
                        },
                        {
                          type: "tableCell",
                          children: [{ type: "text", value: "2" }],
                          data: { gherkin: { type: "dataArgument", parameterIdent: "b" } },
                        },
                      ],
                    },
                  ],
                  data: { gherkin: { type: "dataTable" } },
                },
              ],
              data: { gherkin: { type: "stepLine", stepKeyword: keyword } },
            },
          ],
        });
      });
    });

    suite("Tags", () => {
      test("Tags are parsed correctly", () => {
        const tree = getTree(`
${"`@important` `@essential`"}
### Scenario Outline: eating
`);
        expect(tree.children).toHaveLength(2);

        expect(tree.children[0]).toMatchObject({
          type: "paragraph",
          data: { gherkin: { type: "tagLine" } },
          children: [
            {
              type: "inlineCode",
              value: "@important",
              data: { gherkin: { type: "tag", ident: "important" } },
            },
            { type: "text", value: " ", data: { gherkin: { type: "separator" } } },
            {
              type: "inlineCode",
              value: "@essential",
              data: { gherkin: { type: "tag", ident: "essential" } },
            },
          ],
        });
        expect(tree.children[1]).toMatchObject({
          type: "heading",
          depth: 3,
        });
      });
    });
  });

  suite("Test with fixtures", () => {
    test("mdgExample.feature.md", () => {
      const content = readFileSync(
        import.meta.dirname + "/fixtures/mdgExample.feature.md",
        "utf-8",
      );
      const tree = getTree(content);
      expect(tree).toMatchSnapshot();
    });
  });
});
