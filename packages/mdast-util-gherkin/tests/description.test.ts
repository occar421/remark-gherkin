import { expect, suite, test } from "vite-plus/test";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gherkinFromMarkdown } from "../src/index.ts";
import { gfmTable } from "micromark-extension-gfm-table";
import { gfmTableFromMarkdown } from "mdast-util-gfm-table";

suite("Gherkin description", () => {
  const getTree = (text: string) =>
    fromMarkdown(text, undefined, {
      extensions: [gfmTable()],
      mdastExtensions: [gfmTableFromMarkdown(), gherkinFromMarkdown()],
    });

  test("Identify description between Feature and Scenario", () => {
    const tree = getTree(`
# Feature: User login

This is a feature description.
It can have multiple lines.

## Scenario: Successful login
    `);

    // Children: [Feature heading, description paragraph, Scenario heading]
    expect(tree.children).toHaveLength(3);

    // Feature heading
    expect(tree.children[0].data?.gherkin).toMatchObject({
      type: "segmentLine",
      segmentKeyword: "Feature",
    });

    // Description paragraph
    expect(tree.children[1].type).toBe("paragraph");
    expect(tree.children[1].data?.gherkin).toMatchObject({
      type: "description",
    });

    // Scenario heading
    expect(tree.children[2].data?.gherkin).toMatchObject({
      type: "segmentLine",
      segmentKeyword: "Scenario",
    });
  });

  test("Identify description between Scenario and Steps", () => {
    const tree = getTree(`
# Scenario: Successful login
  
This is a scenario description.

* Given a user
    `);

    expect(tree.children).toHaveLength(3);

    // Scenario heading
    expect(tree.children[0].data?.gherkin).toMatchObject({
      type: "segmentLine",
      segmentKeyword: "Scenario",
    });

    // Description paragraph
    expect(tree.children[1].type).toBe("paragraph");
    expect(tree.children[1].data?.gherkin).toMatchObject({
      type: "description",
    });

    // Step list
    expect(tree.children[2].type).toBe("list");
  });

  test("Identify description containing code blocks", () => {
    const tree = getTree(`
# Feature: Code block in description

This description has a code block:

\`\`\`javascript
console.log("hello");
\`\`\`

And some text after.

## Scenario: Some scenario
    `);

    // Children: [Feature heading, description paragraph, description code, description paragraph, Scenario heading]
    expect(tree.children).toHaveLength(5);

    // Feature
    expect(tree.children[0].data?.gherkin).toMatchObject({
      type: "segmentLine",
      segmentKeyword: "Feature",
    });

    // Description Paragraph 1
    expect(tree.children[1].type).toBe("paragraph");
    expect(tree.children[1].data?.gherkin).toMatchObject({ type: "description" });

    // Description Code
    expect(tree.children[2].type).toBe("code");
    expect(tree.children[3].data?.gherkin).toMatchObject({ type: "description" });

    // Description Paragraph 2
    expect(tree.children[3].type).toBe("paragraph");
    expect(tree.children[3].data?.gherkin).toMatchObject({ type: "description" });

    // Scenario
    expect(tree.children[4].data?.gherkin).toMatchObject({
      type: "segmentLine",
      segmentKeyword: "Scenario",
    });
  });

  test("Identify description containing tables", () => {
    const tree = getTree(`
# Feature: Table in description

Description before table.

| col1 | col2 |
| ---- | ---- |
| val1 | val2 |

Description after table.

* Given something
    `);

    // Children: [Feature heading, description paragraph, description table, description paragraph, Step list]
    expect(tree.children).toHaveLength(5);

    // Feature
    expect(tree.children[0].data?.gherkin).toMatchObject({
      type: "segmentLine",
      segmentKeyword: "Feature",
    });

    // Description Paragraph 1
    expect(tree.children[1].type).toBe("paragraph");
    expect(tree.children[1].data?.gherkin).toMatchObject({ type: "description" });

    // Description Table
    expect(tree.children[2].type).toBe("table");
    expect(tree.children[3].data?.gherkin).toMatchObject({ type: "description" });

    // Description Paragraph 2
    expect(tree.children[3].type).toBe("paragraph");
    expect(tree.children[3].data?.gherkin).toMatchObject({ type: "description" });

    // Step list
    expect(tree.children[4].type).toBe("list");
  });
});
