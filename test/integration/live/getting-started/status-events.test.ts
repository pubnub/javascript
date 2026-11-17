import assert from 'node:assert/strict';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import PubNub from 'pubnub';
import { createClient, friend, shopper, track } from '../support/clients';
import { captureConsole } from '../support/console';
import { keysOf } from '../support/env';
import { LocalProxy } from '../support/proxy';
import { connected, eventually, expectEvent, sleep } from '../support/wait';

/**
 * Status event examples. Port of docs-snippets/getting-started/status-events.ts.
 * Outages are simulated with a local CONNECT proxy. The fixed sleeps prove that a call is still pending or that nothing arrived.
 */
describe('getting-started/status-events', () => {
  const proxy = new LocalProxy();
  // Channels are shared and persistent. The names below are unique per run and are generated outside the snippets.
  const runId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const uniqueChannel = (name: string): string => `${name}-${runId}`;
  const fresh = (label: string, extra: Partial<PubNub.PubNubConfiguration> = {}): PubNub =>
    createClient('open', label, extra);

  /** Runs `fn` with console.log captured and restores it afterwards. */
  async function withConsole<T>(fn: (logs: ReturnType<typeof captureConsole>) => Promise<T>): Promise<T> {
    const logs = captureConsole('log');
    try {
      return await fn(logs);
    } finally {
      logs.restore();
    }
  }

  after(async () => {
    proxy.outage(false);
    await proxy.stop();
  });

  const nextStatus = (
    client: PubNub,
    categories: string[],
    timeout = 20_000,
  ): Promise<PubNub.Status | PubNub.StatusEvent> =>
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

  it('statusEventsMigrationBefore: the legacy subscription manager reports PNConnectedCategory on every change of the channel mix.', async () => {
    const pubnub = fresh('status-before', { enableEventEngine: false });
    const [c1, c2] = [uniqueChannel('ch1'), uniqueChannel('ch2')];
    await withConsole(async (logs) => {
      /* eslint-disable prettier/prettier */
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
      /* eslint-enable prettier/prettier */

      pubnub.subscribe({ channels: [c1] });
      await eventually(() => assert.equal(lines(logs.lines, 'Subscription updated:').length, 1), {
        label: 'first connect logged',
      });
      pubnub.subscribe({ channels: [c2] });
      await eventually(() => assert.equal(lines(logs.lines, 'Subscription updated:').length, 2), {
        label: 'channel change logged as PNConnectedCategory again',
      });
      assert.match(lines(logs.lines, 'Subscription updated:')[1], new RegExp(c2));
      pubnub.unsubscribeAll();
    });
  });

  // After: the same two subscribes report PNConnectedCategory once and PNSubscriptionChangedCategory for the change. The final
  // `sleep` is a negative wait, it gives a wrongly repeated PNConnectedCategory time to arrive before asserting it did not.
  it('statusEventsMigrationAfter: the new subscribe loop reports PNConnectedCategory once and PNSubscriptionChangedCategory for later changes.', async () => {
    const pubnub = fresh('status-after');
    const [c1, c2] = [uniqueChannel('ch1'), uniqueChannel('ch2')];
    await withConsole(async (logs) => {
      /* eslint-disable prettier/prettier */
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
      /* eslint-enable prettier/prettier */

      const subscription1 = pubnub.channel(c1).subscription();
      subscription1.subscribe();
      await eventually(() => assert.equal(lines(logs.lines, 'Subscribed and ready').length, 1), {
        label: 'connected logged',
      });
      const subscription2 = pubnub.channel(c2).subscription();
      subscription2.subscribe();
      await eventually(() => assert.equal(lines(logs.lines, 'Subscription updated:').length, 1), {
        label: 'change logged as PNSubscriptionChangedCategory',
      });
      // The change reports every channel of the new mix, and PNConnectedCategory does not fire again.
      assert.match(lines(logs.lines, 'Subscription updated:')[0], new RegExp(c1));
      assert.match(lines(logs.lines, 'Subscription updated:')[0], new RegExp(c2));
      await sleep(1000);
      assert.equal(
        lines(logs.lines, 'Subscribed and ready').length,
        1,
        'PNConnectedCategory fires only when the subscription starts',
      );
      pubnub.unsubscribeAll();
    });
  });

  // ---- request statuses against a scripted origin ----------------------------------------------------------------

  it('statusEventsRequestCategories: each documented status category is produced by the matching HTTP response from a local server.', async function () {
    this.timeout(60_000);
    let respond: (res: http.ServerResponse) => void = (res) => res.end('[]');
    const server = http.createServer((_req, res) => respond(res));
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const origin = `127.0.0.1:${(server.address() as AddressInfo).port}`;
    try {
      const client = (extra: Partial<PubNub.PubNubConfiguration> = {}): PubNub =>
        fresh('status-origin', {
          origin,
          ssl: false,
          keepAlive: false,
          retryConfiguration: PubNub.NoneRetryPolicy(),
          ...extra,
        });
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
        assert.equal(
          String((error as { status?: { category?: string } }).status?.category),
          'PNTimeoutCategory',
          'no answer within the timeout',
        );
        return true;
      });
      timedOut.destroy();
      // Nothing listens on the origin any more: PNNetworkIssuesCategory.
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      // publish() is excluded from the default retry policy, so it rejects at once. time() would keep retrying.
      await assert.rejects(client().publish({ channel: 'x', message: 'm' }), (error: unknown) => {
        assert.equal(
          String((error as { status?: { category?: string } }).status?.category),
          'PNNetworkIssuesCategory',
          'connection refused',
        );
        return true;
      });
    } finally {
      if (server.listening) {
        server.closeAllConnections();
        server.close();
      }
    }

    const withoutPublishKey = track(new PubNub({ subscribeKey: keysOf('open').subscribeKey, userId: 'status-nokey' }));
    for (const call of [
      () => withoutPublishKey.publish({ channel: 'x', message: 'm' }),
      () => shopper().publish({ message: 'm' } as unknown as PubNub.Publish.PublishParameters),
      () => shopper().publish({ channel: 'x' } as unknown as PubNub.Publish.PublishParameters),
    ]) {
      await assert.rejects(call(), (error: unknown) => {
        assert.equal(
          String((error as { status?: { category?: string } }).status?.category),
          'PNValidationErrorCategory',
        );
        return true;
      });
    }
  });

  it('statusEventsDefaultRetryAlsoRetriesTime: the default retry policy also retries time(), so it stays pending against a server that answers 500.', async function () {
    this.timeout(30_000);
    let hits = 0;
    const server = http.createServer((_req, res) => {
      hits += 1;
      res.writeHead(500, { 'content-type': 'application/json' }).end('{"error":true}');
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const origin = `127.0.0.1:${(server.address() as AddressInfo).port}`;
    try {
      const pubnub = fresh('status-default-retry', { origin, ssl: false, keepAlive: false });
      const settled = pubnub.time().then(
        () => 'settled',
        () => 'settled',
      );
      assert.equal(
        await Promise.race([settled, sleep(4500).then(() => 'pending')]),
        'pending',
        'time() is still retrying after 4.5 seconds',
      );
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
    await proxy.start();
    proxy.outage(false);
    const pubnub = fresh(label, extra);
    pubnub.setProxy(proxy.config);
    const channel = uniqueChannel('outage_channel');
    const ready = connected(pubnub, { channels: [channel] });
    const subscription = pubnub.channel(channel).subscription();
    subscription.subscribe();
    await ready;
    return { pubnub, channel, subscription };
  };

  it('statusEventsUnexpectedDisconnectAndReconnect: with no retry policy a lost request reports PNDisconnectedUnexpectedlyCategory and reconnect() restores delivery.', async function () {
    this.timeout(90_000);
    const { pubnub, channel, subscription } = await proxiedSubscriber('outage-none', {
      retryConfiguration: PubNub.NoneRetryPolicy(),
    });
    try {
      const before = proxy.connects;
      const lost = nextStatus(pubnub, ['PNDisconnectedUnexpectedlyCategory', 'PNConnectionErrorCategory']);
      proxy.outage(true);
      const status = await lost;
      // With the new subscription loop and no retries the loss is reported as PNDisconnectedUnexpectedlyCategory.
      assert.equal(status.category, 'PNDisconnectedUnexpectedlyCategory');
      assert.ok((status as { error?: unknown }).error, 'the status carries an error field');
      console.log(`unexpected disconnect status: ${JSON.stringify(status)}`);
      assert.ok(proxy.connects - before <= 1, 'NoneRetryPolicy makes no retry attempts');

      // The outage ends and the app reconnects.
      proxy.outage(false);
      const back = nextStatus(pubnub, ['PNConnectedCategory', 'PNReconnectedCategory']);
      pubnub.reconnect();
      const reconnected = await back;
      console.log(`reconnect status category: ${reconnected.category}`);
      const received = expectEvent(
        pubnub,
        'message',
        (m) => (m.message as { outage?: string }).outage === 'after' && m.channel === channel,
      );
      await friend().publish({ channel, message: { outage: 'after' } });
      await received;
    } finally {
      proxy.outage(false);
      subscription.unsubscribe();
    }
  });

  // The outage starts before the first subscribe, so the very first connect fails: PNConnectionErrorCategory, not a disconnect.
  it('statusEventsConnectionErrorOnInitialConnect: a failure on the first subscribe is PNConnectionErrorCategory and not a disconnect.', async function () {
    this.timeout(60_000);
    await proxy.start();
    proxy.outage(true);
    const pubnub = fresh('outage-initial', { retryConfiguration: PubNub.NoneRetryPolicy() });
    pubnub.setProxy(proxy.config);
    try {
      const failed = nextStatus(pubnub, ['PNConnectionErrorCategory', 'PNDisconnectedUnexpectedlyCategory']);
      pubnub.channel(uniqueChannel('outage_channel')).subscription().subscribe();
      const status = await failed;
      // Failed to establish the initial connection.
      assert.equal(status.category, 'PNConnectionErrorCategory');
      assert.ok((status as { error?: unknown }).error, 'the status carries an error field');
      console.log(`connection error status: ${JSON.stringify(status)}`);
    } finally {
      proxy.outage(false);
      pubnub.unsubscribeAll();
    }
  });

  // Measures, not mocks: counts CONNECT attempts the proxy sees while a policy retries during one outage. Bounds are loose on
  // purpose (attempts at least 2, linear at least 3.5 s) because timing on a live network varies. The long timeout covers three
  // subscribe and outage cycles.
  it('statusEventsRetryPolicies: during an outage each retry policy makes repeated connect attempts, counted at the proxy, and the linear policy spaces them out.', async function () {
    this.timeout(120_000);
    // Count the tunnel attempts that a policy makes during one outage until the client gives up.
    const attemptsDuring = async (
      label: string,
      retryConfiguration: PubNub.RequestRetryPolicy,
    ): Promise<{ attempts: number; ms: number }> => {
      const { pubnub, subscription } = await proxiedSubscriber(label, { retryConfiguration });
      try {
        const lost = nextStatus(pubnub, ['PNDisconnectedUnexpectedlyCategory', 'PNConnectionErrorCategory'], 60_000);
        const before = proxy.connects;
        const started = Date.now();
        proxy.outage(true);
        await lost;
        return { attempts: proxy.connects - before, ms: Date.now() - started };
      } finally {
        proxy.outage(false);
        subscription.unsubscribe();
      }
    };

    const none = await attemptsDuring('retry-none', PubNub.NoneRetryPolicy());
    const linear = await attemptsDuring('retry-linear', PubNub.LinearRetryPolicy({ delay: 2, maximumRetry: 2 }));
    const exponential = await attemptsDuring(
      'retry-exponential',
      PubNub.ExponentialRetryPolicy({ minimumDelay: 2, maximumDelay: 4, maximumRetry: 2 }),
    );
    console.log(
      `retry attempts during an outage: none ${none.attempts} (${none.ms} ms), linear ${linear.attempts} (${linear.ms} ms), exponential ${exponential.attempts} (${exponential.ms} ms)`,
    );
    assert.ok(none.attempts <= 1, 'NoneRetryPolicy does not retry');
    assert.ok(linear.attempts >= 2, `LinearRetryPolicy({ maximumRetry: 2 }) retries (saw ${linear.attempts} attempts)`);
    assert.ok(linear.ms >= 3500, `Linear waits delay seconds between attempts (took ${linear.ms} ms)`);
    assert.ok(
      exponential.attempts >= 2,
      `ExponentialRetryPolicy({ maximumRetry: 2 }) retries (saw ${exponential.attempts} attempts)`,
    );
    assert.ok(exponential.ms > none.ms, 'retries take time');
  });

  // Default policy: a three second outage is retried inside the SDK. The client never reports a status for the in-between state and
  // delivers a message published after the outage.
  it('statusEventsDefaultRetryRecoversSilently: a short outage is retried inside the SDK with no status and later messages still arrive.', async function () {
    this.timeout(90_000);
    // Default policy (no retryConfiguration, enableEventEngine true): retries subscribe requests. A short outage ends without an unexpected-disconnect status.
    const { pubnub, channel, subscription } = await proxiedSubscriber('outage-default', {});
    const categories: string[] = [];
    pubnub.addListener({ status: (s) => categories.push(String(s.category)) });
    try {
      const before = proxy.connects;
      proxy.outage(true);
      await sleep(3000);
      assert.ok(proxy.connects > before, 'the default policy retried the subscribe request during the outage');
      proxy.outage(false);
      const received = expectEvent(
        pubnub,
        'message',
        (m) => (m.message as { outage?: string }).outage === 'default' && m.channel === channel,
        { timeout: 30_000 },
      );
      await friend().publish({ channel, message: { outage: 'default' } });
      await received;
      assert.deepEqual(categories, [], `no status for intermediate states (saw ${categories.join(', ')})`);
    } finally {
      proxy.outage(false);
      subscription.unsubscribe();
    }
  });

  // Legacy manager (`enableEventEngine: false`) reports an outage as PNNetworkIssuesCategory and the recovery as PNReconnectedCategory.
  it('statusEventsLegacyManagerOutage: the legacy manager reports an outage as PNNetworkIssuesCategory and recovery as PNReconnectedCategory.', async function () {
    this.timeout(90_000);
    await proxy.start();
    proxy.outage(false);
    const pubnub = fresh('outage-legacy', { enableEventEngine: false });
    pubnub.setProxy(proxy.config);
    const channel = uniqueChannel('outage_channel');
    const seen: string[] = [];
    pubnub.addListener({ status: (s) => seen.push(String(s.category)) });
    const ready = connected(pubnub, { channels: [channel] });
    pubnub.subscribe({ channels: [channel] });
    await ready;
    try {
      const issues = nextStatus(pubnub, ['PNNetworkIssuesCategory'], 30_000);
      proxy.outage(true);
      await issues;
      const recovered = nextStatus(pubnub, ['PNReconnectedCategory'], 60_000);
      proxy.outage(false);
      await recovered;
      console.log(`legacy manager statuses: ${seen.join(', ')}`);
    } finally {
      proxy.outage(false);
      pubnub.unsubscribeAll();
    }
  });

  // Access Manager: a 403 on the subscribe loop is a PNConnectionErrorCategory with PNAccessDeniedCategory in the nested error.
  it('statusEventsAccessDeniedOnSubscribe: a 403 on the subscribe loop is PNConnectionErrorCategory with PNAccessDeniedCategory nested.', async function () {
    this.timeout(45_000);
    const pubnub = createClient('pam', 'status-denied');
    const denied = nextStatus(pubnub, ['PNConnectionErrorCategory', 'PNAccessDeniedCategory']);
    pubnub.channel(uniqueChannel('am_room')).subscription().subscribe();
    const status = await denied;
    assert.equal(status.category, 'PNConnectionErrorCategory');
    console.log(`access denied status: ${JSON.stringify(status)}`);
    // The nested error is the category name as a string.
    assert.equal((status as { error?: unknown }).error, 'PNAccessDeniedCategory');
    pubnub.unsubscribeAll();
  });
});
