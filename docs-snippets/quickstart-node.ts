import PubNub from '../lib/types';

// The Node.js quickstart runs as an ES module (index.mjs), so the import line comes from
// docs-snippets/import-pubnub.ts (importPubNub) and the initialization comes from
// docs-snippets/getting-started.ts (gettingStartedInitPubnub and gettingStartedCreateSubscription).
// The import above only lets the compiler check the snippets below.
// The runnable file that combines them all is docs-snippets/quickstart-node.mjs.

const pubnub = new PubNub({
  publishKey: 'YOUR_PUBLISH_KEY',
  subscribeKey: 'YOUR_SUBSCRIBE_KEY',
  userId: 'YOUR_USER_ID',
});

// snippet.quickstartNodeListeners
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
// snippet.end

// snippet.quickstartNodePublish
try {
  const result = await pubnub.publish({
    channel: 'hello_world',
    message: 'Hello, world!',
  });
  console.log(`Published, timetoken: ${result.timetoken}`);
} catch (error) {
  console.error(`Publish failed: ${error}`);
}
// snippet.end
