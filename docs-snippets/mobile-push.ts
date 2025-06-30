import PubNub from '../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'myUniqueUserId',
});

// snippet.simpleNotificationPayloadFCMandAPNS
const builder = PubNub.notificationPayload('Chat invitation', "You have been invited to 'quiz' chat");
builder.sound = 'default';

console.log(JSON.stringify(builder.buildPayload(['apns', 'fcm']), null, 2));
// snippet.end

// snippet.simpleNotificationPayloadFCMandAPNSH/2
const payloadBuilder = PubNub.notificationPayload('Chat invitation', "You have been invited to 'quiz' chat");
payloadBuilder.apns.configurations = [{ targets: [{ topic: 'com.meetings.chat.app' }] }];
payloadBuilder.sound = 'default';

console.log(JSON.stringify(payloadBuilder.buildPayload(['apns2', 'fcm']), null, 2));
// snippet.end

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
