// React example. The component export at the end of the file is not part of the example.
// snippet.reactListeners
import React, { useState, useEffect } from 'react';
import PubNub from 'pubnub';

const pubnub = new PubNub({
  publishKey: 'YOUR_PUBLISH_KEY',
  subscribeKey: 'YOUR_SUBSCRIBE_KEY',
  userId: 'YOUR_USER_ID',
});

function Chat() {
  const [messages, setMessages] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    pubnub.addListener({
      message: (event) => {
        setMessages((prev) => [...prev, event.message]);
      },
      presence: (event) => {
        // event.action: 'join' | 'leave' | 'timeout' | 'interval' | 'state-change'
        // occupancy is present on join/leave/timeout/interval but not on state-change
        if (event.action !== 'state-change') setOnlineCount(event.occupancy);
      },
      status: (event) => {
        setIsConnected(event.category === 'PNConnectedCategory');
      },
    });

    const channel = pubnub.channel('my_channel');
    const subscription = channel.subscription({ receivePresenceEvents: true });
    subscription.subscribe();

    return () => {
      subscription.unsubscribe();
      pubnub.removeAllListeners();
    };
  }, []);

  return (
    <div>
      <p>{isConnected ? `Connected — ${onlineCount} online` : 'Connecting...'}</p>
      <ul>
        {messages.map((msg, i) => (
          <li key={i}>{typeof msg === 'object' ? JSON.stringify(msg) : msg}</li>
        ))}
      </ul>
    </div>
  );
}
// snippet.end

export default Chat;
