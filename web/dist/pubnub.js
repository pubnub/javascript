/*! 3.14.1 / web */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["PUBNUB"] = factory();
	else
		root["PUBNUB"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* globals window, console, 'Web' */
	/* eslint no-unused-expressions: 0, no-console: 0, camelcase: 0, curly: 0 */

	__webpack_require__(1);

	var crypto_obj = __webpack_require__(2);
	var CryptoJS = __webpack_require__(3);
	var packageJSON = __webpack_require__(4);
	var pubNubCore = __webpack_require__(5);
	var WS = __webpack_require__(13);

	/**
	 * UTIL LOCALS
	 */

	var PNSDK = 'PubNub-JS-' + 'Web' + '/' + packageJSON.version;

	/**
	 * CONSOLE COMPATIBILITY
	 */
	window.console || (window.console = window.console || {});
	console.log || (console.log = console.error = ((window.opera || {}).postError || function () {}));

	/**
	 * LOCAL STORAGE OR COOKIE
	 */
	var db = (function () {
	  var store = {};
	  var ls = false;
	  try {
	    ls = window['localStorage'];
	  } catch (e) {
	    return;
	  }
	  var cookieGet = function (key) {
	    if (document.cookie.indexOf(key) === -1) return null;
	    return ((document.cookie || '').match(
	        RegExp(key + '=([^;]+)')
	      ) || [])[1] || null;
	  };
	  var cookieSet = function (key, value) {
	    document.cookie = key + '=' + value +
	      '; expires=Thu, 1 Aug 2030 20:00:00 UTC; path=/';
	  };
	  var cookieTest = (function () {
	    try {
	      cookieSet('pnctest', '1');
	      return cookieGet('pnctest') === '1';
	    } catch (e) {
	      return false;
	    }
	  }());
	  return {
	    get: function (key) {
	      try {
	        if (ls) return ls.getItem(key);
	        if (cookieTest) return cookieGet(key);
	        return store[key];
	      } catch (e) {
	        return store[key];
	      }
	    },
	    set: function (key, value) {
	      try {
	        if (ls) return ls.setItem(key, value) && 0;
	        if (cookieTest) cookieSet(key, value);
	        store[key] = value;
	      } catch (e) {
	        store[key] = value;
	      }
	    }
	  };
	})();

	function get_hmac_SHA256(data, key) {
	  var hash = CryptoJS['HmacSHA256'](data, key);
	  return hash.toString(CryptoJS['enc']['Base64']);
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
	 * ERROR
	 * =====
	 * error('message');
	 */
	function error(message) {
	  console['error'](message);
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
	        e.preventDefault && e.preventDefault();
	        e.stopPropagation && e.stopPropagation();
	      }
	    };

	    if (el.addEventListener) el.addEventListener(etype, rapfun, false);
	    else if (el.attachEvent) el.attachEvent('on' + etype, rapfun);
	    else el['on' + etype] = rapfun;
	  });
	}

	/**
	 * HEAD
	 * ====
	 * head().appendChild(elm);
	 */
	function head() {
	  return search('head')[0];
	}

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

	/* =-====================================================================-= */
	/* =-====================================================================-= */
	/* =-=========================     PUBNUB     ===========================-= */
	/* =-====================================================================-= */
	/* =-====================================================================-= */

	var CREATE_PUBNUB = function (setup) {
	  var leave_on_unload = setup['leave_on_unload'] || 0;

	  setup['xdr'] = xdr;
	  setup['db'] = db;
	  setup['error'] = setup['error'] || error;
	  setup['_is_online'] = _is_online;
	  setup['hmac_SHA256'] = get_hmac_SHA256;
	  setup['crypto_obj'] = crypto_obj();
	  setup['sendBeacon'] = sendBeacon;
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
	  SELF['css'] = css;
	  SELF['$'] = $;
	  SELF['create'] = create;
	  SELF['bind'] = bind;
	  SELF['head'] = head;
	  SELF['search'] = search;
	  SELF['attr'] = attr;
	  SELF['events'] = events;
	  SELF['init'] = SELF;
	  SELF['secure'] = SELF;
	  SELF['crypto_obj'] = crypto_obj(); // export to instance
	  SELF['WS'] = WS;
	  SELF['PNmessage'] = pubNubCore.PNmessage;


	  // Add Leave Functions
	  bind('beforeunload', window, function () {
	    if (leave_on_unload) SELF['each-channel'](function (ch) {
	      SELF['LEAVE'](ch.name, 0);
	    });
	    return true;
	  });

	  SELF.ready();

	  // Return without Testing
	  if (setup['notest']) return SELF;

	  bind('offline', window, SELF['offline']);
	  bind('offline', document, SELF['offline']);

	  // Return PUBNUB Socket Object
	  return SELF;
	};

	CREATE_PUBNUB.init = CREATE_PUBNUB;
	CREATE_PUBNUB.secure = CREATE_PUBNUB;
	CREATE_PUBNUB.crypto_obj = crypto_obj(); // export to constructor
	CREATE_PUBNUB.WS = WS;
	CREATE_PUBNUB.db = db;
	CREATE_PUBNUB.PNmessage = pubNubCore.PNmessage;
	CREATE_PUBNUB.uuid = pubNubCore.uuid;

	CREATE_PUBNUB.css = css;
	CREATE_PUBNUB.$ = $;
	CREATE_PUBNUB.create = $;
	CREATE_PUBNUB.bind = bind;
	CREATE_PUBNUB.head = head;
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


	// jQuery Interface
	window['jQuery'] && (window['jQuery']['PUBNUB'] = CREATE_PUBNUB);

	module.exports = CREATE_PUBNUB;


