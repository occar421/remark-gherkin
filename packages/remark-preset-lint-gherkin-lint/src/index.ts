import remarkLint from "remark-lint";
import type { Plugin } from "unified";
import type { Options as AllowedTagsOptions } from "remark-lint-gherkin-allowed-tags";
import type { Options as MaxScenariosPerFileOptions } from "remark-lint-gherkin-max-scenarios-per-file";
import type { Options as NameLengthOptions } from "remark-lint-gherkin-name-length";
import type { Options as NoDupeScenarioNamesOptions } from "remark-lint-gherkin-no-dupe-scenario-names";
import type { RestrictedPatterns as NoRestrictedPatternsOptions } from "remark-lint-gherkin-no-restricted-patterns";
import type { Options as NoRestrictedTagsOptions } from "remark-lint-gherkin-no-restricted-tags";
import type { Options as RequiredTagsOptions } from "remark-lint-gherkin-required-tags";
import type { Options as ScenarioSizeOptions } from "remark-lint-gherkin-scenario-size";
import remarkLintGherkinNoTagsOnBackgrounds from "remark-lint-gherkin-no-tags-on-backgrounds";
import remarkLintGherkinOneFeaturePerFile from "remark-lint-gherkin-one-feature-per-file";
import remarkLintGherkinUpToOneBackgroundPerFile from "remark-lint-gherkin-up-to-one-background-per-file";
import remarkLintGherkinAllowedTags from "remark-lint-gherkin-allowed-tags";
import remarkLintGherkinMaxScenariosPerFile from "remark-lint-gherkin-max-scenarios-per-file";
import remarkLintGherkinNameLength from "remark-lint-gherkin-name-length";
import remarkLintGherkinNoBackgroundOnlyScenario from "remark-lint-gherkin-no-background-only-scenario";
import remarkLintGherkinNoDupeFeatureNames from "remark-lint-gherkin-no-dupe-feature-names";
import remarkLintGherkinNoDupeScenarioNames from "remark-lint-gherkin-no-dupe-scenario-names";
import remarkLintGherkinNoDuplicateTags from "remark-lint-gherkin-no-duplicate-tags";
import remarkLintGherkinNoEmptyBackground from "remark-lint-gherkin-no-empty-background";
import remarkLintGherkinNoExamplesInScenarios from "remark-lint-gherkin-no-examples-in-scenarios";
import remarkLintGherkinNoFilesWithoutScenarios from "remark-lint-gherkin-no-files-without-scenarios";
import remarkLintGherkinNoPartiallyCommentedTagLines from "remark-lint-gherkin-no-partially-commented-tag-lines";
import remarkLintGherkinNoRestrictedPatterns from "remark-lint-gherkin-no-restricted-patterns";
import remarkLintGherkinNoRestrictedTags from "remark-lint-gherkin-no-restricted-tags";
import remarkLintGherkinNoScenarioOutlinesWithoutExamples from "remark-lint-gherkin-no-scenario-outlines-without-examples";
import remarkLintGherkinNoSuperfluousTags from "remark-lint-gherkin-no-superfluous-tags";
import remarkLintGherkinNoUnnamedFeatures from "remark-lint-gherkin-no-unnamed-features";
import remarkLintGherkinNoUnnamedScenarios from "remark-lint-gherkin-no-unnamed-scenarios";
import remarkLintGherkinNoUnusedVariables from "remark-lint-gherkin-no-unused-variables";
import remarkLintGherkinOneSpaceBetweenTags from "remark-lint-gherkin-one-space-between-tags";
import remarkLintGherkinRequiredTags from "remark-lint-gherkin-required-tags";
import remarkLintGherkinScenarioSize from "remark-lint-gherkin-scenario-size";
import remarkLintGherkinUseAnd from "remark-lint-gherkin-use-and";
import remarkLintGherkinKeywordsInLogicalOrder from "remark-lint-gherkin-keywords-in-logical-order";
import remarkLintGherkinOnlyOneWhen from "remark-lint-gherkin-only-one-when";

export type PresetOptions = {
  rules?: {
    "remark-lint-gherkin-allowed-tags"?: AllowedTagsOptions;
    "remark-lint-gherkin-max-scenarios-per-file"?: MaxScenariosPerFileOptions;
    "remark-lint-gherkin-name-length"?: NameLengthOptions;
    "remark-lint-gherkin-no-dupe-scenario-names"?: NoDupeScenarioNamesOptions;
    "remark-lint-gherkin-no-restricted-patterns"?: NoRestrictedPatternsOptions;
    "remark-lint-gherkin-no-restricted-tags"?: NoRestrictedTagsOptions;
    "remark-lint-gherkin-required-tags"?: RequiredTagsOptions;
    "remark-lint-gherkin-scenario-size"?: ScenarioSizeOptions;
  };
};

const remarkPresetLintGherkinLint: Plugin<[PresetOptions?]> = function (options?: PresetOptions) {
  const rules = options?.rules;

  this.use(remarkLint);
  this.use(remarkLintGherkinNoTagsOnBackgrounds);
  this.use(remarkLintGherkinOneFeaturePerFile);
  this.use(remarkLintGherkinUpToOneBackgroundPerFile);
  this.use(remarkLintGherkinAllowedTags, rules?.["remark-lint-gherkin-allowed-tags"]);
  this.use(
    remarkLintGherkinMaxScenariosPerFile,
    rules?.["remark-lint-gherkin-max-scenarios-per-file"],
  );
  this.use(remarkLintGherkinNameLength, rules?.["remark-lint-gherkin-name-length"]);
  this.use(remarkLintGherkinNoBackgroundOnlyScenario);
  this.use(remarkLintGherkinNoDupeFeatureNames);
  this.use(
    remarkLintGherkinNoDupeScenarioNames,
    rules?.["remark-lint-gherkin-no-dupe-scenario-names"],
  );
  this.use(remarkLintGherkinNoDuplicateTags);
  this.use(remarkLintGherkinNoEmptyBackground);
  this.use(remarkLintGherkinNoExamplesInScenarios);
  this.use(remarkLintGherkinNoFilesWithoutScenarios);
  this.use(remarkLintGherkinNoPartiallyCommentedTagLines);
  this.use(
    remarkLintGherkinNoRestrictedPatterns,
    rules?.["remark-lint-gherkin-no-restricted-patterns"],
  );
  this.use(remarkLintGherkinNoRestrictedTags, rules?.["remark-lint-gherkin-no-restricted-tags"]);
  this.use(remarkLintGherkinNoScenarioOutlinesWithoutExamples);
  this.use(remarkLintGherkinNoSuperfluousTags);
  this.use(remarkLintGherkinNoUnnamedFeatures);
  this.use(remarkLintGherkinNoUnnamedScenarios);
  this.use(remarkLintGherkinNoUnusedVariables);
  this.use(remarkLintGherkinOneSpaceBetweenTags);
  this.use(remarkLintGherkinRequiredTags, rules?.["remark-lint-gherkin-required-tags"]);
  this.use(remarkLintGherkinScenarioSize, rules?.["remark-lint-gherkin-scenario-size"]);
  this.use(remarkLintGherkinUseAnd);
  this.use(remarkLintGherkinKeywordsInLogicalOrder);
  this.use(remarkLintGherkinOnlyOneWhen);
};

export default remarkPresetLintGherkinLint;
