import type { Join } from "mdast-util-to-markdown";
import { testGherkinNode } from "./util/index.ts";

const gherkinTagJoin: Join = (left, right) => {
  if (testGherkinNode("tagLine")(left) && testGherkinNode("segmentLine")(right)) {
    return 0;
  }
  return true;
};

export default [gherkinTagJoin];
