module.exports = {
  default: [
    'test/specs/features/**/*.feature',
    '--require test/contract/setup.js',
    '--require test/contract/definitions/**/*.ts',
    '--require test/contract/shared/**/*.ts',
    '--format summary',
    '--format progress-bar',
    // '--format @cucumber/pretty-formatter',
    // '--publish-quiet',
  ].join(' '),
};
