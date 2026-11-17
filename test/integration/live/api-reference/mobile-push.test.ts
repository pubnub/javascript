import assert from 'node:assert/strict';
import PubNub from 'pubnub';
import { observer, friend, shopper } from '../support/clients';
import { retryTransient } from '../support/retry';
import { captureConsole } from '../support/console';
import { eventually, watch } from '../support/wait';
import { sorted } from '../support/util';

/**
 * Mobile push notification examples. Port of docs-snippets/api-reference/mobile-push.ts.
 * Registering a device token does not send a push. Delivery needs a real device and APNs or FCM credentials.
 * Needs the Push Notifications add-on on the open keyset (no APNs or FCM credentials are needed).
 *
 * The device token of the docs is shared and persistent, so a hook brings it to a known state (every registration removed)
 * before each test that asserts exact channel lists (reset approach).
 */
describe('api-reference/mobile-push', () => {
  // Registration order is not guaranteed by the service, so every list comparison sorts first.
  const DEVICE = '740f4707bebcf74f9b7c25d48e3358945f6aa01da5ddb387462c7eaf61bb78ad';
  const apns2Options = { pushGateway: 'apns2', environment: 'production', topic: 'com.example.bundle_id' } as const;

  // The service text for "add-on not enabled". Anything else is a real failure.
  const PUSH_OFF = /requires Push Notifications which is not enabled/i;

  /** Channels of the device on both gateways, read through a given client. */
  async function registrations(pubnub: PubNub, device = DEVICE): Promise<{ apns2: string[]; fcm: string[] }> {
    const apns2 = await pubnub.push.listChannels({ device, ...apns2Options });
    const fcm = await pubnub.push.listChannels({ device, pushGateway: 'fcm' });
    return { apns2: sorted(apns2.channels), fcm: sorted(fcm.channels) };
  }

  /** Removes every registration of the device on both gateways and waits until another client sees none. */
  async function resetDevice(): Promise<void> {
    const client = friend();
    try {
      await client.push.deleteDevice({ device: DEVICE, ...apns2Options });
      await client.push.deleteDevice({ device: DEVICE, pushGateway: 'fcm' });
    } catch (error) {
      const status = (error as { status?: { statusCode?: unknown; errorData?: unknown } } | undefined)?.status;
      const detail = `${error instanceof Error ? error.message : String(error)} ${JSON.stringify(status?.errorData ?? '')}`;
      if (PUSH_OFF.test(detail)) {
        throw new Error(
          `Push Notifications is not enabled for the open keyset. Enable it in the Admin Portal, no APNs or FCM credentials are needed. ${detail}`,
        );
      }
      throw error;
    }
    const reader = observer();
    await eventually(async () => assert.deepEqual(await registrations(reader), { apns2: [], fcm: [] }), {
      label: 'device has no registrations',
      timeout: 30_000,
    });
  }

  /** Resets the device, registers `channels` on both gateways and waits until another client lists them. */
  async function seedDevice(channels: string[]): Promise<void> {
    await resetDevice();
    const client = friend();
    await retryTransient(() => client.push.addChannels({ channels, device: DEVICE, ...apns2Options }), {
      label: 'seed push registration',
    });
    await retryTransient(() => client.push.addChannels({ channels, device: DEVICE, pushGateway: 'fcm' }), {
      label: 'seed push registration',
    });
    const reader = observer();
    await eventually(
      async () => assert.deepEqual(await registrations(reader), { apns2: sorted(channels), fcm: sorted(channels) }),
      { label: 'device registrations visible', timeout: 30_000 },
    );
  }

  after(async () => {
    // The samples register the device. Leave it without registrations.
    await resetDevice();
  });

  it('addDeciveToChannelBasicUsage: addChannels registers a device token for a channel and another client reads the registration back', async function () {
    this.timeout(60_000);
    const pubnub = shopper();
    // Reset approach: the device starts without registrations, so the lists below are exactly the channels of the sample.
    await resetDevice();

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

    const reader = observer();
    await eventually(
      async () => assert.deepEqual(await registrations(reader), { apns2: ['a', 'b'], fcm: ['a', 'b'] }),
      {
        label: 'registrations visible',
        timeout: 30_000,
      },
    );
  });

  it('listChannelsForDeviceBasicUsage: listChannels returns the channels registered for the device', async function () {
    this.timeout(60_000);
    const pubnub = shopper();
    // Reset approach: register exactly a and b on both gateways first.
    await seedDevice(['a', 'b']);

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

    assert.deepEqual(sorted(response.channels), ['a', 'b'], 'apns2 list');
    assert.deepEqual(sorted(response2.channels), ['a', 'b'], 'fcm list');
  });

  it('removeDeviceFromChannelBasicUsage: removeChannels unregisters the device and both gateways list nothing afterwards', async function () {
    this.timeout(60_000);
    const pubnub = shopper();
    await seedDevice(['a', 'b']);

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
    const reader = observer();
    await eventually(async () => assert.deepEqual(await registrations(reader), { apns2: [], fcm: [] }), {
      label: 'registrations removed',
      timeout: 30_000,
    });
  });

  it('removeAllMobilePushNotificationsBasicUsage: deleteDevice removes every registration of the device and the list is empty afterwards', async function () {
    this.timeout(60_000);
    const pubnub = shopper();
    await seedDevice(['a']);

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
    const reader = observer();
    await eventually(async () => assert.deepEqual(await registrations(reader), { apns2: [], fcm: [] }), {
      label: 'device deleted',
      timeout: 30_000,
    });
  });

  // Replaces the old check pushDeviceTokenFormat: it pins which device token formats each gateway accepts. The docs show
  // the token 'niceDevice', which only fcm accepts.
  it('pushDeviceTokenFormat: apns and apns2 reject the non-hex docs token with 400 and fcm registers it', async function () {
    this.timeout(60_000);
    const client = shopper();
    const reader = observer();
    const docsToken = 'niceDevice';
    const fcmOptions = { device: docsToken, pushGateway: 'fcm' } as const;
    // Reset approach for this token as well.
    await client.push.deleteDevice(fcmOptions);

    for (const [label, options] of [
      ['apns', { pushGateway: 'apns' }],
      ['apns2', apns2Options],
    ] as const) {
      let rejected: unknown;
      try {
        await retryTransient(() => client.push.addChannels({ channels: ['a'], device: docsToken, ...options }), {
          label: 'seed push registration',
        });
      } catch (error) {
        rejected = error;
      }
      assert.ok(rejected, `${label} accepted the docs token "${docsToken}", the docs bug is gone, update the docs`);
      const status = (rejected as { status?: { statusCode?: unknown; errorData?: unknown } }).status;
      const detail = `${rejected instanceof Error ? rejected.message : String(rejected)} status=${String(
        status?.statusCode ?? '',
      )} body=${JSON.stringify(status?.errorData ?? '')}`;
      assert.match(detail, /status=400/, `${label}: expected status 400, got ${detail}`);
      assert.match(detail, /Invalid device token/i, `${label}: expected "Invalid device token", got ${detail}`);
    }

    try {
      await retryTransient(() => client.push.addChannels({ channels: ['a'], ...fcmOptions }), {
        label: 'seed push registration',
      });
      await eventually(async () => assert.deepEqual((await reader.push.listChannels(fcmOptions)).channels, ['a']), {
        label: 'fcm registered a non-hex token',
        timeout: 30_000,
      });
    } finally {
      await client.push.deleteDevice(fcmOptions).catch(() => undefined);
    }
  });

  it('buildNotificationPayloadBasicUsage: the notification payload builder output is published and a subscriber receives the message', async () => {
    const pubnub = shopper();
    const listening = await watch(observer(), ['chat-bot']);

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

    assert.match(String(response.timetoken), /^\d{17}$/);
    assert.ok(messagePayload.pn_apns && messagePayload.pn_fcm, 'the payload carries the APNs and FCM sections');
    // The channel is shared, so match this run's own message by timetoken.
    const received = await listening.next('message', (m) => m.timetoken === String(response.timetoken));
    assert.ok(received.message, 'subscribers get the message');
    listening.stop();
  });

  // ---- payload builders, local ---------------------------------------------------------------------------------------

  it('simpleNotificationPayloadFCMandAPNS: the payload builder prints a payload with the FCM and APNs sections the sample describes', async () => {
    const logs = captureConsole('log');
    try {
      // snippet.simpleNotificationPayloadFCMandAPNS
      const builder = PubNub.notificationPayload('Chat invitation', "You have been invited to 'quiz' chat");
      builder.sound = 'default';

      console.log(JSON.stringify(builder.buildPayload(['apns', 'fcm']), null, 2));
      // snippet.end
    } finally {
      logs.restore();
    }
    const alert = { title: 'Chat invitation', body: "You have been invited to 'quiz' chat" };
    assert.deepEqual(JSON.parse(logs.lines[0]), {
      pn_apns: { aps: { alert, sound: 'default' } },
      pn_fcm: { notification: alert, android: { notification: { sound: 'default' } } },
    });
  });

  it('simpleNotificationPayloadFCMandAPNSH/2: the payload builder produces the APNs HTTP/2 section as documented', async () => {
    const logs = captureConsole('log');
    try {
      // snippet.simpleNotificationPayloadFCMandAPNSH/2
      const payloadBuilder = PubNub.notificationPayload('Chat invitation', "You have been invited to 'quiz' chat");
      payloadBuilder.apns.configurations = [{ targets: [{ topic: 'com.meetings.chat.app' }] }];
      payloadBuilder.sound = 'default';

      console.log(JSON.stringify(payloadBuilder.buildPayload(['apns2', 'fcm']), null, 2));
      // snippet.end
    } finally {
      logs.restore();
    }
    const payload = JSON.parse(logs.lines[0]);
    assert.equal(payload.pn_apns.pn_push[0].targets[0].topic, 'com.meetings.chat.app');
    assert.equal(payload.pn_apns.pn_push[0].version, 'v2');
    assert.equal(payload.pn_apns.aps.sound, 'default');
    assert.equal(payload.pn_fcm.android.notification.sound, 'default');
  });

  // Checks that collapseId and expirationDate reach the payload in the snake case wire format.
  it('simpleNotificationPayloadFCMandAPNSH/2CustomConfiguration: collapseId and expirationDate reach the payload in the wire format', async () => {
    const logs = captureConsole('log');
    // The sample builds its own configuration, so check the expiration against the time window around the run.
    const startedAt = Date.now();
    try {
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
    } finally {
      logs.restore();
    }
    const payload = JSON.parse(logs.lines[0]);
    assert.equal(payload.pn_apns.pn_push[0].collapse_id, 'invitations');
    const expiration = Date.parse(payload.pn_apns.pn_push[0].expiration);
    assert.ok(
      expiration >= startedAt + 10000 && expiration <= Date.now() + 10000,
      `expiration ${expiration} is 10 s ahead`,
    );
  });
});
