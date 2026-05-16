import { visit } from "unist-util-visit";
import type { Literal } from "mdast";
import type { Extension as FromMarkdownExtension, Transform } from "mdast-util-from-markdown";
import type { Options as ToMarkdownExtension } from "mdast-util-to-markdown";

const GHERKIN_KEYWORD_TYPE = "gherkinKeyword" as const;
const FEATURE_KEYWORD = "Feature:";
const BACKGROUND_KEYWORD = "Background:";

export interface GherkinKeyword extends Literal {
  type: typeof GHERKIN_KEYWORD_TYPE;
}

declare module "mdast" {
  interface PhrasingContentMap {
    gherkinKeyword: GherkinKeyword;
  }
}

export function gherkinFromMarkdown(): FromMarkdownExtension {
  return {
    transforms: [gherkinTransform],
  };
}

const gherkinTransform: Transform = (tree) => {
  visit(tree, "heading", (node) => {
    if (node.children.length === 0) {
      return;
    }

    const firstChild = node.children[0];
    if (firstChild.type === "text") {
      for (const keyword of [FEATURE_KEYWORD, BACKGROUND_KEYWORD]) {
        if (firstChild.value.startsWith(`${keyword} `)) {
          // prevent text directive `:color[]{}`
          node.children.shift(); // === firstChild
          node.children.unshift({
            type: "text",
            value: firstChild.value.slice(keyword.length + 1),
          });
          node.children.unshift({ type: GHERKIN_KEYWORD_TYPE, value: keyword });
        }
      }
    }
  });

  return tree;
};

export function gherkinToMarkdown(_options: {} = {}): ToMarkdownExtension {
  return {};
}
