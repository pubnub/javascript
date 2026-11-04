/**
 * Snippet source of the React quickstart (docs/sdks/javascript/quickstart-react.md), the step-by-step blocks.
 *
 * The page embeds the snippets below one by one. `quickstart-react-app.tsx` is the complete `src/App.tsx` of the "Run"
 * section. A separate test project with React renders that file and checks that every snippet body below is a part of the
 * complete component. This repository keeps both files for the docs URLs and does not compile them, because the SDK has no
 * React dependencies.
 *
 * Not run by Mocha (no `page()` module, no phase). `Subscribe` and `Publish` exist only so the hook calls of the snippets sit inside
 * a component for the compiler, they are not rendered. `quickstart-react-app.tsx` has no comments of its own, its text is the docs text.
 */

// snippet.quickstartReactImports
import { useEffect, useState } from 'react';
import PubNub from 'pubnub';

// snippet.end

// snippet.quickstartReactInit
// Create the client once, outside the component, so re-renders reuse it
const pubnub = new PubNub({
  publishKey: 'YOUR_PUBLISH_KEY',
  subscribeKey: 'YOUR_SUBSCRIBE_KEY',
  userId: 'YOUR_USER_ID',
});
// snippet.end

export function Subscribe() {
  // snippet.quickstartReactSubscribe
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const subscription = pubnub.channel('hello_world').subscription();

    subscription.onMessage = (event) => {
      setMessages((previous) => [...previous, `${event.publisher}: ${event.message}`]);
    };
    subscription.subscribe();

    // Runs on unmount, and before React re-runs the effect in development (StrictMode)
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  // snippet.end

  return <ul>{messages.map((message, index) => <li key={index}>{message}</li>)}</ul>;
}

export function Publish() {
  // snippet.quickstartReactPublish
  const [text, setText] = useState('');

  const send = async () => {
    if (!text.trim()) return;

    try {
      await pubnub.publish({ channel: 'hello_world', message: text });
      setText('');
    } catch (error) {
      console.error(`Publish failed: ${error}`);
    }
  };
  // snippet.end

  return (
    <>
      <input value={text} onChange={(event) => setText(event.target.value)} />
      <button onClick={send}>Send</button>
    </>
  );
}
