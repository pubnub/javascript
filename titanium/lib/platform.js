/* globals window, console, PLATFORM, Ti */
/* eslint no-unused-expressions: 0, no-console: 0, camelcase: 0, curly: 0, no-redeclare: 0 */

require('imports?this=>window!../../core/polyfill/json.js');

var crypto_obj = require('../../core/umd_vendor/crypto-obj.js');
var packageJSON = require('../../package.json');
var pubNubCore = require('../../core/lib/pubnub-common.js');
/* ---------------------------------------------------------------------------
 --------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------
 PubNub Real-time Cloud-Hosted Push API and Push Notification Client Frameworks
 Copyright (c) 2011 PubNub Inc.
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

/**
 * UTIL LOCALS
 */
var PNSDK = 'PubNub-JS-' + 'Titanium' + '/' + packageJSON.version;

/**
 * LOCAL STORAGE OR COOKIE
 */
var db = (function () {
  return {
    get: function (key) {
      Ti.App.Properties.getString('' + key);
    },
    set: function (key, value) {
      Ti.App.Properties.setString('' + key, '' + value);
    }
  };
})();


/**
 * Titanium TCP Sockets
 * ====================
 *  xdr({
 *     url     : ['http://www.blah.com/url'],
 *     success : function(response) {},
 *     fail    : function() {}
 *  });
 */
function xdr_tcp(setup) {
  var sock;
  var data = setup.data || {};
  data['pnsdk'] = PNSDK;
  var url = pubNubCore.build_url(setup.url, data);
  var body = [];
  var data = '';
  var rbuffer = Ti.createBuffer({ length: 2048 });
  var wbuffer = Ti.createBuffer({ value: 'GET ' + url + ' HTTP/1.0\n\n' });
  var failed = 0;

  var fail = function () {
    if (failed) return;
    failed = 1;
    (setup.fail || function () {
    })();
  };

  var success = setup.success || function () {};

  function read() {
    Ti.Stream.read(sock, rbuffer, function (stream) {
      if (+stream.bytesProcessed > -1) {
        data = Ti.Codec.decodeString({
          source: rbuffer,
          length: +stream.bytesProcessed
        });

        body.push(data);
        rbuffer.clear();

        return pubNubCore.timeout(read, 1);
      }

      try {
        data = JSON['parse'](
          body.join('').split('\r\n').slice(-1)
        );
      } catch (r) {
        return fail();
      }

      sock.close();
      success(data);
    });
  }


  sock = Ti.Network.Socket.createTCP({
    host: url.split(pubNubCore.URLBIT)[2],
    port: 80,
    mode: Ti.Network.READ_WRITE_MODE,
    timeout: pubNubCore.XHRTME,
    error: fail,
    connected: function () {
      sock.write(wbuffer);
      read();
    }
  });

  try {
    sock.connect();
  } catch (k) {
    return fail();
  }
}

/**
 * Titanium XHR Request
 * ==============================
 *  xdr({
 *     url     : ['http://www.blah.com/url'],
 *     success : function(response) {},
 *     fail    : function() {}
 *  });
 */
function xdr_http_client(setup) {
  var data = setup.data || {};
  data['pnsdk'] = PNSDK;
  var url = pubNubCore.build_url(setup.url, data);
  var xhr;
  var timer;
  var complete = 0;
  var loaded = 0;
  var fail = setup.fail || function () {};
  var success = setup.success || function () {};

  var done = function (failed) {
    if (complete) return;
    complete = 1;

    clearTimeout(timer);

    if (xhr) {
      xhr.onerror = xhr.onload = null;
      xhr.abort && xhr.abort();
      xhr = null;
    }

    failed && fail();
  };

  var finished = function () {
    var response;
    if (loaded) return;
    loaded = 1;

    clearTimeout(timer);

    try {
      response = JSON['parse'](xhr.responseText);
    } catch (r) {
      return done(1);
    }

    success(response);
  };

  timer = pubNubCore.timeout(function () { done(1); }, pubNubCore.XHRTME);

  // Send
  try {
    xhr = Ti.Network.createHTTPClient();
    xhr.onerror = function () {
      done(1);
    };
    xhr.onload = finished;
    xhr.timeout = pubNubCore.XHRTME;

    xhr.open('GET', url, true);
    xhr.send();
  } catch (eee) {
    done(1, { error: 'XHR Failed', stacktrace: eee });
  }

  // Return 'done'
  return done;
}


/**
 * EVENTS
 * ======
 * PUBNUB.events.bind( 'you-stepped-on-flower', function(message) {
 *     // Do Stuff with message
 * } );
 *
 * PUBNUB.events.fire( 'you-stepped-on-flower', "message-data" );
 * PUBNUB.events.fire( 'you-stepped-on-flower', {message:"data"} );
 * PUBNUB.events.fire( 'you-stepped-on-flower', [1,2,3] );
 *
 */
var events = {
  list: {},
  unbind: function (name) {
    events.list[name] = [];
  },
  bind: function (name, fun) {
    (events.list[name] = events.list[name] || []).push(fun);
  },
  fire: function (name, data) {
    pubNubCore.each(
      events.list[name] || [],
      function (fun) {
        fun(data);
      }
    );
  }
};

/* =-====================================================================-= */
/* =-====================================================================-= */
/* =-=========================     PUBNUB     ===========================-= */
/* =-====================================================================-= */
/* =-====================================================================-= */

function CREATE_PUBNUB(setup) {
  setup['db'] = db;
  setup['xdr'] = setup['native_tcp_socket'] ? xdr_tcp : xdr_http_client;
  setup['crypto_obj'] = crypto_obj();
  setup['params'] = { pnsdk: PNSDK };

  var SELF = function (setup) {
    return CREATE_PUBNUB(setup);
  };

  var PN = pubNubCore.PN_API(setup);
  for (var prop in PN) {
    if (PN.hasOwnProperty(prop)) {
      SELF[prop] = PN[prop];
    }
  }

  SELF['init'] = SELF;
  SELF['crypto_obj'] = crypto_obj();


  // Return without Testing
  if (setup['notest']) return SELF;

  SELF['ready']();
  return SELF;
}

CREATE_PUBNUB['init'] = CREATE_PUBNUB;
CREATE_PUBNUB['crypto_obj'] = crypto_obj();

module.exports = CREATE_PUBNUB;
