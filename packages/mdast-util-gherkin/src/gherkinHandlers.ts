import { GherkinTypes } from "./constant.ts";
import type { Handle } from "mdast-util-to-markdown";
import { findAfter } from "unist-util-find-after";

const handlers: Record<string, Handle> = {
  [GherkinTypes.SEGMENT_KEYWORD_TYPE]: (node, parent) => {
    const next = findAfter(parent!, node);

    if (!next) {
      return node.value; // e.g. ### Examples:\n
    }

    return `${node.value} `; // e.g. # Feature: ???
  },
  [GherkinTypes.STEP_KEYWORD_TYPE]: (node) => {
    return `${node.value} `;
  },
  [GherkinTypes.DELIMITED_PARAMETER_TYPE]: (node) => {
    return `<${node.ident}>`;
  },
};

export default handlers;
