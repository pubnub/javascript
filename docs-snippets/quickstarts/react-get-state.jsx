// React example. The component export at the end of the file is not part of the example.
// snippet.reactGetState
import React, { useState, useEffect } from 'react';
import PubNub from 'pubnub';

const pubnub = new PubNub({
  publishKey: 'YOUR_PUBLISH_KEY',
  subscribeKey: 'YOUR_SUBSCRIBE_KEY',
  userId: 'YOUR_USER_ID',
});

function UserState() {
  const [presenceState, setPresenceState] = useState(null);

  useEffect(() => {
    async function fetchState() {
      try {
        const result = await pubnub.getState({
          uuid: pubnub.userId,
          channels: ['my_channel'],
        });
        setPresenceState(result.channels);
      } catch (error) {
        console.error('getState failed:', error);
      }
    }
    fetchState();
  }, []);

  return <pre>{JSON.stringify(presenceState, null, 2)}</pre>;
}
// snippet.end

export default UserState;
