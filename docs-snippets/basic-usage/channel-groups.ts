import PubNub, { PubNubError } from '../../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'myUniqueUserId',
});

// snippet.addChannelsToGroupBasicUsage
try {
  const response = await pubnub.channelGroups.addChannels({
    channels: ['ch1', 'ch2'],
    channelGroup: 'myChannelGroup',
  });
  console.log('addChannels to Group response:', response);
} catch (error) {
  console.error(
    `Add channels to group error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.listChannelsInGroupBasicUsage
// assuming an intialized PubNub instance already exists
// to get some data in response, first add some channels to the group using addChannels() method.
try {
  const response = await pubnub.channelGroups.listChannels({
    channelGroup: 'myChannelGroup',
  });
  console.log('Listing push channels for the device:', response);
  response.channels.forEach((channel: string) => {
    console.log(channel);
  });
} catch (error) {
  console.error(
    `List channels of group error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.removeChannelsFromGroupBasicUsage
// assuming an initialized PubNub instance already exists
// and channel which is going to be removed from the group is aredaly added to the group to observe the removal
try {
  const response = await pubnub.channelGroups.removeChannels({
    channels: ['son'],
    channelGroup: 'family',
  });
  console.log('removeChannels from group response:', response);
} catch (error) {
  console.error(
    `Remove channels from group error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.deleteChannelGroupBasicUsage
// assuming an initialized PubNub instance already exists
// and channel group which is getting deleted already exist to see the deletion effect.
try {
  const response = await pubnub.channelGroups.deleteGroup({
    channelGroup: 'family',
  });
  console.log('deleteChannelGroup response:', response);
} catch (error) {
  console.error(
    `Delete channel group error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end
