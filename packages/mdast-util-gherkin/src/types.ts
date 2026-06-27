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
  GherkinDocString,
  GherkinDataTable,
  GherkinDataParameter,
  GherkinDataArgument,
  GherkinDescription,
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

  interface GherkinExamplesTable extends Table {
    data: {
      gherkin: {
        type: typeof GherkinTypes.EXAMPLES_TABLE;
      };
    };
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

  interface GherkinTagLine extends Paragraph {
    data: {
      gherkin: {
        type: typeof GherkinTypes.TAG_LINE;
      };
    };
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

  interface GherkinTag extends InlineCode {
    data: {
      gherkin: {
        type: typeof GherkinTypes.TAG;
        ident: string;
      };
    };
  }

  interface GherkinDelimitedParameter extends Html {
    data: {
      gherkin: {
        type: typeof GherkinTypes.DELIMITED_PARAMETER;
        ident: string;
      };
    };
  }

  interface GherkinStepLine extends ListItem {
    data: {
      gherkin: {
        type: typeof GherkinTypes.STEP_LINE;
        stepKeyword: keyof typeof StepKeywords;
      };
    };
  }

  interface GherkinDocString extends Code {
    data: {
      gherkin: {
        type: typeof GherkinTypes.DOC_STRING;
      };
    };
  }

  interface GherkinDataTable extends Table {
    data: {
      gherkin: {
        type: typeof GherkinTypes.DATA_TABLE;
      };
    };
  }

  interface GherkinDataParameter extends TableCell {
    data: {
      gherkin: {
        type: typeof GherkinTypes.DATA_PARAMETER;
        ident: string;
      };
    };
  }

  interface GherkinDataArgument extends TableCell {
    data: {
      gherkin: {
        type: typeof GherkinTypes.DATA_ARGUMENT;
        parameterIdent: string;
      };
    };
  }

  interface GherkinDescriptionHeading extends Heading {
    data: {
      gherkin: {
        type: typeof GherkinTypes.DESCRIPTION;
      };
    };
  }

  interface GherkinDescriptionParagraph extends Paragraph {
    data: {
      gherkin: {
        type: typeof GherkinTypes.DESCRIPTION;
      };
    };
  }

  interface GherkinDescriptionTable extends Table {
    data: {
      gherkin: {
        type: typeof GherkinTypes.DESCRIPTION;
      };
    };
  }

  interface GherkinDescriptionHtml extends Html {
    data: {
      gherkin: {
        type: typeof GherkinTypes.DESCRIPTION;
      };
    };
  }

  interface GherkinDescriptionCode extends Code {
    data: {
      gherkin: {
        type: typeof GherkinTypes.DESCRIPTION;
      };
    };
  }

  interface GherkinDescriptionBlockquote extends Blockquote {
    data: {
      gherkin: {
        type: typeof GherkinTypes.DESCRIPTION;
      };
    };
  }

  interface GherkinDescriptionList extends List {
    data: {
      gherkin: {
        type: typeof GherkinTypes.DESCRIPTION;
      };
    };
  }

  interface GherkinDescriptionThematicBreak extends ThematicBreak {
    data: {
      gherkin: {
        type: typeof GherkinTypes.DESCRIPTION;
      };
    };
  }

  export type GherkinDescription =
    | GherkinDescriptionHeading
    | GherkinDescriptionParagraph
    | GherkinDescriptionTable
    | GherkinDescriptionHtml
    | GherkinDescriptionCode
    | GherkinDescriptionBlockquote
    | GherkinDescriptionList
    | GherkinDescriptionThematicBreak;

  // oxlint-disable-next-line no-unused-vars
  interface HeadingData extends Data {
    gherkin?: GherkinSegmentLine["data"]["gherkin"] | GherkinDescriptionHeading["data"]["gherkin"];
  }

  // oxlint-disable-next-line no-unused-vars
  interface TableData extends Data {
    gherkin?:
      | GherkinExamplesTable["data"]["gherkin"]
      | GherkinDataTable["data"]["gherkin"]
      | GherkinDescriptionTable["data"]["gherkin"];
  }

  // oxlint-disable-next-line no-unused-vars
  interface TableCellData extends Data {
    gherkin?:
      | GherkinExampleParameter["data"]["gherkin"]
      | GherkinExampleArgument["data"]["gherkin"]
      | GherkinDataParameter["data"]["gherkin"]
      | GherkinDataArgument["data"]["gherkin"];
  }

  // oxlint-disable-next-line no-unused-vars
  interface ParagraphData extends Data {
    gherkin?: GherkinTagLine["data"]["gherkin"] | GherkinDescriptionParagraph["data"]["gherkin"];
  }

  // oxlint-disable-next-line no-unused-vars
  interface TextData extends Data {
    gherkin?: (
      | GherkinSegmentKeyword
      | GherkinStepKeyword
      | GherkinSegmentDelimiter
      | GherkinSeparator
    )["data"]["gherkin"];
  }

  // oxlint-disable-next-line no-unused-vars
  interface InlineCodeData extends Data {
    gherkin?: GherkinTag["data"]["gherkin"];
  }

  // oxlint-disable-next-line no-unused-vars
  interface HtmlData extends Data {
    gherkin?:
      | GherkinDelimitedParameter["data"]["gherkin"]
      | GherkinDescriptionHtml["data"]["gherkin"];
  }

  // oxlint-disable-next-line no-unused-vars
  interface ListData extends Data {
    gherkin?: GherkinDescriptionList["data"]["gherkin"];
  }

  // oxlint-disable-next-line no-unused-vars
  interface ListItemData extends Data {
    gherkin?: GherkinStepLine["data"]["gherkin"];
  }

  // oxlint-disable-next-line no-unused-vars
  interface CodeData extends Data {
    gherkin?: GherkinDocString["data"]["gherkin"] | GherkinDescriptionCode["data"]["gherkin"];
  }

  // oxlint-disable-next-line no-unused-vars
  interface BlockquoteData extends Data {
    gherkin?: GherkinDescriptionBlockquote["data"]["gherkin"];
  }

  // oxlint-disable-next-line no-unused-vars
  interface ThematicBreakData extends Data {
    gherkin?: GherkinDescriptionThematicBreak["data"]["gherkin"];
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
  | GherkinStepLine
  | GherkinDocString
  | GherkinDataTable
  | GherkinDataParameter
  | GherkinDataArgument
  | GherkinDescription;
