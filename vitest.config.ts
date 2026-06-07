import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.{spec,impl}.test.ts"],
    coverage: { provider: "v8", reportsDirectory: "coverage" },
  },
});
