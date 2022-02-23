module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "mocha", "prettier"],
  extends: ["airbnb", "plugin:@typescript-eslint/recommended"],
  rules: {
    "prettier/prettier": "error",
  },
};
