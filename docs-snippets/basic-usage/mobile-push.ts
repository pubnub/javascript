import PubNub, { PubNubError } from '../../lib/types';

// Initialize PubNub with demo keys
const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'myUniqueUserId',
});

// snippet.addDeciveToChannelBasicUsage
// Function to add a device to a channel for APNs2
try {
  const response = await pubnub.push.addChannels({
    channels: ['a', 'b'],
    device: 'niceDevice',
    pushGateway: 'apns2',
    environment: 'production',
    topic: 'com.example.bundle_id',
  });
  console.log('device added to channels response:', response);
} catch (error) {
  console.error(
    `Error adding device to channels: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}

// Function to add a device to a channel for FCM
try {
  const response = await pubnub.push.addChannels({
    channels: ['a', 'b'],
    device: 'niceDevice',
    pushGateway: 'gcm',
  });
  console.log('device added to channels response:', response);
} catch (error) {
  console.error(
    `Error adding device to channels: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
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
  console.log('listing channels for device response:', response);
  response.channels.forEach((channel: string) => {
    console.log(channel);
  });
} catch (error) {
  console.error(
    `Error listing channels for device: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}

// for FCM
try {
  const response = await pubnub.push.listChannels({
    device: 'niceDevice',
    pushGateway: 'gcm',
  });

  console.log('listing channels for device response:', response);

  response.channels.forEach((channel: string) => {
    console.log(channel);
  });
} catch (error) {
  console.error(
    `Error listing channels for device: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
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

  console.log('removing device from channel response:', response);
} catch (error) {
  console.error(
    `Error removing device from channel: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}

// for FCM
try {
  const response = await pubnub.push.removeChannels({
    channels: ['a', 'b'],
    device: 'niceDevice',
    pushGateway: 'gcm',
  });

  console.log('removing device from channel response:', response);
} catch (error) {
  console.error(
    `Error removing device from channel: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
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

  console.log('deleteDevice response:', response);
} catch (error) {
  console.error(
    `Error deleting device: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}

// for FCM
try {
  const response = await pubnub.push.deleteDevice({
    device: 'niceDevice',
    pushGateway: 'gcm',
  });

  console.log('deleteDevice response:', response);
} catch (error) {
  console.error(
    `Error deleting device: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}

// snippet.end

// snippet.buildNotificationPayloadBasicUsage

const builder = PubNub.notificationPayload('Chat invitation', "You have been invited to 'quiz' chat");
const messagePayload = builder.buildPayload(['apns2', 'fcm']);
// add required fields to the payload
try {
  const response = await pubnub.publish({
    message: messagePayload,
    channel: 'chat-bot',
  });
  console.log('publish response:', response);
} catch (error) {
  console.error(
    `Error publishing message: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end
