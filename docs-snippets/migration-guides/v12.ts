import assert from '../harness/assert.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import PubNub from 'pubnub';
import { page, check } from '../harness/step.js';
import { LocalProxy } from '../harness/proxy.js';

/**
 * docs/sdks/javascript/migration-guides/javascript-v12-migration-guide.md
 *
 * P7. The proxy sample of this guide is `setProxyBasicUsage` (api-reference/misc.ts, the docs embed that id). These checks
 * prove the claims around it: environment proxy variables are no longer read, `setProxy()` accepts an HTTP proxy object
 * or URI string, and it throws with `keepAlive`. The Node.js minimum is asserted in `quickstartNodeVersion`.
 *
 * Phase P7, open keyset. In the Sneaker Drop story it is
 * the upgrade note for a shop behind a corporate proxy. Proves the proxy claims, the optional `react-native-url-polyfill`
 * peer dependency and the Node.js minimum of the SDK manifest. Does not prove a proxy that needs authentication or HTTPS
 * proxies, the local proxy is plain HTTP.
 */
const SDK_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.resolve('pubnub'))), '..', '..');

export default page('migration-guides/v12', 'P7', (world) => {
  // Sets every proxy environment variable to the local proxy and counts CONNECT requests: zero means the SDK ignored them.
  // The variables are restored in `finally` because they are process-wide and would leak into later steps.
  check('migrationV12ProxyEnvironmentVariablesIgnored', { timeout: 45_000, proves: 'The SDK ignores proxy environment variables, shown by zero tunnel requests at the local proxy.' }, async () => {
    // A proxy of its own: world.proxy is shared, and clients of earlier proxy steps may still tunnel through it, which would
    // move the counter while the environment variables are set.
    const proxy = new LocalProxy();
    await proxy.start();
    const names = ['HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'http_proxy', 'https_proxy', 'all_proxy'];
    const saved = Object.fromEntries(names.map((n) => [n, process.env[n]]));
    const uri = `http://${proxy.host}:${proxy.port}`;
    for (const n of names) process.env[n] = uri;
    try {
      const pubnub = world.fresh('v12-env');
      const before = proxy.connects;
      world.check.serverTime((await pubnub.time()).timetoken);
      assert.equal(proxy.connects, before, 'proxy environment variables are not read');

      // "read the variable in your own code and pass the proxy address to setProxy()": a URI string works.
      pubnub.setProxy(process.env.HTTPS_PROXY!);
      world.check.serverTime((await pubnub.time()).timetoken);
      assert.ok(proxy.connects > before, 'setProxy(uri) routes requests through the proxy');
      pubnub.setProxy();
    } finally {
      await proxy.stop();
      for (const n of names) {
        if (saved[n] === undefined) delete process.env[n];
        else process.env[n] = saved[n];
      }
    }
  });

  // Offline: the throw happens inside `setProxy()`, no request is sent.
  check('migrationV12SetProxyKeepAlive', { proves: 'setProxy throws when the client was built with keepAlive true, before any request.' }, () => {
    // "setProxy() ... throws if keepAlive is true."
    const pubnub = world.fresh('v12-keepalive', { keepAlive: true });
    assert.throws(() => pubnub.setProxy({ hostname: '127.0.0.1', port: 8080, protocol: 'http' }), /keepAlive/);
  });

  // Reads the manifest of the linked SDK checkout, so it tracks whatever version the suite is wired to. `void PubNub` keeps the import used.
  check('migrationV12ReactNativePolyfill', { proves: 'The SDK manifest lists react-native-url-polyfill as an optional peer dependency and requires Node 22 or later.' }, () => {
    // "Version 12.0.0 lists react-native-url-polyfill as an optional peer dependency, so installing pubnub no longer installs it."
    const manifest = JSON.parse(fs.readFileSync(path.join(SDK_ROOT, 'package.json'), 'utf8'));
    assert.ok(manifest.peerDependencies?.['react-native-url-polyfill']);
    assert.equal(manifest.peerDependenciesMeta?.['react-native-url-polyfill']?.optional, true);
    assert.ok(!manifest.dependencies?.['react-native-url-polyfill']);
    assert.equal(manifest.engines.node, '>=22.0.0');
    void PubNub;
  });
});
