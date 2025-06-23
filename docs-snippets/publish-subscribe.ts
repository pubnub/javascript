import PubNub from '../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'userId',
});

// snippet.publishJsonSerialisedMessage
const newMessage = {
    text: 'Hi There!',
  };
  
  try {
    const response = await pubnub.publish({
      message: newMessage,
      channel: 'my_channel',
      customMessageType: 'text-message',
    });
  
    console.log(`message published with server response: ${response}`);
  } catch (status) {
    console.log(`publishing failed with status: ${status}`);
  }
  // snippet.end
  
  // snippet.publishStoreThePublishedMessagefor10Hours
  try {
    const response = await pubnub.publish({
      message: 'hello!',
      channel: 'my_channel',
      storeInHistory: true,
      ttl: 10,
      customMessageType: 'text-message',
    });
  
    console.log(`message published with server response: ${response}`);
  } catch (status) {
    console.log(`publishing failed with status: ${status}`);
  }
  // snippet.end
  
  // snippet.publishSuccessfull
  const response = await pubnub.publish({
    message: "hello world!",
    channel: "ch1",
  });
  
  console.log(response); // {timetoken: "14920301569575101"}
  // end.snippet
  
  // snippet.publishUnsuccessfulByNetworkDown
  try {
    const response = await pubnub.publish({
        message: "hello world!",
        channel: "ch1",
    });
  } catch (status) {
    console.log(status); // {error: true, operation: "PNPublishOperation", errorData: Error, category: "PNNetworkIssuesCategory"}
  }
  // snippet.end
  
  // snippet.publishUnsuccessfulWithoutPublishKey
  try {
    const result = await pubnub.publish({
        message: "hello world!",
        channel: "ch1",
    });
  } catch (status) {
    console.log(status); // {error: true, operation: "PNPublishOperation", statusCode: 400, errorData: Error, category: "PNBadRequestCategory"}
  }
  // snippet.end
  // *********** Compilation Error due to wrong code *****************
  // // snippet.publishUnsuccessfulMissingChannel
  // try {
  //   const result = await pubnub.publish({
  //       message: "hello world!",
  //   });
  // } catch (status) {
  //   console.log(status); // {message: "Missing Channel", type: "validationError", error: true}
  // }
  // // snippet.end
  
  // // snippet.publishUnsuccessfulMissingMessage
  // try {
  //   const result = await pubnub.publish({
  //       channel: "ch1",
  //   });
  // } catch (status) {
  //   console.log(status); // {message: "Missing Message", type: "validationError", error: true}
  // }
  // // snippet.end  

// snippet.createSubscription
const channel = pubnub.channel('my_channel');

const subscriptionOptions = { receivePresenceEvents: true };
channel.subscription(subscriptionOptions);
// snippet.end

const subscription = pubnub.channel('channel_1').subscription();
const subscriptionSet = pubnub.subscriptionSet({ channels: ['ch1', 'ch2'] })
// snippet.ubsubscribe
// `subscription` is an active subscription object
subscription.unsubscribe()

// `subscriptionSet` is an active subscription set object
subscriptionSet.unsubscribe()
// snippet.end


// snippet.ubsubscribeAll
pubnub.unsubscribeAll()
// snippet.end

// *************** OLD SUBSCRIBE SYNTAX ***************
// snippet.OLDsubscribeMultipleChannels
pubnub.subscribe({
  channels: ['my_channel_1', 'my_channel_2', 'my_channel_3']
});
// snippet.end

// snippet.OLDsubscribeWithPresence
pubnub.subscribe({
  channels: ["my_channel"],
  withPresence: true,
});
// snippet.end

// snippet.OLDsubscribeWithWildCardChannels
pubnub.subscribe({
  channels: ["ab.*"],
});
// snippet.end

// snippet.OLDsubscribeWithState
pubnub.addListener({
  status: async (statusEvent) => {
      if (statusEvent.category === "PNConnectedCategory") {
          try {
              await pubnub.setState({
                  state: {
                      some: "state",
                  },
              });
          } catch (status) {
              // handle setState error
          }
      }
  },
  message: (messageEvent) => {
      // handle message
  },
  presence: (presenceEvent) => {
      // handle presence
  },
});

pubnub.subscribe({
  channels: ["ch1", "ch2", "ch3"],
});
// snippet.end

// snippet.OLDsubscribeChannelGroup
pubnub.subscribe({
  channelGroups: ["my_channelGroup"],
});
// snippet.end

// snippet.OLDsubscribeChannelGroupWithPresence
pubnub.subscribe({
  channelGroups: ["family"],
  withPresence: true,
});
// snippet.end

// snippet.OLDsubscribeMultipleChannelGroup
pubnub.subscribe({
  channelGroups: ["my_channelGroup1", "my_channelGroup2", "my_channelGroup3"],
});
// snippet.end

// snippet.OLDsubscribeChannelGroupAndChannels
pubnub.subscribe({
  channels: ["my_channel"],
  channelGroups: ["my_channelGroup"],
});
// snippet.end

// snippet.OLDUnsubscribeMultipleChannels
pubnub.unsubscribe({
  channels: ["chan1", "chan2", "chan3"],
});
// snippet.end

// snippet.OLDUnsubscribeMultipleChannelGroup
pubnub.unsubscribe({
  channelGroups: ["demo_group1", "demo_group2"],
});
// snippet.end

{
  // snippet.subscriptionSetFrom2IndividualSubscriptions
  // create a subscription from a channel entity
  const channel = pubnub.channel('channel_1')
  const subscription1 = channel.subscription({ receivePresenceEvents: true });
  
  // create a subscription from a channel group entity
  const channelGroup = pubnub.channelGroup('channelGroup_1')
  const subscription2 = channelGroup.subscription();
  
  // add 2 subscriptions to create a subscription set
  const subscriptionSet = subscription1.addSubscription(subscription2);
  
  // add another subscription to the set
  const subscription3 = pubnub.channel('channel_3').subscription({ receivePresenceEvents: false });
  subscriptionSet.addSubscription(subscription3);
  
  // remove a subscription from a subscription set
  subscriptionSet.removeSubscription(subscription3);
  
  subscriptionSet.subscribe();
  // snippet.end
}

{
// snippet.SubscriptionSetFrom2Sets
// create a subscription set with multiple channels
const subscriptionSet1 = pubnub.subscriptionSet({ channels: ['ch1', 'ch2'] });

// create a subscription set with multiple channel groups and options
const subscriptionSet2 = pubnub.subscriptionSet({ 
  channels: ['ch1', 'ch2'], 
  subscriptionOptions: { receivePresenceEvents: true } 
});

// add a subscription set to another subscription set
subscriptionSet1.addSubscriptionSet(subscriptionSet2);

// remove a subscription set from another subscription set
subscriptionSet1.removeSubscriptionSet(subscriptionSet2);
// snippet.end
}