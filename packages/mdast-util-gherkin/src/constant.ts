export const GherkinTypes = {
  TAG_TYPE: "tag",
  TAG_LINE_TYPE: "tagLine",
  SEGMENT_KEYWORD_TYPE: "gherkinSegmentKeyword",
  STEP_KEYWORD_TYPE: "gherkinStepKeyword",
  DELIMITED_PARAMETER_TYPE: "gherkinDelimitedParameter",
} as const;

export const SegmentKeywords = {
  FEATURE_KEYWORD: "Feature:",
  RULE_KEYWORD: "Rule:",
  EXAMPLE_KEYWORD: "Example:",
  SCENARIO_KEYWORD: "Scenario:",
  BACKGROUND_KEYWORD: "Background:",
  SCENARIO_OUTLINE_KEYWORD: "Scenario Outline:",
  SCENARIO_TEMPLATE_KEYWORD: "Scenario Template:",
  EXAMPLES_KEYWORD: "Examples:",
  SCENARIOS_KEYWORD: "Scenarios:",
} as const;

export const StepKeywords = {
  GIVEN_KEYWORD: "Given",
  WHEN_KEYWORD: "When",
  THEN_KEYWORD: "Then",
  AND_KEYWORD: "And",
  BUT_KEYWORD: "But",
} as const;
