import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import PubNub from 'pubnub';
import { assertTimetoken } from '../support/assertions';
import { createClient, observer, track } from '../support/clients';
import { captureConsole } from '../support/console';
import { keysOf } from '../support/env';
import { watch, eventually } from '../support/wait';

/**
 * Port of docs-snippets/use-cases/score-alerts.ts (page use-cases/sports-media-entertainment/real-time-score-alerts).
 * One flow: register a device, build and publish the alert, list the registration, remove it. Needs the Push Notifications
 * add-on on the open keyset. Delivery of the notification itself needs a real device and provider credentials: not verified.
 */
describe('use-cases/score-alerts', () => {
  const sorted = (values: string[]): string[] => [...values].sort();
  // The device tokens of the page are placeholders. Registrations are shared and persistent, so every run uses its own tokens.
  const APNS_TOKEN = randomBytes(32).toString('hex');
  const FCM_TOKEN = `fcm-registration-${randomUUID()}`;
  const apnsOptions = { pushGateway: 'apns2', environment: 'development', topic: 'com.example.matchday' } as const;

  const removeDevices = async (): Promise<void> => {
    const cleaner = createClient('open', 'score-alerts-cleaner');
    await cleaner.push.deleteDevice({ device: APNS_TOKEN, ...apnsOptions }).catch(() => undefined);
    await cleaner.push.deleteDevice({ device: FCM_TOKEN, pushGateway: 'fcm' }).catch(() => undefined);
    await cleaner.deleteMessages({ channel: 'game.score-alerts' }).catch(() => undefined);
  };
  before(removeDevices);
  after(removeDevices);

  it('scoreAlertsEnvironmentConstant, scoreAlertsRegisterDeviceFCM, scoreAlertsRegisterDeviceAPNs, scoreAlertsBuildNotification, scoreAlertsPublishNotification, scoreAlertsListDeviceRegistrationsFCM, scoreAlertsListDeviceRegistrationsAPNs, scoreAlertsRemoveDeviceRegistrationFCM, scoreAlertsRemoveDeviceRegistrationAPNs: a device registers, an alert is built and published, the registration is listed and removed', async function () {
    this.timeout(120_000);
    const { publishKey, subscribeKey } = keysOf('open');
    const log = captureConsole('log');
    const errors = captureConsole('error');
    try {
      const pubnub = track(new PubNub({ publishKey, subscribeKey, userId: 'fan-42' }));
      // The page tells readers to replace the device token placeholders. Swap them for this run's tokens in the push calls.
      const tokens: Record<string, string> = {
        'replace-with-the-apns-device-token': APNS_TOKEN,
        'replace-with-the-fcm-registration-token': FCM_TOKEN,
      };
      const swap = (value: unknown): unknown =>
        value && typeof value === 'object' && !Array.isArray(value)
          ? Object.fromEntries(
              Object.entries(value).map(([key, item]) => [
                key,
                typeof item === 'string' ? (tokens[item] ?? item) : item,
              ]),
            )
          : value;
      for (const method of ['addChannels', 'listChannels', 'removeChannels'] as const) {
        const original = pubnub.push[method].bind(pubnub.push) as (arg: unknown) => Promise<unknown>;
        (pubnub.push as unknown as Record<string, unknown>)[method] = (arg: unknown) => original(swap(arg));
      }

      // An independent client listens on the alert channel.
      const seen = await watch(observer(), ['game.score-alerts']);
      // Reader that lists registrations independently of the registering client.
      const reader = observer();
      const registrations = async (): Promise<{ apns: string[]; fcm: string[] }> => ({
        apns: sorted((await reader.push.listChannels({ device: APNS_TOKEN, ...apnsOptions })).channels),
        fcm: sorted((await reader.push.listChannels({ device: FCM_TOKEN, pushGateway: 'fcm' })).channels),
      });

      /* eslint-disable prettier/prettier */
      // snippet.scoreAlertsEnvironmentConstant
      // Every APNs call below, device registration, the notification payload's target,
      // listing, and removal, reads this same value. An iOS device token only works in the
      // APNs environment that issued it: a development (sandbox) token comes from a
      // debug or development-signed build and only works with environment: 'development';
      // a production token comes from a TestFlight or App Store build and only works with
      // environment: 'production'. Registering with one value and publishing toward the
      // other is why a registration can succeed while the notification it's supposed to
      // produce never arrives. Change this one constant when you move from a development
      // build to a TestFlight or App Store build, rather than editing every call below.
      const APNS_ENVIRONMENT = 'development';
      // snippet.end
      /* eslint-enable prettier/prettier */
      assert.equal(APNS_ENVIRONMENT, apnsOptions.environment, 'the helpers of this test use the same environment');

      /* eslint-disable prettier/prettier */
      // snippet.scoreAlertsRegisterDeviceFCM
      try {
        const response = await pubnub.push.addChannels({
          channels: ['game.score-alerts'],
          device: 'replace-with-the-fcm-registration-token',
          pushGateway: 'fcm',
        });
        console.log('Android device registered for score alerts:', response);
      } catch (error) {
        const status = error instanceof Error && 'status' in error ? error.status : undefined;
        console.error(`Registering the Android device failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
      }
      // snippet.end
      /* eslint-enable prettier/prettier */
      assert.deepEqual(errors.lines, [], 'FCM registration: error path not taken');
      assert.ok(
        log.lines.some((l) => l.startsWith('Android device registered for score alerts:')),
        log.lines.join(' | '),
      );

      /* eslint-disable prettier/prettier */
      // snippet.scoreAlertsRegisterDeviceAPNs
      try {
        const response = await pubnub.push.addChannels({
          channels: ['game.score-alerts'],
          device: 'replace-with-the-apns-device-token',
          pushGateway: 'apns2',
          environment: APNS_ENVIRONMENT,
          topic: 'com.example.matchday',
        });
        console.log('iOS device registered for score alerts:', response);
      } catch (error) {
        const status = error instanceof Error && 'status' in error ? error.status : undefined;
        console.error(`Registering the iOS device failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
      }
      // snippet.end
      /* eslint-enable prettier/prettier */
      assert.deepEqual(errors.lines, [], 'APNs registration: error path not taken');
      assert.ok(
        log.lines.some((l) => l.startsWith('iOS device registered for score alerts:')),
        log.lines.join(' | '),
      );
      // Another client sees both registrations: one channel per token (the tokens are this run's own).
      await eventually(
        async () =>
          assert.deepEqual(await registrations(), { apns: ['game.score-alerts'], fcm: ['game.score-alerts'] }),
        {
          label: 'registrations visible to another client',
          timeout: 30_000,
        },
      );

      /* eslint-disable prettier/prettier */
      // snippet.scoreAlertsBuildNotification
      const goal = PubNub.notificationPayload('Leeds score!', 'Southampton 0 - 2 Leeds');

      goal.sound = 'default';
      goal.apns.configurations = [{ targets: [{ topic: 'com.example.matchday', environment: APNS_ENVIRONMENT }] }];

      const payload = goal.buildPayload(['apns2', 'fcm']);

      console.log(JSON.stringify(payload, null, 2));
      // snippet.end
      /* eslint-enable prettier/prettier */
      // The printed object is the one the next step publishes: APNs (v2 target with topic and environment) and FCM blocks.
      const printed = JSON.parse(log.lines[log.lines.length - 1]);
      assert.deepEqual(printed, payload);
      const built = payload as unknown as {
        pn_apns: {
          aps: { alert: { title: string; body: string }; sound: string };
          pn_push: Array<{ targets: Array<{ topic: string; environment: string }>; version: string }>;
        };
        pn_fcm: { notification: { title: string; body: string } };
      };
      assert.equal(built.pn_apns.aps.alert.title, 'Leeds score!');
      assert.equal(built.pn_apns.aps.alert.body, 'Southampton 0 - 2 Leeds');
      assert.equal(built.pn_apns.aps.sound, 'default');
      assert.deepEqual(built.pn_apns.pn_push[0].targets, [
        { topic: 'com.example.matchday', environment: 'development' },
      ]);
      assert.equal(built.pn_apns.pn_push[0].version, 'v2');
      assert.equal(built.pn_fcm.notification.title, 'Leeds score!');
      assert.equal(built.pn_fcm.notification.body, 'Southampton 0 - 2 Leeds');

      log.lines.length = 0;
      /* eslint-disable prettier/prettier */
      // snippet.scoreAlertsPublishNotification
      try {
        const response = await pubnub.publish({
          channel: 'game.score-alerts',
          message: {
            ...payload,
            score: '0-2',
            scorer: 'Leeds',
          },
          customMessageType: 'score-alert',
        });
        console.log('score alert published at timetoken:', response.timetoken);
      } catch (error) {
        const status = error instanceof Error && 'status' in error ? error.status : undefined;
        console.error(`Publishing the score alert failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
      }
      // snippet.end
      /* eslint-enable prettier/prettier */
      assert.deepEqual(errors.lines, [], 'publish: error path not taken');
      const timetoken = log.lines.find((l) => l.startsWith('score alert published at timetoken: '))?.split(': ')[1];
      assertTimetoken(timetoken);
      // A subscriber with the app open receives it as an ordinary message.
      const alert = await seen.next('message', (m) => m.timetoken === timetoken);
      assert.equal(alert.channel, 'game.score-alerts');
      assert.equal(alert.customMessageType, 'score-alert');
      assert.equal(alert.publisher, 'fan-42');
      const delivered = alert.message as { score: string; scorer: string };
      assert.equal(delivered.score, '0-2');
      assert.equal(delivered.scorer, 'Leeds');

      log.lines.length = 0;
      /* eslint-disable prettier/prettier */
      // snippet.scoreAlertsListDeviceRegistrationsFCM
      try {
        const response = await pubnub.push.listChannels({
          device: 'replace-with-the-fcm-registration-token',
          pushGateway: 'fcm',
        });
        console.log('this device receives alerts on:', response.channels);
      } catch (error) {
        const status = error instanceof Error && 'status' in error ? error.status : undefined;
        console.error(
          `Listing the device registrations failed: ${error}${status ? ` Additional information: ${status}` : ''}`,
        );
      }
      // snippet.end
      /* eslint-enable prettier/prettier */
      assert.deepEqual(errors.lines, [], 'FCM listing: error path not taken');
      assert.deepEqual(log.lines, ['this device receives alerts on: ["game.score-alerts"]']);

      log.lines.length = 0;
      /* eslint-disable prettier/prettier */
      // snippet.scoreAlertsListDeviceRegistrationsAPNs
      try {
        const response = await pubnub.push.listChannels({
          device: 'replace-with-the-apns-device-token',
          pushGateway: 'apns2',
          environment: APNS_ENVIRONMENT,
          topic: 'com.example.matchday',
        });
        console.log('this device receives alerts on:', response.channels);
      } catch (error) {
        const status = error instanceof Error && 'status' in error ? error.status : undefined;
        console.error(
          `Listing the device registrations failed: ${error}${status ? ` Additional information: ${status}` : ''}`,
        );
      }
      // snippet.end
      /* eslint-enable prettier/prettier */
      assert.deepEqual(errors.lines, [], 'APNs listing: error path not taken');
      assert.deepEqual(log.lines, ['this device receives alerts on: ["game.score-alerts"]']);

      log.lines.length = 0;
      /* eslint-disable prettier/prettier */
      // snippet.scoreAlertsRemoveDeviceRegistrationFCM
      try {
        const response = await pubnub.push.removeChannels({
          channels: ['game.score-alerts'],
          device: 'replace-with-the-fcm-registration-token',
          pushGateway: 'fcm',
        });
        console.log('device no longer receives score alerts:', response);
      } catch (error) {
        const status = error instanceof Error && 'status' in error ? error.status : undefined;
        console.error(
          `Removing the device registration failed: ${error}${status ? ` Additional information: ${status}` : ''}`,
        );
      }
      // snippet.end
      /* eslint-enable prettier/prettier */
      assert.deepEqual(errors.lines, [], 'FCM removal: error path not taken');
      assert.ok(
        log.lines.some((l) => l.startsWith('device no longer receives score alerts:')),
        log.lines.join(' | '),
      );

      /* eslint-disable prettier/prettier */
      // snippet.scoreAlertsRemoveDeviceRegistrationAPNs
      try {
        const response = await pubnub.push.removeChannels({
          channels: ['game.score-alerts'],
          device: 'replace-with-the-apns-device-token',
          pushGateway: 'apns2',
          environment: APNS_ENVIRONMENT,
          topic: 'com.example.matchday',
        });
        console.log('device no longer receives score alerts:', response);
      } catch (error) {
        const status = error instanceof Error && 'status' in error ? error.status : undefined;
        console.error(
          `Removing the device registration failed: ${error}${status ? ` Additional information: ${status}` : ''}`,
        );
      }
      // snippet.end
      /* eslint-enable prettier/prettier */
      assert.deepEqual(errors.lines, [], 'APNs removal: error path not taken');
      assert.equal(log.lines.filter((l) => l.startsWith('device no longer receives score alerts:')).length, 2);
      // Another client sees no registration left for either token.
      await eventually(async () => assert.deepEqual(await registrations(), { apns: [], fcm: [] }), {
        label: 'registrations removed',
        timeout: 30_000,
      });
    } finally {
      log.restore();
      errors.restore();
    }
  });
});
