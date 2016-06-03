var PubNub = require("./lib/node.js/index.js");

const pubnub = new PubNub({ subscribeKey: 'demo-36', publishKey: 'demo-36', sendByPost: true });

ploadz = {
  message: { such: 'object' },
  channel: 'max-max-max',
  sendByPost: true
}

pubnub.publish(ploadz, (status, response) => {
  console.log(status, response);
});

pubnub.history({ channel: 'max-max-max', includeTimetoken: false}, (status, response) => {
  console.log(status, JSON.stringify(response));
})
