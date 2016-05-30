var PubNub = require("./lib/node.js/index.js");

const pubnub = new PubNub({ subscribeKey: 'demo-36', publishKey: 'demo-36' });

pubnub.time((err, data) => {
  console.log(err, data);
});
