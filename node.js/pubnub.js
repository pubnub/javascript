/* ---------------------------------------------------------------------------
 WAIT! - This file depends on instructions from the PUBNUB Cloud.
 http://www.pubnub.com/account
 --------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------
 PubNub Real-time Cloud-Hosted Push API and Push Notification Client Frameworks
 Copyright (c) 2016 PubNub Inc.
 http://www.pubnub.com/
 http://www.pubnub.com/terms
 --------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 --------------------------------------------------------------------------- */

var pubNubCore = require('../core/src/pubnub-common.js');
var XDR = require('./lib/xdr');
var packageJSON = require('../package.json');
var crypto = require('crypto');

/**
 * UTIL LOCALS
 */
var PNSDK = 'PubNub-JS-' + 'Nodejs' + '/' + packageJSON.version;

function getHMACSHA256(data, key) {
  return crypto.createHmac('sha256', new Buffer(key, 'utf8')).update(data).digest('base64');
}


/**
 * ERROR
 * ===
 * error('message');
 */
function error(message) {
  console.error(message); // eslint-disable-line no-console
}


/**
 * LOCAL STORAGE
 */
var db = (function () {
  var store = {};
  return {
    get: function (key) {
      return store[key];
    },
    set: function (key, value) {
      store[key] = value;
    }
  };
})();


var CREATE_PUBNUB = function (setup) {
  var xdrInstance = XDR.createInstance(PNSDK, setup.proxy, setup.keepAlive);

  setup.xdr = xdrInstance.request;
  setup.db = db;
  setup.error = setup.error || error;
  setup.hmac_SHA256 = getHMACSHA256;
  setup.crypto_obj = require('./lib/crypto-wrapper');
  setup.params = { pnsdk: PNSDK };
  setup.shutdown = function () {
    xdrInstance.destroy();
  };

  var SELF = function (setup) {
    return CREATE_PUBNUB(setup);
  };

  var PN = pubNubCore.PN_API(setup);

  for (var prop in PN) {
    if (PN.hasOwnProperty(prop)) {
      SELF[prop] = PN[prop];
    }
  }

  SELF.init = SELF;
  SELF.secure = SELF;
  SELF.crypto_obj = require('./lib/crypto-wrapper');

  // TODO: remove dependence
  SELF.__PN = PN;
  //

  SELF.ready();


  return SELF;
};

CREATE_PUBNUB.init = CREATE_PUBNUB;
CREATE_PUBNUB.unique = pubNubCore.unique;
CREATE_PUBNUB.secure = CREATE_PUBNUB;
CREATE_PUBNUB.crypto_obj = require('./lib/crypto-wrapper');

module.exports = CREATE_PUBNUB;
module.exports.PNmessage = pubNubCore.PNmessage;
