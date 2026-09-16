import PubNub, { PubNubError } from '../../lib/types';

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
  console.error(
    `Counting the fans watching failed: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.reEngagementCheckOneFan
try {
  const response = await pubnub.whereNow({ uuid: 'fan-42' });

  if (response.channels.includes('game.stream')) {
    console.log('fan-42 is watching, so no alert is needed');
  } else {
    console.log('fan-42 left the stream, so a push alert can bring them back');
  }
} catch (error) {
  console.error(
    `Checking where the fan is failed: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.reEngagementWatchFansLeave
const streamSubscription = pubnub.channel('game.stream').subscription({ receivePresenceEvents: true });

streamSubscription.onPresence = (event) => {
  if (event.action === 'leave' || event.action === 'timeout') {
    console.log(`${event.uuid} stopped watching, and ${event.occupancy} fans remain`);
  }
};

streamSubscription.subscribe();
// snippet.end

// snippet.reEngagementPublishMomentAlert
const moment = PubNub.notificationPayload('Injury time', 'Two minutes left, and it is still 2-2.');

moment.sound = 'default';
moment.apns.configurations = [{ targets: [{ topic: 'com.example.matchday' }] }];

try {
  const response = await pubnub.publish({
    channel: 'game.moment-alerts',
    message: {
      ...moment.buildPayload(['apns2', 'fcm']),
      moment: 'injury-time',
    },
    customMessageType: 'moment-alert',
  });
  console.log('moment alert published at timetoken:', response.timetoken);
} catch (error) {
  console.error(
    `Publishing the moment alert failed: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.reEngagementRegisterForMomentAlerts
try {
  const response = await pubnub.push.addChannels({
    channels: ['game.moment-alerts'],
    device: 'replace-with-the-fcm-registration-token',
    pushGateway: 'fcm',
  });
  console.log('device registered for moment alerts:', response);
} catch (error) {
  console.error(
    `Registering for moment alerts failed: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end
