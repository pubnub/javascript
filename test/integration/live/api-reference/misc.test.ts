import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { assertServerTime } from '../support/assertions';
import { friend, shopper } from '../support/clients';
import { LocalProxy } from '../support/proxy';
import { expectStatus, sleep, watch } from '../support/wait';

/**
 * Network examples: `disconnect()`, `reconnect()` and `setProxy()`.
 * The samples name no channel, so each test listens on a channel of its own name.
 */
describe('api-reference/misc', () => {
  const proxy = new LocalProxy();
  after(() => proxy.stop());

  it('disconnectBasicUsage: disconnect() reports a disconnected status and no message arrives afterwards', async () => {
    const pubnub = shopper();
    const run = randomUUID();
    const channel = `misc_disconnect_${run}`;
    const listening = await watch(pubnub, [channel]);
    const disconnected = expectStatus(pubnub, ['PNDisconnectedCategory']);

    // snippet.disconnectBasicUsage
    pubnub.disconnect();
    // snippet.end

    assert.equal(await disconnected, 'PNDisconnectedCategory');
    // While disconnected the client receives nothing. A fixed wait is right here: the test proves that nothing arrived.
    await friend().publish({ channel, message: { while: 'disconnected', run } });
    await sleep(3000);
    assert.ok(
      !listening.events.some((e) => (e.event as { message?: { while?: string } }).message?.while === 'disconnected'),
      'no message arrives while disconnected',
    );
  });

  it('reconnectBasicUsage: reconnect() restores delivery after a disconnect', async () => {
    const pubnub = shopper();
    const run = randomUUID();
    const channel = `misc_reconnect_${run}`;
    const listening = await watch(pubnub, [channel]);
    const disconnected = expectStatus(pubnub, ['PNDisconnectedCategory']);
    pubnub.disconnect();
    await disconnected;
    const back = expectStatus(pubnub, ['PNReconnectedCategory', 'PNConnectedCategory']);

    // snippet.reconnectBasicUsage
    pubnub.reconnect();
    // snippet.end

    await back;
    await friend().publish({ channel, message: { after: 'reconnect', run } });
    await listening.next('message', (m) => (m.message as { after?: string }).after === 'reconnect');
  });

  it('setProxyBasicUsage: setProxy routes the client traffic through the proxy, seen as a tunnel request', async () => {
    await proxy.start();
    const pubnub = shopper();

    // snippet.setProxyBasicUsage
    // This method is only available for NodeJS.
    pubnub.setProxy({
      hostname: 'YOUR_HOSTNAME',
      port: 8080,
      protocol: 'YOUR_PROTOCOL',
      // snippet.hide
      ...proxy.config,
      // snippet.show
    });
    // snippet.end

    const tunnelsBefore = proxy.connects;
    assertServerTime((await pubnub.time()).timetoken);
    assert.ok(proxy.connects > tunnelsBefore, 'the request went through the local proxy');
  });

  it('deleteProxy: setProxy with no argument removes the proxy so the next request adds no tunnel', async () => {
    await proxy.start();
    const pubnub = shopper();
    // Set up by hand what setProxyBasicUsage does, so this test does not depend on it.
    pubnub.setProxy(proxy.config);
    const tunnelsBefore = proxy.connects;
    assertServerTime((await pubnub.time()).timetoken);
    assert.ok(proxy.connects > tunnelsBefore, 'precondition: the request went through the local proxy');

    // snippet.deleteProxy
    pubnub.setProxy();
    // snippet.end

    const tunnelsAfterDelete = proxy.connects;
    assertServerTime((await pubnub.time()).timetoken);
    assert.equal(proxy.connects, tunnelsAfterDelete, 'no request goes through the proxy any more');
  });
});
