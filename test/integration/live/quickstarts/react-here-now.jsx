// React example. The component export at the end of the file is not part of the example.
// snippet.reactHereNow
import React, { useState, useEffect } from 'react';
import PubNub from 'pubnub';

const pubnub = new PubNub({
  publishKey: 'YOUR_PUBLISH_KEY',
  subscribeKey: 'YOUR_SUBSCRIBE_KEY',
  userId: 'YOUR_USER_ID',
});

function ChannelOccupancy() {
  const [occupancy, setOccupancy] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    async function fetchPresence() {
      try {
        const result = await pubnub.hereNow({
          channels: ['my_channel'],
          includeUUIDs: true,
          includeState: true,
        });
        const channel = result.channels['my_channel'];
        setOccupancy(channel.occupancy);
        setOnlineUsers(channel.occupants.map((o) => o.uuid));
      } catch (error) {
        console.error('hereNow failed:', error);
      }
    }
    fetchPresence();
  }, []);

  return (
    <div>
      <p>Users online: {occupancy ?? '...'}</p>
      <ul>
        {onlineUsers.map((uuid) => (
          <li key={uuid}>{uuid}</li>
        ))}
      </ul>
    </div>
  );
}
// snippet.end

export default ChannelOccupancy;
