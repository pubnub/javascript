import PubNub from 'pubnub';

/**
 * Web quickstart examples. The page loads the SDK from the CDN, which exposes the `PubNub` global. The import below
 * only lets the compiler check the examples.
 */

// snippet.quickstartWebInit
const pubnub = new PubNub({
  publishKey: 'YOUR_PUBLISH_KEY',
  subscribeKey: 'YOUR_SUBSCRIBE_KEY',
  userId: 'YOUR_USER_ID',
});
// snippet.end

// snippet.quickstartWebListeners
pubnub.addListener({
  message: (event) => {
    // Add every incoming message to the list on the page
    const item = document.createElement('li');
    item.textContent = `${event.publisher}: ${event.message}`;
    document.querySelector('ul')?.append(item);
  },
  status: (event) => {
    if (event.category === 'PNConnectedCategory') {
      console.log('Connected to PubNub');
    }
  },
});
// snippet.end

// snippet.quickstartWebSubscribe
const subscription = pubnub.channel('hello_world').subscription();
subscription.subscribe();
// snippet.end

// snippet.quickstartWebPublish
document.querySelector('button')?.addEventListener('click', async () => {
  const input = document.querySelector('input');
  if (!input || !input.value.trim()) return;

  try {
    const result = await pubnub.publish({
      channel: 'hello_world',
      message: input.value,
    });
    console.log(`Published, timetoken: ${result.timetoken}`);
    input.value = '';
  } catch (error) {
    console.error(`Publish failed: ${error}`);
  }
});
// snippet.end
