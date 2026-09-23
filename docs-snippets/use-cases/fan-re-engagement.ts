import PubNub from '../../lib/types';

// Presence monitoring and the decision to alert a fan run under their own service
// identity, separate from any fan's own client, so this script's watcher is never
// the same connection whose absence it is trying to detect.
const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'match-service',
});

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
    console.error(`Checking where ${userId} is subscribed failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
    return;
  }

  console.log(`${userId} is not subscribed to game.stream, so sending a moment alert`);
  await sendMomentAlert(userId);
}
// snippet.end

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

// snippet.reEngagementFanViewer
const viewerUserId = process.argv[2] ?? 'fan-a';

const viewerClient = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: viewerUserId,
});

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
