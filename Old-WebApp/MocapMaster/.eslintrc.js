module.exports = {
  root: true,
  parser: "babel-eslint",
  parserOptions: {
    sourceType: "module"
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: "standard",
  // required to lint *.vue files
  plugins: ["html"],
  rules: {
    "no-unused-vars": [1],
    semi: [2, "always"],
    quotes: [2, "double"],
    "space-before-function-paren": [0],
    "no-new": [0],
    "no-unused-expressions": [0],
    "valid-jsdoc": [2],
    "lines-between-class-members": ["error", "always"],
    "padding-line-between-statements": [
      "error",
      {
        blankLine: "always",
        prev: "*",
        next: [
          "block",
          "block-like",
          "cjs-export",
          "class",
          "const",
          "export",
          "import",
          "let",
          "var",
          "function"
        ]
      },
      {
        blankLine: "always",
        prev: [
          "block",
          "block-like",
          "cjs-export",
          "class",
          "const",
          "export",
          "import",
          "let",
          "var",
          "function"
        ],
        next: "*"
      },
      {
        blankLine: "any",
        prev: ["const", "let", "var"],
        next: ["const", "let", "var"]
      },
      {
        blankLine: "any",
        prev: ["export", "import"],
        next: ["export", "import"]
      }
    ]
  }
};
