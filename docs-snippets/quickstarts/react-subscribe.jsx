// docs/sdks/javascript/api-reference/subscribe.md, React tab. Between the markers: the exact text of the page. The export at the end of
// the file is not on the page (the page does not export the component), a separate React test project imports it.
// snippet.reactSubscribe
import React, { useEffect } from 'react';
import PubNub from 'pubnub';

const pubnub = new PubNub({
  publishKey: 'YOUR_PUBLISH_KEY',
  subscribeKey: 'YOUR_SUBSCRIBE_KEY',
  userId: 'YOUR_USER_ID',
});

function SubscribedComponent() {
  useEffect(() => {
    const channel = pubnub.channel('my_channel');
    const subscription = channel.subscription({
      receivePresenceEvents: true,
    });
    subscription.subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <div>Subscribed to my_channel</div>;
}
// snippet.end

export default SubscribedComponent;
