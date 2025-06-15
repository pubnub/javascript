import PubNub from '../../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'myUniqueUserId'
});

// snippet.addChannelsToGroupBasicUsage
// Function to add channels to a channel group
async function addChannelsToGroup() {
  try {
    const response = await pubnub.channelGroups.addChannels({
      channels: ["ch1", "ch2"],
      channelGroup: "myChannelGroup"
    });
    console.log(`addChannels to Group response: ${response}`);
  } catch (status) {
    console.log(`addChannels to group failed with error: ${status}`);
  }
}

// Execute the function to add channels
addChannelsToGroup();
// snippet.end

// snippet.listChannelsInGroupBasicUsage
// assuming an intialized PubNub instance already exists
// to get some data in response, first add some channels to the group using addChannels() method.
try {
    const response = await pubnub.channelGroups.listChannels({
        channelGroup: "myChannelGroup",
    });
    console.log(`Listing push channels for the device: ${response}`);
    response.channels.forEach((channel: string) => {
        console.log(channel);
    });
} catch (status) {
    console.log(`listChannels of group failed with error: ${status}`);
}
// snippet.end

// snippet.removeChannelsFromGroupBasicUsage
// assuming an initialized PubNub instance already exists
// and channel which is going to be removed from the group is aredaly added to the group to observe the removal
try {
    const response = await pubnub.channelGroups.removeChannels({
        channels: ["son"],
        channelGroup: "family",
    });
    console.log(`removeChannels from group response: ${response}`);
} catch (status) {
    console.log(`removeChannels from group failed with error: ${status}`);
}
// snippet.end

// snippet.deleteChannelGroupBasicUsage
// assuming an initialized PubNub instance already exists
// and channel group which is getting deleted already exist to see the deletion effect.
try {
    const response = await pubnub.channelGroups.deleteGroup({
        channelGroup: "family",
    });
    console.log(`deleteChannelGroup response: ${response}`);
} catch (status) {
    console.log(`deleteChannelGroup failed with error: ${status}`);
}
// snippet.end