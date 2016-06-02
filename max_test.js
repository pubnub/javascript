var PubNub = require("./lib/node.js/index.js");

const pubnub = new PubNub({ subscribeKey: 'demo-36', publishKey: 'demo-36', cipherKey: "maSecretKey", sendByPost: true });

ploadz = {
  message: { such: 'object' },
  channel: 'ch1',
  sendByPost: true
}

//pubnub.publish(ploadz, (status, response) => {
//  console.log(status, response);
//});

pubnub.history({ channel: 'max-ch1'}, (status, response) => {
  console.log(status, response);
})
