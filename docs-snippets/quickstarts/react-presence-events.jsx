// docs/sdks/javascript/api-reference/presence.md, React tab. Between the markers: the exact text of the page. The export at the end of
// the file is not on the page (the page does not export the component), a separate React test project imports it.
// snippet.reactPresenceEvents
import React, { useState, useEffect } from 'react';
import PubNub from 'pubnub';

const pubnub = new PubNub({
  publishKey: 'YOUR_PUBLISH_KEY',
  subscribeKey: 'YOUR_SUBSCRIBE_KEY',
  userId: 'YOUR_USER_ID',
});

function PresenceTracker() {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [occupancy, setOccupancy] = useState(0);

  useEffect(() => {
    pubnub.addListener({
      presence: (event) => {
        // event.action: 'join' | 'leave' | 'timeout' | 'interval' | 'state-change'
        if (event.action === 'join') {
          setOnlineUsers((prev) => [...prev.filter((id) => id !== event.uuid), event.uuid]);
        } else if (event.action === 'leave' || event.action === 'timeout') {
          setOnlineUsers((prev) => prev.filter((id) => id !== event.uuid));
        }
        // occupancy is present on join/leave/timeout/interval but not on state-change
        if (event.action !== 'state-change') setOccupancy(event.occupancy);
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
      <p>Online users: {occupancy}</p>
      <ul>
        {onlineUsers.map((userId) => (
          <li key={userId}>{userId}</li>
        ))}
      </ul>
    </div>
  );
}
// snippet.end

export default PresenceTracker;