/***/ },
/* 1 */
/***/ function(module, exports) {

	/*** IMPORTS FROM imports-loader ***/
	(function() {

	/* =-====================================================================-= */
	/* =-====================================================================-= */
	/* =-=========================     JSON     =============================-= */
	/* =-====================================================================-= */
	/* =-====================================================================-= */

	(window['JSON'] && window['JSON']['stringify']) || (function () {
	    window['JSON'] || (window['JSON'] = {});

	    function toJSON(key) {
	        try      { return this.valueOf() }
	        catch(e) { return null }
	    }

	    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	        gap,
	        indent,
	        meta = {    // table of character substitutions
	            '\b': '\\b',
	            '\t': '\\t',
	            '\n': '\\n',
	            '\f': '\\f',
	            '\r': '\\r',
	            '"' : '\\"',
	            '\\': '\\\\'
	        },
	        rep;

	    function quote(string) {
	        escapable.lastIndex = 0;
	        return escapable.test(string) ?
	            '"' + string.replace(escapable, function (a) {
	                var c = meta[a];
	                return typeof c === 'string' ? c :
	                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
	            }) + '"' :
	            '"' + string + '"';
	    }

	    function str(key, holder) {
	        var i,          // The loop counter.
	            k,          // The member key.
	            v,          // The member value.
	            length,
	            partial,
	            mind  = gap,
	            value = holder[key];

	        if (value && typeof value === 'object') {
	            value = toJSON.call( value, key );
	        }

	        if (typeof rep === 'function') {
	            value = rep.call(holder, key, value);
	        }

	        switch (typeof value) {
	        case 'string':
	            return quote(value);

	        case 'number':
	            return isFinite(value) ? String(value) : 'null';

	        case 'boolean':
	        case 'null':
	            return String(value);

	        case 'object':

	            if (!value) {
	                return 'null';
	            }

	            gap += indent;
	            partial = [];

	            if (Object.prototype.toString.apply(value) === '[object Array]') {

	                length = value.length;
	                for (i = 0; i < length; i += 1) {
	                    partial[i] = str(i, value) || 'null';
	                }

	                v = partial.length === 0 ? '[]' :
	                    gap ? '[\n' + gap +
	                            partial.join(',\n' + gap) + '\n' +
	                                mind + ']' :
	                          '[' + partial.join(',') + ']';
	                gap = mind;
	                return v;
	            }
	            if (rep && typeof rep === 'object') {
	                length = rep.length;
	                for (i = 0; i < length; i += 1) {
	                    k = rep[i];
	                    if (typeof k === 'string') {
	                        v = str(k, value);
	                        if (v) {
	                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
	                        }
	                    }
	                }
	            } else {
	                for (k in value) {
	                    if (Object.hasOwnProperty.call(value, k)) {
	                        v = str(k, value);
	                        if (v) {
	                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
	                        }
	                    }
	                }
	            }

	            v = partial.length === 0 ? '{}' :
	                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
	                        mind + '}' : '{' + partial.join(',') + '}';
	            gap = mind;
	            return v;
	        }
	    }

	    if (typeof JSON['stringify'] !== 'function') {
	        JSON['stringify'] = function (value, replacer, space) {
	            var i;
	            gap = '';
	            indent = '';

	            if (typeof space === 'number') {
	                for (i = 0; i < space; i += 1) {
	                    indent += ' ';
	                }
	            } else if (typeof space === 'string') {
	                indent = space;
	            }
	            rep = replacer;
	            if (replacer && typeof replacer !== 'function' &&
	                    (typeof replacer !== 'object' ||
	                     typeof replacer.length !== 'number')) {
	                throw new Error('JSON.stringify');
	            }
	            return str('', {'': value});
	        };
	    }

	    if (typeof JSON['parse'] !== 'function') {
	        // JSON is parsed on the server for security.
	        JSON['parse'] = function (text) {return eval('('+text+')')};
	    }
	}());

	}.call(window));

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/* eslint camelcase: 0 eqeqeq: 0 */

	var CryptoJS = __webpack_require__(3);

	function crypto_obj() {
	  function SHA256(s) {
	    return CryptoJS['SHA256'](s)['toString'](CryptoJS['enc']['Hex']);
	  }

	  var iv = '0123456789012345';

	  var allowedKeyEncodings = ['hex', 'utf8', 'base64', 'binary'];
	  var allowedKeyLengths = [128, 256];
	  var allowedModes = ['ecb', 'cbc'];

	  var defaultOptions = {
	    encryptKey: true,
	    keyEncoding: 'utf8',
	    keyLength: 256,
	    mode: 'cbc'
	  };

	  function parse_options(options) {
	    // Defaults
	    options = options || {};
	    if (!options['hasOwnProperty']('encryptKey')) options['encryptKey'] = defaultOptions['encryptKey'];
	    if (!options['hasOwnProperty']('keyEncoding')) options['keyEncoding'] = defaultOptions['keyEncoding'];
	    if (!options['hasOwnProperty']('keyLength')) options['keyLength'] = defaultOptions['keyLength'];
	    if (!options['hasOwnProperty']('mode')) options['mode'] = defaultOptions['mode'];

	    // Validation
	    if (allowedKeyEncodings['indexOf'](options['keyEncoding']['toLowerCase']()) == -1) options['keyEncoding'] = defaultOptions['keyEncoding'];
	    if (allowedKeyLengths['indexOf'](parseInt(options['keyLength'], 10)) == -1) options['keyLength'] = defaultOptions['keyLength'];
	    if (allowedModes['indexOf'](options['mode']['toLowerCase']()) == -1) options['mode'] = defaultOptions['mode'];

	    return options;
	  }

	  function decode_key(key, options) {
	    if (options['keyEncoding'] === 'base64') {
	      return CryptoJS['enc']['Base64']['parse'](key);
	    } else if (options['keyEncoding'] === 'hex') {
	      return CryptoJS['enc']['Hex']['parse'](key);
	    } else {
	      return key;
	    }
	  }

	  function get_padded_key(key, options) {
	    key = decode_key(key, options);
	    if (options['encryptKey']) {
	      return CryptoJS['enc']['Utf8']['parse'](SHA256(key)['slice'](0, 32));
	    } else {
	      return key;
	    }
	  }

	  function get_mode(options) {
	    if (options['mode'] === 'ecb') {
	      return CryptoJS['mode']['ECB'];
	    } else {
	      return CryptoJS['mode']['CBC'];
	    }
	  }

	  function get_iv(options) {
	    return (options['mode'] === 'cbc') ? CryptoJS['enc']['Utf8']['parse'](iv) : null;
	  }

	  return {
	    encrypt: function (data, key, options) {
	      if (!key) return data;
	      options = parse_options(options);
	      var iv = get_iv(options);
	      var mode = get_mode(options);
	      var cipher_key = get_padded_key(key, options);
	      var hex_message = JSON['stringify'](data);
	      var encryptedHexArray = CryptoJS['AES']['encrypt'](hex_message, cipher_key, { iv: iv, mode: mode })['ciphertext'];
	      var base_64_encrypted = encryptedHexArray['toString'](CryptoJS['enc']['Base64']);
	      return base_64_encrypted || data;
	    },

	    decrypt: function (data, key, options) {
	      if (!key) return data;
	      options = parse_options(options);
	      var iv = get_iv(options);
	      var mode = get_mode(options);
	      var cipher_key = get_padded_key(key, options);
	      try {
	        var binary_enc = CryptoJS['enc']['Base64']['parse'](data);
	        var json_plain = CryptoJS['AES']['decrypt']({ ciphertext: binary_enc }, cipher_key, { iv: iv, mode: mode })['toString'](CryptoJS['enc']['Utf8']);
	        var plaintext = JSON['parse'](json_plain);
	        return plaintext;
	      } catch (e) {
	        return undefined;
	      }
	    }
	  };
	}

	module.exports = crypto_obj;


/***/ },
/* 3 */
/***/ function(module, exports) {

	/*
	 CryptoJS v3.1.2
	 code.google.com/p/crypto-js
	 (c) 2009-2013 by Jeff Mott. All rights reserved.
	 code.google.com/p/crypto-js/wiki/License
	 */
	var CryptoJS=CryptoJS||function(h,s){var f={},g=f.lib={},q=function(){},m=g.Base={extend:function(a){q.prototype=this;var c=new q;a&&c.mixIn(a);c.hasOwnProperty("init")||(c.init=function(){c.$super.init.apply(this,arguments)});c.init.prototype=c;c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.init.prototype.extend(this)}},
	    r=g.WordArray=m.extend({init:function(a,c){a=this.words=a||[];this.sigBytes=c!=s?c:4*a.length},toString:function(a){return(a||k).stringify(this)},concat:function(a){var c=this.words,d=a.words,b=this.sigBytes;a=a.sigBytes;this.clamp();if(b%4)for(var e=0;e<a;e++)c[b+e>>>2]|=(d[e>>>2]>>>24-8*(e%4)&255)<<24-8*((b+e)%4);else if(65535<d.length)for(e=0;e<a;e+=4)c[b+e>>>2]=d[e>>>2];else c.push.apply(c,d);this.sigBytes+=a;return this},clamp:function(){var a=this.words,c=this.sigBytes;a[c>>>2]&=4294967295<<
	      32-8*(c%4);a.length=h.ceil(c/4)},clone:function(){var a=m.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var c=[],d=0;d<a;d+=4)c.push(4294967296*h.random()|0);return new r.init(c,a)}}),l=f.enc={},k=l.Hex={stringify:function(a){var c=a.words;a=a.sigBytes;for(var d=[],b=0;b<a;b++){var e=c[b>>>2]>>>24-8*(b%4)&255;d.push((e>>>4).toString(16));d.push((e&15).toString(16))}return d.join("")},parse:function(a){for(var c=a.length,d=[],b=0;b<c;b+=2)d[b>>>3]|=parseInt(a.substr(b,
	        2),16)<<24-4*(b%8);return new r.init(d,c/2)}},n=l.Latin1={stringify:function(a){var c=a.words;a=a.sigBytes;for(var d=[],b=0;b<a;b++)d.push(String.fromCharCode(c[b>>>2]>>>24-8*(b%4)&255));return d.join("")},parse:function(a){for(var c=a.length,d=[],b=0;b<c;b++)d[b>>>2]|=(a.charCodeAt(b)&255)<<24-8*(b%4);return new r.init(d,c)}},j=l.Utf8={stringify:function(a){try{return decodeURIComponent(escape(n.stringify(a)))}catch(c){throw Error("Malformed UTF-8 data");}},parse:function(a){return n.parse(unescape(encodeURIComponent(a)))}},
	    u=g.BufferedBlockAlgorithm=m.extend({reset:function(){this._data=new r.init;this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=j.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var c=this._data,d=c.words,b=c.sigBytes,e=this.blockSize,f=b/(4*e),f=a?h.ceil(f):h.max((f|0)-this._minBufferSize,0);a=f*e;b=h.min(4*a,b);if(a){for(var g=0;g<a;g+=e)this._doProcessBlock(d,g);g=d.splice(0,a);c.sigBytes-=b}return new r.init(g,b)},clone:function(){var a=m.clone.call(this);
	      a._data=this._data.clone();return a},_minBufferSize:0});g.Hasher=u.extend({cfg:m.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset()},reset:function(){u.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);return this._doFinalize()},blockSize:16,_createHelper:function(a){return function(c,d){return(new a.init(d)).finalize(c)}},_createHmacHelper:function(a){return function(c,d){return(new t.HMAC.init(a,
	    d)).finalize(c)}}});var t=f.algo={};return f}(Math);

	// SHA256
	(function(h){for(var s=CryptoJS,f=s.lib,g=f.WordArray,q=f.Hasher,f=s.algo,m=[],r=[],l=function(a){return 4294967296*(a-(a|0))|0},k=2,n=0;64>n;){var j;a:{j=k;for(var u=h.sqrt(j),t=2;t<=u;t++)if(!(j%t)){j=!1;break a}j=!0}j&&(8>n&&(m[n]=l(h.pow(k,0.5))),r[n]=l(h.pow(k,1/3)),n++);k++}var a=[],f=f.SHA256=q.extend({_doReset:function(){this._hash=new g.init(m.slice(0))},_doProcessBlock:function(c,d){for(var b=this._hash.words,e=b[0],f=b[1],g=b[2],j=b[3],h=b[4],m=b[5],n=b[6],q=b[7],p=0;64>p;p++){if(16>p)a[p]=
	  c[d+p]|0;else{var k=a[p-15],l=a[p-2];a[p]=((k<<25|k>>>7)^(k<<14|k>>>18)^k>>>3)+a[p-7]+((l<<15|l>>>17)^(l<<13|l>>>19)^l>>>10)+a[p-16]}k=q+((h<<26|h>>>6)^(h<<21|h>>>11)^(h<<7|h>>>25))+(h&m^~h&n)+r[p]+a[p];l=((e<<30|e>>>2)^(e<<19|e>>>13)^(e<<10|e>>>22))+(e&f^e&g^f&g);q=n;n=m;m=h;h=j+k|0;j=g;g=f;f=e;e=k+l|0}b[0]=b[0]+e|0;b[1]=b[1]+f|0;b[2]=b[2]+g|0;b[3]=b[3]+j|0;b[4]=b[4]+h|0;b[5]=b[5]+m|0;b[6]=b[6]+n|0;b[7]=b[7]+q|0},_doFinalize:function(){var a=this._data,d=a.words,b=8*this._nDataBytes,e=8*a.sigBytes;
	  d[e>>>5]|=128<<24-e%32;d[(e+64>>>9<<4)+14]=h.floor(b/4294967296);d[(e+64>>>9<<4)+15]=b;a.sigBytes=4*d.length;this._process();return this._hash},clone:function(){var a=q.clone.call(this);a._hash=this._hash.clone();return a}});s.SHA256=q._createHelper(f);s.HmacSHA256=q._createHmacHelper(f)})(Math);

	// HMAC SHA256
	(function(){var h=CryptoJS,s=h.enc.Utf8;h.algo.HMAC=h.lib.Base.extend({init:function(f,g){f=this._hasher=new f.init;"string"==typeof g&&(g=s.parse(g));var h=f.blockSize,m=4*h;g.sigBytes>m&&(g=f.finalize(g));g.clamp();for(var r=this._oKey=g.clone(),l=this._iKey=g.clone(),k=r.words,n=l.words,j=0;j<h;j++)k[j]^=1549556828,n[j]^=909522486;r.sigBytes=l.sigBytes=m;this.reset()},reset:function(){var f=this._hasher;f.reset();f.update(this._iKey)},update:function(f){this._hasher.update(f);return this},finalize:function(f){var g=
	  this._hasher;f=g.finalize(f);g.reset();return g.finalize(this._oKey.clone().concat(f))}})})();

	// Base64
	(function(){var u=CryptoJS,p=u.lib.WordArray;u.enc.Base64={stringify:function(d){var l=d.words,p=d.sigBytes,t=this._map;d.clamp();d=[];for(var r=0;r<p;r+=3)for(var w=(l[r>>>2]>>>24-8*(r%4)&255)<<16|(l[r+1>>>2]>>>24-8*((r+1)%4)&255)<<8|l[r+2>>>2]>>>24-8*((r+2)%4)&255,v=0;4>v&&r+0.75*v<p;v++)d.push(t.charAt(w>>>6*(3-v)&63));if(l=t.charAt(64))for(;d.length%4;)d.push(l);return d.join("")},parse:function(d){var l=d.length,s=this._map,t=s.charAt(64);t&&(t=d.indexOf(t),-1!=t&&(l=t));for(var t=[],r=0,w=0;w<
	l;w++)if(w%4){var v=s.indexOf(d.charAt(w-1))<<2*(w%4),b=s.indexOf(d.charAt(w))>>>6-2*(w%4);t[r>>>2]|=(v|b)<<24-8*(r%4);r++}return p.create(t,r)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}})();

	// BlockCipher
	(function(u){function p(b,n,a,c,e,j,k){b=b+(n&a|~n&c)+e+k;return(b<<j|b>>>32-j)+n}function d(b,n,a,c,e,j,k){b=b+(n&c|a&~c)+e+k;return(b<<j|b>>>32-j)+n}function l(b,n,a,c,e,j,k){b=b+(n^a^c)+e+k;return(b<<j|b>>>32-j)+n}function s(b,n,a,c,e,j,k){b=b+(a^(n|~c))+e+k;return(b<<j|b>>>32-j)+n}for(var t=CryptoJS,r=t.lib,w=r.WordArray,v=r.Hasher,r=t.algo,b=[],x=0;64>x;x++)b[x]=4294967296*u.abs(u.sin(x+1))|0;r=r.MD5=v.extend({_doReset:function(){this._hash=new w.init([1732584193,4023233417,2562383102,271733878])},
	  _doProcessBlock:function(q,n){for(var a=0;16>a;a++){var c=n+a,e=q[c];q[c]=(e<<8|e>>>24)&16711935|(e<<24|e>>>8)&4278255360}var a=this._hash.words,c=q[n+0],e=q[n+1],j=q[n+2],k=q[n+3],z=q[n+4],r=q[n+5],t=q[n+6],w=q[n+7],v=q[n+8],A=q[n+9],B=q[n+10],C=q[n+11],u=q[n+12],D=q[n+13],E=q[n+14],x=q[n+15],f=a[0],m=a[1],g=a[2],h=a[3],f=p(f,m,g,h,c,7,b[0]),h=p(h,f,m,g,e,12,b[1]),g=p(g,h,f,m,j,17,b[2]),m=p(m,g,h,f,k,22,b[3]),f=p(f,m,g,h,z,7,b[4]),h=p(h,f,m,g,r,12,b[5]),g=p(g,h,f,m,t,17,b[6]),m=p(m,g,h,f,w,22,b[7]),
	    f=p(f,m,g,h,v,7,b[8]),h=p(h,f,m,g,A,12,b[9]),g=p(g,h,f,m,B,17,b[10]),m=p(m,g,h,f,C,22,b[11]),f=p(f,m,g,h,u,7,b[12]),h=p(h,f,m,g,D,12,b[13]),g=p(g,h,f,m,E,17,b[14]),m=p(m,g,h,f,x,22,b[15]),f=d(f,m,g,h,e,5,b[16]),h=d(h,f,m,g,t,9,b[17]),g=d(g,h,f,m,C,14,b[18]),m=d(m,g,h,f,c,20,b[19]),f=d(f,m,g,h,r,5,b[20]),h=d(h,f,m,g,B,9,b[21]),g=d(g,h,f,m,x,14,b[22]),m=d(m,g,h,f,z,20,b[23]),f=d(f,m,g,h,A,5,b[24]),h=d(h,f,m,g,E,9,b[25]),g=d(g,h,f,m,k,14,b[26]),m=d(m,g,h,f,v,20,b[27]),f=d(f,m,g,h,D,5,b[28]),h=d(h,f,
	      m,g,j,9,b[29]),g=d(g,h,f,m,w,14,b[30]),m=d(m,g,h,f,u,20,b[31]),f=l(f,m,g,h,r,4,b[32]),h=l(h,f,m,g,v,11,b[33]),g=l(g,h,f,m,C,16,b[34]),m=l(m,g,h,f,E,23,b[35]),f=l(f,m,g,h,e,4,b[36]),h=l(h,f,m,g,z,11,b[37]),g=l(g,h,f,m,w,16,b[38]),m=l(m,g,h,f,B,23,b[39]),f=l(f,m,g,h,D,4,b[40]),h=l(h,f,m,g,c,11,b[41]),g=l(g,h,f,m,k,16,b[42]),m=l(m,g,h,f,t,23,b[43]),f=l(f,m,g,h,A,4,b[44]),h=l(h,f,m,g,u,11,b[45]),g=l(g,h,f,m,x,16,b[46]),m=l(m,g,h,f,j,23,b[47]),f=s(f,m,g,h,c,6,b[48]),h=s(h,f,m,g,w,10,b[49]),g=s(g,h,f,m,
	      E,15,b[50]),m=s(m,g,h,f,r,21,b[51]),f=s(f,m,g,h,u,6,b[52]),h=s(h,f,m,g,k,10,b[53]),g=s(g,h,f,m,B,15,b[54]),m=s(m,g,h,f,e,21,b[55]),f=s(f,m,g,h,v,6,b[56]),h=s(h,f,m,g,x,10,b[57]),g=s(g,h,f,m,t,15,b[58]),m=s(m,g,h,f,D,21,b[59]),f=s(f,m,g,h,z,6,b[60]),h=s(h,f,m,g,C,10,b[61]),g=s(g,h,f,m,j,15,b[62]),m=s(m,g,h,f,A,21,b[63]);a[0]=a[0]+f|0;a[1]=a[1]+m|0;a[2]=a[2]+g|0;a[3]=a[3]+h|0},_doFinalize:function(){var b=this._data,n=b.words,a=8*this._nDataBytes,c=8*b.sigBytes;n[c>>>5]|=128<<24-c%32;var e=u.floor(a/
	    4294967296);n[(c+64>>>9<<4)+15]=(e<<8|e>>>24)&16711935|(e<<24|e>>>8)&4278255360;n[(c+64>>>9<<4)+14]=(a<<8|a>>>24)&16711935|(a<<24|a>>>8)&4278255360;b.sigBytes=4*(n.length+1);this._process();b=this._hash;n=b.words;for(a=0;4>a;a++)c=n[a],n[a]=(c<<8|c>>>24)&16711935|(c<<24|c>>>8)&4278255360;return b},clone:function(){var b=v.clone.call(this);b._hash=this._hash.clone();return b}});t.MD5=v._createHelper(r);t.HmacMD5=v._createHmacHelper(r)})(Math);
	(function(){var u=CryptoJS,p=u.lib,d=p.Base,l=p.WordArray,p=u.algo,s=p.EvpKDF=d.extend({cfg:d.extend({keySize:4,hasher:p.MD5,iterations:1}),init:function(d){this.cfg=this.cfg.extend(d)},compute:function(d,r){for(var p=this.cfg,s=p.hasher.create(),b=l.create(),u=b.words,q=p.keySize,p=p.iterations;u.length<q;){n&&s.update(n);var n=s.update(d).finalize(r);s.reset();for(var a=1;a<p;a++)n=s.finalize(n),s.reset();b.concat(n)}b.sigBytes=4*q;return b}});u.EvpKDF=function(d,l,p){return s.create(p).compute(d,
	  l)}})();

	// Cipher
	CryptoJS.lib.Cipher||function(u){var p=CryptoJS,d=p.lib,l=d.Base,s=d.WordArray,t=d.BufferedBlockAlgorithm,r=p.enc.Base64,w=p.algo.EvpKDF,v=d.Cipher=t.extend({cfg:l.extend(),createEncryptor:function(e,a){return this.create(this._ENC_XFORM_MODE,e,a)},createDecryptor:function(e,a){return this.create(this._DEC_XFORM_MODE,e,a)},init:function(e,a,b){this.cfg=this.cfg.extend(b);this._xformMode=e;this._key=a;this.reset()},reset:function(){t.reset.call(this);this._doReset()},process:function(e){this._append(e);return this._process()},
	  finalize:function(e){e&&this._append(e);return this._doFinalize()},keySize:4,ivSize:4,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:function(e){return{encrypt:function(b,k,d){return("string"==typeof k?c:a).encrypt(e,b,k,d)},decrypt:function(b,k,d){return("string"==typeof k?c:a).decrypt(e,b,k,d)}}}});d.StreamCipher=v.extend({_doFinalize:function(){return this._process(!0)},blockSize:1});var b=p.mode={},x=function(e,a,b){var c=this._iv;c?this._iv=u:c=this._prevBlock;for(var d=0;d<b;d++)e[a+d]^=
	  c[d]},q=(d.BlockCipherMode=l.extend({createEncryptor:function(e,a){return this.Encryptor.create(e,a)},createDecryptor:function(e,a){return this.Decryptor.create(e,a)},init:function(e,a){this._cipher=e;this._iv=a}})).extend();q.Encryptor=q.extend({processBlock:function(e,a){var b=this._cipher,c=b.blockSize;x.call(this,e,a,c);b.encryptBlock(e,a);this._prevBlock=e.slice(a,a+c)}});q.Decryptor=q.extend({processBlock:function(e,a){var b=this._cipher,c=b.blockSize,d=e.slice(a,a+c);b.decryptBlock(e,a);x.call(this,
	  e,a,c);this._prevBlock=d}});b=b.CBC=q;q=(p.pad={}).Pkcs7={pad:function(a,b){for(var c=4*b,c=c-a.sigBytes%c,d=c<<24|c<<16|c<<8|c,l=[],n=0;n<c;n+=4)l.push(d);c=s.create(l,c);a.concat(c)},unpad:function(a){a.sigBytes-=a.words[a.sigBytes-1>>>2]&255}};d.BlockCipher=v.extend({cfg:v.cfg.extend({mode:b,padding:q}),reset:function(){v.reset.call(this);var a=this.cfg,b=a.iv,a=a.mode;if(this._xformMode==this._ENC_XFORM_MODE)var c=a.createEncryptor;else c=a.createDecryptor,this._minBufferSize=1;this._mode=c.call(a,
	  this,b&&b.words)},_doProcessBlock:function(a,b){this._mode.processBlock(a,b)},_doFinalize:function(){var a=this.cfg.padding;if(this._xformMode==this._ENC_XFORM_MODE){a.pad(this._data,this.blockSize);var b=this._process(!0)}else b=this._process(!0),a.unpad(b);return b},blockSize:4});var n=d.CipherParams=l.extend({init:function(a){this.mixIn(a)},toString:function(a){return(a||this.formatter).stringify(this)}}),b=(p.format={}).OpenSSL={stringify:function(a){var b=a.ciphertext;a=a.salt;return(a?s.create([1398893684,
	  1701076831]).concat(a).concat(b):b).toString(r)},parse:function(a){a=r.parse(a);var b=a.words;if(1398893684==b[0]&&1701076831==b[1]){var c=s.create(b.slice(2,4));b.splice(0,4);a.sigBytes-=16}return n.create({ciphertext:a,salt:c})}},a=d.SerializableCipher=l.extend({cfg:l.extend({format:b}),encrypt:function(a,b,c,d){d=this.cfg.extend(d);var l=a.createEncryptor(c,d);b=l.finalize(b);l=l.cfg;return n.create({ciphertext:b,key:c,iv:l.iv,algorithm:a,mode:l.mode,padding:l.padding,blockSize:a.blockSize,formatter:d.format})},
	  decrypt:function(a,b,c,d){d=this.cfg.extend(d);b=this._parse(b,d.format);return a.createDecryptor(c,d).finalize(b.ciphertext)},_parse:function(a,b){return"string"==typeof a?b.parse(a,this):a}}),p=(p.kdf={}).OpenSSL={execute:function(a,b,c,d){d||(d=s.random(8));a=w.create({keySize:b+c}).compute(a,d);c=s.create(a.words.slice(b),4*c);a.sigBytes=4*b;return n.create({key:a,iv:c,salt:d})}},c=d.PasswordBasedCipher=a.extend({cfg:a.cfg.extend({kdf:p}),encrypt:function(b,c,d,l){l=this.cfg.extend(l);d=l.kdf.execute(d,
	  b.keySize,b.ivSize);l.iv=d.iv;b=a.encrypt.call(this,b,c,d.key,l);b.mixIn(d);return b},decrypt:function(b,c,d,l){l=this.cfg.extend(l);c=this._parse(c,l.format);d=l.kdf.execute(d,b.keySize,b.ivSize,c.salt);l.iv=d.iv;return a.decrypt.call(this,b,c,d.key,l)}})}();

	// AES
	(function(){for(var u=CryptoJS,p=u.lib.BlockCipher,d=u.algo,l=[],s=[],t=[],r=[],w=[],v=[],b=[],x=[],q=[],n=[],a=[],c=0;256>c;c++)a[c]=128>c?c<<1:c<<1^283;for(var e=0,j=0,c=0;256>c;c++){var k=j^j<<1^j<<2^j<<3^j<<4,k=k>>>8^k&255^99;l[e]=k;s[k]=e;var z=a[e],F=a[z],G=a[F],y=257*a[k]^16843008*k;t[e]=y<<24|y>>>8;r[e]=y<<16|y>>>16;w[e]=y<<8|y>>>24;v[e]=y;y=16843009*G^65537*F^257*z^16843008*e;b[k]=y<<24|y>>>8;x[k]=y<<16|y>>>16;q[k]=y<<8|y>>>24;n[k]=y;e?(e=z^a[a[a[G^z]]],j^=a[a[j]]):e=j=1}var H=[0,1,2,4,8,
	  16,32,64,128,27,54],d=d.AES=p.extend({_doReset:function(){for(var a=this._key,c=a.words,d=a.sigBytes/4,a=4*((this._nRounds=d+6)+1),e=this._keySchedule=[],j=0;j<a;j++)if(j<d)e[j]=c[j];else{var k=e[j-1];j%d?6<d&&4==j%d&&(k=l[k>>>24]<<24|l[k>>>16&255]<<16|l[k>>>8&255]<<8|l[k&255]):(k=k<<8|k>>>24,k=l[k>>>24]<<24|l[k>>>16&255]<<16|l[k>>>8&255]<<8|l[k&255],k^=H[j/d|0]<<24);e[j]=e[j-d]^k}c=this._invKeySchedule=[];for(d=0;d<a;d++)j=a-d,k=d%4?e[j]:e[j-4],c[d]=4>d||4>=j?k:b[l[k>>>24]]^x[l[k>>>16&255]]^q[l[k>>>
	8&255]]^n[l[k&255]]},encryptBlock:function(a,b){this._doCryptBlock(a,b,this._keySchedule,t,r,w,v,l)},decryptBlock:function(a,c){var d=a[c+1];a[c+1]=a[c+3];a[c+3]=d;this._doCryptBlock(a,c,this._invKeySchedule,b,x,q,n,s);d=a[c+1];a[c+1]=a[c+3];a[c+3]=d},_doCryptBlock:function(a,b,c,d,e,j,l,f){for(var m=this._nRounds,g=a[b]^c[0],h=a[b+1]^c[1],k=a[b+2]^c[2],n=a[b+3]^c[3],p=4,r=1;r<m;r++)var q=d[g>>>24]^e[h>>>16&255]^j[k>>>8&255]^l[n&255]^c[p++],s=d[h>>>24]^e[k>>>16&255]^j[n>>>8&255]^l[g&255]^c[p++],t=
	  d[k>>>24]^e[n>>>16&255]^j[g>>>8&255]^l[h&255]^c[p++],n=d[n>>>24]^e[g>>>16&255]^j[h>>>8&255]^l[k&255]^c[p++],g=q,h=s,k=t;q=(f[g>>>24]<<24|f[h>>>16&255]<<16|f[k>>>8&255]<<8|f[n&255])^c[p++];s=(f[h>>>24]<<24|f[k>>>16&255]<<16|f[n>>>8&255]<<8|f[g&255])^c[p++];t=(f[k>>>24]<<24|f[n>>>16&255]<<16|f[g>>>8&255]<<8|f[h&255])^c[p++];n=(f[n>>>24]<<24|f[g>>>16&255]<<16|f[h>>>8&255]<<8|f[k&255])^c[p++];a[b]=q;a[b+1]=s;a[b+2]=t;a[b+3]=n},keySize:8});u.AES=p._createHelper(d)})();

	// Mode ECB
	CryptoJS.mode.ECB = (function () {
	  var ECB = CryptoJS.lib.BlockCipherMode.extend();

	  ECB.Encryptor = ECB.extend({
	    processBlock: function (words, offset) {
	      this._cipher.encryptBlock(words, offset);
	    }
	  });

	  ECB.Decryptor = ECB.extend({
	    processBlock: function (words, offset) {
	      this._cipher.decryptBlock(words, offset);
	    }
	  });

	  return ECB;
	}());

	module.exports = CryptoJS;


/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = {
		"name": "pubnub",
		"preferGlobal": false,
		"version": "3.14.1",
		"author": "PubNub <support@pubnub.com>",
		"description": "Publish & Subscribe Real-time Messaging with PubNub",
		"contributors": [
			{
				"name": "Stephen Blum",
				"email": "stephen@pubnub.com"
			}
		],
		"bin": {},
		"scripts": {
			"test": "grunt test --force"
		},
		"main": "./node.js/pubnub.js",
		"browser": "./modern/dist/pubnub.js",
		"repository": {
			"type": "git",
			"url": "git://github.com/pubnub/javascript.git"
		},
		"keywords": [
			"cloud",
			"publish",
			"subscribe",
			"websockets",
			"comet",
			"bosh",
			"xmpp",
			"real-time",
			"messaging"
		],
		"dependencies": {
			"agentkeepalive": "~0.2",
			"lodash": "^4.1.0",
			"uuid": "^2.0.1"
		},
		"noAnalyze": false,
		"devDependencies": {
			"babel-core": "^6.5.2",
			"babel-eslint": "^5.0.0",
			"babel-plugin-transform-class-properties": "^6.5.2",
			"babel-plugin-transform-flow-strip-types": "^6.5.0",
			"babel-preset-es2015": "^6.5.0",
			"chai": "^3.5.0",
			"eslint": "^2.2.0",
			"eslint-config-airbnb": "^6.0.2",
			"eslint-plugin-flowtype": "^2.1.0",
			"eslint-plugin-mocha": "^2.0.0",
			"eslint-plugin-react": "^4.1.0",
			"flow-bin": "^0.22.0",
			"grunt": "^0.4.5",
			"grunt-babel": "^6.0.0",
			"grunt-contrib-clean": "^1.0.0",
			"grunt-contrib-copy": "^0.8.2",
			"grunt-contrib-uglify": "^0.11.1",
			"grunt-env": "^0.4.4",
			"grunt-eslint": "^18.0.0",
			"grunt-flow": "^1.0.3",
			"grunt-karma": "^0.12.1",
			"grunt-mocha-istanbul": "^3.0.1",
			"grunt-text-replace": "^0.4.0",
			"grunt-webpack": "^1.0.11",
			"imports-loader": "^0.6.5",
			"isparta": "^4.0.0",
			"json-loader": "^0.5.4",
			"karma": "^0.13.21",
			"karma-chai": "^0.1.0",
			"karma-mocha": "^0.2.1",
			"karma-phantomjs-launcher": "^1.0.0",
			"karma-spec-reporter": "0.0.24",
			"load-grunt-tasks": "^3.4.0",
			"mocha": "^2.4.5",
			"nock": "^1.1.0",
			"node-uuid": "^1.4.7",
			"nodeunit": "^0.9.0",
			"phantomjs-prebuilt": "^2.1.4",
			"proxyquire": "^1.7.4",
			"sinon": "^1.17.2",
			"uglify-js": "^2.6.1",
			"underscore": "^1.7.0",
			"webpack": "^1.12.13",
			"webpack-dev-server": "^1.14.1"
		},
		"bundleDependencies": [],
		"license": "MIT",
		"engine": {
			"node": ">=0.8"
		},
		"files": [
			"core",
			"node.js",
			"modern",
			"CHANGELOG",
			"FUTURE.md",
			"LICENSE",
			"README.md"
		]
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	/* eslint camelcase: 0, no-use-before-define: 0, no-unused-expressions: 0  */
	/* eslint eqeqeq: 0, one-var: 0 */
	/* eslint no-redeclare: 0 */
	/* eslint guard-for-in: 0 */
	/* eslint block-scoped-var: 0 space-return-throw-case: 0, no-unused-vars: 0 */

	var _uuid = __webpack_require__(6);

	var _uuid2 = _interopRequireDefault(_uuid);

	var _networking = __webpack_require__(8);

	var _networking2 = _interopRequireDefault(_networking);

	var _keychain = __webpack_require__(9);

	var _keychain2 = _interopRequireDefault(_keychain);

	var _config = __webpack_require__(12);

	var _config2 = _interopRequireDefault(_config);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var packageJSON = __webpack_require__(4);
	var defaultConfiguration = __webpack_require__(11);
	var utils = __webpack_require__(10);

	var NOW = 1;
	var READY = false;
	var READY_BUFFER = [];
	var PRESENCE_SUFFIX = '-pnpres';
	var DEF_WINDOWING = 10; // MILLISECONDS.
	var DEF_TIMEOUT = 15000; // MILLISECONDS.
	var DEF_SUB_TIMEOUT = 310; // SECONDS.
	var DEF_KEEPALIVE = 60; // SECONDS (FOR TIMESYNC).
	var SECOND = 1000; // A THOUSAND MILLISECONDS.
	var PRESENCE_HB_THRESHOLD = 5;
	var PRESENCE_HB_DEFAULT = 30;
	var SDK_VER = packageJSON.version;

	/**
	 * UTILITIES
	 */
	function unique() {
	  return 'x' + ++NOW + '' + +new Date();
	}

	/**
	 * Generate Subscription Channel List
	 * ==================================
	 * generate_channel_list(channels_object);
	 */
	function generate_channel_list(channels, nopresence) {
	  var list = [];
	  utils.each(channels, function (channel, status) {
	    if (nopresence) {
	      if (channel.search('-pnpres') < 0) {
	        if (status.subscribed) list.push(channel);
	      }
	    } else {
	      if (status.subscribed) list.push(channel);
	    }
	  });
	  return list.sort();
	}

	/**
	 * Generate Subscription Channel Groups List
	 * ==================================
	 * generate_channel_group_list(channels_groups object);
	 */
	function generate_channel_group_list(channel_groups, nopresence) {
	  var list = [];
	  utils.each(channel_groups, function (channel_group, status) {
	    if (nopresence) {
	      if (channel_group.search('-pnpres') < 0) {
	        if (status.subscribed) list.push(channel_group);
	      }
	    } else {
	      if (status.subscribed) list.push(channel_group);
	    }
	  });
	  return list.sort();
	}

	// PUBNUB READY TO CONNECT
	function ready() {
	  if (READY) return;
	  READY = 1;
	  utils.each(READY_BUFFER, function (connect) {
	    connect();
	  });
	}

	function PNmessage(args) {
	  var msg = args || { apns: {} };

	  msg['getPubnubMessage'] = function () {
	    var m = {};

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

	function PN_API(setup) {
	  var xdr = setup.xdr;

	  var db = setup.db || { get: function get() {}, set: function set() {} };

	  var keychain = new _keychain2.default().setInstanceId(_uuid2.default.v4()).setAuthKey(setup.auth_key || '').setSecretKey(setup.secret_key || '').setSubscribeKey(setup.subscribe_key).setPublishKey(setup.publish_key);

	  keychain.setUUID(setup.uuid || !setup.unique_uuid && db.get(keychain.getSubscribeKey() + 'uuid') || _uuid2.default.v4());

	  // write the new key to storage
	  db.set(keychain.getSubscribeKey() + 'uuid', keychain.getUUID());

	  var configComponent = new _config2.default().setRequestIdConfig(setup.use_request_id || false).setInstanceIdConfig(setup.instance_id || false);

	  var networkingComponent = new _networking2.default(setup.xdr, keychain, setup.ssl, setup.origin);

	  var SUB_WINDOWING = +setup['windowing'] || DEF_WINDOWING;
	  var SUB_TIMEOUT = (+setup['timeout'] || DEF_SUB_TIMEOUT) * SECOND;
	  var KEEPALIVE = (+setup['keepalive'] || DEF_KEEPALIVE) * SECOND;
	  var TIME_CHECK = setup['timecheck'] || 0;
	  var NOLEAVE = setup['noleave'] || 0;
	  var hmac_SHA256 = setup['hmac_SHA256'];
	  var SSL = setup['ssl'] ? 's' : '';
	  var CONNECT = function CONNECT() {};
	  var PUB_QUEUE = [];
	  var CLOAK = true;
	  var TIME_DRIFT = 0;
	  var SUB_CALLBACK = 0;
	  var SUB_CHANNEL = 0;
	  var SUB_RECEIVER = 0;
	  var SUB_RESTORE = setup['restore'] || 0;
	  var SUB_BUFF_WAIT = 0;
	  var TIMETOKEN = 0;
	  var RESUMED = false;
	  var CHANNELS = {};
	  var CHANNEL_GROUPS = {};
	  var SUB_ERROR = function SUB_ERROR() {};
	  var STATE = {};
	  var PRESENCE_HB_TIMEOUT = null;
	  var PRESENCE_HB = validate_presence_heartbeat(setup['heartbeat'] || setup['pnexpires'] || 0, setup['error']);
	  var PRESENCE_HB_INTERVAL = setup['heartbeat_interval'] || PRESENCE_HB / 2 - 1;
	  var PRESENCE_HB_RUNNING = false;
	  var NO_WAIT_FOR_PENDING = setup['no_wait_for_pending'];
	  var COMPATIBLE_35 = setup['compatible_3.5'] || false;
	  var params = setup['params'] || {};
	  var _error = setup['error'] || function () {};
	  var _is_online = setup['_is_online'] || function () {
	    return 1;
	  };
	  var jsonp_cb = setup['jsonp_cb'] || function () {
	    return 0;
	  };
	  var CIPHER_KEY = setup['cipher_key'];
	  var _shutdown = setup['shutdown'];
	  var use_send_beacon = typeof setup['use_send_beacon'] != 'undefined' ? setup['use_send_beacon'] : true;
	  var sendBeacon = use_send_beacon ? setup['sendBeacon'] : null;
	  var _poll_timer;
	  var _poll_timer2;

	  if (PRESENCE_HB === 2) PRESENCE_HB_INTERVAL = 1;

	  var crypto_obj = setup['crypto_obj'] || {
	    encrypt: function encrypt(a, key) {
	      return a;
	    },
	    decrypt: function decrypt(b, key) {
	      return b;
	    }
	  };

	  function _get_url_params(data) {
	    if (!data) data = {};
	    utils.each(params, function (key, value) {
	      if (!(key in data)) data[key] = value;
	    });
	    return data;
	  }

	  function _object_to_key_list(o) {
	    var l = [];
	    utils.each(o, function (key, value) {
	      l.push(key);
	    });
	    return l;
	  }

	  function _object_to_key_list_sorted(o) {
	    return _object_to_key_list(o).sort();
	  }

	  function _get_pam_sign_input_from_params(params) {
	    var si = '';
	    var l = _object_to_key_list_sorted(params);

	    for (var i in l) {
	      var k = l[i];
	      si += k + '=' + utils.pamEncode(params[k]);
	      if (i != l.length - 1) si += '&';
	    }
	    return si;
	  }

	  function validate_presence_heartbeat(heartbeat, cur_heartbeat, error) {
	    var err = false;

	    if (typeof heartbeat === 'undefined') {
	      return cur_heartbeat;
	    }

	    if (typeof heartbeat === 'number') {
	      if (heartbeat > PRESENCE_HB_THRESHOLD || heartbeat == 0) {
	        err = false;
	      } else {
	        err = true;
	      }
	    } else if (typeof heartbeat === 'boolean') {
	      if (!heartbeat) {
	        return 0;
	      } else {
	        return PRESENCE_HB_DEFAULT;
	      }
	    } else {
	      err = true;
	    }

	    if (err) {
	      error && error('Presence Heartbeat value invalid. Valid range ( x > ' + PRESENCE_HB_THRESHOLD + ' or x = 0). Current Value : ' + (cur_heartbeat || PRESENCE_HB_THRESHOLD));
	      return cur_heartbeat || PRESENCE_HB_THRESHOLD;
	    } else return heartbeat;
	  }

	  function encrypt(input, key) {
	    return crypto_obj['encrypt'](input, key || CIPHER_KEY) || input;
	  }

	  function decrypt(input, key) {
	    return crypto_obj['decrypt'](input, key || CIPHER_KEY) || crypto_obj['decrypt'](input, CIPHER_KEY) || input;
	  }

	  function error_common(message, callback) {
	    callback && callback({ error: message || 'error occurred' });
	    _error && _error(message);
	  }

	  function _presence_heartbeat() {
	    clearTimeout(PRESENCE_HB_TIMEOUT);

	    if (!PRESENCE_HB_INTERVAL || PRESENCE_HB_INTERVAL >= 500 || PRESENCE_HB_INTERVAL < 1 || !generate_channel_list(CHANNELS, true).length && !generate_channel_group_list(CHANNEL_GROUPS, true).length) {
	      PRESENCE_HB_RUNNING = false;
	      return;
	    }

	    PRESENCE_HB_RUNNING = true;
	    SELF['presence_heartbeat']({
	      callback: function callback(r) {
	        PRESENCE_HB_TIMEOUT = utils.timeout(_presence_heartbeat, PRESENCE_HB_INTERVAL * SECOND);
	      },
	      error: function error(e) {
	        _error && _error('Presence Heartbeat unable to reach Pubnub servers.' + JSON.stringify(e));
	        PRESENCE_HB_TIMEOUT = utils.timeout(_presence_heartbeat, PRESENCE_HB_INTERVAL * SECOND);
	      }
	    });
	  }

	  function start_presence_heartbeat() {
	    !PRESENCE_HB_RUNNING && _presence_heartbeat();
	  }

	  function _publish(next) {
	    if (NO_WAIT_FOR_PENDING) {
	      if (!PUB_QUEUE.length) return;
	    } else {
	      if (next) PUB_QUEUE.sending = 0;
	      if (PUB_QUEUE.sending || !PUB_QUEUE.length) return;
	      PUB_QUEUE.sending = 1;
	    }

	    xdr(PUB_QUEUE.shift());
	  }

	  function each_channel_group(callback) {
	    var count = 0;

	    utils.each(generate_channel_group_list(CHANNEL_GROUPS), function (channel_group) {
	      var chang = CHANNEL_GROUPS[channel_group];

	      if (!chang) return;

	      count++;
	      (callback || function () {})(chang);
	    });

	    return count;
	  }

	  function each_channel(callback) {
	    var count = 0;

	    utils.each(generate_channel_list(CHANNELS), function (channel) {
	      var chan = CHANNELS[channel];

	      if (!chan) return;

	      count++;
	      (callback || function () {})(chan);
	    });

	    return count;
	  }

	  function _invoke_callback(response, callback, err) {
	    if ((typeof response === 'undefined' ? 'undefined' : _typeof(response)) == 'object') {
	      if (response['error']) {
	        var callback_data = {};

	        if (response['message']) {
	          callback_data['message'] = response['message'];
	        }

	        if (response['payload']) {
	          callback_data['payload'] = response['payload'];
	        }

	        err && err(callback_data);
	        return;
	      }
	      if (response['payload']) {
	        if (response['next_page']) {
	          callback && callback(response['payload'], response['next_page']);
	        } else {
	          callback && callback(response['payload']);
	        }
	        return;
	      }
	    }
	    callback && callback(response);
	  }

	  function _invoke_error(response, err) {
	    if ((typeof response === 'undefined' ? 'undefined' : _typeof(response)) == 'object' && response['error']) {
	      var callback_data = {};

	      if (response['message']) {
	        callback_data['message'] = response['message'];
	      }

	      if (response['payload']) {
	        callback_data['payload'] = response['payload'];
	      }

	      err && err(callback_data);
	      return;
	    } else {
	      err && err(response);
	    }
	  }

	  function CR(args, callback, url1, data) {
	    var callback = args['callback'] || callback;
	    var err = args['error'] || _error;
	    var jsonp = jsonp_cb();

	    data = data || {};

	    if (!data['auth']) {
	      data['auth'] = args['auth_key'] || keychain.getAuthKey();
	    }

	    var url = [networkingComponent.getStandardOrigin(), 'v1', 'channel-registration', 'sub-key', keychain.getSubscribeKey()];

	    url.push.apply(url, url1);

	    if (jsonp) data['callback'] = jsonp;

	    xdr({
	      callback: jsonp,
	      data: _get_url_params(data),
	      success: function success(response) {
	        _invoke_callback(response, callback, err);
	      },
	      fail: function fail(response) {
	        _invoke_error(response, err);
	      },
	      url: url
	    });
	  }

	  // Announce Leave Event
	  var SELF = {
	    LEAVE: function LEAVE(channel, blocking, auth_key, callback, error) {
	      var data = { uuid: keychain.getUUID(), auth: auth_key || keychain.getAuthKey() };
	      var origin = networkingComponent.nextOrigin(false);
	      var callback = callback || function () {};
	      var err = error || function () {};
	      var url;
	      var params;
	      var jsonp = jsonp_cb();

	      // Prevent Leaving a Presence Channel
	      if (channel.indexOf(PRESENCE_SUFFIX) > 0) return true;

	      if (COMPATIBLE_35) {
	        if (!SSL) return false;
	        if (jsonp == '0') return false;
	      }

	      if (NOLEAVE) return false;

	      if (jsonp != '0') data['callback'] = jsonp;

	      if (configComponent.isInstanceIdEnabled()) {
	        data['instanceid'] = keychain.getInstanceId();
	      }

	      url = [origin, 'v2', 'presence', 'sub_key', keychain.getSubscribeKey(), 'channel', utils.encode(channel), 'leave'];

	      params = _get_url_params(data);

	      if (sendBeacon) {
	        var url_string = utils.buildURL(url, params);
	        if (sendBeacon(url_string)) {
	          callback && callback({ status: 200, action: 'leave', message: 'OK', service: 'Presence' });
	          return true;
	        }
	      }

	      xdr({
	        blocking: blocking || SSL,
	        callback: jsonp,
	        data: params,
	        success: function success(response) {
	          _invoke_callback(response, callback, err);
	        },
	        fail: function fail(response) {
	          _invoke_error(response, err);
	        },
	        url: url
	      });
	      return true;
	    },

	    LEAVE_GROUP: function LEAVE_GROUP(channel_group, blocking, auth_key, callback, error) {
	      var data = { uuid: keychain.getUUID(), auth: auth_key || keychain.getAuthKey() };
	      var origin = networkingComponent.nextOrigin(false);
	      var url;
	      var params;
	      var callback = callback || function () {};
	      var err = error || function () {};
	      var jsonp = jsonp_cb();

	      // Prevent Leaving a Presence Channel Group
	      if (channel_group.indexOf(PRESENCE_SUFFIX) > 0) return true;

	      if (COMPATIBLE_35) {
	        if (!SSL) return false;
	        if (jsonp == '0') return false;
	      }

	      if (NOLEAVE) return false;

	      if (jsonp != '0') data['callback'] = jsonp;

	      if (channel_group && channel_group.length > 0) data['channel-group'] = channel_group;

	      if (configComponent.isInstanceIdEnabled()) {
	        data['instanceid'] = keychain.getInstanceId();
	      }

	      url = [origin, 'v2', 'presence', 'sub_key', keychain.getSubscribeKey(), 'channel', utils.encode(','), 'leave'];

	      params = _get_url_params(data);

	      if (sendBeacon) {
	        var url_string = utils.buildURL(url, params);
	        if (sendBeacon(url_string)) {
	          callback && callback({ status: 200, action: 'leave', message: 'OK', service: 'Presence' });
	          return true;
	        }
	      }

	      xdr({
	        blocking: blocking || SSL,
	        callback: jsonp,
	        data: params,
	        success: function success(response) {
	          _invoke_callback(response, callback, err);
	        },
	        fail: function fail(response) {
	          _invoke_error(response, err);
	        },
	        url: url
	      });
	      return true;
	    },

	    set_resumed: function set_resumed(resumed) {
	      RESUMED = resumed;
	    },

	    get_cipher_key: function get_cipher_key() {
	      return CIPHER_KEY;
	    },

	    set_cipher_key: function set_cipher_key(key) {
	      CIPHER_KEY = key;
	    },

	    raw_encrypt: function raw_encrypt(input, key) {
	      return encrypt(input, key);
	    },

	    raw_decrypt: function raw_decrypt(input, key) {
	      return decrypt(input, key);
	    },

	    get_heartbeat: function get_heartbeat() {
	      return PRESENCE_HB;
	    },

	    set_heartbeat: function set_heartbeat(heartbeat, heartbeat_interval) {
	      PRESENCE_HB = validate_presence_heartbeat(heartbeat, PRESENCE_HB, _error);
	      PRESENCE_HB_INTERVAL = heartbeat_interval || PRESENCE_HB / 2 - 1;
	      if (PRESENCE_HB == 2) {
	        PRESENCE_HB_INTERVAL = 1;
	      }
	      CONNECT();
	      _presence_heartbeat();
	    },

	    get_heartbeat_interval: function get_heartbeat_interval() {
	      return PRESENCE_HB_INTERVAL;
	    },

	    set_heartbeat_interval: function set_heartbeat_interval(heartbeat_interval) {
	      PRESENCE_HB_INTERVAL = heartbeat_interval;
	      _presence_heartbeat();
	    },

	    get_version: function get_version() {
	      return SDK_VER;
	    },

	    getGcmMessageObject: function getGcmMessageObject(obj) {
	      return {
	        data: obj
	      };
	    },

	    getApnsMessageObject: function getApnsMessageObject(obj) {
	      var x = {
	        aps: { badge: 1, alert: '' }
	      };
	      for (var k in obj) {
	        k[x] = obj[k];
	      }
	      return x;
	    },

	    _add_param: function _add_param(key, val) {
	      params[key] = val;
	    },

	    channel_group: function channel_group(args, callback) {
	      var ns_ch = args['channel_group'];
	      var callback = callback || args['callback'];
	      var channels = args['channels'] || args['channel'];
	      var cloak = args['cloak'];
	      var namespace;
	      var channel_group;
	      var url = [];
	      var data = {};
	      var mode = args['mode'] || 'add';

	      if (ns_ch) {
	        var ns_ch_a = ns_ch.split(':');

	        if (ns_ch_a.length > 1) {
	          namespace = ns_ch_a[0] === '*' ? null : ns_ch_a[0];

	          channel_group = ns_ch_a[1];
	        } else {
	          channel_group = ns_ch_a[0];
	        }
	      }

	      namespace && url.push('namespace') && url.push(utils.encode(namespace));

	      url.push('channel-group');

	      if (channel_group && channel_group !== '*') {
	        url.push(channel_group);
	      }

	      if (channels) {
	        if (utils.isArray(channels)) {
	          channels = channels.join(',');
	        }
	        data[mode] = channels;
	        data['cloak'] = CLOAK ? 'true' : 'false';
	      } else {
	        if (mode === 'remove') url.push('remove');
	      }

	      if (typeof cloak != 'undefined') data['cloak'] = cloak ? 'true' : 'false';

	      CR(args, callback, url, data);
	    },

	    channel_group_list_groups: function channel_group_list_groups(args, callback) {
	      var namespace;

	      namespace = args['namespace'] || args['ns'] || args['channel_group'] || null;
	      if (namespace) {
	        args['channel_group'] = namespace + ':*';
	      }

	      SELF['channel_group'](args, callback);
	    },

	    channel_group_list_channels: function channel_group_list_channels(args, callback) {
	      if (!args['channel_group']) return _error('Missing Channel Group');
	      SELF['channel_group'](args, callback);
	    },

	    channel_group_remove_channel: function channel_group_remove_channel(args, callback) {
	      if (!args['channel_group']) return _error('Missing Channel Group');
	      if (!args['channel'] && !args['channels']) return _error('Missing Channel');

	      args['mode'] = 'remove';
	      SELF['channel_group'](args, callback);
	    },

	    channel_group_remove_group: function channel_group_remove_group(args, callback) {
	      if (!args['channel_group']) return _error('Missing Channel Group');
	      if (args['channel']) return _error('Use channel_group_remove_channel if you want to remove a channel from a group.');

	      args['mode'] = 'remove';
	      SELF['channel_group'](args, callback);
	    },

	    channel_group_add_channel: function channel_group_add_channel(args, callback) {
	      if (!args['channel_group']) return _error('Missing Channel Group');
	      if (!args['channel'] && !args['channels']) return _error('Missing Channel');
	      SELF['channel_group'](args, callback);
	    },

	    channel_group_cloak: function channel_group_cloak(args, callback) {
	      if (typeof args['cloak'] == 'undefined') {
	        callback(CLOAK);
	        return;
	      }
	      CLOAK = args['cloak'];
	      SELF['channel_group'](args, callback);
	    },

	    channel_group_list_namespaces: function channel_group_list_namespaces(args, callback) {
	      var url = ['namespace'];
	      CR(args, callback, url);
	    },

	    channel_group_remove_namespace: function channel_group_remove_namespace(args, callback) {
	      var url = ['namespace', args['namespace'], 'remove'];
	      CR(args, callback, url);
	    },

	    /*
	     PUBNUB.history({
	     channel  : 'my_chat_channel',
	     limit    : 100,
	     callback : function(history) { }
	     });
	     */
	    history: function history(args, callback) {
	      var callback = args['callback'] || callback;
	      var count = args['count'] || args['limit'] || 100;
	      var reverse = args['reverse'] || 'false';
	      var err = args['error'] || function () {};
	      var auth_key = args['auth_key'] || keychain.getAuthKey();
	      var cipher_key = args['cipher_key'];
	      var channel = args['channel'];
	      var channel_group = args['channel_group'];
	      var start = args['start'];
	      var end = args['end'];
	      var include_token = args['include_token'];
	      var string_msg_token = args['string_message_token'] || false;
	      var params = {};
	      var jsonp = jsonp_cb();

	      // Make sure we have a Channel
	      if (!channel && !channel_group) return _error('Missing Channel');
	      if (!callback) return _error('Missing Callback');
	      if (!keychain.getSubscribeKey()) return _error('Missing Subscribe Key');

	      params['stringtoken'] = 'true';
	      params['count'] = count;
	      params['reverse'] = reverse;
	      params['auth'] = auth_key;

	      if (channel_group) {
	        params['channel-group'] = channel_group;
	        if (!channel) {
	          channel = ',';
	        }
	      }
	      if (jsonp) params['callback'] = jsonp;
	      if (start) params['start'] = start;
	      if (end) params['end'] = end;
	      if (include_token) params['include_token'] = 'true';
	      if (string_msg_token) params['string_message_token'] = 'true';

	      // Send Message
	      networkingComponent.fetchHistory(channel, {
	        callback: jsonp,
	        data: _get_url_params(params),
	        success: function success(response) {
	          if ((typeof response === 'undefined' ? 'undefined' : _typeof(response)) == 'object' && response['error']) {
	            err({ message: response['message'], payload: response['payload'] });
	            return;
	          }
	          var messages = response[0];
	          var decrypted_messages = [];
	          for (var a = 0; a < messages.length; a++) {
	            if (include_token) {
	              var new_message = decrypt(messages[a]['message'], cipher_key);
	              var timetoken = messages[a]['timetoken'];
	              try {
	                decrypted_messages.push({ message: JSON.parse(new_message), timetoken: timetoken });
	              } catch (e) {
	                decrypted_messages.push({ message: new_message, timetoken: timetoken });
	              }
	            } else {
	              var new_message = decrypt(messages[a], cipher_key);
	              try {
	                decrypted_messages.push(JSON.parse(new_message));
	              } catch (e) {
	                decrypted_messages.push(new_message);
	              }
	            }
	          }
	          callback([decrypted_messages, response[1], response[2]]);
	        },
	        fail: function fail(response) {
	          _invoke_error(response, err);
	        }
	      });
	    },

	    /*
	     PUBNUB.replay({
	     source      : 'my_channel',
	     destination : 'new_channel'
	     });
	     */
	    replay: function replay(args, callback) {
	      var callback = callback || args['callback'] || function () {};
	      var auth_key = args['auth_key'] || keychain.getAuthKey();
	      var source = args['source'];
	      var destination = args['destination'];
	      var err = args['error'] || args['error'] || function () {};
	      var stop = args['stop'];
	      var start = args['start'];
	      var end = args['end'];
	      var reverse = args['reverse'];
	      var limit = args['limit'];
	      var jsonp = jsonp_cb();
	      var data = {};
	      var url;

	      // Check User Input
	      if (!source) return _error('Missing Source Channel');
	      if (!destination) return _error('Missing Destination Channel');
	      if (!keychain.getPublishKey()) return _error('Missing Publish Key');
	      if (!keychain.getSubscribeKey()) return _error('Missing Subscribe Key');

	      // Setup URL Params
	      if (jsonp != '0') data['callback'] = jsonp;
	      if (stop) data['stop'] = 'all';
	      if (reverse) data['reverse'] = 'true';
	      if (start) data['start'] = start;
	      if (end) data['end'] = end;
	      if (limit) data['count'] = limit;

	      data['auth'] = auth_key;

	      // Start (or Stop) Replay!
	      networkingComponent.fetchReplay(source, destination, {
	        callback: jsonp,
	        success: function success(response) {
	          _invoke_callback(response, callback, err);
	        },
	        fail: function fail() {
	          callback([0, 'Disconnected']);
	        },
	        data: _get_url_params(data)
	      });
	    },

	    /*
	     PUBNUB.auth('AJFLKAJSDKLA');
	     */
	    auth: function auth(_auth) {
	      keychain.setAuthKey(_auth);
	      CONNECT();
	    },

	    /*
	     PUBNUB.time(function(time){ });
	     */
	    time: function time(callback) {
	      var jsonp = jsonp_cb();

	      var data = { uuid: keychain.getUUID(), auth: keychain.getAuthKey() };

	      if (configComponent.isInstanceIdEnabled()) {
	        data['instanceid'] = keychain.getInstanceId();
	      }

	      networkingComponent.fetchTime(jsonp, {
	        callback: jsonp,
	        data: _get_url_params(data),
	        success: function success(response) {
	          callback(response[0]);
	        },
	        fail: function fail() {
	          callback(0);
	        }
	      });
	    },

	    /*
	     PUBNUB.publish({
	     channel : 'my_chat_channel',
	     message : 'hello!'
	     });
	     */
	    publish: function publish(args, callback) {
	      var msg = args['message'];
	      if (!msg) return _error('Missing Message');

	      var callback = callback || args['callback'] || msg['callback'] || args['success'] || function () {};
	      var channel = args['channel'] || msg['channel'];
	      var auth_key = args['auth_key'] || keychain.getAuthKey();
	      var cipher_key = args['cipher_key'];
	      var err = args['error'] || msg['error'] || function () {};
	      var post = args['post'] || false;
	      var store = 'store_in_history' in args ? args['store_in_history'] : true;
	      var jsonp = jsonp_cb();
	      var add_msg = 'push';
	      var params = { uuid: keychain.getUUID(), auth: auth_key };
	      var url;

	      if (args['prepend']) add_msg = 'unshift';

	      if (!channel) return _error('Missing Channel');
	      if (!keychain.getPublishKey()) return _error('Missing Publish Key');
	      if (!keychain.getSubscribeKey()) return _error('Missing Subscribe Key');

	      if (msg['getPubnubMessage']) {
	        msg = msg['getPubnubMessage']();
	      }

	      // If trying to send Object
	      msg = JSON.stringify(encrypt(msg, cipher_key));

	      // Create URL
	      url = [networkingComponent.getStandardOrigin(), 'publish', keychain.getPublishKey(), keychain.getSubscribeKey(), 0, utils.encode(channel), jsonp, utils.encode(msg)];

	      if (!store) params['store'] = '0';

	      if (configComponent.isInstanceIdEnabled()) {
	        params['instanceid'] = keychain.getInstanceId();
	      }

	      // Queue Message Send
	      PUB_QUEUE[add_msg]({
	        callback: jsonp,
	        url: url,
	        data: _get_url_params(params),
	        fail: function fail(response) {
	          _invoke_error(response, err);
	          _publish(1);
	        },
	        success: function success(response) {
	          _invoke_callback(response, callback, err);
	          _publish(1);
	        },
	        mode: post ? 'POST' : 'GET'
	      });

	      // Send Message
	      _publish();
	    },

	    /*
	     PUBNUB.unsubscribe({ channel : 'my_chat' });
	     */
	    unsubscribe: function unsubscribe(args, callback) {
	      var channelArg = args['channel'];
	      var channelGroupArg = args['channel_group'];
	      var auth_key = args['auth_key'] || keychain.getAuthKey();
	      var callback = callback || args['callback'] || function () {};
	      var err = args['error'] || function () {};

	      TIMETOKEN = 0;
	      SUB_RESTORE = 1; // REVISIT !!!!

	      if (!channelArg && !channelGroupArg) return _error('Missing Channel or Channel Group');
	      if (!keychain.getSubscribeKey()) return _error('Missing Subscribe Key');

	      if (channelArg) {
	        var channels = utils.isArray(channelArg) ? channelArg : ('' + channelArg).split(',');
	        var existingChannels = [];
	        var presenceChannels = [];

	        utils.each(channels, function (channel) {
	          if (CHANNELS[channel]) existingChannels.push(channel);
	        });

	        // if we do not have any channels to unsubscribe from, trigger a callback.
	        if (existingChannels.length == 0) {
	          callback({ action: 'leave' });
	          return;
	        }

	        // Prepare presence channels
	        utils.each(existingChannels, function (channel) {
	          presenceChannels.push(channel + PRESENCE_SUFFIX);
	        });

	        utils.each(existingChannels.concat(presenceChannels), function (channel) {
	          if (channel in CHANNELS) CHANNELS[channel] = 0;
	          if (channel in STATE) delete STATE[channel];
	        });

	        var CB_CALLED = true;
	        if (READY) {
	          CB_CALLED = SELF['LEAVE'](existingChannels.join(','), 0, auth_key, callback, err);
	        }
	        if (!CB_CALLED) callback({ action: 'leave' });
	      }

	      if (channelGroupArg) {
	        var channelGroups = utils.isArray(channelGroupArg) ? channelGroupArg : ('' + channelGroupArg).split(',');
	        var existingChannelGroups = [];
	        var presenceChannelGroups = [];

	        utils.each(channelGroups, function (channelGroup) {
	          if (CHANNEL_GROUPS[channelGroup]) existingChannelGroups.push(channelGroup);
	        });

	        // if we do not have any channel groups to unsubscribe from, trigger a callback.
	        if (existingChannelGroups.length == 0) {
	          callback({ action: 'leave' });
	          return;
	        }

	        // Prepare presence channels
	        utils.each(existingChannelGroups, function (channelGroup) {
	          presenceChannelGroups.push(channelGroup + PRESENCE_SUFFIX);
	        });

	        utils.each(existingChannelGroups.concat(presenceChannelGroups), function (channelGroup) {
	          if (channelGroup in CHANNEL_GROUPS) CHANNEL_GROUPS[channelGroup] = 0;
	          if (channelGroup in STATE) delete STATE[channelGroup];
	        });

	        var CB_CALLED = true;
	        if (READY) {
	          CB_CALLED = SELF['LEAVE_GROUP'](existingChannelGroups.join(','), 0, auth_key, callback, err);
	        }
	        if (!CB_CALLED) callback({ action: 'leave' });
	      }

	      // Reset Connection if Count Less
	      CONNECT();
	    },

	    /*
	     PUBNUB.subscribe({
	     channel  : 'my_chat'
	     callback : function(message) { }
	     });
	     */
	    subscribe: function subscribe(args, callback) {
	      var channel = args['channel'];
	      var channel_group = args['channel_group'];
	      var callback = callback || args['callback'];
	      var callback = callback || args['message'];
	      var connect = args['connect'] || function () {};
	      var reconnect = args['reconnect'] || function () {};
	      var disconnect = args['disconnect'] || function () {};
	      var SUB_ERROR = args['error'] || SUB_ERROR || function () {};
	      var idlecb = args['idle'] || function () {};
	      var presence = args['presence'] || 0;
	      var noheresync = args['noheresync'] || 0;
	      var backfill = args['backfill'] || 0;
	      var timetoken = args['timetoken'] || 0;
	      var sub_timeout = args['timeout'] || SUB_TIMEOUT;
	      var windowing = args['windowing'] || SUB_WINDOWING;
	      var state = args['state'];
	      var heartbeat = args['heartbeat'] || args['pnexpires'];
	      var heartbeat_interval = args['heartbeat_interval'];
	      var restore = args['restore'] || SUB_RESTORE;

	      keychain.setAuthKey(args['auth_key'] || keychain.getAuthKey());

	      // Restore Enabled?
	      SUB_RESTORE = restore;

	      // Always Reset the TT
	      TIMETOKEN = timetoken;

	      // Make sure we have a Channel
	      if (!channel && !channel_group) {
	        return _error('Missing Channel');
	      }

	      if (!callback) return _error('Missing Callback');
	      if (!keychain.getSubscribeKey()) return _error('Missing Subscribe Key');

	      if (heartbeat || heartbeat === 0 || heartbeat_interval || heartbeat_interval === 0) {
	        SELF['set_heartbeat'](heartbeat, heartbeat_interval);
	      }

	      // Setup Channel(s)
	      if (channel) {
	        utils.each((channel.join ? channel.join(',') : '' + channel).split(','), function (channel) {
	          var settings = CHANNELS[channel] || {};

	          // Store Channel State
	          CHANNELS[SUB_CHANNEL = channel] = {
	            name: channel,
	            connected: settings.connected,
	            disconnected: settings.disconnected,
	            subscribed: 1,
	            callback: SUB_CALLBACK = callback,
	            cipher_key: args['cipher_key'],
	            connect: connect,
	            disconnect: disconnect,
	            reconnect: reconnect
	          };

	          if (state) {
	            if (channel in state) {
	              STATE[channel] = state[channel];
	            } else {
	              STATE[channel] = state;
	            }
	          }

	          // Presence Enabled?
	          if (!presence) return;

	          // Subscribe Presence Channel
	          SELF['subscribe']({
	            channel: channel + PRESENCE_SUFFIX,
	            callback: presence,
	            restore: restore
	          });

	          // Presence Subscribed?
	          if (settings.subscribed) return;

	          // See Who's Here Now?
	          if (noheresync) return;
	          SELF['here_now']({
	            channel: channel,
	            data: _get_url_params({ uuid: keychain.getUUID(), auth: keychain.getAuthKey() }),
	            callback: function callback(here) {
	              utils.each('uuids' in here ? here['uuids'] : [], function (uid) {
	                presence({
	                  action: 'join',
	                  uuid: uid,
	                  timestamp: Math.floor(utils.rnow() / 1000),
	                  occupancy: here['occupancy'] || 1
	                }, here, channel);
	              });
	            }
	          });
	        });
	      }

	      // Setup Channel Groups
	      if (channel_group) {
	        utils.each((channel_group.join ? channel_group.join(',') : '' + channel_group).split(','), function (channel_group) {
	          var settings = CHANNEL_GROUPS[channel_group] || {};

	          CHANNEL_GROUPS[channel_group] = {
	            name: channel_group,
	            connected: settings.connected,
	            disconnected: settings.disconnected,
	            subscribed: 1,
	            callback: SUB_CALLBACK = callback,
	            cipher_key: args['cipher_key'],
	            connect: connect,
	            disconnect: disconnect,
	            reconnect: reconnect
	          };

	          // Presence Enabled?
	          if (!presence) return;

	          // Subscribe Presence Channel
	          SELF['subscribe']({
	            channel_group: channel_group + PRESENCE_SUFFIX,
	            callback: presence,
	            restore: restore,
	            auth_key: keychain.getAuthKey()
	          });

	          // Presence Subscribed?
	          if (settings.subscribed) return;

	          // See Who's Here Now?
	          if (noheresync) return;
	          SELF['here_now']({
	            channel_group: channel_group,
	            data: _get_url_params({ uuid: keychain.getUUID(), auth: keychain.getAuthKey() }),
	            callback: function callback(here) {
	              utils.each('uuids' in here ? here['uuids'] : [], function (uid) {
	                presence({
	                  action: 'join',
	                  uuid: uid,
	                  timestamp: Math.floor(utils.rnow() / 1000),
	                  occupancy: here['occupancy'] || 1
	                }, here, channel_group);
	              });
	            }
	          });
	        });
	      }

	      // Test Network Connection
	      function _test_connection(success) {
	        if (success) {
	          // Begin Next Socket Connection
	          utils.timeout(CONNECT, windowing);
	        } else {
	          // New Origin on Failed Connection
	          networkingComponent.shiftStandardOrigin(true);
	          networkingComponent.shiftSubscribeOrigin(true);

	          // Re-test Connection
	          utils.timeout(function () {
	            SELF['time'](_test_connection);
	          }, SECOND);
	        }

	        // Disconnect & Reconnect
	        each_channel(function (channel) {
	          // Reconnect
	          if (success && channel.disconnected) {
	            channel.disconnected = 0;
	            return channel.reconnect(channel.name);
	          }

	          // Disconnect
	          if (!success && !channel.disconnected) {
	            channel.disconnected = 1;
	            channel.disconnect(channel.name);
	          }
	        });

	        // Disconnect & Reconnect for channel groups
	        each_channel_group(function (channel_group) {
	          // Reconnect
	          if (success && channel_group.disconnected) {
	            channel_group.disconnected = 0;
	            return channel_group.reconnect(channel_group.name);
	          }

	          // Disconnect
	          if (!success && !channel_group.disconnected) {
	            channel_group.disconnected = 1;
	            channel_group.disconnect(channel_group.name);
	          }
	        });
	      }

	      // Evented Subscribe
	      function _connect() {
	        var jsonp = jsonp_cb();
	        var channels = generate_channel_list(CHANNELS).join(',');
	        var channel_groups = generate_channel_group_list(CHANNEL_GROUPS).join(',');

	        // Stop Connection
	        if (!channels && !channel_groups) return;

	        if (!channels) channels = ',';

	        // Connect to PubNub Subscribe Servers
	        _reset_offline();

	        var data = _get_url_params({ uuid: keychain.getUUID(), auth: keychain.getAuthKey() });

	        if (channel_groups) {
	          data['channel-group'] = channel_groups;
	        }

	        var st = JSON.stringify(STATE);
	        if (st.length > 2) data['state'] = JSON.stringify(STATE);

	        if (PRESENCE_HB) data['heartbeat'] = PRESENCE_HB;

	        if (configComponent.isInstanceIdEnabled()) {
	          data['instanceid'] = keychain.getInstanceId();
	        }

	        start_presence_heartbeat();
	        SUB_RECEIVER = xdr({
	          timeout: sub_timeout,
	          callback: jsonp,
	          fail: function fail(response) {
	            if (response && response['error'] && response['service']) {
	              _invoke_error(response, SUB_ERROR);
	              _test_connection(false);
	            } else {
	              SELF['time'](function (success) {
	                !success && _invoke_error(response, SUB_ERROR);
	                _test_connection(success);
	              });
	            }
	          },
	          data: _get_url_params(data),
	          url: [networkingComponent.getSubscribeOrigin(), 'subscribe', keychain.getSubscribeKey(), utils.encode(channels), jsonp, TIMETOKEN],
	          success: function success(messages) {
	            // Check for Errors
	            if (!messages || (typeof messages === 'undefined' ? 'undefined' : _typeof(messages)) == 'object' && 'error' in messages && messages['error']) {
	              SUB_ERROR(messages);
	              return utils.timeout(CONNECT, SECOND);
	            }

	            // User Idle Callback
	            idlecb(messages[1]);

	            // Restore Previous Connection Point if Needed
	            TIMETOKEN = !TIMETOKEN && SUB_RESTORE && db['get'](keychain.getSubscribeKey()) || messages[1];

	            /*
	             // Connect
	             each_channel_registry(function(registry){
	             if (registry.connected) return;
	             registry.connected = 1;
	             registry.connect(channel.name);
	             });
	             */

	            // Connect
	            each_channel(function (channel) {
	              if (channel.connected) return;
	              channel.connected = 1;
	              channel.connect(channel.name);
	            });

	            // Connect for channel groups
	            each_channel_group(function (channel_group) {
	              if (channel_group.connected) return;
	              channel_group.connected = 1;
	              channel_group.connect(channel_group.name);
	            });

	            if (RESUMED && !SUB_RESTORE) {
	              TIMETOKEN = 0;
	              RESUMED = false;
	              // Update Saved Timetoken
	              db['set'](keychain.getSubscribeKey(), 0);
	              utils.timeout(_connect, windowing);
	              return;
	            }

	            // Invoke Memory Catchup and Receive Up to 100
	            // Previous Messages from the Queue.
	            if (backfill) {
	              TIMETOKEN = 10000;
	              backfill = 0;
	            }

	            // Update Saved Timetoken
	            db['set'](keychain.getSubscribeKey(), messages[1]);

	            // Route Channel <---> Callback for Message
	            var next_callback = function () {
	              var channels = '';
	              var channels2 = '';

	              if (messages.length > 3) {
	                channels = messages[3];
	                channels2 = messages[2];
	              } else if (messages.length > 2) {
	                channels = messages[2];
	              } else {
	                channels = utils.map(generate_channel_list(CHANNELS), function (chan) {
	                  return utils.map(Array(messages[0].length).join(',').split(','), function () {
	                    return chan;
	                  });
	                }).join(',');
	              }

	              var list = channels.split(',');
	              var list2 = channels2 ? channels2.split(',') : [];

	              return function () {
	                var channel = list.shift() || SUB_CHANNEL;
	                var channel2 = list2.shift();

	                var chobj = {};

	                if (channel2) {
	                  if (channel && channel.indexOf('-pnpres') >= 0 && channel2.indexOf('-pnpres') < 0) {
	                    channel2 += '-pnpres';
	                  }
	                  chobj = CHANNEL_GROUPS[channel2] || CHANNELS[channel2] || { callback: function callback() {} };
	                } else {
	                  chobj = CHANNELS[channel];
	                }

	                var r = [chobj.callback || SUB_CALLBACK, channel.split(PRESENCE_SUFFIX)[0]];
	                channel2 && r.push(channel2.split(PRESENCE_SUFFIX)[0]);
	                return r;
	              };
	            }();

	            var latency = detect_latency(+messages[1]);
	            utils.each(messages[0], function (msg) {
	              var next = next_callback();
	              var decrypted_msg = decrypt(msg, CHANNELS[next[1]] ? CHANNELS[next[1]]['cipher_key'] : null);
	              next[0] && next[0](decrypted_msg, messages, next[2] || next[1], latency, next[1]);
	            });

	            utils.timeout(_connect, windowing);
	          }
	        });
	      }

	      CONNECT = function CONNECT() {
	        _reset_offline();
	        utils.timeout(_connect, windowing);
	      };

	      // Reduce Status Flicker
	      if (!READY) return READY_BUFFER.push(CONNECT);

	      // Connect Now
	      CONNECT();
	    },

	    /*
	     PUBNUB.here_now({ channel : 'my_chat', callback : fun });
	     */
	    here_now: function here_now(args, callback) {
	      var callback = args['callback'] || callback;
	      var debug = args['debug'];
	      var err = args['error'] || function () {};
	      var auth_key = args['auth_key'] || keychain.getAuthKey();
	      var channel = args['channel'];
	      var channel_group = args['channel_group'];
	      var jsonp = jsonp_cb();
	      var uuids = 'uuids' in args ? args['uuids'] : true;
	      var state = args['state'];
	      var data = { uuid: keychain.getUUID(), auth: auth_key };

	      if (!uuids) data['disable_uuids'] = 1;
	      if (state) data['state'] = 1;

	      // Make sure we have a Channel
	      if (!callback) return _error('Missing Callback');
	      if (!keychain.getSubscribeKey()) return _error('Missing Subscribe Key');

	      var url = [networkingComponent.getStandardOrigin(), 'v2', 'presence', 'sub_key', keychain.getSubscribeKey()];

	      channel && url.push('channel') && url.push(utils.encode(channel));

	      if (jsonp != '0') {
	        data['callback'] = jsonp;
	      }

	      if (channel_group) {
	        data['channel-group'] = channel_group;
	        !channel && url.push('channel') && url.push(',');
	      }

	      if (configComponent.isInstanceIdEnabled()) {
	        data['instanceid'] = keychain.getInstanceId();
	      }

	      xdr({
	        callback: jsonp,
	        data: _get_url_params(data),
	        success: function success(response) {
	          _invoke_callback(response, callback, err);
	        },
	        fail: function fail(response) {
	          _invoke_error(response, err);
	        },
	        debug: debug,
	        url: url
	      });
	    },

	    /*
	     PUBNUB.current_channels_by_uuid({ channel : 'my_chat', callback : fun });
	     */
	    where_now: function where_now(args, callback) {
	      var callback = args['callback'] || callback;
	      var err = args['error'] || function () {};
	      var auth_key = args['auth_key'] || keychain.getAuthKey();
	      var jsonp = jsonp_cb();
	      var uuid = args['uuid'] || keychain.getUUID();
	      var data = { auth: auth_key };

	      // Make sure we have a Channel
	      if (!callback) return _error('Missing Callback');
	      if (!keychain.getSubscribeKey()) return _error('Missing Subscribe Key');

	      if (jsonp != '0') {
	        data['callback'] = jsonp;
	      }

	      if (configComponent.isInstanceIdEnabled()) {
	        data['instanceid'] = keychain.getInstanceId();
	      }

	      xdr({
	        callback: jsonp,
	        data: _get_url_params(data),
	        success: function success(response) {
	          _invoke_callback(response, callback, err);
	        },
	        fail: function fail(response) {
	          _invoke_error(response, err);
	        },
	        url: [networkingComponent.getStandardOrigin(), 'v2', 'presence', 'sub_key', keychain.getSubscribeKey(), 'uuid', utils.encode(uuid)]
	      });
	    },

	    state: function state(args, callback) {
	      var callback = args['callback'] || callback || function (r) {};
	      var err = args['error'] || function () {};
	      var auth_key = args['auth_key'] || keychain.getAuthKey();
	      var jsonp = jsonp_cb();
	      var state = args['state'];
	      var uuid = args['uuid'] || keychain.getUUID();
	      var channel = args['channel'];
	      var channel_group = args['channel_group'];
	      var url;
	      var data = _get_url_params({ auth: auth_key });

	      // Make sure we have a Channel
	      if (!keychain.getSubscribeKey()) return _error('Missing Subscribe Key');
	      if (!uuid) return _error('Missing UUID');
	      if (!channel && !channel_group) return _error('Missing Channel');

	      if (jsonp != '0') {
	        data['callback'] = jsonp;
	      }

	      if (typeof channel != 'undefined' && CHANNELS[channel] && CHANNELS[channel].subscribed) {
	        if (state) STATE[channel] = state;
	      }

	      if (typeof channel_group != 'undefined' && CHANNEL_GROUPS[channel_group] && CHANNEL_GROUPS[channel_group].subscribed) {
	        if (state) STATE[channel_group] = state;
	        data['channel-group'] = channel_group;

	        if (!channel) {
	          channel = ',';
	        }
	      }

	      data['state'] = JSON.stringify(state);

	      if (configComponent.isInstanceIdEnabled()) {
	        data['instanceid'] = keychain.getInstanceId();
	      }

	      if (state) {
	        url = [networkingComponent.getStandardOrigin(), 'v2', 'presence', 'sub-key', keychain.getSubscribeKey(), 'channel', channel, 'uuid', uuid, 'data'];
	      } else {
	        url = [networkingComponent.getStandardOrigin(), 'v2', 'presence', 'sub-key', keychain.getSubscribeKey(), 'channel', channel, 'uuid', utils.encode(uuid)];
	      }

	      xdr({
	        callback: jsonp,
	        data: _get_url_params(data),
	        success: function success(response) {
	          _invoke_callback(response, callback, err);
	        },
	        fail: function fail(response) {
	          _invoke_error(response, err);
	        },
	        url: url

	      });
	    },

	    /*
	     PUBNUB.grant({
	     channel  : 'my_chat',
	     callback : fun,
	     error    : fun,
	     ttl      : 24 * 60, // Minutes
	     read     : true,
	     write    : true,
	     auth_key : '3y8uiajdklytowsj'
	     });
	     */
	    grant: function grant(args, callback) {
	      var callback = args['callback'] || callback;
	      var err = args['error'] || function () {};
	      var channel = args['channel'] || args['channels'];
	      var channel_group = args['channel_group'];
	      var jsonp = jsonp_cb();
	      var ttl = args['ttl'];
	      var r = args['read'] ? '1' : '0';
	      var w = args['write'] ? '1' : '0';
	      var m = args['manage'] ? '1' : '0';
	      var auth_key = args['auth_key'] || args['auth_keys'];

	      if (!callback) return _error('Missing Callback');
	      if (!keychain.getSubscribeKey()) return _error('Missing Subscribe Key');
	      if (!keychain.getPublishKey()) return _error('Missing Publish Key');
	      if (!keychain.getSecretKey()) return _error('Missing Secret Key');

	      var timestamp = Math.floor(new Date().getTime() / 1000);
	      var sign_input = keychain.getSubscribeKey() + '\n' + keychain.getPublishKey() + '\n' + 'grant' + '\n';

	      var data = { w: w, r: r, timestamp: timestamp };

	      if (args['manage']) {
	        data['m'] = m;
	      }
	      if (utils.isArray(channel)) {
	        channel = channel['join'](',');
	      }
	      if (utils.isArray(auth_key)) {
	        auth_key = auth_key['join'](',');
	      }
	      if (typeof channel != 'undefined' && channel != null && channel.length > 0) data['channel'] = channel;
	      if (typeof channel_group != 'undefined' && channel_group != null && channel_group.length > 0) {
	        data['channel-group'] = channel_group;
	      }
	      if (jsonp != '0') {
	        data['callback'] = jsonp;
	      }
	      if (ttl || ttl === 0) data['ttl'] = ttl;

	      if (auth_key) data['auth'] = auth_key;

	      data = _get_url_params(data);

	      if (!auth_key) delete data['auth'];

	      sign_input += _get_pam_sign_input_from_params(data);

	      var signature = hmac_SHA256(sign_input, keychain.getSecretKey());

	      signature = signature.replace(/\+/g, '-');
	      signature = signature.replace(/\//g, '_');

	      data['signature'] = signature;

	      xdr({
	        callback: jsonp,
	        data: data,
	        success: function success(response) {
	          _invoke_callback(response, callback, err);
	        },
	        fail: function fail(response) {
	          _invoke_error(response, err);
	        },
	        url: [networkingComponent.getStandardOrigin(), 'v1', 'auth', 'grant', 'sub-key', keychain.getSubscribeKey()]
	      });
	    },

	    /*
	     PUBNUB.mobile_gw_provision ({
	     device_id: 'A655FBA9931AB',
	     op       : 'add' | 'remove',
	     gw_type  : 'apns' | 'gcm',
	     channel  : 'my_chat',
	     callback : fun,
	     error    : fun,
	     });
	     */

	    mobile_gw_provision: function mobile_gw_provision(args) {
	      var callback = args['callback'] || function () {};
	      var auth_key = args['auth_key'] || keychain.getAuthKey();
	      var err = args['error'] || function () {};
	      var jsonp = jsonp_cb();
	      var channel = args['channel'];
	      var op = args['op'];
	      var gw_type = args['gw_type'];
	      var device_id = args['device_id'];
	      var url;

	      if (!device_id) return _error('Missing Device ID (device_id)');
	      if (!gw_type) return _error('Missing GW Type (gw_type: gcm or apns)');
	      if (!op) return _error('Missing GW Operation (op: add or remove)');
	      if (!channel) return _error('Missing gw destination Channel (channel)');
	      if (!keychain.getPublishKey()) return _error('Missing Publish Key');
	      if (!keychain.getSubscribeKey()) return _error('Missing Subscribe Key');

	      var params = { uuid: keychain.getUUID(), auth: auth_key, type: gw_type };

	      // Create URL
	      url = [networkingComponent.getStandardOrigin(), 'v1/push/sub-key', keychain.getSubscribeKey(), 'devices', device_id];

	      if (op == 'add') {
	        params['add'] = channel;
	      } else if (op == 'remove') {
	        params['remove'] = channel;
	      }

	      if (configComponent.isInstanceIdEnabled()) {
	        params['instanceid'] = keychain.getInstanceId();
	      }

	      xdr({
	        callback: jsonp,
	        data: params,
	        success: function success(response) {
	          _invoke_callback(response, callback, err);
	        },
	        fail: function fail(response) {
	          _invoke_error(response, err);
	        },
	        url: url
	      });
	    },

	    /*
	     PUBNUB.audit({
	     channel  : 'my_chat',
	     callback : fun,
	     error    : fun,
	     read     : true,
	     write    : true,
	     auth_key : '3y8uiajdklytowsj'
	     });
	     */
	    audit: function audit(args, callback) {
	      var callback = args['callback'] || callback;
	      var err = args['error'] || function () {};
	      var channel = args['channel'];
	      var channel_group = args['channel_group'];
	      var auth_key = args['auth_key'];
	      var jsonp = jsonp_cb();

	      // Make sure we have a Channel
	      if (!callback) return _error('Missing Callback');
	      if (!keychain.getSubscribeKey()) return _error('Missing Subscribe Key');
	      if (!keychain.getPublishKey()) return _error('Missing Publish Key');
	      if (!keychain.getSecretKey()) return _error('Missing Secret Key');

	      var timestamp = Math.floor(new Date().getTime() / 1000);
	      var sign_input = keychain.getSubscribeKey() + '\n' + keychain.getPublishKey() + '\n' + 'audit' + '\n';

	      var data = { timestamp: timestamp };
	      if (jsonp != '0') {
	        data['callback'] = jsonp;
	      }
	      if (typeof channel != 'undefined' && channel != null && channel.length > 0) data['channel'] = channel;
	      if (typeof channel_group != 'undefined' && channel_group != null && channel_group.length > 0) {
	        data['channel-group'] = channel_group;
	      }
	      if (auth_key) data['auth'] = auth_key;

	      data = _get_url_params(data);

	      if (!auth_key) delete data['auth'];

	      sign_input += _get_pam_sign_input_from_params(data);

	      var signature = hmac_SHA256(sign_input, keychain.getSecretKey());

	      signature = signature.replace(/\+/g, '-');
	      signature = signature.replace(/\//g, '_');

	      data['signature'] = signature;
	      xdr({
	        callback: jsonp,
	        data: data,
	        success: function success(response) {
	          _invoke_callback(response, callback, err);
	        },
	        fail: function fail(response) {
	          _invoke_error(response, err);
	        },
	        url: [networkingComponent.getStandardOrigin(), 'v1', 'auth', 'audit', 'sub-key', keychain.getSubscribeKey()]
	      });
	    },

	    /*
	     PUBNUB.revoke({
	     channel  : 'my_chat',
	     callback : fun,
	     error    : fun,
	     auth_key : '3y8uiajdklytowsj'
	     });
	     */
	    revoke: function revoke(args, callback) {
	      args['read'] = false;
	      args['write'] = false;
	      SELF['grant'](args, callback);
	    },

	    set_uuid: function set_uuid(uuid) {
	      keychain.setUUID(uuid);
	      CONNECT();
	    },

	    get_uuid: function get_uuid() {
	      return keychain.getUUID();
	    },

	    isArray: function isArray(arg) {
	      return utils.isArray(arg);
	    },

	    get_subscribed_channels: function get_subscribed_channels() {
	      return generate_channel_list(CHANNELS, true);
	    },

	    presence_heartbeat: function presence_heartbeat(args) {
	      var callback = args['callback'] || function () {};
	      var err = args['error'] || function () {};
	      var jsonp = jsonp_cb();
	      var data = { uuid: keychain.getUUID(), auth: keychain.getAuthKey() };

	      var st = JSON.stringify(STATE);
	      if (st.length > 2) data['state'] = JSON.stringify(STATE);

	      if (PRESENCE_HB > 0 && PRESENCE_HB < 320) data['heartbeat'] = PRESENCE_HB;

	      if (jsonp != '0') {
	        data['callback'] = jsonp;
	      }

	      var channels = utils.encode(generate_channel_list(CHANNELS, true)['join'](','));
	      var channel_groups = generate_channel_group_list(CHANNEL_GROUPS, true)['join'](',');

	      if (!channels) channels = ',';
	      if (channel_groups) data['channel-group'] = channel_groups;

	      if (configComponent.isInstanceIdEnabled()) {
	        data['instanceid'] = keychain.getInstanceId();
	      }

	      if (configComponent.isRequestIdEnabled()) {
	        data['requestid'] = utils.generateUUID();
	      }

	      xdr({
	        callback: jsonp,
	        data: _get_url_params(data),
	        url: [networkingComponent.getStandardOrigin(), 'v2', 'presence', 'sub-key', keychain.getSubscribeKey(), 'channel', channels, 'heartbeat'],
	        success: function success(response) {
	          _invoke_callback(response, callback, err);
	        },
	        fail: function fail(response) {
	          _invoke_error(response, err);
	        }
	      });
	    },

	    stop_timers: function stop_timers() {
	      clearTimeout(_poll_timer);
	      clearTimeout(_poll_timer2);
	      clearTimeout(PRESENCE_HB_TIMEOUT);
	    },

	    shutdown: function shutdown() {
	      SELF['stop_timers']();
	      _shutdown && _shutdown();
	    },

	    // Expose PUBNUB Functions
	    xdr: xdr,
	    ready: ready,
	    db: db,
	    uuid: utils.generateUUID,
	    map: utils.map,
	    each: utils.each,
	    'each-channel': each_channel,
	    grep: utils.grep,
	    offline: function offline() {
	      _reset_offline(1, { message: 'Offline. Please check your network settings.' });
	    },
	    supplant: utils.supplant,
	    now: utils.rnow,
	    unique: unique,
	    updater: utils.updater
	  };

	  function _poll_online() {
	    _is_online() || _reset_offline(1, { error: 'Offline. Please check your network settings.' });
	    _poll_timer && clearTimeout(_poll_timer);
	    _poll_timer = utils.timeout(_poll_online, SECOND);
	  }

	  function _poll_online2() {
	    if (!TIME_CHECK) return;
	    SELF['time'](function (success) {
	      detect_time_detla(function () {}, success);
	      success || _reset_offline(1, {
	        error: 'Heartbeat failed to connect to Pubnub Servers.' + 'Please check your network settings.'
	      });
	      _poll_timer2 && clearTimeout(_poll_timer2);
	      _poll_timer2 = utils.timeout(_poll_online2, KEEPALIVE);
	    });
	  }

	  function _reset_offline(err, msg) {
	    SUB_RECEIVER && SUB_RECEIVER(err, msg);
	    SUB_RECEIVER = null;

	    clearTimeout(_poll_timer);
	    clearTimeout(_poll_timer2);
	  }

	  _poll_timer = utils.timeout(_poll_online, SECOND);
	  _poll_timer2 = utils.timeout(_poll_online2, KEEPALIVE);
	  PRESENCE_HB_TIMEOUT = utils.timeout(start_presence_heartbeat, (PRESENCE_HB_INTERVAL - 3) * SECOND);

	  // Detect Age of Message
	  function detect_latency(tt) {
	    var adjusted_time = utils.rnow() - TIME_DRIFT;
	    return adjusted_time - tt / 10000;
	  }

	  detect_time_detla();
	  function detect_time_detla(cb, time) {
	    var stime = utils.rnow();

	    time && calculate(time) || SELF['time'](calculate);

	    function calculate(time) {
	      if (!time) return;
	      var ptime = time / 10000;
	      var latency = (utils.rnow() - stime) / 2;
	      TIME_DRIFT = utils.rnow() - (ptime + latency);
	      cb && cb(TIME_DRIFT);
	    }
	  }

	  return SELF;
	}

	module.exports = {
	  PN_API: PN_API,
	  unique: unique,
	  PNmessage: PNmessage,
	  DEF_TIMEOUT: DEF_TIMEOUT,
	  timeout: utils.timeout,
	  build_url: utils.buildURL,
	  each: utils.each,
	  uuid: utils.generateUUID,
	  URLBIT: defaultConfiguration.URLBIT,
	  grep: utils.grep,
	  supplant: utils.supplant,
	  now: utils.rnow,
	  updater: utils.updater,
	  map: utils.map
	};
	//# sourceMappingURL=pubnub-common.js.map


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	//     uuid.js
	//
	//     Copyright (c) 2010-2012 Robert Kieffer
	//     MIT License - http://opensource.org/licenses/mit-license.php

	// Unique ID creation requires a high quality random # generator.  We feature
	// detect to determine the best RNG source, normalizing to a function that
	// returns 128-bits of randomness, since that's what's usually required
	var _rng = __webpack_require__(7);

	// Maps for number <-> hex string conversion
	var _byteToHex = [];
	var _hexToByte = {};
	for (var i = 0; i < 256; i++) {
	  _byteToHex[i] = (i + 0x100).toString(16).substr(1);
	  _hexToByte[_byteToHex[i]] = i;
	}

	// **`parse()` - Parse a UUID into it's component bytes**
	function parse(s, buf, offset) {
	  var i = (buf && offset) || 0, ii = 0;

	  buf = buf || [];
	  s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
	    if (ii < 16) { // Don't overflow!
	      buf[i + ii++] = _hexToByte[oct];
	    }
	  });

	  // Zero out remaining bytes if string was short
	  while (ii < 16) {
	    buf[i + ii++] = 0;
	  }

	  return buf;
	}

	// **`unparse()` - Convert UUID byte array (ala parse()) into a string**
	function unparse(buf, offset) {
	  var i = offset || 0, bth = _byteToHex;
	  return  bth[buf[i++]] + bth[buf[i++]] +
	          bth[buf[i++]] + bth[buf[i++]] + '-' +
	          bth[buf[i++]] + bth[buf[i++]] + '-' +
	          bth[buf[i++]] + bth[buf[i++]] + '-' +
	          bth[buf[i++]] + bth[buf[i++]] + '-' +
	          bth[buf[i++]] + bth[buf[i++]] +
	          bth[buf[i++]] + bth[buf[i++]] +
	          bth[buf[i++]] + bth[buf[i++]];
	}

	// **`v1()` - Generate time-based UUID**
	//
	// Inspired by https://github.com/LiosK/UUID.js
	// and http://docs.python.org/library/uuid.html

	// random #'s we need to init node and clockseq
	var _seedBytes = _rng();

	// Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
	var _nodeId = [
	  _seedBytes[0] | 0x01,
	  _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
	];

	// Per 4.2.2, randomize (14 bit) clockseq
	var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

	// Previous uuid creation time
	var _lastMSecs = 0, _lastNSecs = 0;

	// See https://github.com/broofa/node-uuid for API details
	function v1(options, buf, offset) {
	  var i = buf && offset || 0;
	  var b = buf || [];

	  options = options || {};

	  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

	  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
	  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
	  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
	  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
	  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

	  // Per 4.2.1.2, use count of uuid's generated during the current clock
	  // cycle to simulate higher resolution clock
	  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

	  // Time since last uuid creation (in msecs)
	  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

	  // Per 4.2.1.2, Bump clockseq on clock regression
	  if (dt < 0 && options.clockseq === undefined) {
	    clockseq = clockseq + 1 & 0x3fff;
	  }

	  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
	  // time interval
	  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
	    nsecs = 0;
	  }

	  // Per 4.2.1.2 Throw error if too many uuids are requested
	  if (nsecs >= 10000) {
	    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
	  }

	  _lastMSecs = msecs;
	  _lastNSecs = nsecs;
	  _clockseq = clockseq;

	  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
	  msecs += 12219292800000;

	  // `time_low`
	  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
	  b[i++] = tl >>> 24 & 0xff;
	  b[i++] = tl >>> 16 & 0xff;
	  b[i++] = tl >>> 8 & 0xff;
	  b[i++] = tl & 0xff;

	  // `time_mid`
	  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
	  b[i++] = tmh >>> 8 & 0xff;
	  b[i++] = tmh & 0xff;

	  // `time_high_and_version`
	  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
	  b[i++] = tmh >>> 16 & 0xff;

	  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
	  b[i++] = clockseq >>> 8 | 0x80;

	  // `clock_seq_low`
	  b[i++] = clockseq & 0xff;

	  // `node`
	  var node = options.node || _nodeId;
	  for (var n = 0; n < 6; n++) {
	    b[i + n] = node[n];
	  }

	  return buf ? buf : unparse(b);
	}

	// **`v4()` - Generate random UUID**

	// See https://github.com/broofa/node-uuid for API details
	function v4(options, buf, offset) {
	  // Deprecated - 'format' argument, as supported in v1.2
	  var i = buf && offset || 0;

	  if (typeof(options) == 'string') {
	    buf = options == 'binary' ? new Array(16) : null;
	    options = null;
	  }
	  options = options || {};

	  var rnds = options.random || (options.rng || _rng)();

	  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
	  rnds[6] = (rnds[6] & 0x0f) | 0x40;
	  rnds[8] = (rnds[8] & 0x3f) | 0x80;

	  // Copy bytes to buffer, if provided
	  if (buf) {
	    for (var ii = 0; ii < 16; ii++) {
	      buf[i + ii] = rnds[ii];
	    }
	  }

	  return buf || unparse(rnds);
	}

	// Export public API
	var uuid = v4;
	uuid.v1 = v1;
	uuid.v4 = v4;
	uuid.parse = parse;
	uuid.unparse = unparse;

	module.exports = uuid;


/***/ },
/* 7 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {
	var rng;

	if (global.crypto && crypto.getRandomValues) {
	  // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
	  // Moderately fast, high quality
	  var _rnds8 = new Uint8Array(16);
	  rng = function whatwgRNG() {
	    crypto.getRandomValues(_rnds8);
	    return _rnds8;
	  };
	}

	if (!rng) {
	  // Math.random()-based (RNG)
	  //
	  // If all else fails, use Math.random().  It's fast, but is of unspecified
	  // quality.
	  var  _rnds = new Array(16);
	  rng = function() {
	    for (var i = 0, r; i < 16; i++) {
	      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
	      _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
	    }

	    return _rnds;
	  };
	}

	module.exports = rng;


	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _keychain = __webpack_require__(9);

	var _keychain2 = _interopRequireDefault(_keychain);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var utils = __webpack_require__(10);

	var _class = function () {
	  function _class(xdr, keychain) {
	    var ssl = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
	    var origin = arguments.length <= 3 || arguments[3] === undefined ? 'pubsub.pubnub.com' : arguments[3];

	    _classCallCheck(this, _class);

	    this._xdr = xdr;
	    this._keychain = keychain;

	    this._maxSubDomain = 20;
	    this._currentSubDomain = Math.floor(Math.random() * this._maxSubDomain);

	    this._providedFQDN = (ssl ? 'https://' : 'http://') + origin;

	    // create initial origins
	    this.shiftStandardOrigin(false);
	    this.shiftSubscribeOrigin(false);
	  }

	  _createClass(_class, [{
	    key: 'nextOrigin',
	    value: function nextOrigin(failover) {
	      // if a custom origin is supplied, use do not bother with shuffling subdomains
	      if (this._providedFQDN.indexOf('pubsub.') === -1) {
	        return this._providedFQDN;
	      }

	      var newSubDomain = undefined;

	      if (failover) {
	        newSubDomain = utils.generateUUID().split('-')[0];
	      } else {
	        this._currentSubDomain = this._currentSubDomain + 1;

	        if (this._currentSubDomain >= this._maxSubDomain) {
	          this._currentSubDomain = 1;
	        }

	        newSubDomain = this._currentSubDomain.toString();
	      }

	      return this._providedFQDN.replace('pubsub', 'ps' + newSubDomain);
	    }

	    // origin operations

	  }, {
	    key: 'shiftStandardOrigin',
	    value: function shiftStandardOrigin() {
	      var failover = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

	      this._standardOrigin = this.nextOrigin(failover);

	      return this._standardOrigin;
	    }
	  }, {
	    key: 'shiftSubscribeOrigin',
	    value: function shiftSubscribeOrigin() {
	      var failover = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

	      this._subscribeOrigin = this.nextOrigin(failover);

	      return this._subscribeOrigin;
	    }

	    // method based URL's

	  }, {
	    key: 'fetchHistory',
	    value: function fetchHistory(channel, _ref) {
	      var data = _ref.data;
	      var callback = _ref.callback;
	      var success = _ref.success;
	      var fail = _ref.fail;

	      var url = [this.getStandardOrigin(), 'v2', 'history', 'sub-key', this._keychain.getSubscribeKey(), 'channel', utils.encode(channel)];

	      this._xdr({ data: data, callback: callback, success: success, fail: fail, url: url });
	    }
	  }, {
	    key: 'fetchReplay',
	    value: function fetchReplay(source, destination, _ref2) {
	      var data = _ref2.data;
	      var callback = _ref2.callback;
	      var success = _ref2.success;
	      var fail = _ref2.fail;

	      var url = [this.getStandardOrigin(), 'v1', 'replay', this._keychain.getPublishKey(), this._keychain.getSubscribeKey(), source, destination];

	      this._xdr({ data: data, callback: callback, success: success, fail: fail, url: url });
	    }
	  }, {
	    key: 'fetchTime',
	    value: function fetchTime(jsonp, _ref3) {
	      var data = _ref3.data;
	      var callback = _ref3.callback;
	      var success = _ref3.success;
	      var fail = _ref3.fail;

	      var url = [this.getStandardOrigin(), 'time', jsonp];

	      this._xdr({ data: data, callback: callback, success: success, fail: fail, url: url });
	    }
	  }, {
	    key: 'getOrigin',
	    value: function getOrigin() {
	      return this._providedFQDN;
	    }
	  }, {
	    key: 'getStandardOrigin',
	    value: function getStandardOrigin() {
	      return this._standardOrigin;
	    }
	  }, {
	    key: 'getSubscribeOrigin',
	    value: function getSubscribeOrigin() {
	      return this._subscribeOrigin;
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;
	//# sourceMappingURL=networking.js.map


/***/ },
/* 9 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class() {
	    _classCallCheck(this, _class);
	  }

	  _createClass(_class, [{
	    key: "setUUID",
	    value: function setUUID(UUID) {
	      this._UUID = UUID;
	      return this;
	    }
	  }, {
	    key: "setSubscribeKey",
	    value: function setSubscribeKey(subscribeKey) {
	      this._subscribeKey = subscribeKey;
	      return this;
	    }
	  }, {
	    key: "setPublishKey",
	    value: function setPublishKey(publishkey) {
	      this._publishKey = publishkey;
	      return this;
	    }
	  }, {
	    key: "setAuthKey",
	    value: function setAuthKey(authKey) {
	      this._authKey = authKey;
	      return this;
	    }
	  }, {
	    key: "setInstanceId",
	    value: function setInstanceId(instanceId) {
	      this._instanceId = instanceId;
	      return this;
	    }
	  }, {
	    key: "setSecretKey",
	    value: function setSecretKey(secretKey) {
	      this._secretKey = secretKey;
	      return this;
	    }

	    //

	  }, {
	    key: "getSubscribeKey",
	    value: function getSubscribeKey() {
	      return this._subscribeKey;
	    }
	  }, {
	    key: "getPublishKey",
	    value: function getPublishKey() {
	      return this._publishKey;
	    }
	  }, {
	    key: "getAuthKey",
	    value: function getAuthKey() {
	      return this._authKey;
	    }
	  }, {
	    key: "getInstanceId",
	    value: function getInstanceId() {
	      return this._instanceId;
	    }
	  }, {
	    key: "getSecretKey",
	    value: function getSecretKey() {
	      return this._secretKey;
	    }
	  }, {
	    key: "getUUID",
	    value: function getUUID() {
	      return this._UUID;
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;
	//# sourceMappingURL=keychain.js.map


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _uuid = __webpack_require__(6);

	var _uuid2 = _interopRequireDefault(_uuid);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/* eslint no-unused-expressions: 0, block-scoped-var: 0, no-redeclare: 0, guard-for-in: 0 */

	var defaultConfiguration = __webpack_require__(11);
	var REPL = /{([\w\-]+)}/g;

	function rnow() {
	  return +new Date();
	}

	function isArray(arg) {
	  return !!arg && typeof arg !== 'string' && (Array.isArray && Array.isArray(arg) || typeof arg.length === 'number');
	  // return !!arg && (Array.isArray && Array.isArray(arg) || typeof(arg.length) === "number")
	}

	/**
	 * EACH
	 * ====
	 * each( [1,2,3], function(item) { } )
	 */
	function each(o, f) {
	  if (!o || !f) {
	    return;
	  }

	  if (isArray(o)) {
	    for (var i = 0, l = o.length; i < l;) {
	      f.call(o[i], o[i], i++);
	    }
	  } else {
	    for (var i in o) {
	      o.hasOwnProperty && o.hasOwnProperty(i) && f.call(o[i], i, o[i]);
	    }
	  }
	}

	/**
	 * ENCODE
	 * ======
	 * var encoded_data = encode('path');
	 */
	function encode(path) {
	  return encodeURIComponent(path);
	}

	/**
	 * Build Url
	 * =======
	 *
	 */
	function buildURL(urlComponents, urlParams) {
	  var url = urlComponents.join(defaultConfiguration.URLBIT);
	  var params = [];

	  if (!urlParams) return url;

	  each(urlParams, function (key, value) {
	    var valueStr = (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' ? JSON['stringify'](value) : value;
	    typeof value !== 'undefined' && value !== null && encode(valueStr).length > 0 && params.push(key + '=' + encode(valueStr));
	  });

	  url += '?' + params.join(defaultConfiguration.PARAMSBIT);
	  return url;
	}

	/**
	 * UPDATER
	 * =======
	 * var timestamp = unique();
	 */
	function updater(fun, rate) {
	  var timeout;
	  var last = 0;
	  var runnit = function runnit() {
	    if (last + rate > rnow()) {
	      clearTimeout(timeout);
	      timeout = setTimeout(runnit, rate);
	    } else {
	      last = rnow();
	      fun();
	    }
	  };

	  return runnit;
	}

	/**
	 * GREP
	 * ====
	 * var list = grep( [1,2,3], function(item) { return item % 2 } )
	 */
	function grep(list, fun) {
	  var fin = [];
	  each(list || [], function (l) {
	    fun(l) && fin.push(l);
	  });
	  return fin;
	}

	/**
	 * SUPPLANT
	 * ========
	 * var text = supplant( 'Hello {name}!', { name : 'John' } )
	 */
	function supplant(str, values) {
	  return str.replace(REPL, function (_, match) {
	    return values[match] || _;
	  });
	}

	/**
	 * timeout
	 * =======
	 * timeout( function(){}, 100 );
	 */
	function timeout(fun, wait) {
	  if (typeof setTimeout === 'undefined') {
	    return;
	  }

	  return setTimeout(fun, wait);
	}

	/**
	 * uuid
	 * ====
	 * var my_uuid = generateUUID();
	 */
	function generateUUID(callback) {
	  var u = _uuid2.default.v4();
	  if (callback) callback(u);
	  return u;
	}

	/**
	 * MAP
	 * ===
	 * var list = map( [1,2,3], function(item) { return item + 1 } )
	 */
	function map(list, fun) {
	  var fin = [];
	  each(list || [], function (k, v) {
	    fin.push(fun(k, v));
	  });
	  return fin;
	}

	function pamEncode(str) {
	  return encodeURIComponent(str).replace(/[!'()*~]/g, function (c) {
	    return '%' + c.charCodeAt(0).toString(16).toUpperCase();
	  });
	}

	module.exports = {
	  buildURL: buildURL,
	  encode: encode,
	  each: each,
	  updater: updater,
	  rnow: rnow,
	  isArray: isArray,
	  map: map,
	  pamEncode: pamEncode,
	  generateUUID: generateUUID,
	  timeout: timeout,
	  supplant: supplant,
	  grep: grep
	};
	//# sourceMappingURL=utils.js.map


/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = {
		"PARAMSBIT": "&",
		"URLBIT": "/"
	};

/***/ },
/* 12 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {

	  /*
	    if instanceId config is true, the SDK will pass the unique instance
	    identifier to the server as instanceId=<UUID>
	  */

	  function _class() {
	    _classCallCheck(this, _class);

	    this._instanceId = false;
	    this._requestId = false;
	  }

	  /*
	    if requestId config is true, the SDK will pass a unique request identifier
	    with each request as request_id=<UUID>
	  */


	  _createClass(_class, [{
	    key: "setInstanceIdConfig",
	    value: function setInstanceIdConfig(configValue) {
	      this._instanceId = configValue;
	      return this;
	    }
	  }, {
	    key: "setRequestIdConfig",
	    value: function setRequestIdConfig(configValue) {
	      this._requestId = configValue;
	      return this;
	    }
	  }, {
	    key: "isInstanceIdEnabled",
	    value: function isInstanceIdEnabled() {
	      return this._instanceId;
	    }
	  }, {
	    key: "isRequestIdEnabled",
	    value: function isRequestIdEnabled() {
	      return this._requestId;
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;
	//# sourceMappingURL=config.js.map


/***/ },
/* 13 */
/***/ function(module, exports) {

	// ---------------------------------------------------------------------------
	// WEBSOCKET INTERFACE
	// ---------------------------------------------------------------------------
	var WS = function( url, protocols ) {
	  if (!(this instanceof WS)) return new WS( url, protocols );

	  var self     = this
	    ,   url      = self.url      = url || ''
	    ,   protocol = self.protocol = protocols || 'Sec-WebSocket-Protocol'
	    ,   bits     = url.split('/')
	    ,   setup    = {
	    'ssl'           : bits[0] === 'wss:'
	    ,'origin'        : bits[2]
	    ,'publish_key'   : bits[3]
	    ,'subscribe_key' : bits[4]
	    ,'channel'       : bits[5]
	  };

	  // READY STATES
	  self['CONNECTING'] = 0; // The connection is not yet open.
	  self['OPEN']       = 1; // The connection is open and ready to communicate.
	  self['CLOSING']    = 2; // The connection is in the process of closing.
	  self['CLOSED']     = 3; // The connection is closed or couldn't be opened.

	  // CLOSE STATES
	  self['CLOSE_NORMAL']         = 1000; // Normal Intended Close; completed.
	  self['CLOSE_GOING_AWAY']     = 1001; // Closed Unexpecttedly.
	  self['CLOSE_PROTOCOL_ERROR'] = 1002; // Server: Not Supported.
	  self['CLOSE_UNSUPPORTED']    = 1003; // Server: Unsupported Protocol.
	  self['CLOSE_TOO_LARGE']      = 1004; // Server: Too Much Data.
	  self['CLOSE_NO_STATUS']      = 1005; // Server: No reason.
	  self['CLOSE_ABNORMAL']       = 1006; // Abnormal Disconnect.

	  // Events Default
	  self['onclose']   = self['onerror'] =
	    self['onmessage'] = self['onopen']  =
	      self['onsend']    =  function(){};

	  // Attributes
	  self['binaryType']     = '';
	  self['extensions']     = '';
	  self['bufferedAmount'] = 0;
	  self['trasnmitting']   = false;
	  self['buffer']         = [];
	  self['readyState']     = self['CONNECTING'];

	  // Close if no setup.
	  if (!url) {
	    self['readyState'] = self['CLOSED'];
	    self['onclose']({
	      'code'     : self['CLOSE_ABNORMAL'],
	      'reason'   : 'Missing URL',
	      'wasClean' : true
	    });
	    return self;
	  }

	  // PubNub WebSocket Emulation
	  self.pubnub       = PUBNUB['init'](setup);
	  self.pubnub.setup = setup;
	  self.setup        = setup;

	  self.pubnub['subscribe']({
	    'restore'    : false,
	    'channel'    : setup['channel'],
	    'disconnect' : self['onerror'],
	    'reconnect'  : self['onopen'],
	    'error'      : function() {
	      self['onclose']({
	        'code'     : self['CLOSE_ABNORMAL'],
	        'reason'   : 'Missing URL',
	        'wasClean' : false
	      });
	    },
	    'callback'   : function(message) {
	      self['onmessage']({ 'data' : message });
	    },
	    'connect'    : function() {
	      self['readyState'] = self['OPEN'];
	      self['onopen']();
	    }
	  });
	};

	// ---------------------------------------------------------------------------
	// WEBSOCKET SEND
	// ---------------------------------------------------------------------------
	WS.prototype.send = function(data) {
	  var self = this;
	  self.pubnub['publish']({
	    'channel'  : self.pubnub.setup['channel'],
	    'message'  : data,
	    'callback' : function(response) {
	      self['onsend']({ 'data' : response });
	    }
	  });
	};

	// ---------------------------------------------------------------------------
	// WEBSOCKET CLOSE
	// ---------------------------------------------------------------------------
	WS.prototype.close = function() {
	  var self = this;
	  self.pubnub['unsubscribe']({ 'channel' : self.pubnub.setup['channel'] });
	  self['readyState'] = self['CLOSED'];
	  self['onclose']({});
	};

	module.exports = WS;


/***/ }
/******/ ])
});
;