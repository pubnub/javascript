'use strict';
/**
 * Mocha options of the live docs snippet suite. harness/cli.ts reads them and adds the staged spec file, which only exists
 * after staging (docs-snippets/.run/<runId>/harness/mocha-entry.ts). This file is separate from the SDK's root .mocharc.json
 * on purpose: the suite never loads test/setup-why.ts (it restores nock) and the root spec never picks up the suite.
 *
 * retries 0: a retry would hide a flaky docs sample, waits are explicit (harness/wait.ts). bail false: one failing step must
 * not hide the others.
 */
module.exports = {
  reporter: require('node:path').join(__dirname, 'harness', 'reporter.cjs'),
  retries: 0,
  timeout: 30000,
  bail: false,
};
