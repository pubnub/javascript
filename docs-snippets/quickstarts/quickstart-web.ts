import PubNub from 'pubnub';

/**
 * Snippet source of the Web quickstart (docs/sdks/javascript/quickstart-web.md), the four step-by-step blocks.
 *
 * The page loads the SDK from the CDN, which exposes the `PubNub` global. The import above only lets the compiler check
 * the snippets (`npm run test:docs-snippets:types`, tsconfig.browser.json, with the DOM library). The snippet bodies are the
 * exact text the page shows. The page that combines them is `quickstart-web.html`. This repository cannot run either file,
 * because it has no browser.
 *
 * The publish snippet keeps its try and catch because the page teaches that error handling. Standalone quickstart files
 * are exempt from the "snippets let errors throw" rule of the Node snippets (see lint-markers.ts, STANDALONE_DIR).
 *
 * Not run by Mocha: there is no `page()` module and no phase. Companion files with no comments of their own, because their text is the docs text:
 * `quickstart-web.html`.
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
const channel = pubnub.channel('hello_world');
const subscription = channel.subscription();
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
