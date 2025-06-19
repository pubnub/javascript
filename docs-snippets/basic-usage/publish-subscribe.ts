import PubNub from '../../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'myUniqueUserId',
});

// snippet.publishBasicUsage
// Function to publish a message
async function publishMessage() {
  try {
    const response = await pubnub.publish({
      message: { text: 'Hello World' },
      channel: 'my_channel',
      sendByPost: false,
      storeInHistory: true,
      meta: { sender: 'user123' },
      customMessageType: 'text-message',
    });
    console.log('Publish Success:', response);
  } catch (error) {
    console.log('Publish Failed:', error);
  }
}

// Execute the function to publish the message
publishMessage();
// snippet.end

// snippet.signalBasicUsage
try {
  const response = await pubnub.signal({
    message: 'hello',
    channel: 'foo',
    customMessageType: 'text-message',
  });
  console.log(`signal response: ${response}`);
} catch (status) {
  // handle error
  console.log(`signal failed with error: ${status}`);
}
// snippet.end

// snippet.fireBasicUsage
// Initialize PubNub with your keys
try {
  const response = await pubnub.fire({
    message: {
      such: 'object',
    },
    channel: 'my_channel',
    sendByPost: false, // true to send via post
    meta: {
      cool: 'meta',
    }, // fire extra meta with the request
  });

  console.log(`message published with timetoken: ${response.timetoken}`);
} catch (status) {
  // handle error
  console.log(`fire failed with error: ${status}`);
}
// snippet.end

// snippet.createChannelBasicUsage
const channel = pubnub.channel('my_channel');
// snippet.end

// snippet.createChannelGroupBasicUsage
// Initialize PubNub with demo keys
const channelGroup = pubnub.channelGroup('channelGroup_1');
// snippet.end

// snippet.createChannelMetadataBasicUsage
// Initialize PubNub with demo keys

const channelMetadata = pubnub.channelMetadata('channel_1');
// snippet.end

// snippet.createUserMetadataBasicUsage
// Initialize PubNub with demo keys

const userMetadata = pubnub.userMetadata('user_meta1');
// snippet.end

// snippet.unsubscribeBasicUsage
// create a subscription from a channel entity
const channel1 = pubnub.channel('channel_1');
const subscription1 = channel1.subscription({ receivePresenceEvents: true });

// create a subscription set with multiple channels
const subscriptionSet1 = pubnub.subscriptionSet({ channels: ['ch1', 'ch2'] });

subscription1.subscribe();
subscriptionSet1.subscribe();

subscription1.unsubscribe();
subscriptionSet1.unsubscribe();
// snippet.end

// snippet.subscriptionSetSubscribeBasicUsage
const channelsSubscriptionSet = pubnub.subscriptionSet({ channels: ['ch1', 'ch2'] });
channelsSubscriptionSet.subscribe();
// snippet.end

// snippet.unsubscribeAllBasicUsage
// create a subscription set with multiple channels
const subscriptionSet = pubnub.subscriptionSet({ channels: ['ch1', 'ch2'] });
subscriptionSet.subscribe();

// create a subscription from a channel entity
const channelGroup1 = pubnub.channelGroup('channelGroup_1');
const groupSubscription1 = channelGroup1.subscription({ receivePresenceEvents: true });
groupSubscription1.subscribe();

// unsubscribe all active subscriptions
pubnub.unsubscribeAll();
// snippet.end


// ***********  OLD SYNTAX ***********
// snippet.OLDsubscribeBasicUsage
pubnub.subscribe({
  channels: ["my_channel"],
});
// snippet.end

// snippet.OLDUnsubscribeBasicUsage
pubnub.unsubscribe({
  channels: ["my_channel"],
});
// snippet.end

// snippet.OLDUnsubscribeAllBasicUsage
pubnub.unsubscribeAll();
// snippet.end  