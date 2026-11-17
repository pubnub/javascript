import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import PubNub from 'pubnub';
import { assertServerTime } from '../support/assertions';
import { createClient, shopper } from '../support/clients';

import { SDK_ROOT } from '../support/tsc-scratch';
import { LocalProxy } from '../support/proxy';

/**
 * Examples for the version 12 migration guide. The page has no snippet markers.
 */
describe('migration-guides/v12', () => {
  it('migrationV12ProxyEnvironmentVariablesIgnored: the SDK ignores proxy environment variables, shown by zero tunnel requests at the local proxy', async function () {
    this.timeout(45_000);
    const proxy = new LocalProxy();
    await proxy.start();
    const names = ['HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'http_proxy', 'https_proxy', 'all_proxy'];
    const saved = Object.fromEntries(names.map((n) => [n, process.env[n]]));
    const uri = `http://${proxy.host}:${proxy.port}`;
    for (const n of names) process.env[n] = uri;
    try {
      const pubnub = shopper();
      const before = proxy.connects;
      assertServerTime((await pubnub.time()).timetoken);
      assert.equal(proxy.connects, before, 'proxy environment variables are not read');

      // "read the variable in your own code and pass the proxy address to setProxy()": a URI string works.
      pubnub.setProxy(process.env.HTTPS_PROXY!);
      assertServerTime((await pubnub.time()).timetoken);
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
  it('migrationV12SetProxyKeepAlive: setProxy throws when the client was built with keepAlive true, before any request', () => {
    // "setProxy() ... throws if keepAlive is true."
    const pubnub = createClient('open', 'v12-keepalive', { keepAlive: true });
    assert.throws(() => pubnub.setProxy({ hostname: '127.0.0.1', port: 8080, protocol: 'http' }), /keepAlive/);
  });

  it('migrationV12ReactNativePolyfill: the SDK manifest lists react-native-url-polyfill as an optional peer dependency and requires Node 22 or later', () => {
    // "Version 12.0.0 lists react-native-url-polyfill as an optional peer dependency, so installing pubnub no longer installs it."
    const manifest = JSON.parse(fs.readFileSync(path.join(SDK_ROOT, 'package.json'), 'utf8'));
    assert.ok(manifest.peerDependencies?.['react-native-url-polyfill']);
    assert.equal(manifest.peerDependenciesMeta?.['react-native-url-polyfill']?.optional, true);
    assert.ok(!manifest.dependencies?.['react-native-url-polyfill']);
    assert.equal(manifest.engines.node, '>=22.0.0');
    void PubNub;
  });
});
