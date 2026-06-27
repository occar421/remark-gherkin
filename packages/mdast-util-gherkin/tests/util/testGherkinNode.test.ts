import { expect, expectTypeOf, suite, test } from "vite-plus/test";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gherkinFromMarkdown, testGherkinNode } from "../../src/index.ts";
import type {
  GherkinSegmentLine,
  GherkinStepLine,
  GherkinTagLine,
  GherkinTag,
  GherkinDelimitedParameter,
  GherkinSegmentKeyword,
  GherkinStepKeyword,
  GherkinSegmentDelimiter,
  GherkinSeparator,
  GherkinDescription,
  Paragraph,
} from "mdast";

suite("testGherkinNode", () => {
  const getTree = (text: string) =>
    fromMarkdown(text, undefined, { mdastExtensions: [gherkinFromMarkdown()] });

  test("without argument should match any Gherkin node", () => {
    const tree = getTree("`@tag`\n# Feature: Hello\n* Given step");
    const tagLine = tree.children[0];
    const segmentLine = tree.children[1];
    const list = tree.children[2] as any;
    const stepLine = list.children[0];

    const tester = testGherkinNode();
    expect(tester(tagLine)).toBe(true);
    expect(tester(segmentLine)).toBe(true);
    expect(tester(stepLine)).toBe(true);
    expect(tester({ type: "paragraph" })).toBe(false);
  });

  test("segmentLine", () => {
    const tree = getTree("# Feature: Hello world");
    const segment = tree.children[0];
    if (testGherkinNode("segmentLine")(segment)) {
      expectTypeOf(segment).toEqualTypeOf<GherkinSegmentLine>();
      expect(segment.data.gherkin.type).toBe("segmentLine");
      expect(segment.data.gherkin.segmentKeyword).toBe("Feature");
    } else {
      expect.fail("Should be segmentLine");
    }
  });

  test("stepLine", () => {
    const tree = getTree("* Given step");
    const list = tree.children[0] as any;
    const step = list.children[0];
    if (testGherkinNode("stepLine")(step)) {
      expectTypeOf(step).toEqualTypeOf<GherkinStepLine>();
      expect(step.data.gherkin.type).toBe("stepLine");
      expect(step.data.gherkin.stepKeyword).toBe("Given");
    } else {
      expect.fail("Should be stepLine");
    }
  });

  test("tagLine", () => {
    const tree = getTree("`@tag`\n# Feature: Hello");
    // tree.children[0] is paragraph (`@tag`)
    // tree.children[1] is heading (# Feature: Hello)
    const tagLine = tree.children[0];
    if (testGherkinNode("tagLine")(tagLine)) {
      expectTypeOf(tagLine).toEqualTypeOf<GherkinTagLine>();
      expect(tagLine.data.gherkin.type).toBe("tagLine");
    } else {
      expect.fail("Should be tagLine");
    }
  });

  test("tag", () => {
    const tree = getTree("`@tag`\n# Feature: Hello");
    const tagLine = tree.children[0] as Paragraph;
    const tag = tagLine.children[0];
    if (testGherkinNode("tag")(tag)) {
      expectTypeOf(tag).toEqualTypeOf<GherkinTag>();
      expect(tag.data.gherkin.type).toBe("tag");
      expect(tag.data.gherkin.ident).toBe("tag");
    } else {
      expect.fail("Should be tag");
    }
  });

  test("delimitedParameter", () => {
    const tree = getTree("* Given <param>");
    const list = tree.children[0] as any;
    const stepLine = list.children[0] as GherkinStepLine;
    const paragraph = stepLine.children[0] as Paragraph;
    const param = paragraph.children.find((c) => c.type === "html")!;
    if (testGherkinNode("delimitedParameter")(param)) {
      expectTypeOf(param).toEqualTypeOf<GherkinDelimitedParameter>();
      expect(param.data.gherkin.type).toBe("delimitedParameter");
      expect(param.data.gherkin.ident).toBe("param");
    } else {
      expect.fail("Should be delimitedParameter");
    }
  });

  test("segmentKeyword, separator and segmentDelimiter", () => {
    const tree = getTree("# Feature: Hello");
    const segmentLine = tree.children[0] as GherkinSegmentLine;
    const keyword = segmentLine.children[0];
    const separator = segmentLine.children[2]; // Keyword(0), Delimiter(1), Separator(2)
    const delimiter = segmentLine.children[1];

    if (testGherkinNode("segmentKeyword")(keyword)) {
      expectTypeOf(keyword).toEqualTypeOf<GherkinSegmentKeyword>();
      expect(keyword.data.gherkin.type).toBe("segmentKeyword");
      expect(keyword.data.gherkin.keyword).toBe("Feature");
    } else {
      expect.fail("Should be segmentKeyword");
    }

    if (testGherkinNode("separator")(separator)) {
      expectTypeOf(separator).toEqualTypeOf<GherkinSeparator>();
      expect(separator.data.gherkin.type).toBe("separator");
    } else {
      expect.fail("Should be separator");
    }

    if (testGherkinNode("segmentDelimiter")(delimiter)) {
      expectTypeOf(delimiter).toEqualTypeOf<GherkinSegmentDelimiter>();
      expect(delimiter.data.gherkin.type).toBe("segmentDelimiter");
    } else {
      expect.fail("Should be segmentDelimiter");
    }
  });

  test("stepKeyword", () => {
    const tree = getTree("* Given step");
    const list = tree.children[0] as any;
    const stepLine = list.children[0] as GherkinStepLine;
    const paragraph = stepLine.children[0] as Paragraph;
    const keyword = paragraph.children[0];

    if (testGherkinNode("stepKeyword")(keyword)) {
      expectTypeOf(keyword).toEqualTypeOf<GherkinStepKeyword>();
      expect(keyword.data.gherkin.type).toBe("stepKeyword");
      expect(keyword.data.gherkin.keyword).toBe("Given");
    } else {
      expect.fail("Should be stepKeyword");
    }
  });

  test("should return false for non-matching type", () => {
    const tree = getTree("# Feature: Hello");
    const segmentLine = tree.children[0];
    expect(testGherkinNode("stepLine")(segmentLine)).toBe(false);
  });

  test("description", () => {
    const tree = getTree("# Feature: Hello\n\nDescription paragraph");
    // child 0: segmentLine
    // child 1: description paragraph
    const description = tree.children[1];
    if (testGherkinNode("description")(description)) {
      expectTypeOf(description).toEqualTypeOf<GherkinDescription>();
      expect(description.data.gherkin.type).toBe("description");
    } else {
      expect.fail("Should be description");
    }
  });
});
