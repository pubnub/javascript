// snippet.importPubNub
import PubNub from 'pubnub';
// snippet.end

// snippet.importFS
import fs from 'fs';
// snippet.end

// snippet.PubNubinitBasicUsage
// Initialize PubNub with your keys
const pubnub = new PubNub({
  publishKey: 'YOUR_PUBLISH_KEY',
  subscribeKey: 'YOUR_SUBSCRIBE_KEY',
  userId: 'YOUR_USER_ID',
});
// snippet.end
