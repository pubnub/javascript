import assert from '../harness/assert.js';
import PubNub from 'pubnub';
import { page, step, check, skipStep } from '../harness/step.js';
import { eventually, watch } from '../harness/wait.js';
import { explainError } from '../harness/guard.js';
import { DEVICE_TOKEN_EXAMPLE } from '../fixtures/names.js';
import { registry } from '../harness/registry.js';

/**
 * docs/sdks/javascript/api-reference/mobile-push.md
 *
 * WHAT THIS PAGE PROVES, AND WHAT IT DOES NOT
 * - Proven live: the registration API. addChannels, listChannels, removeChannels and deleteDevice are accepted by the
 *   service and change the registration state, and each step reads that state back (list shows exactly the registered
 *   channels, remove shows them gone, deleteDevice leaves none).
 * - Not tested: delivery. No push is ever sent to a device, that needs a real device and real APNs or FCM credentials.
 * - Not validated: the tokens. The keyset has Push Notifications enabled WITHOUT any APNs or FCM credentials, so the
 *   service only checks the token FORMAT for apns and apns2 (hex string, 64 characters and also 40 pass) and accepts
 *   any string for fcm. Nothing is checked against Apple or Google until a push is sent, so a registered token here
 *   says nothing about whether it belongs to a real device.
 * - Payload builders (`PubNub.notificationPayload`) are local code and run without the add-on.
 *
 * DOCS BUG: the original docs sample used the device `niceDevice` with `pushGateway: 'apns2'`. The real service answers that
 * with 400 {"error":"Invalid device token"}. The snippet bodies here use a 64-character hex token instead
 * (`DEVICE_TOKEN_EXAMPLE` in fixtures/names.ts, registered as kind `device`). Staging replaces it with a per-run hex
 * token of the same length (`deviceToken`), so the value stays valid for every gateway. The check
 * `pushDeviceTokenFormat` keeps the 'niceDevice' claim true over time.
 *
 * Samples that call a method twice (APNs2, then FCM) number the later `response` variables.
 *
 * Keyset: open, with the Push Notifications add-on (optional, see below). Phase: P6, with the preflight in P0.
 * Sneaker Drop story: a shopper's phone registers for drop alerts on channels `a` and `b`, and the app builds the
 * notification payload that would announce a drop. Steps skip as `needs-feature:push-notifications` when the add-on
 * is off, which is allowed and costs no skip budget. The registration steps chain through `requireStep` and not through
 * `needs`, explained at `requireStep`. The janitor removes device registrations by recomputing the per-run token.
 */
