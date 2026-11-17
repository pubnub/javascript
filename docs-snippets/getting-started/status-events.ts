import assert from '../harness/assert.js';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import PubNub from 'pubnub';
import { page, step, check } from '../harness/step.js';
import { connected, eventually, expectEvent, sleep } from '../harness/wait.js';

/**
 * Status event examples.
 */
export default page('status-events', 'P7', (world) => {
  const nextStatus = (client: PubNub, categories: string[], timeout = 20_000): Promise<PubNub.Status | PubNub.StatusEvent> =>
    new Promise((resolve, reject) => {
      const listener: PubNub.Listener = {
        status: (status) => {
          if (!categories.includes(String(status.category))) return;
          clearTimeout(timer);
          setImmediate(() => client.removeListener(listener));
          resolve(status);
        },
      };
      const timer = setTimeout(() => {
        client.removeListener(listener);
        reject(new Error(`no status in [${categories.join(', ')}] within ${timeout}ms`));
      }, timeout);
      client.addListener(listener);
    });

  const lines = (logs: string[], prefix: string): string[] => logs.filter((line) => line.startsWith(prefix));

  // ---- before and after: PNConnectedCategory on every change versus PNSubscriptionChangedCategory ---------------

  step('statusEventsMigrationBefore', { phase: 'P4', proves: 'The legacy subscription manager reports PNConnectedCategory on every change of the channel mix.' }, async () => {
    const pubnub = world.fresh('status-before', { enableEventEngine: false });
    const [c1, c2] = [world.n('ch1'), world.n('ch2')];
    await world.withConsole(async (logs) => {
      // snippet.statusEventsMigrationBefore
      pubnub.addListener({
        status: (statusEvent) => {
          if (statusEvent.category === 'PNConnectedCategory') {
            // This ran on first connect AND every time channels/groups were added or removed
            console.log('Subscription updated:', statusEvent.affectedChannels, statusEvent.affectedChannelGroups);
          }
        }
      });
      // snippet.end

      pubnub.subscribe({ channels: [c1] });
      await eventually(() => assert.equal(lines(logs.lines, 'Subscription updated:').length, 1), { label: 'first connect logged' });
      pubnub.subscribe({ channels: [c2] });
      await eventually(() => assert.equal(lines(logs.lines, 'Subscription updated:').length, 2), { label: 'channel change logged as PNConnectedCategory again' });
      assert.match(lines(logs.lines, 'Subscription updated:')[1], new RegExp(c2));
      pubnub.unsubscribeAll();
    });
  });

  // After: the same two subscribes report PNConnectedCategory once and PNSubscriptionChangedCategory for the change. The final
  // `sleep` is a negative wait, it gives a wrongly repeated PNConnectedCategory time to arrive before asserting it did not.
  step('statusEventsMigrationAfter', { phase: 'P4', proves: 'The new subscribe loop reports PNConnectedCategory once and PNSubscriptionChangedCategory for later changes.' }, async () => {
    const pubnub = world.fresh('status-after');
    const [c1, c2] = [world.n('ch1'), world.n('ch2')];
    await world.withConsole(async (logs) => {
      // snippet.statusEventsMigrationAfter
      pubnub.addListener({
        status: (statusEvent) => {
          if (statusEvent.category === 'PNConnectedCategory') {
            console.log('Subscribed and ready');
          }
          if (statusEvent.category === 'PNSubscriptionChangedCategory') {
            console.log('Subscription updated:', statusEvent.affectedChannels, statusEvent.affectedChannelGroups);
          }
        }
      });
      // snippet.end

      const subscription1 = pubnub.channel(c1).subscription();
      subscription1.subscribe();
      await eventually(() => assert.equal(lines(logs.lines, 'Subscribed and ready').length, 1), { label: 'connected logged' });
      const subscription2 = pubnub.channel(c2).subscription();
      subscription2.subscribe();
      await eventually(() => assert.equal(lines(logs.lines, 'Subscription updated:').length, 1), { label: 'change logged as PNSubscriptionChangedCategory' });
      // The change reports every channel of the new mix, and PNConnectedCategory does not fire again.
      assert.match(lines(logs.lines, 'Subscription updated:')[0], new RegExp(c1));
      assert.match(lines(logs.lines, 'Subscription updated:')[0], new RegExp(c2));
      await sleep(1000);
      assert.equal(lines(logs.lines, 'Subscribed and ready').length, 1, 'PNConnectedCategory fires only when the subscription starts');
      pubnub.unsubscribeAll();
    });
  });

  // ---- request statuses against a scripted origin ----------------------------------------------------------------

  check('statusEventsRequestCategories', { phase: 'P0', timeout: 60_000, proves: 'Each documented status category is produced by the matching HTTP response from a local server.' }, async () => {
    let respond: (res: http.ServerResponse) => void = (res) => res.end('[]');
    const server = http.createServer((_req, res) => respond(res));
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const origin = `127.0.0.1:${(server.address() as AddressInfo).port}`;
    try {
      const client = (extra: Partial<PubNub.PubNubConfiguration> = {}): PubNub =>
        world.fresh('status-origin', { origin, ssl: false, keepAlive: false, retryConfiguration: PubNub.NoneRetryPolicy(), ...extra });
      const categoryOf = async (pubnub: PubNub): Promise<{ category: string; statusCode?: number }> => {
        try {
          await pubnub.time();
        } catch (error) {
          const status = (error as { status?: { category?: string; statusCode?: number } }).status;
          return { category: String(status?.category), statusCode: status?.statusCode };
        }
        return { category: 'none (resolved)' };
      };
      const reply = (code: number, body: string) => (res: http.ServerResponse) => {
        res.writeHead(code, { 'content-type': 'application/json' }).end(body);
      };

      respond = reply(400, '{"error":true,"message":"bad"}');
      assert.equal((await categoryOf(client())).category, 'PNBadRequestCategory', '400');
      respond = reply(403, '{"error":true,"message":"Forbidden"}');
      assert.equal((await categoryOf(client())).category, 'PNAccessDeniedCategory', '403');
      respond = reply(500, '{"error":true}');
      assert.equal((await categoryOf(client())).category, 'PNServerErrorCategory', '500');
      respond = reply(503, '{"error":true}');
      assert.equal((await categoryOf(client())).category, 'PNServerErrorCategory', '503');
      respond = reply(418, '{"error":true}');
      assert.equal((await categoryOf(client())).category, 'PNUnknownCategory', 'unhandled status code');
      respond = reply(200, 'this is not json');
      assert.equal((await categoryOf(client())).category, 'PNUnknownCategory', '200 with a body that is not JSON');
      respond = (res) => res.writeHead(200, { 'content-type': 'text/html' }).end('<html>proxy login</html>');
      assert.equal((await categoryOf(client())).category, 'PNUnknownCategory', '200 with an HTML page');
      // A server that never answers: PNTimeoutCategory after transactionalRequestTimeout seconds.
      respond = () => undefined;
      const timedOut = client({ transactionalRequestTimeout: 1 });
      await assert.rejects(timedOut.publish({ channel: 'x', message: 'm' }), (error: unknown) => {
        assert.equal(String((error as { status?: { category?: string } }).status?.category), 'PNTimeoutCategory', 'no answer within the timeout');
        return true;
      });
      timedOut.destroy();
      // Nothing listens on the origin any more: PNNetworkIssuesCategory.
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      // publish() is excluded from the default retry policy, so it rejects at once. time() would keep retrying.
      await assert.rejects(client().publish({ channel: 'x', message: 'm' }), (error: unknown) => {
        assert.equal(String((error as { status?: { category?: string } }).status?.category), 'PNNetworkIssuesCategory', 'connection refused');
        return true;
      });
    } finally {
      if (server.listening) {
        server.closeAllConnections();
        server.close();
      }
    }

    const open = world.env.open!;
    const withoutPublishKey = world.track(new PubNub({ subscribeKey: open.subscribeKey, userId: world.n('status-nokey') }));
    for (const call of [
      () => withoutPublishKey.publish({ channel: 'x', message: 'm' }),
      () => world.shopper.publish({ message: 'm' } as unknown as PubNub.Publish.PublishParameters),
      () => world.shopper.publish({ channel: 'x' } as unknown as PubNub.Publish.PublishParameters),
    ]) {
      await assert.rejects(call(), (error: unknown) => {
        assert.equal(String((error as { status?: { category?: string } }).status?.category), 'PNValidationErrorCategory');
        return true;
      });
    }
  });

  check('statusEventsDefaultRetryAlsoRetriesTime', { timeout: 30_000, proves: 'The default retry policy also retries time(), so it stays pending against a server that answers 500.' }, async () => {
    let hits = 0;
    const server = http.createServer((_req, res) => {
      hits += 1;
      res.writeHead(500, { 'content-type': 'application/json' }).end('{"error":true}');
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const origin = `127.0.0.1:${(server.address() as AddressInfo).port}`;
    try {
      const pubnub = world.fresh('status-default-retry', { origin, ssl: false, keepAlive: false });
      const settled = pubnub.time().then(() => 'settled', () => 'settled');
      assert.equal(await Promise.race([settled, sleep(4500).then(() => 'pending')]), 'pending', 'time() is still retrying after 4.5 seconds');
      assert.ok(hits >= 2, `time() was retried (${hits} requests reached the server)`);
      // publish() is excluded from the default policy: one request, one failure.
      const before = hits;
      await assert.rejects(pubnub.publish({ channel: 'x', message: 'm' }));
      assert.equal(hits - before, 1, 'publish() is not retried');
      pubnub.destroy();
    } finally {
      server.closeAllConnections();
      server.close();
    }
  });

  // ---- subscription statuses under an outage ---------------------------------------------------------------------

  const proxiedSubscriber = async (label: string, extra: Partial<PubNub.PubNubConfiguration>) => {
    await world.proxy.start();
    world.proxy.outage(false);
    const pubnub = world.fresh(label, extra);
    pubnub.setProxy(world.proxy.config);
    const channel = world.n('outage_channel');
    const ready = connected(pubnub, { channels: [channel] });
    const subscription = pubnub.channel(channel).subscription();
    subscription.subscribe();
    await ready;
    return { pubnub, channel, subscription };
  };

  check('statusEventsUnexpectedDisconnectAndReconnect', { timeout: 90_000, proves: 'With no retry policy a lost request reports PNDisconnectedUnexpectedlyCategory and reconnect() restores delivery.' }, async () => {
    const { pubnub, channel, subscription } = await proxiedSubscriber('outage-none', { retryConfiguration: PubNub.NoneRetryPolicy() });
    try {
      const before = world.proxy.connects;
      const lost = nextStatus(pubnub, ['PNDisconnectedUnexpectedlyCategory', 'PNConnectionErrorCategory']);
      world.proxy.outage(true);
      const status = await lost;
      // With the new subscription loop and no retries the loss is reported as PNDisconnectedUnexpectedlyCategory.
      assert.equal(status.category, 'PNDisconnectedUnexpectedlyCategory');
      assert.ok((status as { error?: unknown }).error, 'the status carries an error field');
      console.log(`unexpected disconnect status: ${JSON.stringify(status)}`);
      assert.ok(world.proxy.connects - before <= 1, 'NoneRetryPolicy makes no retry attempts');

      // The outage ends and the app reconnects.
      world.proxy.outage(false);
      const back = nextStatus(pubnub, ['PNConnectedCategory', 'PNReconnectedCategory']);
      pubnub.reconnect();
      const reconnected = await back;
      console.log(`reconnect status category: ${reconnected.category}`);
      const received = expectEvent(pubnub, 'message', (m) => (m.message as { outage?: string }).outage === 'after' && m.channel === channel);
      await world.friend.publish({ channel, message: { outage: 'after' } });
      await received;
    } finally {
      world.proxy.outage(false);
      subscription.unsubscribe();
    }
  });

  // The outage starts before the first subscribe, so the very first connect fails: PNConnectionErrorCategory, not a disconnect.
  check('statusEventsConnectionErrorOnInitialConnect', { timeout: 60_000, proves: 'A failure on the first subscribe is PNConnectionErrorCategory and not a disconnect.' }, async () => {
    await world.proxy.start();
    world.proxy.outage(true);
    const pubnub = world.fresh('outage-initial', { retryConfiguration: PubNub.NoneRetryPolicy() });
    pubnub.setProxy(world.proxy.config);
    try {
      const failed = nextStatus(pubnub, ['PNConnectionErrorCategory', 'PNDisconnectedUnexpectedlyCategory']);
      pubnub.channel(world.n('outage_channel')).subscription().subscribe();
      const status = await failed;
      // Failed to establish the initial connection.
      assert.equal(status.category, 'PNConnectionErrorCategory');
      assert.ok((status as { error?: unknown }).error, 'the status carries an error field');
      console.log(`connection error status: ${JSON.stringify(status)}`);
    } finally {
      world.proxy.outage(false);
      pubnub.unsubscribeAll();
    }
  });

  // Measures, not mocks: counts CONNECT attempts the proxy sees while a policy retries during one outage. Bounds are loose on
  // purpose (attempts at least 2, linear at least 3.5 s) because timing on a live network varies. The long timeout covers three
  // subscribe and outage cycles.
  check('statusEventsRetryPolicies', { timeout: 120_000, proves: 'During an outage each retry policy makes repeated connect attempts, counted at the proxy, and the linear policy spaces them out.' }, async () => {
    // Count the tunnel attempts that a policy makes during one outage until the client gives up.
    const attemptsDuring = async (label: string, retryConfiguration: PubNub.RequestRetryPolicy): Promise<{ attempts: number; ms: number }> => {
      const { pubnub, subscription } = await proxiedSubscriber(label, { retryConfiguration });
      try {
        const lost = nextStatus(pubnub, ['PNDisconnectedUnexpectedlyCategory', 'PNConnectionErrorCategory'], 60_000);
        const before = world.proxy.connects;
        const started = Date.now();
        world.proxy.outage(true);
        await lost;
        return { attempts: world.proxy.connects - before, ms: Date.now() - started };
      } finally {
        world.proxy.outage(false);
        subscription.unsubscribe();
      }
    };

    const none = await attemptsDuring('retry-none', PubNub.NoneRetryPolicy());
    const linear = await attemptsDuring('retry-linear', PubNub.LinearRetryPolicy({ delay: 2, maximumRetry: 2 }));
    const exponential = await attemptsDuring('retry-exponential', PubNub.ExponentialRetryPolicy({ minimumDelay: 2, maximumDelay: 4, maximumRetry: 2 }));
    console.log(`retry attempts during an outage: none ${none.attempts} (${none.ms} ms), linear ${linear.attempts} (${linear.ms} ms), exponential ${exponential.attempts} (${exponential.ms} ms)`);
    assert.ok(none.attempts <= 1, 'NoneRetryPolicy does not retry');
    assert.ok(linear.attempts >= 2, `LinearRetryPolicy({ maximumRetry: 2 }) retries (saw ${linear.attempts} attempts)`);
    assert.ok(linear.ms >= 3500, `Linear waits delay seconds between attempts (took ${linear.ms} ms)`);
    assert.ok(exponential.attempts >= 2, `ExponentialRetryPolicy({ maximumRetry: 2 }) retries (saw ${exponential.attempts} attempts)`);
    assert.ok(exponential.ms > none.ms, 'retries take time');
  });

  // Default policy: a three second outage is retried inside the SDK. The client never reports a status for the in-between state and
  // delivers a message published after the outage.
  check('statusEventsDefaultRetryRecoversSilently', { timeout: 90_000, proves: 'A short outage is retried inside the SDK with no status and later messages still arrive.' }, async () => {
    // Default policy (no retryConfiguration, enableEventEngine true): retries subscribe requests. A short outage ends without an unexpected-disconnect status.
    const { pubnub, channel, subscription } = await proxiedSubscriber('outage-default', {});
    const categories: string[] = [];
    pubnub.addListener({ status: (s) => categories.push(String(s.category)) });
    try {
      const before = world.proxy.connects;
      world.proxy.outage(true);
      await sleep(3000);
      assert.ok(world.proxy.connects > before, 'the default policy retried the subscribe request during the outage');
      world.proxy.outage(false);
      const received = expectEvent(pubnub, 'message', (m) => (m.message as { outage?: string }).outage === 'default' && m.channel === channel, { timeout: 30_000 });
      await world.friend.publish({ channel, message: { outage: 'default' } });
      await received;
      assert.deepEqual(categories, [], `no status for intermediate states (saw ${categories.join(', ')})`);
    } finally {
      world.proxy.outage(false);
      subscription.unsubscribe();
    }
  });

  // Legacy manager (`enableEventEngine: false`) reports an outage as PNNetworkIssuesCategory and the recovery as PNReconnectedCategory.
  check('statusEventsLegacyManagerOutage', { timeout: 90_000, proves: 'The legacy manager reports an outage as PNNetworkIssuesCategory and recovery as PNReconnectedCategory.' }, async () => {
    await world.proxy.start();
    world.proxy.outage(false);
    const pubnub = world.fresh('outage-legacy', { enableEventEngine: false });
    pubnub.setProxy(world.proxy.config);
    const channel = world.n('outage_channel');
    const seen: string[] = [];
    pubnub.addListener({ status: (s) => seen.push(String(s.category)) });
    const ready = connected(pubnub, { channels: [channel] });
    pubnub.subscribe({ channels: [channel] });
    await ready;
    try {
      const issues = nextStatus(pubnub, ['PNNetworkIssuesCategory'], 30_000);
      world.proxy.outage(true);
      await issues;
      const recovered = nextStatus(pubnub, ['PNReconnectedCategory'], 60_000);
      world.proxy.outage(false);
      await recovered;
      console.log(`legacy manager statuses: ${seen.join(', ')}`);
    } finally {
      world.proxy.outage(false);
      pubnub.unsubscribeAll();
    }
  });

  // Access Manager: a 403 on the subscribe loop is a PNConnectionErrorCategory with PNAccessDeniedCategory in the nested error.
  check('statusEventsAccessDeniedOnSubscribe', { keyset: 'pam', timeout: 45_000, proves: 'A 403 on the subscribe loop is PNConnectionErrorCategory with PNAccessDeniedCategory nested.' }, async () => {
    const pubnub = world.client('secured', 'status-denied');
    const denied = nextStatus(pubnub, ['PNConnectionErrorCategory', 'PNAccessDeniedCategory']);
    pubnub.channel(world.n('am_room')).subscription().subscribe();
    const status = await denied;
    assert.equal(status.category, 'PNConnectionErrorCategory');
    console.log(`access denied status: ${JSON.stringify(status)}`);
    // The nested error is the category name as a string.
    assert.equal((status as { error?: unknown }).error, 'PNAccessDeniedCategory');
    pubnub.unsubscribeAll();
  });
});
