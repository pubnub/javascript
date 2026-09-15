import PubNub, { PubNubError } from '../../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'fan-42',
});

// snippet.scoreAlertsRegisterDeviceAPNs
try {
  const response = await pubnub.push.addChannels({
    channels: ['game.score-alerts'],
    device: 'replace-with-the-apns-device-token',
    pushGateway: 'apns2',
    environment: 'production',
    topic: 'com.example.matchday',
  });
  console.log('iOS device registered for score alerts:', response);
} catch (error) {
  console.error(
    `Registering the iOS device failed: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.scoreAlertsRegisterDeviceFCM
try {
  const response = await pubnub.push.addChannels({
    channels: ['game.score-alerts'],
    device: 'replace-with-the-fcm-registration-token',
    pushGateway: 'fcm',
  });
  console.log('Android device registered for score alerts:', response);
} catch (error) {
  console.error(
    `Registering the Android device failed: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.scoreAlertsBuildNotification
const goal = PubNub.notificationPayload('Leeds score!', 'Southampton 0 - 2 Leeds');

goal.sound = 'default';
goal.apns.configurations = [{ targets: [{ topic: 'com.example.matchday' }] }];

const payload = goal.buildPayload(['apns2', 'fcm']);

console.log(JSON.stringify(payload, null, 2));
// snippet.end

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
  console.error(
    `Publishing the score alert failed: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.scoreAlertsListDeviceRegistrations
try {
  const response = await pubnub.push.listChannels({
    device: 'replace-with-the-fcm-registration-token',
    pushGateway: 'fcm',
  });
  console.log('this device receives alerts on:', response.channels);
} catch (error) {
  console.error(
    `Listing the device registrations failed: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.scoreAlertsRemoveDeviceRegistration
try {
  const response = await pubnub.push.removeChannels({
    channels: ['game.score-alerts'],
    device: 'replace-with-the-fcm-registration-token',
    pushGateway: 'fcm',
  });
  console.log('device no longer receives score alerts:', response);
} catch (error) {
  console.error(
    `Removing the device registration failed: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end
