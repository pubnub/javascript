import assert from 'node:assert/strict';
/* eslint-disable prettier/prettier -- the sample text is shown to readers as written */
// snippet.migrationV8AfterImport
import PubNub, { AppContext } from 'pubnub'

// snippet.end
/* eslint-enable prettier/prettier */
import { tscScratch } from '../support/tsc-scratch';

/**
 * Examples for the version 8 migration guide.
 * The import snippet sits at the top because an import cannot sit inside a test. It is type checked by the tier's tsconfig
 * (npm run test:integration:live:types) and loaded when the file runs. The scratch projects of the second test show what the
 * guide claims about the "before" import.
 */
describe('migration-guides/v8', () => {
  it('migrationV8AfterImport, migrationV8AfterParams: the typed parameters constant of the v8 guide compiles against the SDK types', () => {
    void PubNub;
    // snippet.migrationV8AfterParams
    // other code

    const params: AppContext.GetMembershipsParameters = {};
    // snippet.end
    assert.deepEqual(params, {});
  });

  it('migrationV8TypeImports: the before sample for type imports fails to compile and the after sample compiles', function () {
    this.timeout(90_000);
    const before = tscScratch({
      'before.ts': `import PubNub, { GetMembershipsParameters } from 'pubnub'\n\nconst params: GetMembershipsParameters = {};\n`,
    });
    assert.equal(before.ok, false, 'importing GetMembershipsParameters directly fails in 8.x.x');
    assert.match(before.output, /GetMembershipsParameters/);

    const namespaces = [
      'Subscription',
      'AppContext',
      'ChannelGroups',
      'Publish',
      'Signal',
      'Presence',
      'History',
      'MessageAction',
      'FileSharing',
      'PAM',
      'Time',
      'Push',
    ];
    const after = tscScratch({
      'after.ts': `import PubNub, { ${namespaces.join(', ')} } from 'pubnub'\n\nconst params: AppContext.GetMembershipsParameters = {};\nvoid PubNub; void params;\n`,
    });
    assert.ok(after.ok, `the 8.x.x import and every namespace compile.\n${after.output}`);
  });
});
