import assert from '../harness/assert.js';
import PubNub from 'pubnub';
import { page, step, check, skipStep } from '../harness/step.js';
import { eventually, watch } from '../harness/wait.js';
import { explainError } from '../harness/guard.js';
import { DEVICE_TOKEN_EXAMPLE } from '../fixtures/names.js';
import { registry } from '../harness/registry.js';

/**
 * Mobile push notification examples. Registering a device token does not send a push. Delivery needs a real device and
 * APNs or FCM credentials.
 */
export default page('api-reference/mobile-push', 'P6', (world) => {
  // Registration order is not guaranteed by the service, so every list comparison sorts first.
  const sorted = (values: string[]): string[] => [...values].sort();
  const ab = (): string[] => sorted([world.n('a'), world.n('b')]);
  const device = (): string => world.n(DEVICE_TOKEN_EXAMPLE);
  const apns2Options = { pushGateway: 'apns2', environment: 'production', topic: 'com.example.bundle_id' } as const;

  function serviceText(error: unknown): string {
    explainError(error);
    const status = (error as { status?: { statusCode?: unknown; errorData?: unknown } } | undefined)?.status;
    const body = status?.errorData === undefined ? '' : JSON.stringify(status.errorData);
    const message = error instanceof Error ? error.message : String(error);
    return `${message} status=${String(status?.statusCode ?? '')} body=${body}`;
  }
  // The service text for "add-on not enabled". Anything else is a real failure.
  const PUSH_OFF = /requires Push Notifications which is not enabled/i;
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
        await client.push.deleteDevice({ device: device(), pushGateway: 'fcm' }).catch(() => undefined);
        await client.push.deleteDevice({ device: device(), ...apns2Options }).catch(() => undefined);
      }
    })();
    return probe;
  }

  async function requirePush(): Promise<void> {
    const result = await pushAvailability();
    if (result.off) {
      skipStep(
        'needs-feature:push-notifications',
        `the add-on is off for the open keyset, so registration was not exercised (${result.detail}). Enable Push Notifications for it in the Admin Portal, no APNs or FCM credentials are needed.`,
      );
    }
    await world.observer.objects
      .setChannelMetadata({ channel: world.n('push_marker'), data: { name: 'mobile push run marker' } })
      .catch(() => undefined);
  }

  // Wired through requirePush so a keyset without the add-on skips here as needs-feature and not as a failure.
  check('preflightMobilePush', { phase: 'P0', timeout: 60_000, proves: 'Preflight: the keyset has the Mobile Push add-on, otherwise push steps skip as needs-feature.' }, async () => {
    await requirePush();
  });

  check('pushDeviceTokenFormat', { timeout: 60_000, proves: 'Pins which device token formats each push gateway accepts, behind a documented docs problem.' }, async () => {
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
    const fcmToken = world.n(docsToken);
    try {
      await client.push.addChannels({ channels: [channel], device: fcmToken, pushGateway: 'fcm' });
      const listed = await world.observer.push.listChannels({ device: fcmToken, pushGateway: 'fcm' });
      assert.deepEqual(listed.channels, [channel], 'fcm registered a non-hex token');
    } finally {
      await client.push.deleteDevice({ device: fcmToken, pushGateway: 'fcm' }).catch(() => undefined);
    }
  });

  function requireStep(id: string): void {
    const result = registry.result(id);
    if (result && result.status !== 'passed') skipStep(`blocked-by:${id}`);
  }

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
    assert.deepEqual(sorted(response.channels), ab(), 'apns2 list');
    assert.deepEqual(sorted(response2.channels), ab(), 'fcm list');
  });

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

  step('removeAllMobilePushNotificationsBasicUsage', { timeout: 60_000, proves: 'deleteDevice removes every registration of the device and the list is empty afterwards.' }, async () => {
    const pubnub = world.shopper;
    await requirePush();
    requireStep('removeDeviceFromChannelBasicUsage');
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
