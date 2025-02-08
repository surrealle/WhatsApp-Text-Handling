import react from "eslint-plugin-react";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends("eslint:recommended"),
  {
    plugins: {
      react,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      ecmaVersion: 2022,
      sourceType: "module",

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    rules: {
      "no-console": "warn",
      "no-unused-vars": "warn",

      "max-lines": [
        "warn",
        {
          max: 400,
        },
      ],

      "max-lines-per-function": [
        "warn",
        {
          max: 100,
        },
      ],

      "max-statements": [
        "warn",
        {
          max: 20,
        },
      ],

      "no-empty": "off",
      "sort-imports": "off",
      "sort-keys": "off",
      "multiline-ternary": "off",
      "id-length": "off",
      "require-unicode-regexp": "off",
      "no-magic-numbers": "off",
      camelcase: "warn",
      quotes: ["error", "double"],
      semi: ["error", "always"],
      "space-before-function-paren": "off",
      "prefer-const": "warn",
      "prefer-arrow-callback": "warn",
      "prefer-template": "warn",
    },
  },
];
