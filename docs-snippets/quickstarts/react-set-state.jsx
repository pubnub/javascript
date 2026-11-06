// docs/sdks/javascript/api-reference/presence.md, React tab. Between the markers: the exact text of the page. The export at the end of
// the file is not on the page (the page does not export the component), a separate React test project imports it.
// snippet.reactSetState
import React, { useEffect, useState } from 'react';
import PubNub from 'pubnub';

const pubnub = new PubNub({
  publishKey: 'YOUR_PUBLISH_KEY',
  subscribeKey: 'YOUR_SUBSCRIBE_KEY',
  userId: 'YOUR_USER_ID',
});

function UserWithPresenceState() {
  const [isStateSet, setIsStateSet] = useState(false);

  useEffect(() => {
    async function setPresenceState() {
      try {
        const response = await pubnub.setState({
          state: { status: 'online' },
          channels: ['my_channel'],
        });
        console.log('State set successfully:', response);
        setIsStateSet(true);
      } catch (error) {
        console.error('setState failed:', error);
      }
    }
    setPresenceState();
  }, []);

  return <div>{isStateSet ? 'User with presence state' : 'Setting state...'}</div>;
}
// snippet.end

export default UserWithPresenceState;
