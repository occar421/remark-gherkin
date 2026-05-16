import type { Extension as FromMarkdownExtension } from "mdast-util-from-markdown";
import type { Options as ToMarkdownExtension } from "mdast-util-to-markdown";

export function gherkinFromMarkdown(): FromMarkdownExtension {
  return {};
}

export function gherkinToMarkdown(_options: {} = {}): ToMarkdownExtension {
  return {};
}
