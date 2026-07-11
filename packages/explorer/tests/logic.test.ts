import { expect, test, describe } from "vite-plus/test";
import { processor, filterNode, findPathAt } from "../src/main.js";

const gherkin = `# Feature: Hello
## Scenario: World
* Given a step
`;

describe("logic", () => {
  test("filterNode should hide location", () => {
    const tree = processor.parse(gherkin);
    const filtered = filterNode(tree, {
      hideLocation: true,
      hideMethods: true,
      hideEmpty: false,
      hideType: false,
    });

    // root node's position should be gone
    expect(filtered.position).toBeUndefined();
  });

  test("filterNode should hide type", () => {
    const tree = processor.parse(gherkin);
    const filtered = filterNode(tree, {
      hideLocation: false,
      hideMethods: true,
      hideEmpty: false,
      hideType: true,
    });

    expect(filtered.type).toBeUndefined();
  });

  test("findPathAt should find correct path", () => {
    const tree = processor.parse(gherkin);
    // "Feature: Hello" is at line 1
    const path = findPathAt(tree, 1, 1);
    expect(path).toBeDefined();
    expect(path).toContain("children");
    expect(path).toContain("0");
  });
});
