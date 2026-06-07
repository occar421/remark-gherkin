import { expect, expectTypeOf, suite, test } from "vite-plus/test";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gherkinFromMarkdown, getSegmentName, getStepName, testGherkinNode } from "../src/index.ts";
import type {
  Heading,
  ListItem,
  GherkinSegmentLine,
  GherkinStepLine,
  GherkinTagLine,
  GherkinTag,
  GherkinDelimitedParameter,
  GherkinSegmentKeyword,
  GherkinStepKeyword,
  GherkinSegmentDelimiter,
  GherkinSeparator,
  Paragraph,
} from "mdast";

suite("Utilities", () => {
  const getTree = (text: string) =>
    fromMarkdown(text, undefined, { mdastExtensions: [gherkinFromMarkdown()] });

  suite("getSegmentName", () => {
    test("should return segment name from heading", () => {
      const tree = getTree("# Feature: Hello world");
      const heading = tree.children[0] as Heading;
      expect(getSegmentName(heading)).toBe("Hello world");
    });

    test("should return segment name from heading without name", () => {
      const tree = getTree("# Examples:");
      const heading = tree.children[0] as Heading;
      expect(getSegmentName(heading)).toBe("");
    });

    test("should return undefined for non-gherkin heading", () => {
      const tree = getTree("# Normal heading");
      const heading = tree.children[0] as Heading;
      expect(getSegmentName(heading)).toBeUndefined();
    });
  });

  suite("getStepName", () => {
    test("should return step name from list item", () => {
      const tree = getTree("* Given there are <start> cucumbers");
      const list = tree.children[0] as any;
      const listItem = list.children[0] as ListItem;
      expect(getStepName(listItem)).toBe("there are <start> cucumbers");
    });

    test("should return undefined for non-gherkin list item", () => {
      const tree = getTree("* Normal list item");
      const list = tree.children[0] as any;
      const listItem = list.children[0] as ListItem;
      expect(getStepName(listItem)).toBeUndefined();
    });
  });

  suite("testGherkinNode", () => {
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
      // console.log('paragraph children types:', paragraph.children.map(c => c.type));
      // console.log('html data:', (paragraph.children.find(c => c.type === 'html') as any)?.data);
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
  });
});
