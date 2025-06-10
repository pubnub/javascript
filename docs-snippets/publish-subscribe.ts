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