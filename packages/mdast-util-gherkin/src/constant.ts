export const Types = {
  GHERKIN_TAG_TYPE: "gherkinTag",
  GHERKIN_SEGMENT_KEYWORD_TYPE: "gherkinSegmentKeyword",
  GHERKIN_STEP_KEYWORD_TYPE: "gherkinStepKeyword",
  GHERKIN_DELIMITED_PARAMETER_TYPE: "gherkinDelimitedParameter",
} as const;

export const SegmentKeywords = {
  FEATURE_KEYWORD: "Feature:",
  BACKGROUND_KEYWORD: "Background:",
  RULE_KEYWORD: "Rule:",
  SCENARIO_KEYWORD: "Scenario:",
  SCENARIO_OUTLINE_KEYWORD: "Scenario Outline:",
  EXAMPLE_KEYWORD: "Example:",
} as const;

export const StepKeywords = {
  GIVEN_KEYWORD: "Given",
  WHEN_KEYWORD: "When",
  THEN_KEYWORD: "Then",
  AND_KEYWORD: "And",
  BUT_KEYWORD: "But",
} as const;
