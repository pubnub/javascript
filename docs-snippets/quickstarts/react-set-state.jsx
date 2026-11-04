// docs/sdks/javascript/api-reference/presence.md, React tab. Between the markers: the exact text of the page. The export at the end of
// the file is not on the page (the page does not export the component), a separate React test project imports it.
// snippet.reactSetState
import React, { useEffect } from 'react';
import PubNub from 'pubnub';

const pubnub = new PubNub({
  publishKey: 'YOUR_PUBLISH_KEY',
  subscribeKey: 'YOUR_SUBSCRIBE_KEY',
  userId: 'YOUR_USER_ID',
});

function UserWithPresenceState() {
  useEffect(() => {
    async function setPresenceState() {
      try {
        const response = await pubnub.setState({
          state: { status: 'online' },
          channels: ['my_channel'],
        });
        console.log('State set successfully:', response);
      } catch (error) {
        console.error('setState failed:', error);
      }
    }
    setPresenceState();
  }, []);

  return <div>User with presence state</div>;
}
// snippet.end

export default UserWithPresenceState;
