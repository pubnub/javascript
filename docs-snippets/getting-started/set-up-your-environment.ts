import assert from '../harness/assert.js';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
// snippet.setUpTypeScriptImport
import PubNub from 'pubnub';

// snippet.end
import { page, step, check } from '../harness/step.js';

/**
 * Examples for setting up your environment.
 */
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SDK_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.resolve('pubnub'))), '..', '..');
const TSC = path.resolve(path.dirname(fileURLToPath(import.meta.resolve('typescript'))), 'tsc.js');

export default page('getting-started/set-up-your-environment', 'P0', (world) => {
  const scratch = (): string => fs.mkdtempSync(path.join(HERE, '.setup-'));

  step('setUpTypeScriptInit', { proves: 'The TypeScript init sample builds a working client and time() succeeds.' }, async () => {
    // snippet.setUpTypeScriptInit
    const pubnub = new PubNub({
        publishKey: 'your-publish-key',
        subscribeKey: 'your-subscribe-key',
        // snippet.hide
        ...world.live.open,
        // snippet.show
        userId: 'your-user-id'
    });
    // snippet.end
    world.track(pubnub);
    assert.equal(pubnub.getUserId(), world.n('your-user-id'));
    world.check.serverTime((await pubnub.time()).timetoken);
  });

  check('setUpTypeScriptProject', { timeout: 90_000, proves: 'The TypeScript sample file and the documented tsconfig.json compile under strict settings.' }, () => {
    const dir = scratch();
    try {
      fs.writeFileSync(
        path.join(dir, 'tsconfig.json'),
        JSON.stringify(
          {
            compilerOptions: {
              target: 'ES2020',
              module: 'ESNext',
              moduleResolution: 'bundler',
              strict: true,
              esModuleInterop: true,
              skipLibCheck: true,
              forceConsistentCasingInFileNames: true,
            },
            include: ['index.ts'],
          },
          null,
          2,
        ),
      );
      fs.writeFileSync(
        path.join(dir, 'index.ts'),
        `import PubNub from 'pubnub';

const pubnub = new PubNub({
    publishKey: 'your-publish-key',
    subscribeKey: 'your-subscribe-key',
    userId: 'your-user-id'
});
`,
      );
      // "you do not need an additional @types package": tsc resolves the types that the pubnub package ships.
      execFileSync(process.execPath, [TSC, '-p', dir, '--noEmit'], { stdio: 'pipe' });
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  check('setUpModuleFormats', { timeout: 60_000, proves: 'Each documented module format loads the SDK in a real Node process.' }, () => {
    const dir = scratch();
    const run = (args: string[], cwd = dir): string => execFileSync(process.execPath, args, { cwd, encoding: 'utf8', stdio: 'pipe' }).trim();
    const probe = "typeof PubNub === 'function' ? new PubNub({ subscribeKey: 'k', userId: 'u' }).getUserId() : 'no constructor'";
    try {
      // CommonJS: const PubNub = require('pubnub');
      fs.writeFileSync(path.join(dir, 'cjs.cjs'), `const PubNub = require('pubnub');\nconsole.log(${probe});\n`);
      assert.equal(run([path.join(dir, 'cjs.cjs')]), 'u', 'require("pubnub") returns the constructor');
      // ES modules through the .mjs extension.
      fs.writeFileSync(path.join(dir, 'esm.mjs'), `import PubNub from 'pubnub';\nconsole.log(${probe});\n`);
      assert.equal(run([path.join(dir, 'esm.mjs')]), 'u', '.mjs files use import');
      // "type": "module" in package.json makes .js an ES module.
      fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ type: 'module' }));
      fs.writeFileSync(path.join(dir, 'esm.js'), `import PubNub from 'pubnub';\nconsole.log(${probe});\n`);
      assert.equal(run([path.join(dir, 'esm.js')]), 'u', '"type": "module" makes .js an ES module');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  // Two-way drift guard against the SDK checkout: every documented variable and default must be in rollup.config.js, and every
  // `*_MODULE` variable the SDK source reads must be documented, so adding a module to the SDK without the table fails here.
  // Build a custom bundle: the module table matches rollup.config.js, names and defaults.
  check('setUpBundleModuleTable', { proves: 'The custom bundle module table matches the SDK rollup configuration in both directions.' }, () => {
    const documented: Record<string, string> = {
      CRYPTO_MODULE: 'enabled',
      SHARED_WORKER: 'enabled',
      PUBLISH_MODULE: 'enabled',
      SUBSCRIBE_MODULE: 'enabled',
      SUBSCRIBE_EVENT_ENGINE_MODULE: 'enabled',
      SUBSCRIBE_MANAGER_MODULE: 'enabled',
      PRESENCE_MODULE: 'enabled',
      PAM_MODULE: 'disabled',
      CHANNEL_GROUPS_MODULE: 'enabled',
      MESSAGE_PERSISTENCE_MODULE: 'enabled',
      MOBILE_PUSH_MODULE: 'enabled',
      APP_CONTEXT_MODULE: 'enabled',
      DATA_SYNC_MODULE: 'enabled',
      FILE_SHARING_MODULE: 'enabled',
      MESSAGE_REACTIONS_MODULE: 'enabled',
    };
    const rollup = fs.readFileSync(path.join(SDK_ROOT, 'rollup.config.js'), 'utf8');
    const actual: Record<string, string> = {};
    for (const match of rollup.matchAll(/'process\.env\.([A-Z_]+)':\s*JSON\.stringify\(process\.env\.\1 \?\? '(enabled|disabled)'\)/g)) actual[match[1]] = match[2];
    assert.deepEqual(actual, documented, 'documented build variables and defaults equal rollup.config.js');
    const used = new Set<string>();
    const walk = (dir: string): void => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.endsWith('.ts')) for (const m of fs.readFileSync(full, 'utf8').matchAll(/process\.env\.([A-Z_]+_MODULE|SHARED_WORKER)\b/g)) used.add(m[1]);
      }
    };
    walk(path.join(SDK_ROOT, 'src'));
    assert.deepEqual([...used].sort(), Object.keys(documented).sort(), 'every build variable that the source reads is documented');
    // "Set enableTreeShaking to true": the constant exists.
    assert.match(rollup, /const enableTreeShaking = (false|true);/);
  });

  check('setUpWebpackConfigSyntax', { proves: 'The documented Webpack configuration is valid JavaScript and defines the variables of the table.' }, () => {
    const source = `const webpack = require('webpack');

module.exports = {
  // Other configuration...
  plugins: [
    new webpack.DefinePlugin({
      'process.env.PRESENCE_MODULE': JSON.stringify(process.env.PRESENCE_MODULE ?? 'enabled'),
      'process.env.PUBLISH_MODULE': JSON.stringify(process.env.PUBLISH_MODULE ?? 'enabled'),
      // One entry for every variable in the table.
    }),
  ],
};
`;
    const result = ts.transpileModule(source, { reportDiagnostics: true, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
    assert.deepEqual(result.diagnostics ?? [], [], 'the Webpack configuration parses');
  });

  check('setUpCdnUrls', { timeout: 30_000, proves: 'The pinned CDN URLs for the linked SDK version exist.' }, async () => {
    const version = JSON.parse(fs.readFileSync(path.join(SDK_ROOT, 'package.json'), 'utf8')).version as string;
    for (const file of [`pubnub.${version}.js`, `pubnub.worker.${version}.js`]) {
      const response = await fetch(`https://cdn.pubnub.com/sdk/javascript/${file}`, { method: 'HEAD' });
      assert.equal(response.status, 200, `${file} exists on the CDN`);
    }
  });

});
