var PubNub = require("./lib/node.js/index.js");

/*
const pubnub = new PubNub({
  subscribeKey: 'sub-c-82ab2196-b64f-11e5-8622-0619f8945a4f',
  publishKey: 'pub-c-8beb3658-0dfd-4032-8f4b-9c6b9ca4d803',
  secretKey: 'sec-c-NDJkOWM2ZWItNzBhMS00YzllLWFlZjAtNGJlMjVkZjZlNzMy',
  sendByPost: true
});
*/

const pubnub = new PubNub({
  subscribeKey: 'demo',
  publishKey: 'demo',
  sendByPost: true,
  presenceTimeout: 10
});

pubnub.addListener({
  presence: (presence) => {
    // console.log("\n\n\n");
    // console.log('incoming presence', presence);
    // console.log("\n\n\n");
  },
  status: (status) => {
    console.log("\n\n\n");
    console.log('incoming status', status);
    console.log("\n\n\n");
  },
  message: (message) => {
    console.log("\n\n\n");
    console.log('on listener, got message', message);
    console.log("\n\n\n");
  }
});

ploadz = {
  message: { such: 'object' },
  channel: 'max-max-max',
  sendByPost: true
}


//pubnub.presence.hereNow({ channels: ['Shield_Proxy_Get_Analytics1', 'Shield_Proxy_Check_Online2'] }, (status, payload) => {
//  console.log(status, payload);
//})

pubnub.subscribe({ channels: ['max-ch1', 'max-ch2'], channelGroups: [],  withPresence: true });

//pubnub.accessManager.audit({ authKeys: ['a'], channel: 'max-ch1' }, (status, response) => {
//  console.log(status, response);
//})

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
