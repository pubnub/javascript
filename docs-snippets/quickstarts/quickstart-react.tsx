/**
 * React quickstart examples. `Subscribe` and `Publish` only place the hook calls inside a component. They are not
 * rendered.
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
