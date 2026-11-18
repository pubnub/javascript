// Used by .mocharc.cjs and .mocharc.endpoints.cjs (plain CommonJS: Mocha reads its config before tsx is loaded).
// `LIVE_GROUP=<name>` selects one group of ../groups.cjs: the config's `spec` becomes that group's files. Without LIVE_GROUP the
// config keeps its own `spec`. An unknown name, or a group of the other tier, stops the run with a message.
const path = require('node:path');
const groups = require('../groups.cjs');

const LIVE_DIR_FROM_ROOT = 'test/integration/live';

/** The spec list of the selected group, or `fallback` when LIVE_GROUP is not set. `tier` is 'docs' or 'endpoints'. */
function groupSpec(tier, fallback) {
  const name = (process.env.LIVE_GROUP || '').trim();
  if (!name) return fallback;
  const group = groups.find((g) => g.name === name);
  if (!group) {
    throw new Error(
      `LIVE_GROUP=${name} is not a group of ${LIVE_DIR_FROM_ROOT}/groups.cjs. Groups: ${groups.map((g) => g.name).join(', ')}`,
    );
  }
  if (group.tier !== tier) {
    const script = group.tier === 'endpoints' ? 'test:integration:live:endpoints' : 'test:integration:live';
    throw new Error(`LIVE_GROUP=${name} belongs to the ${group.tier} tier. Run it with npm run ${script}.`);
  }
  return group.files.map((file) => path.posix.join(LIVE_DIR_FROM_ROOT, file));
}

module.exports = { groupSpec };
