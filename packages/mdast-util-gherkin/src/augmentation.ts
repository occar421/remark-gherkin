import type { Literal, Node } from "mdast";
import { GherkinTypes } from "./constant.ts";

export interface GherkinSegmentKeyword extends Literal {
  type: typeof GherkinTypes.SEGMENT_KEYWORD_TYPE;
}
export interface GherkinStepKeyword extends Literal {
  type: typeof GherkinTypes.STEP_KEYWORD_TYPE;
}
export interface GherkinDelimitedParameter extends Node {
  type: typeof GherkinTypes.DELIMITED_PARAMETER_TYPE;
  ident: string;
}

declare module "mdast" {
  interface PhrasingContentMap {
    gherkinSegmentKeyword: GherkinSegmentKeyword;
    gherkinStepKeyword: GherkinStepKeyword;
    gherkinDelimitedParameter: GherkinDelimitedParameter;
  }

  interface Data {
    gherkin?: {
      type?: (typeof GherkinTypes)[keyof typeof GherkinTypes];
    };
  }
}