export default page('api-reference/mobile-push', 'P6', (world) => {
  // Registration order is not guaranteed by the service, so every list comparison sorts first.
  const sorted = (values: string[]): string[] => [...values].sort();
  // The two channels every registration step uses (docs `a` and `b`, run-suffixed).
  const ab = (): string[] => sorted([world.n('a'), world.n('b')]);
  /** This run's device token, as the staged snippets use it. Valid hex, same length as the literal in the docs. */
  const device = (): string => world.n(DEVICE_TOKEN_EXAMPLE);
  // The APNs2 parameters the docs show, shared by the harness calls that sit outside the snippets.
  const apns2Options = { pushGateway: 'apns2', environment: 'production', topic: 'com.example.bundle_id' } as const;

  // ---- add-on probe --------------------------------------------------------------------------------------------------
  //
  // Push Notifications is an add-on. With it off, every registration call answers 403 "Use of the mobile push
  // notifications API requires Push Notifications which is not enabled for this subscribe key". That is a keyset
  // configuration gap, not a docs or SDK defect, so it is a precise `needs-feature:push-notifications` skip.
  // harness/policy.ts fails the run on every skip, so a keyset without the add-on cannot pass with the push steps
  // unnoticed. The skip still names the missing feature, which is easier to fix than a bare failure. Any other error
  // (400, 5xx, network) is a real failure.
  //
  // The dependent steps do NOT use `needs: ['preflightMobilePush']`. A skipped upstream would turn them into
  // `blocked-by:*` skips, which would hide that the real cause is the add-on. Each step
  // calls `requirePush()` instead, which repeats the same precise feature skip.
  /**
   * Everything the service said about a failed call, as one string: the SDK message, the HTTP status and the body.
   * The push endpoints answer errors as `{"error":"Invalid device token"}` (a string under `error`), and
   * `explainError` in harness/guard.ts only reads `error_message`, `message` and `error.message`, so it misses that
   * shape. Read the body here instead of widening the shared guard.
   */
  function serviceText(error: unknown): string {
    explainError(error);
    const status = (error as { status?: { statusCode?: unknown; errorData?: unknown } } | undefined)?.status;
    const body = status?.errorData === undefined ? '' : JSON.stringify(status.errorData);
    const message = error instanceof Error ? error.message : String(error);
    return `${message} status=${String(status?.statusCode ?? '')} body=${body}`;
  }
  // The service text for "add-on not enabled". Anything else is a real failure.
  const PUSH_OFF = /requires Push Notifications which is not enabled/i;
  // Memoized so the add-on probe runs once per run, however many steps ask.
  let probe: Promise<{ off: false } | { off: true; detail: string }> | undefined;

  /** Registers and removes a hex token on fcm and apns2 once per run, and tells whether the add-on is off. */
  function pushAvailability(): Promise<{ off: false } | { off: true; detail: string }> {
    probe ??= (async () => {
      const client = world.shopper;
      const channel = world.n('preflight_channel');
      try {
        // fcm accepts any string, apns2 needs the hex format. Both use this run's hex token.
        await client.push.addChannels({ channels: [channel], device: device(), pushGateway: 'fcm' });
        await client.push.addChannels({ channels: [channel], device: device(), ...apns2Options });
        return { off: false } as const;
      } catch (error) {
        const detail = serviceText(error);
        if (PUSH_OFF.test(detail)) return { off: true, detail } as const;
        throw new Error(
          `A push registration with a synthetic ${DEVICE_TOKEN_EXAMPLE.length}-character hex device token was rejected, and the answer is not the "add-on not enabled" 403. ` +
            `Push Notifications is on for this keyset, so this is a service or SDK problem. ${detail}`,
        );
      } finally {
        // Always remove what the probe registered, on both gateways, whatever happened above.
        await client.push.deleteDevice({ device: device(), pushGateway: 'fcm' }).catch(() => undefined);
        await client.push.deleteDevice({ device: device(), ...apns2Options }).catch(() => undefined);
      }
    })();
    return probe;
  }

  /** Skips the calling step (precise feature skip) when the add-on is off. Rethrows real errors. */
  async function requirePush(): Promise<void> {
    const result = await pushAvailability();
    if (result.off) {
      skipStep(
        'needs-feature:push-notifications',
        `the add-on is off for the open keyset, so registration was not exercised (${result.detail}). Enable Push Notifications for it in the Admin Portal, no APNs or FCM credentials are needed.`,
      );
    }
    // Leave a marker that names this run id on a channel (App Context). The janitor lists channel metadata by pattern
    // and finds the run ids of crashed runs from it. Push registrations cannot be listed without the token, so
    // without a marker a crashed push-only run could never be swept. Best effort: no App Context only loses the sweep.
    await world.observer.objects
      .setChannelMetadata({ channel: world.n('push_marker'), data: { name: 'mobile push run marker' } })
      .catch(() => undefined);
  }

  // Wired through requirePush so a keyset without the add-on skips here as needs-feature and not as a failure.
  check('preflightMobilePush', { phase: 'P0', timeout: 60_000, proves: 'Preflight: the keyset has the Mobile Push add-on, otherwise push steps skip as needs-feature.' }, async () => {
    // Registers this run's hex token on the preflight channel for fcm and apns2, then removes it again.
    // Passing means: the add-on is on and accepts synthetic tokens without credentials. Skipping means: add-on off.
    await requirePush();
  });

  // Harness-only. Not a docs sample: it pins the claim behind the docs bug so the claim cannot go stale.
  check('pushDeviceTokenFormat', { timeout: 60_000, proves: 'Pins which device token formats each push gateway accepts, behind a documented docs problem.' }, async () => {
    // Keeps the docs-bug claim true over time: the docs token 'niceDevice' is rejected for apns and apns2 (400
    // "Invalid device token") and accepted for fcm. If the service ever changes either way, this fails and the
    // docs claim must be revisited. 'niceDevice' is used literally for the rejections, nothing is registered.
    await requirePush();
    const client = world.shopper;
    const channel = world.n('a');
    const docsToken = 'niceDevice';
    for (const [label, options] of [['apns', { pushGateway: 'apns' }], ['apns2', apns2Options]] as const) {
      let rejected: unknown;
      try {
        await client.push.addChannels({ channels: [channel], device: docsToken, ...options });
      } catch (error) {
        rejected = error;
      }
      assert.ok(rejected, `${label} accepted the docs token "${docsToken}", the docs bug is gone, update the docs`);
      const detail = serviceText(rejected);
      assert.match(detail, /status=400/, `${label}: expected status 400, got ${detail}`);
      assert.match(detail, /Invalid device token/i, `${label}: expected "Invalid device token", got ${detail}`);
    }
    // fcm takes any string. Use a run-suffixed copy so parallel runs do not share a registration, then remove it.
    const fcmToken = world.n(docsToken);
    try {
      await client.push.addChannels({ channels: [channel], device: fcmToken, pushGateway: 'fcm' });
      const listed = await world.observer.push.listChannels({ device: fcmToken, pushGateway: 'fcm' });
      assert.deepEqual(listed.channels, [channel], 'fcm registered a non-hex token');
    } finally {
      await client.push.deleteDevice({ device: fcmToken, pushGateway: 'fcm' }).catch(() => undefined);
    }
  });

  /**
   * The registration steps build on each other (add, list, remove, delete). When an earlier one failed, skip with
   * `blocked-by` so one root cause shows once. Not a `needs`, see the add-on probe comment above.
   */
  function requireStep(id: string): void {
    const result = registry.result(id);
    if (result && result.status !== 'passed') skipStep(`blocked-by:${id}`);
  }

  // The id keeps the docs' misspelling ("Decive") because the docs embed it by that name. First step of the chain.
  // The snippet shows a hex token, staging swaps in this run's token, and the read-back uses another client
  // (`eventually`, because the registration becomes listable shortly after the call).
  step('addDeciveToChannelBasicUsage', { timeout: 60_000, proves: 'addChannels registers a device token for a channel and another client reads the registration back.' }, async () => {
    const pubnub = world.shopper;
    await requirePush();
    // snippet.addDeciveToChannelBasicUsage
    // Function to add a device to a channel for APNs2
    const response = await pubnub.push.addChannels({
      channels: ['a', 'b'],
      device: '740f4707bebcf74f9b7c25d48e3358945f6aa01da5ddb387462c7eaf61bb78ad',
      pushGateway: 'apns2',
      environment: 'production',
      topic: 'com.example.bundle_id',
    });
    console.log('device added to channels response:', response);

    // Function to add a device to a channel for FCM
    const response2 = await pubnub.push.addChannels({
      channels: ['a', 'b'],
      device: '740f4707bebcf74f9b7c25d48e3358945f6aa01da5ddb387462c7eaf61bb78ad',
      pushGateway: 'fcm',
    });
    console.log('device added to channels response:', response2);
    // snippet.end
    // Read-back: a list call per gateway must show exactly the two registered channels (this run's suffixed a and b),
    // nothing more. This proves the registration changed state on the service. It does not prove delivery.
    await eventually(async () => {
      const apns2 = await world.observer.push.listChannels({
        device: device(),
        pushGateway: 'apns2',
        environment: 'production',
        topic: 'com.example.bundle_id',
      });
      assert.deepEqual(sorted(apns2.channels), ab(), 'apns2 registration');
      const fcm = await world.observer.push.listChannels({ device: device(), pushGateway: 'fcm' });
      assert.deepEqual(sorted(fcm.channels), ab(), 'fcm registration');
    }, { label: 'registrations visible' });
  });

  // Chain step 2. The snippet's own list responses are the assertion target, no second client needed.
  step('listChannelsForDeviceBasicUsage', { timeout: 60_000, proves: 'listChannels returns the channels registered for the device.' }, async () => {
    const pubnub = world.shopper;
    await requirePush();
    requireStep('addDeciveToChannelBasicUsage');
    // snippet.listChannelsForDeviceBasicUsage
    // for APNs2
    const response = await pubnub.push.listChannels({
      device: '740f4707bebcf74f9b7c25d48e3358945f6aa01da5ddb387462c7eaf61bb78ad',
      pushGateway: 'apns2',
      environment: 'production',
      topic: 'com.example.bundle_id',
    });
    console.log('listing channels for device response:', response);
    response.channels.forEach((channel) => {
      console.log(channel);
    });

    // for FCM
    const response2 = await pubnub.push.listChannels({
      device: '740f4707bebcf74f9b7c25d48e3358945f6aa01da5ddb387462c7eaf61bb78ad',
      pushGateway: 'fcm',
    });

    console.log('listing channels for device response:', response2);

    response2.channels.forEach((channel) => {
      console.log(channel);
    });
    // snippet.end
    // The snippet's own list answers must carry exactly the registered channels, for both gateways.
    assert.deepEqual(sorted(response.channels), ab(), 'apns2 list');
    assert.deepEqual(sorted(response2.channels), ab(), 'fcm list');
  });

  // Chain step 3. Proves removal by reading with another client until both gateways list nothing.
  step('removeDeviceFromChannelBasicUsage', { timeout: 60_000, proves: 'removeChannels unregisters the device and both gateways list nothing afterwards.' }, async () => {
    const pubnub = world.shopper;
    await requirePush();
    requireStep('listChannelsForDeviceBasicUsage');
    // snippet.removeDeviceFromChannelBasicUsage
    // for APNs2
    const response = await pubnub.push.removeChannels({
      channels: ['a', 'b'],
      device: '740f4707bebcf74f9b7c25d48e3358945f6aa01da5ddb387462c7eaf61bb78ad',
      pushGateway: 'apns2',
      environment: 'production',
      topic: 'com.example.bundle_id',
    });

    console.log('removing device from channel response:', response);

    // for FCM
    const response2 = await pubnub.push.removeChannels({
      channels: ['a', 'b'],
      device: '740f4707bebcf74f9b7c25d48e3358945f6aa01da5ddb387462c7eaf61bb78ad',
      pushGateway: 'fcm',
    });

    console.log('removing device from channel response:', response2);
    // snippet.end
    // Read-back: after removeChannels a fresh list per gateway (other client) must be empty.
    await eventually(async () => {
      const apns2 = await world.observer.push.listChannels({
        device: device(),
        pushGateway: 'apns2',
        environment: 'production',
        topic: 'com.example.bundle_id',
      });
      assert.deepEqual(apns2.channels, []);
      const fcm = await world.observer.push.listChannels({ device: device(), pushGateway: 'fcm' });
      assert.deepEqual(fcm.channels, []);
    }, { label: 'registrations removed' });
  });

  // Chain step 4. Step 3 emptied the device, so the friend client registers it again OUTSIDE the markers. Otherwise
  // deleteDevice would have nothing to delete and the final empty list would prove nothing.
  step('removeAllMobilePushNotificationsBasicUsage', { timeout: 60_000, proves: 'deleteDevice removes every registration of the device and the list is empty afterwards.' }, async () => {
    const pubnub = world.shopper;
    await requirePush();
    requireStep('removeDeviceFromChannelBasicUsage');
    // Register again (one channel, other client) so deleteDevice has something to remove, and prove it is there.
    await world.friend.push.addChannels({ channels: [world.n('a')], device: device(), ...apns2Options });
    await world.friend.push.addChannels({ channels: [world.n('a')], device: device(), pushGateway: 'fcm' });
    await eventually(async () => {
      const apns2 = await world.observer.push.listChannels({ device: device(), ...apns2Options });
      assert.deepEqual(apns2.channels, [world.n('a')], 'apns2 registered before deleteDevice');
      const fcm = await world.observer.push.listChannels({ device: device(), pushGateway: 'fcm' });
      assert.deepEqual(fcm.channels, [world.n('a')], 'fcm registered before deleteDevice');
    }, { label: 'registrations visible before deleteDevice' });
    // snippet.removeAllMobilePushNotificationsBasicUsage

    // for APNs2
    const response = await pubnub.push.deleteDevice({
      device: '740f4707bebcf74f9b7c25d48e3358945f6aa01da5ddb387462c7eaf61bb78ad',
      pushGateway: 'apns2',
      environment: 'production',
      topic: 'com.example.bundle_id',
    });

    console.log('deleteDevice response:', response);

    // for FCM
    const response2 = await pubnub.push.deleteDevice({
      device: '740f4707bebcf74f9b7c25d48e3358945f6aa01da5ddb387462c7eaf61bb78ad',
      pushGateway: 'fcm',
    });

    console.log('deleteDevice response:', response2);

    // snippet.end
    // Read-back: deleteDevice must leave no channel on either gateway.
    await eventually(async () => {
      const apns2 = await world.observer.push.listChannels({ device: device(), ...apns2Options });
      assert.deepEqual(apns2.channels, [], 'apns2 device deleted');
      const fcm = await world.observer.push.listChannels({ device: device(), pushGateway: 'fcm' });
      assert.deepEqual(fcm.channels, [], 'fcm device deleted');
    }, { label: 'device deleted' });
  });

  // Local payload builder plus a real publish (no add-on needed). The observer subscribes first so the message cannot
  // be missed, and the message is matched by timetoken. This step does not use requirePush.
  step('buildNotificationPayloadBasicUsage', { proves: 'The notification payload builder output is published and a subscriber receives the message.' }, async () => {
    const pubnub = world.shopper;
    const listening = await watch(world.fresh('pushobserver'), [world.n('chat-bot')]);
    // snippet.buildNotificationPayloadBasicUsage

    const builder = PubNub.notificationPayload('Chat invitation', "You have been invited to 'quiz' chat");
    builder.apns.configurations = [{ targets: [{ topic: 'com.example.bundle_id' }] }];
    const messagePayload = builder.buildPayload(['apns2', 'fcm']);
    // add required fields to the payload
    const response = await pubnub.publish({
      message: messagePayload,
      channel: 'chat-bot',
    });
    console.log('publish response:', response);
    // snippet.end
    world.check.timetoken(response.timetoken);
    assert.ok(messagePayload.pn_apns && messagePayload.pn_fcm, 'the payload carries the APNs and FCM sections');
    const received = await listening.next('message', (m) => m.timetoken === String(response.timetoken));
    assert.ok(received.message, 'subscribers get the message');
    listening.stop();
  });

  // ---- payload builders, local ---------------------------------------------------------------------------------------

  // Local only. console.log is captured so the printed payload can be parsed and compared. The snippet prints the
  // builder's payload, and console is restored before the assertions.
  step('simpleNotificationPayloadFCMandAPNS', { proves: 'The payload builder prints a payload with the FCM and APNs sections the sample describes.' }, async () => {
    const logs = world.captureConsole('log');
    // snippet.simpleNotificationPayloadFCMandAPNS
    const builder = PubNub.notificationPayload('Chat invitation', "You have been invited to 'quiz' chat");
    builder.sound = 'default';

    console.log(JSON.stringify(builder.buildPayload(['apns', 'fcm']), null, 2));
    // snippet.end
    logs.restore();
    const alert = { title: 'Chat invitation', body: "You have been invited to 'quiz' chat" };
    assert.deepEqual(JSON.parse(logs.lines[0]), {
      pn_apns: { aps: { alert, sound: 'default' } },
      pn_fcm: { notification: alert, android: { notification: { sound: 'default' } } },
    });
  });

  // The id contains a slash, which the marker lint and the docs extractor both accept. Checks the APNs HTTP/2 section.
  step('simpleNotificationPayloadFCMandAPNSH/2', { proves: 'The payload builder produces the APNs HTTP/2 section as documented.' }, async () => {
    const logs = world.captureConsole('log');
    // snippet.simpleNotificationPayloadFCMandAPNSH/2
    const payloadBuilder = PubNub.notificationPayload('Chat invitation', "You have been invited to 'quiz' chat");
    payloadBuilder.apns.configurations = [{ targets: [{ topic: 'com.meetings.chat.app' }] }];
    payloadBuilder.sound = 'default';

    console.log(JSON.stringify(payloadBuilder.buildPayload(['apns2', 'fcm']), null, 2));
    // snippet.end
    logs.restore();
    const payload = JSON.parse(logs.lines[0]);
    assert.equal(payload.pn_apns.pn_push[0].targets[0].topic, 'com.meetings.chat.app');
    assert.equal(payload.pn_apns.pn_push[0].version, 'v2');
    // The Output block of the page shows `sound` in `pn_apns.aps` and in `pn_fcm.android.notification`.
    assert.equal(payload.pn_apns.aps.sound, 'default');
    assert.equal(payload.pn_fcm.android.notification.sound, 'default');
  });

  // Checks that collapseId and expirationDate reach the payload in the snake case wire format.
  step('simpleNotificationPayloadFCMandAPNSH/2CustomConfiguration', { proves: 'collapseId and expirationDate reach the payload in the wire format.' }, async () => {
    const logs = world.captureConsole('log');
    // snippet.simpleNotificationPayloadFCMandAPNSH/2CustomConfiguration
    const configuration = [
      {
        collapseId: 'invitations',
        expirationDate: new Date(Date.now() + 10000),
        targets: [{ topic: 'com.meetings.chat.app' }],
      },
    ];
    const customConfigurationBuilder = PubNub.notificationPayload(
      'Chat invitation',
      "You have been invited to 'quiz' chat",
    );
    customConfigurationBuilder.apns.configurations = configuration;

    console.log(JSON.stringify(customConfigurationBuilder.buildPayload(['apns2', 'fcm']), null, 2));
    // snippet.end
    logs.restore();
    const payload = JSON.parse(logs.lines[0]);
    assert.equal(payload.pn_apns.pn_push[0].collapse_id, 'invitations');
    assert.equal(payload.pn_apns.pn_push[0].expiration, configuration[0].expirationDate.toISOString());
  });
});
