import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  test: {
    typecheck: {
      enabled: true,
    },
    expect: {
      requireAssertions: true,
    },
  },
  fmt: {
    ignorePatterns: ["packages/mdast-util-gherkin/tests/fixtures/*"],
  },
  lint: { options: { typeAware: true, typeCheck: true } },
  run: {
    cache: true,
  },
});
