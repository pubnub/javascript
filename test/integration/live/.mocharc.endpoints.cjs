// Mocha config of the real-network endpoint tests (test/integration/live/endpoints/**). Run it through
// `npm run test:integration:live:endpoints`. No role is required up front: each test needs its own (`datasync` for the DataSync
// files, which use classes that exist only on the separate DS_* keyset; `open` for the other files) and fails with a "missing keys"
// message naming the env variables when they are absent, so a --grep run needs only the keys of the selected tests. The janitor and the keyset preflight are off by default: their resource list and feature checks
// belong to the docs keysets, and these tests clean up their own uniquely named objects. `LIVE_JANITOR=on` or `LIVE_PREFLIGHT=on`
// in the environment turns either back on. A spec argument on the command line is added to the spec below (Mocha merges them).
// `LIVE_GROUP=<name>` runs only the files of that endpoint-tier group of groups.cjs (support/group-select.cjs).
const { groupSpec } = require('./support/group-select.cjs');

process.env.LIVE_TIER = 'endpoints';
process.env.LIVE_JANITOR ||= 'off';
process.env.LIVE_PREFLIGHT ||= 'off';

module.exports = {
  require: ['tsx', 'test/integration/live/support/hooks.ts'],
  spec: groupSpec('endpoints', ['test/integration/live/endpoints/**/*.test.ts']),
  timeout: 30000,
  retries: 0,
  reporter: 'spec',
};
