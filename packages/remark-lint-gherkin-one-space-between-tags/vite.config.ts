import { defineConfig } from "vite-plus";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["mdast-util-gherkin", "remark-lint", "unified-lint-rule", "unist-util-visit"],
    },
  },
});
