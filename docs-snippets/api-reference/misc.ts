import assert from '../harness/assert.js';
import type PubNub from 'pubnub';
import { page, step } from '../harness/step.js';
import { expectStatus, sleep, watch } from '../harness/wait.js';

/**
 * docs/sdks/javascript/api-reference/misc.md
 *
 * Keyset: open. Phase: P7 "Network". In the Sneaker Drop story this is the shop app on a flaky connection: the
 * shopper disconnects, reconnects and goes through a corporate proxy.
 *
 * What it proves: `disconnect()` stops delivery, `reconnect()` resumes it, and `setProxy()` really routes requests
 * through the local CONNECT proxy the harness starts on 127.0.0.1 (counted by `world.proxy.connects`).
 * What it does not prove: the outage steps for unexpected disconnect and reconnect statuses are still open, and a real corporate proxy with authentication.
 */
export default page('api-reference/misc', 'P7', (world) => {
  // Shared between setProxyBasicUsage and deleteProxy, which must act on the same client.
  let proxied: PubNub | undefined;

  // Proves disconnect() emits PNDisconnectedCategory and that nothing is delivered afterwards.
  // The fixed 3 second sleep is a negative wait: there is no event to wait for when a message must NOT arrive.
  step('disconnectBasicUsage', { proves: 'disconnect() reports a disconnected status and no message arrives afterwards.' }, async () => {
    const pubnub = world.fresh('disconnect');
    const channel = world.n('ch1');
    const listening = await watch(pubnub, [channel]);
    const disconnected = expectStatus(pubnub, ['PNDisconnectedCategory']);

    // snippet.disconnectBasicUsage
    pubnub.disconnect();
    // snippet.end

    assert.equal(await disconnected, 'PNDisconnectedCategory');
    // While disconnected the client receives nothing.
    await world.friend.publish({ channel, message: { while: 'disconnected' } });
    await sleep(3000);
    assert.ok(
      !listening.events.some((e) => (e.event as { message?: { while?: string } }).message?.while === 'disconnected'),
      'no message arrives while disconnected',
    );
  });

  // Proves reconnect() restores delivery. The setup disconnects first so the snippet has something to undo.
  // The status listener is registered before the call because statuses are not replayed.
  step('reconnectBasicUsage', { proves: 'reconnect() restores delivery after a disconnect.' }, async () => {
    const pubnub = world.fresh('reconnect');
    const channel = world.n('ch1');
    const listening = await watch(pubnub, [channel]);
    const disconnected = expectStatus(pubnub, ['PNDisconnectedCategory']);
    pubnub.disconnect();
    await disconnected;
    const back = expectStatus(pubnub, ['PNReconnectedCategory', 'PNConnectedCategory']);

    // snippet.reconnectBasicUsage
    pubnub.reconnect();
    // snippet.end

    await back;
    await world.friend.publish({ channel, message: { after: 'reconnect' } });
    await listening.next('message', (m) => (m.message as { after?: string }).after === 'reconnect');
  });

  // Proves setProxy() routes traffic through the proxy. The hidden spread in the snippet replaces the docs placeholders
  // (YOUR_HOSTNAME and so on) with the local proxy. A time() call is the cheapest request that needs the network.
  // No `needs`: the step only uses the keys, not a keyset feature.
  step('setProxyBasicUsage', { proves: 'setProxy routes the client traffic through the proxy, seen as a tunnel request.' }, async () => {
    await world.proxy.start();
    const pubnub = world.fresh('proxy');
    proxied = pubnub;

    // snippet.setProxyBasicUsage
    // This method is only available for NodeJS.
    pubnub.setProxy({
      hostname: 'YOUR_HOSTNAME',
      port: 8080,
      protocol: 'YOUR_PROTOCOL',
      // snippet.hide
      ...world.proxy.config,
      // snippet.show
    });
    // snippet.end

    const tunnelsBefore = world.proxy.connects;
    world.check.serverTime((await pubnub.time()).timetoken);
    assert.ok(world.proxy.connects > tunnelsBefore, 'the request went through the local proxy');
  });

  // Proves setProxy() with no argument removes the proxy: the next request adds no tunnel.
  // Reuses the client of setProxyBasicUsage, hence the `needs`.
  step('deleteProxy', { needs: ['setProxyBasicUsage'], proves: 'setProxy with no argument removes the proxy so the next request adds no tunnel.' }, async () => {
    const pubnub = proxied;
    assert.ok(pubnub, 'setProxyBasicUsage has not run');

    // snippet.deleteProxy
    pubnub.setProxy();
    // snippet.end

    const tunnelsBefore = world.proxy.connects;
    world.check.serverTime((await pubnub.time()).timetoken);
    assert.equal(world.proxy.connects, tunnelsBefore, 'no request goes through the proxy any more');
  });
});
