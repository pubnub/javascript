import PubNub from '../lib/types';

// snippet.gettingStartedCompleteExample
// Save this file as index.js/.ts

// 1. Import pubnub
// import PubNub from 'pubnub';

// 2. Initialize PubNub with demo keys and a random user ID
const pubnub = new PubNub({
  publishKey: 'YOUR_PUBLISH_KEY',
  subscribeKey: 'YOUR_SUBSCRIBE_KEY',
  userId: 'YOUR_USER_ID',
});

// 3. Add listener to handle messages, presence events, and connection status
pubnub.addListener({
  // Handle incoming messages
  message: function (event) {
    // Handle message event
    console.log('New message:', event.message);
    // Format and display received message
    const displayText = (() => {
      if (typeof event.message === 'object' && event.message && 'text' in event.message) {
        const messageObj = event.message as { text?: string; sender?: string };
        return `${messageObj.sender || 'User'}: ${messageObj.text}`;
      } else {
        return `Message: ${JSON.stringify(event.message)}`;
      }
    })();
    console.log(displayText);
  },

  // Handle presence events (join, leave, timeout)
  presence: function (event) {
    // Handle presence event
    console.log('Presence event:', event);
    console.log('Action:', event.action); // join, leave, timeout
    console.log('Channel:', event.channel);
  },

  // Handle connection status events
  status: function (event) {
    // Handle status event
    if (event.category === 'PNConnectedCategory') {
      console.log('Connected to PubNub chat!');
      console.log('Your user ID is:', pubnub.userId);
    } else if (event.category === 'PNNetworkIssuesCategory') {
      console.log('Connection lost. Attempting to reconnect...');
    }
  },
});

// 4. Create a channel entity and subscription with presence
const channel = pubnub.channel('hello_world');
const subscription = channel.subscription({
  receivePresenceEvents: true, // to receive presence events
});

// 5. Subscribe to the channel
subscription.subscribe();

// 6. Function to publish messages
async function publishMessage(text: string) {
  if (!text.trim()) return;

  try {
    // Create a message object with text, timestamp, and sender ID
    const message = {
      text: text,
      time: new Date().toISOString(),
      sender: pubnub.userId,
    };

    // Publish the message to the channel
    const response = await pubnub.publish({
      message: message,
      channel: 'hello_world',
      storeInHistory: true, // Save this message in history
    });

    // Success message (timetoken is the unique ID for this message)
    console.log(`\nMessage sent successfully!`);
  } catch (error) {
    // Handle publish errors
    console.error(`\n❌ Failed to send message: ${error}`);
  }
}

// 7. define the message and Publish that message.
const text_message = 'Hello, world!';
publishMessage(text_message);

// snippet.end
