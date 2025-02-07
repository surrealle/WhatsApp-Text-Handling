module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2022,
    sourceType: "commonjs",
  },
  plugins: ["react"],
  rules: {
    "no-console": "warn", // ✅ Warns about console.log, but doesn't error
    "no-unused-vars": "warn", // ✅ Warns about unused imports but doesn't block
    "max-lines": ["warn", { max: 400 }], // ✅ Allows larger files
    "max-lines-per-function": ["warn", { max: 100 }], // ✅ Allows larger functions
    "max-statements": ["warn", { max: 20 }], // ✅ Allows more statements per function
    "no-empty": "off", // ✅ Allows empty blocks (useful for try/catch)
    "sort-imports": "off", // ✅ Disables forced alphabetical imports
    "sort-keys": "off", // ✅ Disables forced sorting of object keys
    "multiline-ternary": "off", // ✅ Allows inline ternary expressions
    "id-length": "off", // ✅ Allows short variable names like `e`
    "require-unicode-regexp": "off", // ✅ Disables forced Unicode regex
    "no-magic-numbers": "off", // ✅ Allows numbers without requiring constants
    camelcase: "warn", // ✅ Warns but doesn't error on camelCase issues
    quotes: ["error", "double"], // ✅ Enforces double quotes for consistency
    semi: ["error", "always"], // ✅ Requires semicolons
    "space-before-function-paren": "off", // ✅ Allows function parentheses without space
    "prefer-const": "warn", // ✅ Encourages `const` but doesn't enforce
    "prefer-arrow-callback": "warn", // ✅ Encourages arrow functions
    "prefer-template": "warn", // ✅ Encourages template literals instead of string concatenation
  },
};
