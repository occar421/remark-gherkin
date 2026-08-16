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
  lint: {
    plugins: ["import"],
    options: { typeAware: true, typeCheck: true },
    rules: {
      "typescript/no-explicit-any": "error",
      "react/exhaustive-deps": "error",
      "eslint/curly": "error",
      "import/extensions": "error",
    },
    overrides: [
      {
        files: ["*.test.ts", "*.spec.ts"],
        rules: {
          "@typescript-eslint/no-explicit-any": "off",
        },
      },
    ],
  },
});
