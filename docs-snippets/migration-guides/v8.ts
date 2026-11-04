// snippet.migrationV8AfterImport
import PubNub, { AppContext } from 'pubnub'

// snippet.end
import assert from '../harness/assert.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { page, step, check } from '../harness/step.js';
import { tscProject } from '../harness/tsc-project.js';

/**
 * docs/sdks/javascript/migration-guides/javascript-v8-migration-guide.md
 *
 * Type-only guide. The "after" sample is compiled as part of this app (`tsc --noEmit`), the "before" sample and the list
 * of API group namespaces are compiled with a separate `tsc` run. The page hardcodes both samples as fragments, so the
 * ids `migrationV8AfterImport` and `migrationV8AfterParams` are proposed ids, the docs page does not embed them yet.
 *
 * Phase P0, no keyset (nothing here touches the network). In the Sneaker Drop story it is the upgrade note for an old shop
 * codebase moving from 7.x.x. Proves that the 8.x.x import form compiles, that the 7.x.x form really stopped compiling and
 * that every namespace the page lists is exported. Does not prove any runtime behavior, the guide has none.
 */
const HERE = path.dirname(fileURLToPath(import.meta.url));

export default page('migration-guides/v8', 'P0', () => {
  // The import-only snippet `migrationV8AfterImport` sits at the top of this file and is checked by `tsc --noEmit` of the whole app.
  // `void PubNub` only marks the default import as used. The typed constant is the proof: it fails to compile if
  // `AppContext.GetMembershipsParameters` is renamed or moved.
  step('migrationV8AfterParams', { proves: 'The typed parameters constant of the v8 guide compiles against the SDK types.' }, () => {
    void PubNub;
    // snippet.migrationV8AfterParams
    // other code

    const params: AppContext.GetMembershipsParameters = {};
    // snippet.end
    assert.deepEqual(params, {});
  });

  // Runs a separate `tsc` over scratch files (harness/tsc-project.ts) because the "before" sample must FAIL to compile, which
  // cannot live in a file that the app's own typecheck has to pass. The long timeout is two cold `tsc` processes.
  check('migrationV8TypeImports', { timeout: 90_000, proves: 'The before sample for type imports fails to compile and the after sample compiles.' }, () => {
    // The 7.x.x import no longer compiles: the type moved into the AppContext namespace.
    const before = tscProject(HERE, {
      'before.ts': `import PubNub, { GetMembershipsParameters } from 'pubnub'\n\nconst params: GetMembershipsParameters = {};\n`,
    });
    assert.equal(before.ok, false, 'importing GetMembershipsParameters directly fails in 8.x.x');
    assert.match(before.output, /GetMembershipsParameters/);

    // The 8.x.x import compiles, and so does every API group namespace that the page lists.
    const namespaces = ['Subscription', 'AppContext', 'ChannelGroups', 'Publish', 'Signal', 'Presence', 'History', 'MessageAction', 'FileSharing', 'PAM', 'Time', 'Push'];
    const after = tscProject(HERE, {
      'after.ts': `import PubNub, { ${namespaces.join(', ')} } from 'pubnub'\n\nconst params: AppContext.GetMembershipsParameters = {};\nvoid PubNub; void params;\n`,
    });
    assert.ok(after.ok, `the 8.x.x import and every namespace compile.\n${after.output}`);
  });
});
