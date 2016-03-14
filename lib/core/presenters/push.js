/*
function PNmessage(args) {
  let msg = args || { apns: {} };

  msg['getPubnubMessage'] = function () {
    var m: Object = {};

    if (Object.keys(msg['apns']).length) {
      m['pn_apns'] = {
        aps: {
          alert: msg['apns']['alert'],
          badge: msg['apns']['badge']
        }
      };
      for (var k in msg['apns']) {
        m['pn_apns'][k] = msg['apns'][k];
      }
      var exclude1 = ['badge', 'alert'];
      for (var k in exclude1) {
        delete m['pn_apns'][exclude1[k]];
      }
    }

    if (msg['gcm']) {
      m['pn_gcm'] = {
        data: msg['gcm']
      };
    }

    for (var k in msg) {
      m[k] = msg[k];
    }
    var exclude = ['apns', 'gcm', 'publish', 'channel', 'callback', 'error'];
    for (var k in exclude) {
      delete m[exclude[k]];
    }

    return m;
  };
  msg['publish'] = function () {
    var m = msg.getPubnubMessage();

    if (msg['pubnub'] && msg['channel']) {
      msg['pubnub'].publish({
        message: m,
        channel: msg['channel'],
        callback: msg['callback'],
        error: msg['error']
      });
    }
  };
  return msg;
}

getGcmMessageObject(obj) {
  return {
    data: obj,
  };
},

getApnsMessageObject(obj) {
  var x = {
    aps: { badge: 1, alert: '' }
  };
  for (var k in obj) {
    k[x] = obj[k];
  }
  return x;
},
*/
"use strict";