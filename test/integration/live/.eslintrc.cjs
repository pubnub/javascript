// The root `npm run lint` covers src/ only. Run the tier with `npx eslint "test/integration/live/**/*.ts"`. This file lets
// long comments and test titles pass; the sample lines between the markers are never reformatted.
module.exports = {
  rules: {
    'max-len': [
      'error',
      { code: 120, tabWidth: 2, ignoreComments: true, ignoreStrings: true, ignoreTemplateLiterals: true },
    ],
  },
};
