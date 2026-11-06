// snippet.migrationV8AfterImport
import PubNub, { AppContext } from 'pubnub'

// snippet.end
import assert from '../harness/assert.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { page, step, check } from '../harness/step.js';
import { tscProject } from '../harness/tsc-project.js';

/**
 * Examples for the version 8 migration guide.
 */
const HERE = path.dirname(fileURLToPath(import.meta.url));

export default page('migration-guides/v8', 'P0', () => {
  step('migrationV8AfterParams', { proves: 'The typed parameters constant of the v8 guide compiles against the SDK types.' }, () => {
    void PubNub;
    // snippet.migrationV8AfterParams
    // other code

    const params: AppContext.GetMembershipsParameters = {};
    // snippet.end
    assert.deepEqual(params, {});
  });

  check('migrationV8TypeImports', { timeout: 90_000, proves: 'The before sample for type imports fails to compile and the after sample compiles.' }, () => {
    const before = tscProject(HERE, {
      'before.ts': `import PubNub, { GetMembershipsParameters } from 'pubnub'\n\nconst params: GetMembershipsParameters = {};\n`,
    });
    assert.equal(before.ok, false, 'importing GetMembershipsParameters directly fails in 8.x.x');
    assert.match(before.output, /GetMembershipsParameters/);

    const namespaces = ['Subscription', 'AppContext', 'ChannelGroups', 'Publish', 'Signal', 'Presence', 'History', 'MessageAction', 'FileSharing', 'PAM', 'Time', 'Push'];
    const after = tscProject(HERE, {
      'after.ts': `import PubNub, { ${namespaces.join(', ')} } from 'pubnub'\n\nconst params: AppContext.GetMembershipsParameters = {};\nvoid PubNub; void params;\n`,
    });
    assert.ok(after.ok, `the 8.x.x import and every namespace compile.\n${after.output}`);
  });
});
