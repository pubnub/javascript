// React example. The component export at the end of the file is not part of the example.
// snippet.reactConfigurationLifecycle
import React, { useRef, useEffect } from 'react';
import PubNub from 'pubnub';

function App() {
  const pubnubRef = useRef(null);

  useEffect(() => {
    pubnubRef.current = new PubNub({
      publishKey: 'YOUR_PUBLISH_KEY',
      subscribeKey: 'YOUR_SUBSCRIBE_KEY',
      userId: 'YOUR_USER_ID',
    });

    return () => {
      if (pubnubRef.current) {
        pubnubRef.current.removeAllListeners();
        pubnubRef.current.destroy();
      }
    };
  }, []);

  return <div>Your app content</div>;
}
// snippet.end

export default App;
