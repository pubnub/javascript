import PubNub from '../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'userId',
});

// snippet.hereNowWithState
try {
  const response = await pubnub.hereNow({
    channels: ['my_channel'],
    includeState: true,
  });
  console.log('hereNow response:', response);
} catch (error) {
  console.error(`hereNow failed with error: ${error}`);
}
// snippet.end

// snippet.hereNowFetchOccupancyOnly
try {
  const response = await pubnub.hereNow({
    channels: ['my_channel'],
    includeUUIDs: false,
  });
  console.log('hereNow response:', response);
} catch (error) {
  console.error(`hereNow failed with error: ${error}`);
}
// snippet.end

// snippet.hereNowChannelGroup
try {
  const response = await pubnub.hereNow({
    channelGroups: ['my_channel_group'],
  });
  console.log('hereNow response:', response);
} catch (error) {
  console.error(`hereNow failed with error: ${error}`);
}
// snippet.end
