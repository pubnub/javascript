// React example. The component export at the end of the file is not part of the example.
// snippet.reactFetchMessages
import React, { useState, useEffect } from 'react';
import PubNub from 'pubnub';

const pubnub = new PubNub({
  publishKey: 'YOUR_PUBLISH_KEY',
  subscribeKey: 'YOUR_SUBSCRIBE_KEY',
  userId: 'YOUR_USER_ID',
});

function MessageHistory() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const result = await pubnub.fetchMessages({
          channels: ['my_channel'],
          count: 25,
        });
        const channelMessages = result.channels['my_channel'] ?? [];
        setMessages(channelMessages.map((m) => m.message));
      } catch (error) {
        console.error('fetchMessages failed:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, []);

  if (isLoading) return <p>Loading history...</p>;

  return (
    <ul>
      {messages.map((msg, i) => (
        <li key={i}>{typeof msg === 'object' ? JSON.stringify(msg) : msg}</li>
      ))}
    </ul>
  );
}
// snippet.end

export default MessageHistory;
