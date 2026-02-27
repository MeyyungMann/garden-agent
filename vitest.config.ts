import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "jsdom",
          include: ["src/**/__tests__/unit/**/*.test.{ts,tsx}"],
          setupFiles: ["src/test/setup-unit.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          environment: "node",
          include: ["src/**/__tests__/integration/**/*.test.ts"],
          setupFiles: ["src/test/setup-integration.ts"],
          fileParallelism: false,
          testTimeout: 15000,
        },
      },
    ],
  },
});
