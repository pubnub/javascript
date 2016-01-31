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

var pubNubCore = require('../core/pubnub-common.js');
var packageJSON = require('../package.json');
var crypto = require('crypto');
var http = require('http');
var https = require('https');

/**
 * UTIL LOCALS
 */
var PNSDK = 'PubNub-JS-' + 'Nodejs' + '/' + packageJSON.version;
var proxy = null;
var keepAliveConfig = {
  keepAlive: true,
  keepAliveMsecs: 300000,
  maxSockets: 5
};
var keepAliveAgent;
var keepAliveAgentSSL;

function keepAliveIsEmbedded() {
  return 'EventEmitter' in http.Agent.super_;
}


if (keepAliveIsEmbedded()) {
  keepAliveAgent = new http.Agent(keepAliveConfig);
  keepAliveAgentSSL = new https.Agent(keepAliveConfig);
} else {
  (function () {
    var agent = require('agentkeepalive');
    var agentSSL = agent.HttpsAgent;

    keepAliveAgent = new agent(keepAliveConfig);
    keepAliveAgentSSL = new agentSSL(keepAliveConfig);
  })();
}

function getHMACSHA256(data, key) {
  return crypto.createHmac('sha256', new Buffer(key, 'utf8')).update(data).digest('base64');
}


/**
 * ERROR
 * ===
 * error('message');
 */
function error(message) {
  console.error(message);
}

/**
 * Request
 * =======
 *  xdr({
 *     url     : ['http://www.blah.com/url'],
 *     success : function(response) {},
 *     fail    : function() {}
 *  });
 */
function xdr(setup) {
  var request;
  var response;
  var debug = setup.debug;
  var success = setup.success || function () {};
  var fail = setup.fail || function () {};
  var ssl = setup.ssl;
  var complete = 0;
  var loaded = 0;
  var mode = setup.mode || 'GET';
  var data = setup.data || {};
  var xhrtme = setup.timeout || pubNubCore.DEF_TIMEOUT;
  var body = '';

  var timer;

  var finished = function () {
    if (loaded) return;
    loaded = 1;

    clearTimeout(timer);
    try {
      response = JSON.parse(body);
    } catch (r) {
      return done(1, { error: true, message: 'error in response parsing' });
    }
    success(response);
  };

  var done = function (failed, response) {
    if (complete) return;
    complete = 1;

    clearTimeout(timer);

    if (request) {
      request.on('error', function () {});
      request.on('data', function () {});
      request.on('end', function () {});

      if (request.abort) {
        request.abort();
      }

      request = null;
    }

    if (failed) {
      fail(response);
    }
  };

  timer = pubNubCore.timeout(function () {
    done(1, { error: true, message: 'timeout' });
  }, xhrtme);

  data.pnsdk = PNSDK;

  var options = {};
  var payload = '';

  if (mode === 'POST') {
    payload = decodeURIComponent(setup.url.pop());
  }

  var url = pubNubCore.build_url(setup.url, data);

  if (debug) {
    debug(url);
  }

  if (!ssl) ssl = (url.split('://')[0] === 'https');

  url = '/' + url.split('/').slice(3).join('/');

  var origin = setup.url[0].split('//')[1];

  options.hostname = proxy ? proxy.hostname : setup.url[0].split('//')[1];
  options.port = proxy ? proxy.port : ssl ? 443 : 80;
  options.path = proxy ? 'http://' + origin + url : url;
  options.headers = proxy ? { Host: origin } : null;
  options.method = mode;
  options.keepAlive = !!keepAliveAgent;
  options.body = payload;

  if (options.keepAlive && ssl) {
    options.agent = keepAliveAgentSSL;
  } else if (options.keepAlive) {
    options.agent = keepAliveAgent;
  }

  require('http').globalAgent.maxSockets = Infinity;

  try {
    request = (ssl ? https : http).request(options, function (response) {
      response.setEncoding('utf8');
      response.on('error', function () {
        done(1, body || { error: true, message: 'Network Connection Error' });
      });
      response.on('abort', function () {
        done(1, body || { error: true, message: 'Network Connection Error' });
      });
      response.on('data', function (chunk) {
        if (chunk) body += chunk;
      });
      response.on('end', function () {
        var statusCode = response.statusCode;

        switch (statusCode) {
          case 200:
            break;
          default:
            try {
              response = JSON.parse(body);
              done(1, response);
            } catch (r) {
              return done(1, { status: statusCode, payload: null, message: body });
            }
            return;
        }
        finished();
      });
    });
    request.timeout = xhrtme;
    request.on('error', function () {
      done(1, { error: true, message: 'Network Connection Error' });
    });

    if (mode === 'POST') request.write(payload);
    request.end();
  } catch (e) {
    done(0);
    return xdr(setup);
  }

  return done;
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
  proxy = setup.proxy;
  setup.xdr = xdr;
  setup.db = db;
  setup.error = setup.error || error;
  setup.hmac_SHA256 = getHMACSHA256;
  setup.crypto_obj = require('./lib/cryptoUtil');
  setup.params = { pnsdk: PNSDK };
  setup.shutdown = function () {
    if (keepAliveAgentSSL && keepAliveAgentSSL.destroy) {
      keepAliveAgentSSL.destroy();
    }
    if (keepAliveAgent && keepAliveAgent.destroy) {
      keepAliveAgent.destroy();
    }
  };

  if (setup.keepAlive === false) {
    keepAliveAgent = undefined;
  }

  var SELF = function (setup) {
    return CREATE_PUBNUB(setup);
  };

  var PN = pubNubCore.PN_API(setup);

  for (var prop in PN) {
    if (PN.hasOwnProperty(prop)) {
      SELF[prop] = PN[prop];
    }
  }

  // overwrite version function to fetch information from json.
  SELF.get_version = function () {
    return packageJSON.version;
  };

  SELF.init = SELF;
  SELF.secure = SELF;
  SELF.crypto_obj = require('./lib/cryptoUtil');

  // TODO: remove dependence
  SELF.__PN = PN;
  //

  SELF.ready();


  return SELF;
};

CREATE_PUBNUB.init = CREATE_PUBNUB;
CREATE_PUBNUB.unique = pubNubCore.unique;
CREATE_PUBNUB.secure = CREATE_PUBNUB;
CREATE_PUBNUB.crypto_obj = require('./lib/cryptoUtil');
module.exports = CREATE_PUBNUB;
module.exports.PNmessage = pubNubCore.PNmessage;
