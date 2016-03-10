'use strict';

var packageJSON = require('../../package.json');
var pubNubCore = require('../core/pubnub-common.js');
var crypto_obj = require('../../vendor/umd_vendor/crypto-obj.js');
var CryptoJS = require('../../vendor/umd_vendor/hmac-sha256.js');

/**
 * UTIL LOCALS
 */
var PNSDK = 'PubNub-JS-' + 'consumer' + '/' + packageJSON.version;

/**
 * LOCAL STORAGE
 */
var db = function () {
  var ls = typeof localStorage !== 'undefined' && localStorage;
  return {
    get: function get(key) {
      try {
        if (ls) return ls.getItem(key);
        if (document.cookie.indexOf(key) === -1) return null;
        return ((document.cookie || '').match(RegExp(key + '=([^;]+)')) || [])[1] || null;
      } catch (e) {
        return;
      }
    },
    set: function set(key, value) {
      try {
        if (ls) return ls.setItem(key, value) && 0;
        document.cookie = key + '=' + value + '; expires=Thu, 1 Aug 2030 20:00:00 UTC; path=/';
      } catch (e) {
        return;
      }
    }
  };
}();

/**
 * CORS XHR Request
 * ================
 *  xdr({
 *     url     : ['http://www.blah.com/url'],
 *     success : function(response) {},
 *     fail    : function() {}
 *  });
 */
function xdr(setup) {
  var xhr;
  var timer;
  var complete = 0;
  var loaded = 0;
  var async = true; /* do not allow sync operations in modern builds */
  var xhrtme = setup.timeout || pubNubCore.DEF_TIMEOUT;
  var data = setup.data || {};
  var fail = setup.fail || function () {};
  var success = setup.success || function () {};

  var done = function done(failed, response) {
    if (complete) return;
    complete = 1;

    clearTimeout(timer);

    if (xhr) {
      xhr.onerror = xhr.onload = null;
      if (xhr.abort) xhr.abort();
      xhr = null;
    }

    if (failed) fail(response);
  };

  var finished = function finished() {
    if (loaded) return;
    var response;
    loaded = 1;

    clearTimeout(timer);

    try {
      response = JSON.parse(xhr.responseText);
    } catch (r) {
      return done(1);
    }

    success(response);
  };

  timer = pubNubCore.timeout(function () {
    done(1);
  }, xhrtme);

  // Send
  try {
    xhr = typeof XDomainRequest !== 'undefined' && new XDomainRequest() || new XMLHttpRequest();

    xhr.onerror = xhr.onabort = function () {
      done(1, xhr.responseText || { error: 'Network Connection Error' });
    };
    xhr.onload = xhr.onloadend = finished;

    data.pnsdk = PNSDK;
    var url = pubNubCore.build_url(setup.url, data);
    xhr.open('GET', url, async);
    if (async) xhr.timeout = xhrtme;
    xhr.send();
  } catch (eee) {
    done(1, { error: 'XHR Failed', stacktrace: eee });
  }

  // Return 'done'
  return done;
}

function get_hmac_SHA256(data, key) {
  var hash = CryptoJS['HmacSHA256'](data, key);
  return hash.toString(CryptoJS['enc']['Base64']);
}

// Test Connection State
function _is_online() {
  if (!('onLine' in navigator)) return 1;
  try {
    return navigator['onLine'];
  } catch (e) {
    return true;
  }
}

function sendBeacon(url) {
  if (!('sendBeacon' in navigator)) return false;

  return navigator['sendBeacon'](url);
}

/**
 * ERROR
 * ===
 * error('message');
 */
function error(message) {
  console.error(message); // eslint-disable-line no-console
}

/* =-====================================================================-= */
/* =-====================================================================-= */
/* =-=========================     PUBNUB     ===========================-= */
/* =-====================================================================-= */
/* =-====================================================================-= */

function CREATE_PUBNUB(setup) {
  setup.db = db;
  setup.xdr = xdr;
  setup.error = setup.error || error;
  setup.hmac_SHA256 = get_hmac_SHA256;
  setup.crypto_obj = crypto_obj();
  setup._is_online = _is_online;
  setup.sendBeacon = sendBeacon;
  setup.params = { pnsdk: PNSDK };

  var SELF = function SELF(setup) {
    return CREATE_PUBNUB(setup);
  };

  var PN = pubNubCore.PN_API(setup);
  for (var prop in PN) {
    if (PN.hasOwnProperty(prop)) {
      SELF[prop] = PN[prop];
    }
  }

  SELF.init = SELF;
  SELF.crypto_obj = crypto_obj();
  SELF.PNmessage = pubNubCore.PNmessage;

  window.addEventListener('beforeunload', function () {
    SELF['each-channel'](function (ch) {
      SELF['LEAVE'](ch.name, 0);
    });
    return true;
  });

  SELF.ready();

  window.addEventListener('offline', SELF['offline']);

  return SELF;
}

CREATE_PUBNUB.PNmessage = pubNubCore.PNmessage;

module.exports = CREATE_PUBNUB;