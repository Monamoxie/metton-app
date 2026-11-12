import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import storybook from "eslint-plugin-storybook";

export default defineConfig([
  ...nextVitals,
  ...storybook.configs["flat/recommended"],
  {
    rules: {
      // Existing fetch-in-useEffect pages trip this; warn until they're refactored
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "storybook-static/**",
    "next-env.d.ts",
  ]),
]);
