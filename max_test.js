var PubNub = require("./lib/node.js/index.js");

const pubnub = new PubNub({
  subscribeKey: 'sub-c-82ab2196-b64f-11e5-8622-0619f8945a4f',
  publishKey: 'pub-c-8beb3658-0dfd-4032-8f4b-9c6b9ca4d803',
  secretKey: 'sec-c-NDJkOWM2ZWItNzBhMS00YzllLWFlZjAtNGJlMjVkZjZlNzMy',
  sendByPost: true
});

ploadz = {
  message: { such: 'object' },
  channel: 'max-max-max',
  sendByPost: true
}

pubnub.accessManager.audit({ authKeys: ['a'], channel: 'max-ch1' }, (status, response) => {
  console.log(status, response);
})

//pubnub.accessManager.grant({ ttl: 0, read: true, authKeys: ['a'], channelGroups: ['max-ch1', 'max-ch2'] }, (status, response) => {
//  console.log("hello!", status, JSON.stringify(response));
//})

/*
pubnub.publish(ploadz, (status, response) => {
  console.log(status, response);
});

pubnub.history({ channel: 'max-max-max', includeTimetoken: false}, (status, response) => {
  console.log(status, JSON.stringify(response));
})
*/
