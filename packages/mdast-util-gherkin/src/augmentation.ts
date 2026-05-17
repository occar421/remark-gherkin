import type { Literal } from "mdast";
import { GherkinTypes } from "./constant.ts";

export interface GherkinSegmentKeyword extends Literal {
  type: typeof GherkinTypes.SEGMENT_KEYWORD_TYPE;
}
export interface GherkinStepKeyword extends Literal {
  type: typeof GherkinTypes.STEP_KEYWORD_TYPE;
}

declare module "mdast" {
  interface PhrasingContentMap {
    gherkinSegmentKeyword: GherkinSegmentKeyword;
    gherkinStepKeyword: GherkinStepKeyword;
  }

  interface Data {
    gherkin?: {
      type?: (typeof GherkinTypes)[keyof typeof GherkinTypes];
      ident?: string;
    };
  }
}
