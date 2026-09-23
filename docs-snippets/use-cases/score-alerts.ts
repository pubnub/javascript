import PubNub from '../../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'fan-42',
});

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

// snippet.scoreAlertsBuildNotification
const goal = PubNub.notificationPayload('Leeds score!', 'Southampton 0 - 2 Leeds');

goal.sound = 'default';
goal.apns.configurations = [{ targets: [{ topic: 'com.example.matchday', environment: APNS_ENVIRONMENT }] }];

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
  const status = error instanceof Error && 'status' in error ? error.status : undefined;
  console.error(`Publishing the score alert failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
}
// snippet.end

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
  console.error(`Listing the device registrations failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
}
// snippet.end

// snippet.scoreAlertsListDeviceRegistrationsFCM
try {
  const response = await pubnub.push.listChannels({
    device: 'replace-with-the-fcm-registration-token',
    pushGateway: 'fcm',
  });
  console.log('this device receives alerts on:', response.channels);
} catch (error) {
  const status = error instanceof Error && 'status' in error ? error.status : undefined;
  console.error(`Listing the device registrations failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
}
// snippet.end

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
  console.error(`Removing the device registration failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
}
// snippet.end

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
  console.error(`Removing the device registration failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
}
// snippet.end
