// React example. The component export at the end of the file is not part of the example.
// snippet.reactSubscribe
import React, { useEffect, useState } from 'react';
import PubNub from 'pubnub';

const pubnub = new PubNub({
  publishKey: 'YOUR_PUBLISH_KEY',
  subscribeKey: 'YOUR_SUBSCRIBE_KEY',
  userId: 'YOUR_USER_ID',
});

function SubscribedComponent() {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const listener = {
      status: (statusEvent) => {
        if (
          statusEvent.category === 'PNConnectedCategory' ||
          statusEvent.category === 'PNSubscriptionChangedCategory'
        ) {
          setIsSubscribed(true);
        }
      },
    };
    pubnub.addListener(listener);

    const channel = pubnub.channel('my_channel');
    const subscription = channel.subscription({
      receivePresenceEvents: true,
    });
    subscription.subscribe();

    return () => {
      subscription.unsubscribe();
      pubnub.removeListener(listener);
    };
  }, []);

  return <div>{isSubscribed ? 'Subscribed to my_channel' : 'Connecting to channel...'}</div>;
}
// snippet.end

export default SubscribedComponent;
