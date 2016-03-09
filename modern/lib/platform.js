/* globals PLATFORM */
/* eslint curly: 0, camelcase: 0, dot-notation: 0 */

var packageJSON = require('../../package.json');
var pubNubCore = require('../../core/src/pubnub-common.js');
var crypto_obj = require('../../core/umd_vendor/crypto-obj.js');
var CryptoJS = require('../../core/umd_vendor/hmac-sha256.js');
var WS = require('../../core/umd_vendor/websocket');

/**
 * UTIL LOCALS
 */
var PNSDK = 'PubNub-JS-' + PLATFORM + '/' + packageJSON.version;

/**
 * LOCAL STORAGE
 */
var db = (function () {
  var ls = typeof localStorage !== 'undefined' && localStorage;
  return {
    get: function (key) {
      try {
        if (ls) return ls.getItem(key);
        if (document.cookie.indexOf(key) === -1) return null;
        return ((document.cookie || '').match(
            RegExp(key + '=([^;]+)')
          ) || [])[1] || null;
      } catch (e) {
        return;
      }
    },
    set: function (key, value) {
      try {
        if (ls) return ls.setItem(key, value) && 0;
        document.cookie = key + '=' + value +
          '; expires=Thu, 1 Aug 2030 20:00:00 UTC; path=/';
      } catch (e) {
        return;
      }
    }
  };
})();


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

  var done = function (failed, response) {
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

  var finished = function () {
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
    xhr = typeof XDomainRequest !== 'undefined' &&
      new XDomainRequest() ||
      new XMLHttpRequest();

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

/**
 * BIND
 * ====
 * bind( 'keydown', search('a')[0], function(element) {
 *     ...
 * } );
 */
function bind(type, el, fun) {
  pubNubCore.each(type.split(','), function (etype) {
    var rapfun = function (e) {
      if (!e) e = window.event;
      if (!fun(e)) {
        e.cancelBubble = true;
        e.returnValue = false;
        if (e.preventDefault) e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();
      }
    };

    if (el.addEventListener) el.addEventListener(etype, rapfun, false);
    else if (el.attachEvent) el.attachEvent('on' + etype, rapfun);
    else el['on' + etype] = rapfun;
  });
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

/**
 * ATTR
 * ====
 * var attribute = attr( node, 'attribute' );
 */
function attr(node, attribute, value) {
  if (value) node.setAttribute(attribute, value);
  else return node && node.getAttribute && node.getAttribute(attribute);
}

/**
 * $
 * =
 * var div = $('divid');
 */
function $(id) {
  return document.getElementById(id);
}


/**
 * SEARCH
 * ======
 * var elements = search('a div span');
 */
function search(elements, start) {
  var list = [];
  pubNubCore.each(elements.split(/\s+/), function (el) {
    pubNubCore.each((start || document).getElementsByTagName(el), function (node) {
      list.push(node);
    });
  });
  return list;
}

/**
 * CSS
 * ===
 * var obj = create('div');
 */
function css(element, styles) {
  for (var style in styles) if (styles.hasOwnProperty(style))
    try {
      element.style[style] = styles[style] + (
          '|width|height|top|left|'.indexOf(style) > 0 &&
          typeof styles[style] === 'number'
            ? 'px' : ''
        );
    } catch (e) {
      return;
    }
}

/**
 * CREATE
 * ======
 * var obj = create('div');
 */
function create(element) {
  return document.createElement(element);
}


function get_hmac_SHA256(data, key) {
  var hash = CryptoJS['HmacSHA256'](data, key);
  return hash.toString(CryptoJS['enc']['Base64']);
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
  setup.WS = WS;
  setup.params = { pnsdk: PNSDK };

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
  SELF.$ = $;
  SELF.attr = attr;
  SELF.search = search;
  SELF.bind = bind;
  SELF.css = css;
  SELF.create = create;
  SELF.crypto_obj = crypto_obj();
  SELF.WS = WS;
  SELF.PNmessage = pubNubCore.PNmessage;

  if (typeof(window) !== 'undefined') {
    bind('beforeunload', window, function () {
      SELF['each-channel'](function (ch) {
        SELF['LEAVE'](ch.name, 1);
      });
      return true;
    });
  }

  SELF.ready();

  // Return without Testing
  if (setup.notest) return SELF;

  if (typeof(window) !== 'undefined') {
    bind('offline', window, SELF['offline']);
  }

  if (typeof(document) !== 'undefined') {
    bind('offline', document, SELF['offline']);
  }

  return SELF;
}

CREATE_PUBNUB.init = CREATE_PUBNUB;
CREATE_PUBNUB.secure = CREATE_PUBNUB;
CREATE_PUBNUB.crypto_obj = crypto_obj();
CREATE_PUBNUB.WS = WS;
CREATE_PUBNUB.db = db;
CREATE_PUBNUB.PNmessage = pubNubCore.PNmessage;
CREATE_PUBNUB.uuid = pubNubCore.uuid;

CREATE_PUBNUB.css = css;
CREATE_PUBNUB.$ = $;
CREATE_PUBNUB.create = $;
CREATE_PUBNUB.bind = bind;
CREATE_PUBNUB.search = search;
CREATE_PUBNUB.attr = attr;
CREATE_PUBNUB.events = events;

CREATE_PUBNUB.map = pubNubCore.map;
CREATE_PUBNUB.each = pubNubCore.each;
CREATE_PUBNUB.grep = pubNubCore.grep;
CREATE_PUBNUB.supplent = pubNubCore.supplant;
CREATE_PUBNUB.now = pubNubCore.now;
CREATE_PUBNUB.unique = pubNubCore.unique;
CREATE_PUBNUB.updater = pubNubCore.updater;

module.exports = CREATE_PUBNUB;
