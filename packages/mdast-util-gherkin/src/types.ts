import type { GherkinTypes, SegmentKeywords, StepKeywords } from "./constant.ts";
import type {
  GherkinDelimitedParameter,
  GherkinSegmentLine,
  GherkinSegmentDelimiter,
  GherkinSegmentKeyword,
  GherkinSeparator,
  GherkinStepKeyword,
  GherkinStepLine,
  GherkinTag,
  GherkinTagLine,
  GherkinExamplesTable,
  GherkinExampleParameter,
  GherkinExampleArgument,
} from "mdast";

declare module "mdast" {
  interface GherkinSegmentLine extends Heading {
    data: {
      gherkin: {
        type: typeof GherkinTypes.SEGMENT_LINE;
        segmentKeyword: keyof typeof SegmentKeywords;
      };
    };
  }

  interface HeadingData extends Data {
    gherkin?: GherkinSegmentLine["data"]["gherkin"];
  }

  interface GherkinExamplesTable extends Table {
    data: {
      gherkin: {
        type: typeof GherkinTypes.EXAMPLES_TABLE;
      };
    };
  }

  interface TableData extends Data {
    gherkin?: GherkinExamplesTable["data"]["gherkin"];
  }

  interface GherkinExampleParameter extends TableCell {
    data: {
      gherkin: {
        type: typeof GherkinTypes.EXAMPLE_PARAMETER;
        ident: string;
      };
    };
  }

  interface GherkinExampleArgument extends TableCell {
    data: {
      gherkin: {
        type: typeof GherkinTypes.EXAMPLE_ARGUMENT;
        parameterIdent: string;
      };
    };
  }

  interface TableCellData extends Data {
    gherkin?:
      | GherkinExampleParameter["data"]["gherkin"]
      | GherkinExampleArgument["data"]["gherkin"];
  }

  interface GherkinTagLine extends Paragraph {
    data: {
      gherkin: {
        type: typeof GherkinTypes.TAG_LINE;
      };
    };
  }

  interface ParagraphData extends Data {
    gherkin?: GherkinTagLine["data"]["gherkin"];
  }

  interface GherkinSegmentKeyword extends Text {
    data: {
      gherkin: {
        type: typeof GherkinTypes.SEGMENT_KEYWORD;
        keyword: keyof typeof SegmentKeywords;
      };
    };
  }

  interface GherkinStepKeyword extends Text {
    data: {
      gherkin: {
        type: typeof GherkinTypes.STEP_KEYWORD;
        keyword: keyof typeof StepKeywords;
      };
    };
  }

  interface GherkinSegmentDelimiter extends Text {
    data: {
      gherkin: {
        type: typeof GherkinTypes.SEGMENT_DELIMITER;
      };
    };
  }

  interface GherkinSeparator extends Text {
    data: {
      gherkin: {
        type: typeof GherkinTypes.SEPARATOR;
      };
    };
  }

  interface TextData extends Data {
    gherkin?: (
      | GherkinSegmentKeyword
      | GherkinStepKeyword
      | GherkinSegmentDelimiter
      | GherkinSeparator
    )["data"]["gherkin"];
  }

  interface GherkinTag extends InlineCode {
    data: {
      gherkin: {
        type: typeof GherkinTypes.TAG;
        ident: string;
      };
    };
  }

  interface InlineCodeData extends Data {
    gherkin?: GherkinTag["data"]["gherkin"];
  }

  interface GherkinDelimitedParameter extends Html {
    data: {
      gherkin: {
        type: typeof GherkinTypes.DELIMITED_PARAMETER;
        ident: string;
      };
    };
  }

  interface HtmlData extends Data {
    gherkin?: GherkinDelimitedParameter["data"]["gherkin"];
  }

  interface GherkinStepLine extends ListItem {
    data: {
      gherkin: {
        type: typeof GherkinTypes.STEP_LINE;
        stepKeyword: keyof typeof StepKeywords;
      };
    };
  }

  interface ListItemData extends Data {
    gherkin?: GherkinStepLine["data"]["gherkin"];
  }

  interface Data {
    gherkin?: GherkinNodes["data"]["gherkin"];
  }
}

export type GherkinNodes =
  | GherkinSegmentLine
  | GherkinTagLine
  | GherkinSegmentKeyword
  | GherkinExamplesTable
  | GherkinExampleParameter
  | GherkinExampleArgument
  | GherkinStepKeyword
  | GherkinSegmentDelimiter
  | GherkinSeparator
  | GherkinTag
  | GherkinDelimitedParameter
  | GherkinStepLine;
