import { expect, suite, test } from "vite-plus/test";
import { toMarkdown } from "mdast-util-to-markdown";
import { gherkinToMarkdown } from "../src/index.ts";
import type { Nodes } from "mdast";
import { gfmTableToMarkdown } from "mdast-util-gfm-table";

suite("Markdown with Gherkin to mdast", () => {
  const markdownOfTree = (nodes: Nodes, _options: {} = {}) =>
    toMarkdown(nodes, { bullet: "*", extensions: [gfmTableToMarkdown(), gherkinToMarkdown()] });

  suite("keyword", () => {
    suite.each([
      ["Feature", "Feature"],
      ["Background", "Background"],
      ["Rule", "Rule"],
      ["Scenario", "Scenario"],
      ["Scenario Outline", "ScenarioOutline"],
      ["Example", "Scenario"],
      ["Scenario Template", "ScenarioOutline"],
      ["Examples", "Examples"],
      ["Scenarios", "Examples"],
    ] as const)("%s", (keyword, key) => {
      test.each([1, 2, 3, 4, 5, 6] as const)(
        `Can serialize it to "${keyword}: ???" from Gherkin segment keyword in h%i`,
        (level) => {
          const str = markdownOfTree({
            type: "heading",
            depth: level,
            children: [
              {
                type: "text",
                value: `${keyword}`,
                data: {
                  gherkin: {
                    type: "segmentKeyword",
                    keyword: key,
                  },
                },
              },
              { type: "text", value: `:`, data: { gherkin: { type: "segmentDelimiter" } } },
              { type: "text", value: " " },
              { type: "text", value: "Hello" },
            ],
            data: { gherkin: { type: "segmentLine", segmentKeyword: key } },
          });
          expect(str).toMatch(`${"#".repeat(level)} ${keyword}: Hello`);
        },
      );
    });
  });

  suite.each([
    ["Examples", "Examples"],
    ["Scenarios", "Examples"],
  ] as const)("%s with Table", (keyword, key) => {
    test.each([1, 2, 3, 4, 5, 6] as const)(
      `Can serialize it to "${keyword}:" from Gherkin segment keyword in h%i`,
      (level) => {
        const str = markdownOfTree({
          type: "root",
          children: [
            {
              type: "heading",
              depth: level,
              children: [
                {
                  type: "text",
                  value: `${keyword}`,
                  data: {
                    gherkin: {
                      type: "segmentKeyword",
                      keyword: key,
                    },
                  },
                },
                { type: "text", value: `:`, data: { gherkin: { type: "segmentDelimiter" } } },
              ],
              data: { gherkin: { type: "segmentLine", segmentKeyword: key } },
            },
            {
              type: "table",
              data: { gherkin: { type: "examplesTable" } },
              children: [
                {
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
                },
                {
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
                },
              ],
            },
          ],
        });
        expect(str).toMatch(`${"#".repeat(level)} ${keyword}:

| a | b |
| - | - |
| 1 | 2 |
`);
      },
    );
  });

  suite.each(["Given", "When", "Then", "And", "But"] as const)("%s", (keyword) => {
    test(`Can serialize it to "${keyword} " is parsed as Gherkin step keyword in list item`, () => {
      const str = markdownOfTree({
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
                    data: {
                      gherkin: {
                        type: "stepKeyword",
                        keyword: keyword,
                      },
                    },
                  },
                  { type: "text", value: " ", data: { gherkin: { type: "separator" } } },
                  { type: "text", value: "there are " },
                  {
                    type: "html",
                    value: "<start>",
                    data: { gherkin: { type: "delimitedParameter", ident: "start" } },
                  },
                  { type: "text", value: " cucumbers" },
                ],
              },
            ],
          },
        ],
        data: { gherkin: { type: "steps" } },
      });
      expect(str).toMatch(`* ${keyword} there are <start> cucumbers`);
    });

    test(`Can serialize doc string with "${keyword}"`, () => {
      const str = markdownOfTree({
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
                    data: {
                      gherkin: {
                        type: "stepKeyword",
                        keyword: keyword,
                      },
                    },
                  },
                  { type: "text", value: " ", data: { gherkin: { type: "separator" } } },
                  { type: "text", value: "there are 3 cucumbers" },
                ],
              },
              {
                type: "code",
                value:
                  "Some Title, Eh?\n===============\nHere is the first paragraph of my blog post. Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit.",
                data: { gherkin: { type: "docString" } },
              },
            ],
          },
        ],
        data: { gherkin: { type: "steps" } },
      });
      expect(str).toMatch(
        `* ${keyword} there are 3 cucumbers

  ${"```"}
  Some Title, Eh?
  ===============
  Here is the first paragraph of my blog post. Lorem ipsum dolor sit amet,
  consectetur adipiscing elit.
  ${"```"}
`,
      );
    });

    test(`Can serialize doc string with "${keyword}"`, () => {
      const str = markdownOfTree({
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
                    data: {
                      gherkin: {
                        type: "stepKeyword",
                        keyword: keyword,
                      },
                    },
                  },
                  { type: "text", value: " ", data: { gherkin: { type: "separator" } } },
                  { type: "text", value: "there are 3 cucumbers" },
                ],
              },
              {
                type: "table",
                children: [
                  {
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
          },
        ],
        data: { gherkin: { type: "steps" } },
      });
      expect(str).toMatch(
        `* ${keyword} there are 3 cucumbers

  | a | b |
  | - | - |
  | 1 | 2 |
`,
      );
    });
  });

  suite("Tags", () => {
    test("Can serialize it to Tags", () => {
      const str = markdownOfTree({
        type: "root",
        children: [
          {
            type: "paragraph",
            data: { gherkin: { type: "tagLine" } },
            children: [
              {
                type: "inlineCode",
                value: "@important",
                data: { gherkin: { type: "tag", ident: "important" } },
              },
              { type: "text", value: " " },
              {
                type: "inlineCode",
                value: "@essential",
                data: { gherkin: { type: "tag", ident: "essential" } },
              },
            ],
          },
          {
            type: "heading",
            depth: 3,
            children: [
              {
                type: "text",
                value: "Scenario Outline:",
              },
              { type: "text", value: " " },
              { type: "text", value: "eating" },
            ],
            data: { gherkin: { type: "segmentLine", segmentKeyword: "ScenarioOutline" } },
          },
        ],
      });

      expect(str).toMatch(
        `${"`@important` `@essential`"}
### Scenario Outline: eating
`,
      );
    });
  });
});
