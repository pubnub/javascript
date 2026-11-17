/* eslint-disable prettier/prettier, max-len -- sample text must stay character for character, so its long lines cannot be re-wrapped */
import assert from 'node:assert/strict';
import PubNub from 'pubnub';
import { createClient, observer, track } from '../support/clients';
import { captureConsole } from '../support/console';
import { openKeys } from '../support/env';
import { DEVICE_TOKEN_EXAMPLE } from '../support/resources';
import { connected, eventually, PRESENCE_TIMEOUT, settled, watch } from '../support/wait';

/**
 * Fan re-engagement. Port of docs-snippets/use-cases/fan-re-engagement.ts.
 * Needs Presence and Mobile Push Notifications on the open keyset. The test registers a device token for push but no real
 * device exists, so it cannot verify that a push notification is DELIVERED; it verifies the publish to the fan's own alert
 * channel, the payload, and the device registration.
 */
describe('use-cases/fan-re-engagement', () => {
  it('reEngagementCountFansWatching, reEngagementPublishMomentAlert, reEngagementCheckOneFan, reEngagementWatchFansLeave, reEngagementFanViewer: the service counts fans, alerts only a fan who left, and a viewer stays reachable after it stops watching', async function () {
    this.timeout(180_000);
    const pubnub = createClient('open', 'match-service');
    const logs = captureConsole('log');
    const errors = captureConsole('error');
    const argvBefore = process.argv;
    const sigintBefore = process.listeners('SIGINT');
    // Two stand-in fans that watch the stream: fan-b leaves in the middle of the flow, fan-a is the sample's viewer.
    const fanB = createClient('open', 'fan-b');
    const fanBWatching = await watch(fanB, ['game.stream']);
    // The samples read the presence of the fan once (hereNow for the count, whereNow for the check of one fan) and the assertions
    // after them need the fan listed, so both reads must hold on consecutive polls.
    const presenceSeen = async (userId: string, present = true) => {
      await settled(
        async () => {
          const here = await observer().hereNow({ channels: ['game.stream'], includeUUIDs: true });
          const listed = here.channels['game.stream']?.occupants.some((o) => o.uuid === userId) ?? false;
          assert.equal(listed, present, `${userId} ${present ? 'is' : 'is not'} listed on game.stream`);
          const where = await observer().whereNow({ uuid: userId });
          assert.equal(where.channels.includes('game.stream'), present, `whereNow ${present ? 'lists' : 'omits'} game.stream for ${userId}`);
        },
        { timeout: PRESENCE_TIMEOUT, label: `${userId} presence on game.stream` },
      );
    };
    try {
      await presenceSeen('fan-b');

      // snippet.reEngagementCountFansWatching
      try {
        const response = await pubnub.hereNow({
          channels: ['game.stream'],
          includeUUIDs: false,
        });
        console.log('fans currently watching the stream:', response.totalOccupancy);
      } catch (error) {
        const status = error instanceof Error && 'status' in error ? error.status : undefined;
        console.error(`Counting the fans watching failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
      }
      // snippet.end

      assert.deepEqual(errors.lines, [], 'the error path was not taken');
      const countLine = logs.lines.find((line) => line.startsWith('fans currently watching the stream: '));
      assert.ok(countLine, 'the sample printed the count');
      // Other users may watch too: the count includes at least fan-b.
      assert.ok(Number(countLine.slice('fans currently watching the stream: '.length)) >= 1, countLine);

      // snippet.reEngagementPublishMomentAlert
      async function sendMomentAlert(userId = '') {
        const alertChannel = `game.moment-alerts.${userId}`;
        const moment = PubNub.notificationPayload('Injury time', 'Two minutes left, and it is still 2-2.');

        moment.sound = 'default';
        moment.apns.configurations = [{ targets: [{ topic: 'com.example.matchday' }] }];

        try {
          const response = await pubnub.publish({
            channel: alertChannel,
            message: {
              ...moment.buildPayload(['apns2', 'fcm']),
              moment: 'injury-time',
            },
            customMessageType: 'moment-alert',
          });
          console.log(`moment alert published to ${alertChannel} at timetoken:`, response.timetoken);
        } catch (error) {
          const status = error instanceof Error && 'status' in error ? error.status : undefined;
          console.error(`Publishing the moment alert failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
        }
      }
      // snippet.end

      const alerts = await watch(observer(), ['game.moment-alerts.fan-b']);
      await sendMomentAlert('fan-b');
      assert.deepEqual(errors.lines, [], 'the error path was not taken');
      const alert = await alerts.next('message');
      assert.equal(alert.channel, 'game.moment-alerts.fan-b');
      assert.equal(alert.customMessageType, 'moment-alert');
      assert.equal(alert.publisher, 'match-service');
      const body = alert.message as {
        moment?: string;
        pn_fcm?: { notification?: { title?: string; body?: string } };
        pn_apns?: { aps?: { alert?: { title?: string } }; pn_push?: Array<{ targets?: Array<{ topic?: string }> }> };
      };
      assert.equal(body.moment, 'injury-time');
      assert.equal(body.pn_fcm?.notification?.title, 'Injury time');
      assert.equal(body.pn_fcm?.notification?.body, 'Two minutes left, and it is still 2-2.');
      assert.equal(body.pn_apns?.aps?.alert?.title, 'Injury time');
      assert.equal(body.pn_apns?.pn_push?.[0]?.targets?.[0]?.topic, 'com.example.matchday');
      assert.ok(logs.lines.some((line) => line.startsWith('moment alert published to game.moment-alerts.fan-b at timetoken: ')));
      alerts.stop();

      // snippet.reEngagementCheckOneFan
      async function notifyIfAbsent(userId = '') {
        try {
          const response = await pubnub.whereNow({ uuid: userId });

          if (response.channels.includes('game.stream')) {
            console.log(`${userId} is still subscribed to game.stream, so no alert is needed`);
            return;
          }
        } catch (error) {
          const status = error instanceof Error && 'status' in error ? error.status : undefined;
          console.error(
            `Checking where ${userId} is subscribed failed: ${error}${status ? ` Additional information: ${status}` : ''}`,
          );
          return;
        }

        console.log(`${userId} is not subscribed to game.stream, so sending a moment alert`);
        await sendMomentAlert(userId);
      }
      // snippet.end

      // A fan who is watching gets no alert; an absent one does. Unique ids keep this run's alert channels apart.
      logs.lines.length = 0;
      const absent = `fan-absent-${Date.now()}`;
      const absentAlerts = await watch(observer(), [`game.moment-alerts.${absent}`]);
      const watchingAlerts = await watch(observer(), ['game.moment-alerts.fan-b']);
      await notifyIfAbsent('fan-b');
      assert.ok(logs.lines.includes('fan-b is still subscribed to game.stream, so no alert is needed'));
      await notifyIfAbsent(absent);
      assert.ok(logs.lines.includes(`${absent} is not subscribed to game.stream, so sending a moment alert`));
      const absentAlert = await absentAlerts.next('message');
      assert.equal((absentAlert.message as { moment?: string }).moment, 'injury-time');
      // The absence of an alert for the watching fan is proven by the log above (no publish happens on that path) and by the
      // channel staying silent over the time the absent fan's alert took to arrive.
      assert.equal(watchingAlerts.events.filter((e) => e.kind === 'message').length, 0, 'the watching fan got no alert');
      assert.deepEqual(errors.lines, [], 'the error path was not taken');
      absentAlerts.stop();
      watchingAlerts.stop();

      // snippet.reEngagementWatchFansLeave
      const streamSubscription = pubnub.channel('game.stream').subscription({ receivePresenceEvents: true });

      streamSubscription.onPresence = (event) => {
        if (event.action === 'leave' || event.action === 'timeout') {
          console.log(`${event.uuid} stopped watching, and ${event.occupancy} fans remain`);
          void notifyIfAbsent(event.uuid);
        }
      };

      streamSubscription.subscribe();
      // snippet.end

      // fan-b leaves: the service sees the leave, confirms through whereNow and alerts fan-b alone.
      await eventually(async () => {
        const here = await observer().hereNow({ channels: ['game.stream'], includeUUIDs: true });
        assert.ok(here.channels['game.stream']?.occupants.some((o) => o.uuid === 'match-service'), 'service is listed');
      }, { timeout: PRESENCE_TIMEOUT, label: 'service presence' });
      const leaveAlerts = await watch(observer(), ['game.moment-alerts.fan-b']);
      logs.lines.length = 0;
      fanBWatching.stop();
      await eventually(() => assert.ok(logs.lines.some((line) => line.startsWith('fan-b stopped watching, and '))), {
        timeout: PRESENCE_TIMEOUT,
        label: 'leave event handled',
      });
      const leftAlert = await leaveAlerts.next('message', undefined, { timeout: 30_000 });
      assert.equal((leftAlert.message as { moment?: string }).moment, 'injury-time');
      assert.ok(logs.lines.includes('fan-b is not subscribed to game.stream, so sending a moment alert'));
      assert.deepEqual(errors.lines, [], 'the error path was not taken');
      leaveAlerts.stop();

      // The sample reads the fan from argv. Under mocha argv holds mocha's own arguments, so give it the shape of `node fan-viewer.js`.
      process.argv = ['node', 'fan-viewer.js'];
      logs.lines.length = 0;
      // Setup of the viewer client the sample builds (kept out of the snippet so the hidden block stays one line): the test
      // destroys it, and the sample shows a placeholder for the device token, so the real registration call gets a token of the
      // right shape.
      const prepareViewer = (viewerClient: PubNub): void => {
        track(viewerClient);
        const realAddChannels = viewerClient.push.addChannels.bind(viewerClient.push);
        viewerClient.push.addChannels = (args) =>
          realAddChannels({
            ...args,
            device: args.device === 'replace-with-the-fcm-registration-token' ? DEVICE_TOKEN_EXAMPLE : args.device,
          });
      };
      // snippet.reEngagementFanViewer
      const viewerUserId = process.argv[2] ?? 'fan-a';

      const viewerClient = new PubNub({
        publishKey: 'demo',
        subscribeKey: 'demo',
        userId: viewerUserId,
        // snippet.hide
        ...openKeys(),
        // snippet.show
      });
      // snippet.hide
      prepareViewer(viewerClient);
      // snippet.show

      const watchSubscription = viewerClient.channel('game.stream').subscription({ receivePresenceEvents: false });
      watchSubscription.subscribe();

      try {
        const response = await viewerClient.push.addChannels({
          channels: [`game.moment-alerts.${viewerUserId}`],
          device: 'replace-with-the-fcm-registration-token',
          pushGateway: 'fcm',
        });
        console.log(`${viewerUserId} registered its device for game.moment-alerts.${viewerUserId}:`, response);
      } catch (error) {
        const status = error instanceof Error && 'status' in error ? error.status : undefined;
        console.error(`Registering the device failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
      }

      const alertSubscription = viewerClient.channel(`game.moment-alerts.${viewerUserId}`).subscription();

      alertSubscription.onMessage = (event) => {
        console.log(`${viewerUserId} received a moment alert:`, event.message);
      };

      alertSubscription.subscribe();

      process.on('SIGINT', () => {
        console.log(`${viewerUserId} left game.stream, but is still reachable for a moment alert`);
        watchSubscription.unsubscribe();
      });
      // snippet.end

      process.argv = argvBefore;
      assert.equal(viewerUserId, 'fan-a', 'the viewer defaults to fan-a');
      assert.deepEqual(errors.lines, [], 'the error path was not taken');
      assert.ok(logs.lines.some((line) => line.startsWith('fan-a registered its device for game.moment-alerts.fan-a:')));
      await settled(
        async () => {
          const registered = await observer().push.listChannels({ device: DEVICE_TOKEN_EXAMPLE, pushGateway: 'fcm' });
          assert.ok(
            registered.channels.includes('game.moment-alerts.fan-a'),
            'the device is registered for the fan alert channel',
          );
        },
        { label: 'device registration listed' },
      );
      await presenceSeen('fan-a');

      // The fan's alert-channel subscription is live: an alert from the service reaches it.
      await eventually(async () => {
        const here = await observer().hereNow({ channels: ['game.moment-alerts.fan-a'], includeUUIDs: true });
        assert.ok(here.channels['game.moment-alerts.fan-a']?.occupants.some((o) => o.uuid === 'fan-a'), 'fan-a on alert channel');
      }, { timeout: PRESENCE_TIMEOUT, label: 'fan-a subscribed to its alert channel' });
      await sendMomentAlert('fan-a');
      await eventually(() => assert.ok(logs.lines.some((line) => line.startsWith('fan-a received a moment alert:'))), {
        label: 'viewer received the alert',
      });

      // Ctrl+C: the viewer leaves game.stream; the service sees it, confirms and alerts; the viewer still receives it.
      const handlers = process.listeners('SIGINT').filter((listener) => !sigintBefore.includes(listener));
      assert.equal(handlers.length, 1, 'the sample registered one SIGINT handler');
      logs.lines.length = 0;
      handlers[0]('SIGINT');
      assert.ok(logs.lines.includes('fan-a left game.stream, but is still reachable for a moment alert'));
      await eventually(() => assert.ok(logs.lines.some((line) => line.startsWith('fan-a stopped watching, and '))), {
        timeout: PRESENCE_TIMEOUT,
        label: 'service saw fan-a leave',
      });
      await eventually(() => assert.ok(logs.lines.some((line) => line.startsWith('fan-a received a moment alert:'))), {
        timeout: 30_000,
        label: 'fan-a still receives the alert after leaving game.stream',
      });
      assert.ok(logs.lines.includes('fan-a is not subscribed to game.stream, so sending a moment alert'));
      assert.deepEqual(errors.lines, [], 'the error path was not taken');
    } finally {
      process.argv = argvBefore;
      process.listeners('SIGINT').forEach((listener) => {
        if (!sigintBefore.includes(listener)) process.removeListener('SIGINT', listener);
      });
      logs.restore();
      errors.restore();
    }
  });

  after(async () => {
    // Best effort: drop the device registration the viewer sample made.
    try {
      const client = createClient('open', 'fan-a');
      await client.push.removeChannels({
        channels: ['game.moment-alerts.fan-a'],
        device: DEVICE_TOKEN_EXAMPLE,
        pushGateway: 'fcm',
      });
    } catch {
      // the janitor clears the device token as well
    }
  });
});
