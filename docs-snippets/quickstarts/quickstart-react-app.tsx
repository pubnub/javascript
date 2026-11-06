import { useEffect, useState } from 'react';
import PubNub from 'pubnub';

// Create the client once, outside the component, so re-renders reuse it
const pubnub = new PubNub({
  publishKey: 'YOUR_PUBLISH_KEY',
  subscribeKey: 'YOUR_SUBSCRIBE_KEY',
  userId: 'YOUR_USER_ID',
});

export default function App() {
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

  return (
    <div>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
      <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Type a message" />
      <button onClick={send}>Send</button>
    </div>
  );
}
