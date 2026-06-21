import type { Preset } from "unified";
import remarkLint from "remark-lint";
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

const remarkPresetLintGherkinLint: Preset = {
  plugins: [
    remarkLint,
    remarkLintGherkinNoTagsOnBackgrounds,
    remarkLintGherkinOneFeaturePerFile,
    remarkLintGherkinUpToOneBackgroundPerFile,
    remarkLintGherkinAllowedTags,
    remarkLintGherkinMaxScenariosPerFile,
    remarkLintGherkinNameLength,
    remarkLintGherkinNoBackgroundOnlyScenario,
    remarkLintGherkinNoDupeFeatureNames,
    remarkLintGherkinNoDupeScenarioNames,
    remarkLintGherkinNoDuplicateTags,
    remarkLintGherkinNoEmptyBackground,
    remarkLintGherkinNoExamplesInScenarios,
    remarkLintGherkinNoFilesWithoutScenarios,
    remarkLintGherkinNoPartiallyCommentedTagLines,
    remarkLintGherkinNoRestrictedPatterns,
    remarkLintGherkinNoRestrictedTags,
    remarkLintGherkinNoScenarioOutlinesWithoutExamples,
    remarkLintGherkinNoSuperfluousTags,
    remarkLintGherkinNoUnnamedFeatures,
    remarkLintGherkinNoUnnamedScenarios,
    remarkLintGherkinNoUnusedVariables,
    remarkLintGherkinOneSpaceBetweenTags,
    remarkLintGherkinRequiredTags,
    remarkLintGherkinScenarioSize,
    remarkLintGherkinUseAnd,
    remarkLintGherkinKeywordsInLogicalOrder,
    remarkLintGherkinOnlyOneWhen,
  ],
};

export default remarkPresetLintGherkinLint;
