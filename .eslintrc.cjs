module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true,
  },
  ignorePatterns: [
    "node_modules/",
    "dist/",
    "build/",
    "coverage/",
    ".turbo/",
    ".next/",
    "out/",
    "archive/",
  ],
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      parser: require.resolve("@typescript-eslint/parser"),
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      extends: ["eslint:recommended"],
      rules: {
        "no-undef": "off",
        "no-unused-vars": [
          "warn",
          {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
          },
        ],
      },
    },
  ],
};
