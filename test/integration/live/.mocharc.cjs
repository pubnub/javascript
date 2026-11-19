// Mocha config of the live tier's docs-sample tests (everything except endpoints/). Run it through `npm run test:integration:live`,
// which also sets TSX_TSCONFIG_PATH so that `import PubNub from 'pubnub'` resolves to the built library (lib/node/index.js).
// Paths are relative to the repository root. The tests of endpoints/ have their own config, .mocharc.endpoints.cjs.
// `LIVE_GROUP=<name>` runs only the files of that docs-tier group of groups.cjs (support/group-select.cjs).
const { groupSpec } = require('./support/group-select.cjs');

module.exports = {
  require: ['tsx', 'test/integration/live/support/hooks.ts'],
  spec: groupSpec('docs', ['test/integration/live/**/*.test.ts']),
  exclude: ['test/integration/live/endpoints/**'],
  timeout: 30000,
  retries: 0,
  reporter: 'spec',
};
