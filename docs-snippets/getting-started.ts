import PubNub, { Subscription } from '../lib/types';

// snippet.gettingStartedInitPubnub
const pubnub = new PubNub({
    publishKey: 'YOUR_PUBLISH_KEY',
    subscribeKey: 'YOUR_SUBSCRIBE_KEY',
    userId: 'YOUR_USER_ID'
});
// snippet.end

// snippet.gettingStartedEventListeners
// Add listener to handle messages, presence events, and connection status
pubnub.addListener({
    message: function(event: Subscription.Message) {
        // Handle message event
        console.log("New message:", event.message);
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
    presence: function(event: Subscription.Presence) {
        // Handle presence event
        console.log("Presence event:", event);
        console.log("Action:", event.action); // join, leave, timeout
        console.log("Channel:", event.channel);
    },
    status: function(event) {
        // Handle status event
        if (event.category === "PNConnectedCategory") {
            console.log("Connected to PubNub chat!");
        } else if (event.category === "PNNetworkIssuesCategory") {
            console.log("Connection lost. Attempting to reconnect...");
        }
    }
});
// snippet.end

// snippet.gettingStartedCreateSubscription
// Create a channel entity
const channel = pubnub.channel('hello_world');

// Create a subscription
const subscription = channel.subscription({
    receivePresenceEvents: true // to receive presence events
});

// Subscribe
subscription.subscribe();
// snippet.end

// snippet.gettingStartedPublishMessages
// Function to publish a message
async function publishMessage(text: string) {
    if (!text.trim()) return;
    
    try {
        const result = await pubnub.publish({
            message: {
                text: text,
                sender: pubnub.userId,
                time: new Date().toISOString()
            },
            channel: 'hello_world'
        });
        console.log(`Message published with timetoken: ${result.timetoken}`);
        console.log(`You: ${text}`);
    } catch (error) {
        console.error(`Publish failed: ${error}`);
    }
}

// Example: publish a message
const text_message = "Hello, world!";
publishMessage(text_message);

// snippet.end
