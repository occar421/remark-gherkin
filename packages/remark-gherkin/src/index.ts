import { gherkin } from "micromark-extention-gherkin";
import { gherkinFromMarkdown, gherkinToMarkdown } from "mdast-util-gherkin";
import type { Root } from "mdast";
import type { Processor } from "unified";

declare module "unified" {
  interface Data {
    micromarkExtensions?: unknown[];
    fromMarkdownExtensions?: unknown[];
    toMarkdownExtensions?: unknown[];
  }
}

export default function remarkGherkin(this: Processor<Root>, options: {} = {}) {
  const data = this.data();

  const micromarkExtensions = data.micromarkExtensions || (data.micromarkExtensions = []);
  const fromMarkdownExtensions = data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);
  const toMarkdownExtensions = data.toMarkdownExtensions || (data.toMarkdownExtensions = []);

  micromarkExtensions.push(gherkin(options));
  fromMarkdownExtensions.push(gherkinFromMarkdown());
  toMarkdownExtensions.push(gherkinToMarkdown(options));
}
