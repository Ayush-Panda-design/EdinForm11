import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextJsConfig,
  {
    rules: {
      // TypeScript handles prop validation; shadcn UI components trigger false positives
      "react/prop-types": "off",
      // Marketing copy uses natural apostrophes/quotes
      "react/no-unescaped-entities": "off",
    },
  },
  {
    files: ["env.js"],
    languageOptions: {
      globals: {
        process: "readonly",
      },
    },
    rules: {
      "turbo/no-undeclared-env-vars": "off",
    },
  },
];
