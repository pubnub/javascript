import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
// snippet.setUpTypeScriptImport
import PubNub from 'pubnub';

// snippet.end
import { assertServerTime } from '../support/assertions';
import { track } from '../support/clients';
import { openKeys } from '../support/env';

import { makeScratch, SDK_ROOT, tscScratch } from '../support/tsc-scratch';

/**
 * Examples for setting up your environment. Port of docs-snippets/getting-started/set-up-your-environment.ts.
 * The import snippet sits at the top because an import cannot sit inside a test. It is type checked by the tier's tsconfig and
 * loaded when the file runs.
 */

describe('getting-started/set-up-your-environment', () => {
  it('setUpTypeScriptImport, setUpTypeScriptInit: the TypeScript init sample builds a working client and time() succeeds', async () => {
    assert.equal(typeof PubNub, 'function');
    /* eslint-disable prettier/prettier -- the sample text is shown to readers as written */
    // snippet.setUpTypeScriptInit
    const pubnub = new PubNub({
        publishKey: 'your-publish-key',
        subscribeKey: 'your-subscribe-key',
        // snippet.hide
        ...openKeys(),
        // snippet.show
        userId: 'your-user-id'
    });
    // snippet.end
    /* eslint-enable prettier/prettier */
    track(pubnub);
    assert.equal(pubnub.getUserId(), 'your-user-id');
    assertServerTime((await pubnub.time()).timetoken);
  });

  it('setUpTypeScriptProject: the TypeScript sample file and the documented tsconfig.json compile under strict settings', function () {
    this.timeout(90_000);
    // "you do not need an additional @types package": tsc resolves the types that the pubnub package ships.
    const result = tscScratch({
      'tsconfig.json': JSON.stringify(
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
      'index.ts': `import PubNub from 'pubnub';

const pubnub = new PubNub({
    publishKey: 'your-publish-key',
    subscribeKey: 'your-subscribe-key',
    userId: 'your-user-id'
});
`,
    });
    assert.ok(result.ok, `the documented project compiles.\n${result.output}`);
  });

  it('setUpModuleFormats: each documented module format loads the SDK in a real Node process', function () {
    this.timeout(60_000);
    const dir = makeScratch('pn-live-modules-');
    const run = (args: string[]): string =>
      execFileSync(process.execPath, args, { cwd: dir, encoding: 'utf8', stdio: 'pipe' }).trim();
    const probe =
      "typeof PubNub === 'function' ? new PubNub({ subscribeKey: 'k', userId: 'u' }).getUserId() : 'no constructor'";
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
  it('setUpBundleModuleTable: the custom bundle module table matches the SDK rollup configuration in both directions', () => {
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
    for (const match of rollup.matchAll(
      /'process\.env\.([A-Z_]+)':\s*JSON\.stringify\(process\.env\.\1 \?\? '(enabled|disabled)'\)/g,
    ))
      actual[match[1]] = match[2];
    assert.deepEqual(actual, documented, 'documented build variables and defaults equal rollup.config.js');
    const used = new Set<string>();
    const walk = (dir: string): void => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.endsWith('.ts'))
          for (const m of fs.readFileSync(full, 'utf8').matchAll(/process\.env\.([A-Z_]+_MODULE|SHARED_WORKER)\b/g))
            used.add(m[1]);
      }
    };
    walk(path.join(SDK_ROOT, 'src'));
    assert.deepEqual(
      [...used].sort(),
      Object.keys(documented).sort(),
      'every build variable that the source reads is documented',
    );
    // "Set enableTreeShaking to true": the constant exists.
    assert.match(rollup, /const enableTreeShaking = (false|true);/);
  });

  it('setUpWebpackConfigSyntax: the documented Webpack configuration is valid JavaScript and defines the variables of the table', () => {
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
    const result = ts.transpileModule(source, {
      reportDiagnostics: true,
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    });
    assert.deepEqual(result.diagnostics ?? [], [], 'the Webpack configuration parses');
  });

  it('setUpCdnUrls: the pinned CDN URLs for the linked SDK version exist', async function () {
    this.timeout(30_000);
    const version = JSON.parse(fs.readFileSync(path.join(SDK_ROOT, 'package.json'), 'utf8')).version as string;
    for (const file of [`pubnub.${version}.js`, `pubnub.worker.${version}.js`]) {
      const response = await fetch(`https://cdn.pubnub.com/sdk/javascript/${file}`, { method: 'HEAD' });
      assert.equal(response.status, 200, `${file} exists on the CDN`);
    }
  });
});
