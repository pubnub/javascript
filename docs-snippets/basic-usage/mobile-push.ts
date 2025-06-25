import PubNub from '../../lib/types';

// Initialize PubNub with demo keys
const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'myUniqueUserId',
});

// snippet.addDeciveToChannelBasicUsage
// Function to add a device to a channel for APNs2
async function addDeviceToChannelAPNs2() {
  try {
    const result = await pubnub.push.addChannels({
      channels: ['a', 'b'],
      device: 'niceDevice',
      pushGateway: 'apns2',
      environment: 'production',
      topic: 'com.example.bundle_id',
    });
    console.log('Operation done for APNs2!');
    console.log('Response:', result);
  } catch (error) {
    console.log('Operation failed with error for APNs2:', error);
  }
}

// Function to add a device to a channel for FCM
async function addDeviceToChannelFCM() {
  try {
    const result = await pubnub.push.addChannels({
      channels: ['a', 'b'],
      device: 'niceDevice',
      pushGateway: 'gcm',
    });
    console.log('Operation done for FCM!');
    console.log('Response:', result);
  } catch (error) {
    console.log('Operation failed with error for FCM:', error);
  }
}

// Execute the functions to add the device to channels
addDeviceToChannelAPNs2();
addDeviceToChannelFCM();

// snippet.end

// snippet.listChannelsForDeviceBasicUsage
// for APNs2
try {
  const response = await pubnub.push.listChannels({
    device: 'niceDevice',
    pushGateway: 'apns2',
    environment: 'production',
    topic: 'com.example.bundle_id',
  });
  console.log(`listing channels for device response: ${response}`);
  response.channels.forEach((channel: string) => {
    console.log(channel);
  });
} catch (status) {
  console.log(`listing channels for device failed with error: ${status}`);
}

// for FCM
try {
  const response = await pubnub.push.listChannels({
    device: 'niceDevice',
    pushGateway: 'gcm',
  });

  console.log(`listing channels for device response: ${response}`);

  response.channels.forEach((channel: string) => {
    console.log(channel);
  });
} catch (status) {
  console.log(`listing channels for device failed with error: ${status}`);
}
// snippet.end

// snippet.removeDeviceFromChannelBasicUsage
// for APNs2
try {
  const response = await pubnub.push.removeChannels({
    channels: ['a', 'b'],
    device: 'niceDevice',
    pushGateway: 'apns2',
    environment: 'production',
    topic: 'com.example.bundle_id',
  });

  console.log(`removing device from channel response: ${response}`);
} catch (status) {
  console.log(`removing device from channel failed with error: ${status}`);
}

// for FCM
try {
  const response = await pubnub.push.removeChannels({
    channels: ['a', 'b'],
    device: 'niceDevice',
    pushGateway: 'gcm',
  });

  console.log(`removing device from channel response: ${response}`);
} catch (status) {
  console.log(`removing device from channel failed with error: ${status}`);
}
// snippet.end

// snippet.removeAllMobilePushNotificationsBasicUsage

// for APNs2
try {
  const response = await pubnub.push.deleteDevice({
    device: 'niceDevice',
    pushGateway: 'apns2',
    environment: 'production',
    topic: 'com.example.bundle_id',
  });

  console.log(`deleteDevice response: ${response}`);
} catch (status) {
  console.log(`deleteDevice failed with error: ${status}`);
}

// for FCM
try {
  const response = await pubnub.push.deleteDevice({
    device: 'niceDevice',
    pushGateway: 'gcm',
  });

  console.log(`deleteDevice response: ${response}`);
} catch (status) {
  console.log(`deleteDevice failed with error: ${status}`);
}

// snippet.end

// snippet.buildNotificationPayloadBasicUsage

const builder = PubNub.notificationPayload('Chat invitation', "You have been invited to 'quiz' chat");
const messagePayload = builder.buildPayload(['apns2', 'fcm']);
// add required fields to the payload

const response = await pubnub.publish({
  message: messagePayload,
  channel: 'chat-bot',
});

console.log(`publish response: ${response}`);

// snippet.end
