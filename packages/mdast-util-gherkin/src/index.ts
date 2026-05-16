import type { Literal, Node } from "mdast";
import type { Extension as FromMarkdownExtension } from "mdast-util-from-markdown";
import type { Options as ToMarkdownExtension } from "mdast-util-to-markdown";
import gherkinTransform from "./gherkinTransform.ts";
import { GHERKIN_KEYWORD_TYPE, GHERKIN_DELIMITED_PARAMETER_TYPE } from "./constant.ts";

export interface GherkinKeyword extends Literal {
  type: typeof GHERKIN_KEYWORD_TYPE;
}
export interface GherkinDelimitedParameter extends Node {
  type: typeof GHERKIN_DELIMITED_PARAMETER_TYPE;
  ident: string;
}

declare module "mdast" {
  interface PhrasingContentMap {
    gherkinKeyword: GherkinKeyword;
    gherkinDelimitedParameter: GherkinDelimitedParameter;
  }
}

export function gherkinFromMarkdown(): FromMarkdownExtension {
  return {
    transforms: [gherkinTransform],
  };
}

export function gherkinToMarkdown(_options: {} = {}): ToMarkdownExtension {
  return {};
}
