// docs/sdks/javascript/api-reference/presence.md, React tab. Between the markers: the exact text of the page. The export at the end of
// the file is not on the page (the page does not export the component), a separate React test project imports it.
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
