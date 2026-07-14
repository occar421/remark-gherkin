import { defineConfig, loadEnv } from "vite-plus";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    base: env.VITE_DEMO_BASE_URL ?? "/",
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
    lint: { options: { typeAware: true, typeCheck: true } },
    run: {
      cache: true,
    },
  };
});
