import { expect, suite, test } from "vite-plus/test";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import remarkGherkin from "../src/index.ts";

suite("remark-gherkin", () => {
  const toHtml = unified()
    .use(remarkParse)
    .use(remarkGherkin)
    .use(remarkRehype) // TODO make this plugin
    .use(rehypeStringify);

  test("Should parse Gherkin", () => {
    const html = toHtml
      .processSync("# Feature: Test Feature\n## Scenario: Test Scenario\n- Given a test step")
      .toString();
    console.log(html);
    expect(html).toContain("<h1>Feature: Test Feature</h1>");
    expect(html).toContain("<h2>Scenario: Test Scenario</h2>");
    expect(html).toContain("<li>Given a test step</li>");
  });
});
