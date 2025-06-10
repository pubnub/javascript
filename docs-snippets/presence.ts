import PubNub from '../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'userId',
});

// snippet.hereNowWithState
try {
    const response = await pubnub.hereNow({
        channels: ["my_channel"],
        includeState: true,
    });
} catch (status) {
    console.log(status);
}
// snippet.end

// snippet.hereNowFetchOccupancyOnly
try {
    const response = await pubnub.hereNow({
        channels: ["my_channel"],
        includeUUIDs: false,
    });
} catch (status) {
    console.log(status);
}
// snippet.end


// snippet.hereNowChannelGroup
try {
    const response = await pubnub.hereNow({
        channelGroups: ["my_channel_group"] 
    });
} catch (status) {
    console.log(status);
}
// snippet.end