// React example. The component export at the end of the file is not part of the example.
// snippet.reactWhereNow
import React, { useState, useEffect } from 'react';
import PubNub from 'pubnub';

const pubnub = new PubNub({
  publishKey: 'YOUR_PUBLISH_KEY',
  subscribeKey: 'YOUR_SUBSCRIBE_KEY',
  userId: 'YOUR_USER_ID',
});

function UserChannels() {
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    async function fetchChannels() {
      try {
        const result = await pubnub.whereNow({ uuid: pubnub.userId });
        setChannels(result.channels);
      } catch (error) {
        console.error('whereNow failed:', error);
      }
    }
    fetchChannels();
  }, []);

  return (
    <div>
      <p>Subscribed channels:</p>
      <ul>
        {channels.map((ch) => (
          <li key={ch}>{ch}</li>
        ))}
      </ul>
    </div>
  );
}
// snippet.end

export default UserChannels;
