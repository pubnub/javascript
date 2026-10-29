import PubNub from 'pubnub';

const pubnub = new PubNub({
  publishKey: 'YOUR_PUBLISH_KEY',
  subscribeKey: 'YOUR_SUBSCRIBE_KEY',
  userId: 'YOUR_USER_ID',
});

pubnub.addListener({
  message: (event) => {
    console.log(`Received on ${event.channel}: ${event.message}`);
  },
  status: (event) => {
    if (event.category === 'PNConnectedCategory') {
      console.log('Connected to PubNub');
    }
  },
});

// Create a channel entity
const channel = pubnub.channel('hello_world');

// Create a subscription
const subscription = channel.subscription({
  receivePresenceEvents: true, // to receive presence events
});

// Subscribe
subscription.subscribe();

try {
  const result = await pubnub.publish({
    channel: 'hello_world',
    message: 'Hello, world!',
  });
  console.log(`Published, timetoken: ${result.timetoken}`);
} catch (error) {
  console.error(`Publish failed: ${error}`);
}
