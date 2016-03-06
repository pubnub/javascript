/*! 3.14.1 / parse */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("crypto"), require("buffer"));
	else if(typeof define === 'function' && define.amd)
		define(["crypto", "buffer"], factory);
	else if(typeof exports === 'object')
		exports["PUBNUB"] = factory(require("crypto"), require("buffer"));
	else
		root["PUBNUB"] = factory(root["crypto"], root["buffer"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_2__) {
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

	/* globals 'Parse', Parse */
	/* eslint camelcase: 0 */

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
	 of this software and associated documentation files (the 'Software'), to deal
	 in the Software without restriction, including without limitation the rights
	 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 copies of the Software, and to permit persons to whom the Software is
	 furnished to do so, subject to the following conditions:

	 The above copyright notice and this permission notice shall be included in
	 all copies or substantial portions of the Software.

	 THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 THE SOFTWARE.
	 --------------------------------------------------------------------------- */

	var crypto = __webpack_require__(1);
	var Buffer = __webpack_require__(2).Buffer;
	var packageJSON = __webpack_require__(3);
	var pubNubCore = __webpack_require__(4);

	var PNSDK = 'PubNub-JS-' + 'Parse' + '/' + packageJSON.version;

	/**
	 * UTIL LOCALS
	 */
	function get_hmac_SHA256(data, key) {
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
	 * Request
	 * =======
	 *  xdr({
	 *     url     : ['http://www.blah.com/url'],
	 *     success : function(response) {},
	 *     fail    : function() {}
	 *  });
	 */
	function xdr(setup) {
	  var success = setup.success || function () {};
	  var fail = setup.fail || function () {};
	  var mode = setup.mode || 'GET';
	  var data = setup.data || {};
	  var options = {};
	  var payload;
	  var origin;
	  var url;

	  data.pnsdk = PNSDK;

	  if (mode === 'POST') {
	    payload = decodeURIComponent(setup.url.pop());
	  }

	  url = pubNubCore.build_url(setup.url, data);
	  url = '/' + url.split('/').slice(3).join('/');

	  origin = setup.url[0].split('//')[1];

	  options.url = 'http://' + origin + url;
	  options.method = mode;
	  options.body = payload;

	  function invokeFail(message, payload) {
	    fail({
	      message: message,
	      payload: payload
	    });
	  }

	  Parse.Cloud.httpRequest(options)
	    .then(function (httpResponse) {
	      var result;

	      try {
	        result = JSON.parse(httpResponse.text);
	      } catch (e) {
	        invokeFail('Bad JSON response', httpResponse.text);
	        return;
	      }

	      success(result);
	    }, function (httpResponse) {
	      var response;

	      try {
	        response = JSON.parse(httpResponse.text);

	        if (typeof response === 'object' && 'error' in response && response.error === true) {
	          fail(response);
	        } else {
	          invokeFail('Network error', httpResponse.text);
	        }
	      } catch (e) {
	        invokeFail('Network error', httpResponse.text);
	      }
	    });
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

	function crypto_obj() {
	  var iv = '0123456789012345';

	  function get_padded_key(key) {
	    return crypto.createHash('sha256').update(key).digest('hex').slice(0, 32);
	  }

	  return {
	    encrypt: function (input, key) {
	      if (!key) return input;
	      var plain_text = JSON['stringify'](input);
	      var cipher = crypto.createCipheriv('aes-256-cbc', get_padded_key(key), iv);
	      var base_64_encrypted = cipher.update(plain_text, 'utf8', 'base64') + cipher.final('base64');
	      return base_64_encrypted || input;
	    },
	    decrypt: function (input, key) {
	      var decrypted;

	      if (!key) return input;
	      var decipher = crypto.createDecipheriv('aes-256-cbc', get_padded_key(key), iv);
	      try {
	        decrypted = decipher.update(input, 'base64', 'utf8') + decipher.final('utf8');
	      } catch (e) {
	        return null;
	      }
	      return JSON.parse(decrypted);
	    }
	  };
	}

	var CREATE_PUBNUB = function (setup) {
	  setup['xdr'] = xdr;
	  setup['db'] = db;
	  setup['error'] = setup['error'] || error;
	  setup['hmac_SHA256'] = get_hmac_SHA256;
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

	  SELF.init = SELF;
	  SELF.secure = SELF;

	  SELF.subscribe = function () {
	    throw Error('#subscribe() method is disabled in Parse.com environment');
	  };

	  SELF.ready();

	  return SELF;
	};

	CREATE_PUBNUB.init = CREATE_PUBNUB;
	CREATE_PUBNUB.unique = pubNubCore.unique;
	CREATE_PUBNUB.secure = CREATE_PUBNUB;

	module.exports = CREATE_PUBNUB;
	module.exports.PNmessage = pubNubCore.PNmessage;


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ },
/* 3 */
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
			"babel-core": "^6.6.5",
			"babel-eslint": "5.0.0",
			"babel-plugin-transform-class-properties": "^6.6.0",
			"babel-plugin-transform-flow-strip-types": "^6.6.5",
			"babel-preset-es2015": "^6.6.0",
			"chai": "3.5.0",
			"eslint": "2.2.0",
			"eslint-config-airbnb": "6.0.2",
			"eslint-plugin-flowtype": "2.1.0",
			"eslint-plugin-mocha": "2.0.0",
			"eslint-plugin-react": "4.1.0",
			"flow-bin": "^0.22.1",
			"grunt": "0.4.5",
			"grunt-babel": "6.0.0",
			"grunt-contrib-clean": "1.0.0",
			"grunt-contrib-copy": "^1.0.0",
			"grunt-contrib-uglify": "^1.0.0",
			"grunt-env": "0.4.4",
			"grunt-eslint": "18.0.0",
			"grunt-flow": "1.0.3",
			"grunt-karma": "0.12.1",
			"grunt-mocha-istanbul": "3.0.1",
			"grunt-text-replace": "0.4.0",
			"grunt-webpack": "1.0.11",
			"imports-loader": "0.6.5",
			"isparta": "4.0.0",
			"json-loader": "0.5.4",
			"karma": "0.13.21",
			"karma-chai": "0.1.0",
			"karma-mocha": "^0.2.2",
			"karma-phantomjs-launcher": "1.0.0",
			"karma-spec-reporter": "0.0.24",
			"load-grunt-tasks": "^3.4.1",
			"mocha": "2.4.5",
			"nock": "1.1.0",
			"node-uuid": "1.4.7",
			"nodeunit": "0.9.0",
			"phantomjs-prebuilt": "2.1.4",
			"proxyquire": "1.7.4",
			"sinon": "^1.17.3",
			"uglify-js": "^2.6.2",
			"underscore": "1.7.0",
			"webpack": "^1.12.14",
			"webpack-dev-server": "1.14.1"
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
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	/* eslint camelcase: 0, no-use-before-define: 0, no-unused-expressions: 0  */
	/* eslint eqeqeq: 0, one-var: 0 */
	/* eslint no-redeclare: 0 */
	/* eslint guard-for-in: 0 */
	/* eslint block-scoped-var: 0 space-return-throw-case: 0, no-unused-vars: 0 */

	var _uuid = __webpack_require__(5);

	var _uuid2 = _interopRequireDefault(_uuid);

	var _networking = __webpack_require__(7);

	var _networking2 = _interopRequireDefault(_networking);

	var _keychain = __webpack_require__(8);

	var _keychain2 = _interopRequireDefault(_keychain);

	var _config = __webpack_require__(11);

	var _config2 = _interopRequireDefault(_config);

	var _state = __webpack_require__(12);

	var _state2 = _interopRequireDefault(_state);

	var _responders = __webpack_require__(13);

	var _responders2 = _interopRequireDefault(_responders);

	var _time = __webpack_require__(33);

	var _time2 = _interopRequireDefault(_time);

	var _presence = __webpack_require__(34);

	var _presence2 = _interopRequireDefault(_presence);

	var _history = __webpack_require__(35);

	var _history2 = _interopRequireDefault(_history);

	var _push = __webpack_require__(36);

	var _push2 = _interopRequireDefault(_push);

	var _access = __webpack_require__(37);

	var _access2 = _interopRequireDefault(_access);

	var _replay = __webpack_require__(38);

	var _replay2 = _interopRequireDefault(_replay);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var packageJSON = __webpack_require__(3);
	var defaultConfiguration = __webpack_require__(10);
	var utils = __webpack_require__(9);

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
	  var jsonp_cb = setup.jsonp_cb || function () {
	    return 0;
	  };
	  var xdr = setup.xdr;

	  var db = setup.db || { get: function get() {}, set: function set() {} };
	  var _error = setup.error || function () {};
	  var hmac_SHA256 = setup.hmac_SHA256;
	  var crypto_obj = setup.crypto_obj || {
	    encrypt: function encrypt(a, key) {
	      return a;
	    },
	    decrypt: function decrypt(b, key) {
	      return b;
	    }
	  };

	  var keychain = new _keychain2.default().setInstanceId(_uuid2.default.v4()).setAuthKey(setup.auth_key || '').setSecretKey(setup.secret_key || '').setSubscribeKey(setup.subscribe_key).setPublishKey(setup.publish_key).setCipherKey(setup.cipher_key);

	  keychain.setUUID(setup.uuid || !setup.unique_uuid && db.get(keychain.getSubscribeKey() + 'uuid') || _uuid2.default.v4());

	  // write the new key to storage
	  db.set(keychain.getSubscribeKey() + 'uuid', keychain.getUUID());

	  var config = new _config2.default().setRequestIdConfig(setup.use_request_id || false).setInstanceIdConfig(setup.instance_id || false);

	  var stateStorage = new _state2.default();

	  var networking = new _networking2.default(setup.xdr, keychain, setup.ssl, setup.origin).setCoreParams(setup.params || {});

	  // initialize the encryption and decryption logic
	  function encrypt(input, key) {
	    return crypto_obj.encrypt(input, key || keychain.getCipherKey()) || input;
	  }

	  function decrypt(input, key) {
	    return crypto_obj['decrypt'](input, key || keychain.getCipherKey()) || crypto_obj['decrypt'](input, keychain.getCipherKey()) || input;
	  }

	  // initalize the endpoints
	  var timeEndpoint = new _time2.default({ keychain: keychain, config: config, networking: networking, jsonp_cb: jsonp_cb });
	  var pushEndpoint = new _push2.default({ keychain: keychain, config: config, networking: networking, jsonp_cb: jsonp_cb, error: _error });
	  var presenceEndpoints = new _presence2.default({ keychain: keychain, config: config, networking: networking, jsonp_cb: jsonp_cb, error: _error });
	  var historyEndpoint = new _history2.default({ keychain: keychain, networking: networking, jsonp_cb: jsonp_cb, error: _error, decrypt: decrypt });
	  var accessEndpoints = new _access2.default({ keychain: keychain, config: config, networking: networking, jsonp_cb: jsonp_cb, error: _error, hmac_SHA256: hmac_SHA256 });
	  var replayEndpoint = new _replay2.default({ keychain: keychain, networking: networking, jsonp_cb: jsonp_cb, error: _error });

	  var SUB_WINDOWING = +setup['windowing'] || DEF_WINDOWING;
	  var SUB_TIMEOUT = (+setup['timeout'] || DEF_SUB_TIMEOUT) * SECOND;
	  var KEEPALIVE = (+setup['keepalive'] || DEF_KEEPALIVE) * SECOND;
	  var TIME_CHECK = setup['timecheck'] || 0;
	  var NOLEAVE = setup['noleave'] || 0;
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
	  var SUB_ERROR = function SUB_ERROR() {};
	  var STATE = {};
	  var PRESENCE_HB_TIMEOUT = null;
	  var PRESENCE_HB = validate_presence_heartbeat(setup['heartbeat'] || setup['pnexpires'] || 0, setup['error']);
	  var PRESENCE_HB_INTERVAL = setup['heartbeat_interval'] || PRESENCE_HB / 2 - 1;
	  var PRESENCE_HB_RUNNING = false;
	  var NO_WAIT_FOR_PENDING = setup['no_wait_for_pending'];
	  var COMPATIBLE_35 = setup['compatible_3.5'] || false;
	  var _is_online = setup['_is_online'] || function () {
	    return 1;
	  };
	  var _shutdown = setup['shutdown'];
	  var use_send_beacon = typeof setup['use_send_beacon'] != 'undefined' ? setup['use_send_beacon'] : true;
	  var sendBeacon = use_send_beacon ? setup['sendBeacon'] : null;
	  var _poll_timer;
	  var _poll_timer2;

	  if (PRESENCE_HB === 2) PRESENCE_HB_INTERVAL = 1;

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

	  function error_common(message, callback) {
	    callback && callback({ error: message || 'error occurred' });
	    _error && _error(message);
	  }

	  function _presence_heartbeat() {
	    clearTimeout(PRESENCE_HB_TIMEOUT);

	    if (!PRESENCE_HB_INTERVAL || PRESENCE_HB_INTERVAL >= 500 || PRESENCE_HB_INTERVAL < 1 || !stateStorage.generate_channel_list(true).length && !stateStorage.generate_channel_group_list(true).length) {
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

	    utils.each(stateStorage.generate_channel_group_list(), function (channel_group) {
	      var chang = stateStorage.getChannelGroup(channel_group);

	      if (!chang) return;

	      count++;
	      (callback || function () {})(chang);
	    });

	    return count;
	  }

	  function each_channel(callback) {
	    var count = 0;

	    utils.each(stateStorage.generate_channel_list(), function (channel) {
	      var chan = stateStorage.getChannel(channel);

	      if (!chan) return;

	      count++;
	      (callback || function () {})(chan);
	    });

	    return count;
	  }

	  function CR(args, callback, url1, data) {
	    var callback = args['callback'] || callback;
	    var err = args['error'] || _error;
	    var jsonp = jsonp_cb();

	    data = data || {};

	    if (!data['auth']) {
	      data['auth'] = args['auth_key'] || keychain.getAuthKey();
	    }

	    var url = [networking.getStandardOrigin(), 'v1', 'channel-registration', 'sub-key', keychain.getSubscribeKey()];

	    url.push.apply(url, url1);

	    if (jsonp) data['callback'] = jsonp;

	    xdr({
	      callback: jsonp,
	      data: networking.prepareParams(data),
	      success: function success(response) {
	        _responders2.default.callback(response, callback, err);
	      },
	      fail: function fail(response) {
	        _responders2.default.error(response, err);
	      },
	      url: url
	    });
	  }

	  // Announce Leave Event
	  var SELF = {
	    history: function history(args, callback) {
	      historyEndpoint.fetchHistory(args, callback);
	    },
	    time: function time(callback) {
	      timeEndpoint.fetchTime(callback);
	    },
	    here_now: function here_now(args, callback) {
	      presenceEndpoints.hereNow(args, callback);
	    },
	    where_now: function where_now(args, callback) {
	      presenceEndpoints.whereNow(args, callback);
	    },
	    grant: function grant(args, callback) {
	      accessEndpoints.performGrant(args, callback);
	    },
	    audit: function audit(args, callback) {
	      accessEndpoints.performAudit(args, callback);
	    },
	    mobile_gw_provision: function mobile_gw_provision(args) {
	      pushEndpoint.provisionDevice(args);
	    },
	    replay: function replay(args, callback) {
	      replayEndpoint.performReplay(args, callback);
	    },


	    LEAVE: function LEAVE(channel, blocking, auth_key, callback, error) {
	      var data = { uuid: keychain.getUUID(), auth: auth_key || keychain.getAuthKey() };
	      var origin = networking.nextOrigin(false);
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

	      if (config.isInstanceIdEnabled()) {
	        data['instanceid'] = keychain.getInstanceId();
	      }

	      url = [origin, 'v2', 'presence', 'sub_key', keychain.getSubscribeKey(), 'channel', utils.encode(channel), 'leave'];

	      params = networking.prepareParams(data);

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
	          _responders2.default.callback(response, callback, err);
	        },
	        fail: function fail(response) {
	          _responders2.default.error(response, err);
	        },
	        url: url
	      });
	      return true;
	    },

	    LEAVE_GROUP: function LEAVE_GROUP(channel_group, blocking, auth_key, callback, error) {
	      var data = { uuid: keychain.getUUID(), auth: auth_key || keychain.getAuthKey() };
	      var origin = networking.nextOrigin(false);
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

	      if (config.isInstanceIdEnabled()) {
	        data['instanceid'] = keychain.getInstanceId();
	      }

	      url = [origin, 'v2', 'presence', 'sub_key', keychain.getSubscribeKey(), 'channel', utils.encode(','), 'leave'];

	      params = networking.prepareParams(data);

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
	          _responders2.default.callback(response, callback, err);
	        },
	        fail: function fail(response) {
	          _responders2.default.error(response, err);
	        },
	        url: url
	      });
	      return true;
	    },

	    set_resumed: function set_resumed(resumed) {
	      RESUMED = resumed;
	    },

	    get_cipher_key: function get_cipher_key() {
	      return keychain.getCipherKey();
	    },

	    set_cipher_key: function set_cipher_key(key) {
	      keychain.setCipherKey(key);
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
	      networking.addCoreParam(key, val);
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
	     PUBNUB.auth('AJFLKAJSDKLA');
	     */
	    auth: function auth(_auth) {
	      keychain.setAuthKey(_auth);
	      CONNECT();
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
	      url = [networking.getStandardOrigin(), 'publish', keychain.getPublishKey(), keychain.getSubscribeKey(), 0, utils.encode(channel), jsonp, utils.encode(msg)];

	      if (!store) params['store'] = '0';

	      if (config.isInstanceIdEnabled()) {
	        params['instanceid'] = keychain.getInstanceId();
	      }

	      // Queue Message Send
	      PUB_QUEUE[add_msg]({
	        callback: jsonp,
	        url: url,
	        data: networking.prepareParams(params),
	        fail: function fail(response) {
	          _responders2.default.error(response, err);
	          _publish(1);
	        },
	        success: function success(response) {
	          _responders2.default.callback(response, callback, err);
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
	          if (stateStorage.getChannel(channel)) existingChannels.push(channel);
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
	          if (stateStorage.containsChannel(channel)) stateStorage.addChannel(channel, 0);
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
	          if (stateStorage.getChannelGroup(channelGroup)) existingChannelGroups.push(channelGroup);
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
	          if (stateStorage.containsChannelGroup(channelGroup)) stateStorage.addChannelGroup(channelGroup, 0);
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
	          var settings = stateStorage.getChannel(channel) || {};

	          // Store Channel State
	          stateStorage.addChannel(SUB_CHANNEL = channel, {
	            name: channel,
	            connected: settings.connected,
	            disconnected: settings.disconnected,
	            subscribed: 1,
	            callback: SUB_CALLBACK = callback,
	            cipher_key: args['cipher_key'],
	            connect: connect,
	            disconnect: disconnect,
	            reconnect: reconnect
	          });

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
	            data: networking.prepareParams({ uuid: keychain.getUUID(), auth: keychain.getAuthKey() }),
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
	          var settings = stateStorage.getChannelGroup(channel_group) || {};

	          stateStorage.addChannelGroup(channel_group, {
	            name: channel_group,
	            connected: settings.connected,
	            disconnected: settings.disconnected,
	            subscribed: 1,
	            callback: SUB_CALLBACK = callback,
	            cipher_key: args['cipher_key'],
	            connect: connect,
	            disconnect: disconnect,
	            reconnect: reconnect
	          });

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
	            data: networking.prepareParams({ uuid: keychain.getUUID(), auth: keychain.getAuthKey() }),
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
	          networking.shiftStandardOrigin(true);
	          networking.shiftSubscribeOrigin(true);

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
	        var channels = stateStorage.generate_channel_list().join(',');
	        var channel_groups = stateStorage.generate_channel_group_list().join(',');

	        // Stop Connection
	        if (!channels && !channel_groups) return;

	        if (!channels) channels = ',';

	        // Connect to PubNub Subscribe Servers
	        _reset_offline();

	        var data = networking.prepareParams({ uuid: keychain.getUUID(), auth: keychain.getAuthKey() });

	        if (channel_groups) {
	          data['channel-group'] = channel_groups;
	        }

	        var st = JSON.stringify(STATE);
	        if (st.length > 2) data['state'] = JSON.stringify(STATE);

	        if (PRESENCE_HB) data['heartbeat'] = PRESENCE_HB;

	        if (config.isInstanceIdEnabled()) {
	          data['instanceid'] = keychain.getInstanceId();
	        }

	        start_presence_heartbeat();
	        SUB_RECEIVER = xdr({
	          timeout: sub_timeout,
	          callback: jsonp,
	          fail: function fail(response) {
	            if (response && response['error'] && response['service']) {
	              _responders2.default.error(response, SUB_ERROR);
	              _test_connection(false);
	            } else {
	              SELF['time'](function (success) {
	                !success && _responders2.default.error(response, SUB_ERROR);
	                _test_connection(success);
	              });
	            }
	          },
	          data: networking.prepareParams(data),
	          url: [networking.getSubscribeOrigin(), 'subscribe', keychain.getSubscribeKey(), utils.encode(channels), jsonp, TIMETOKEN],
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
	                channels = utils.map(stateStorage.generate_channel_list(), function (chan) {
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
	                  chobj = stateStorage.getChannelGroup(channel2) || stateStorage.getChannel(channel2) || { callback: function callback() {} };
	                } else {
	                  chobj = stateStorage.getChannel(channel);
	                }

	                var r = [chobj.callback || SUB_CALLBACK, channel.split(PRESENCE_SUFFIX)[0]];
	                channel2 && r.push(channel2.split(PRESENCE_SUFFIX)[0]);
	                return r;
	              };
	            }();

	            var latency = detect_latency(+messages[1]);
	            utils.each(messages[0], function (msg) {
	              var next = next_callback();
	              var decrypted_msg = decrypt(msg, stateStorage.getChannel(next[1]) ? stateStorage.getChannel(next[1])['cipher_key'] : null);
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
	      var data = networking.prepareParams({ auth: auth_key });

	      // Make sure we have a Channel
	      if (!keychain.getSubscribeKey()) return _error('Missing Subscribe Key');
	      if (!uuid) return _error('Missing UUID');
	      if (!channel && !channel_group) return _error('Missing Channel');

	      if (jsonp != '0') {
	        data['callback'] = jsonp;
	      }

	      if (typeof channel != 'undefined' && stateStorage.getChannel(channel) && stateStorage.getChannel(channel).subscribed) {
	        if (state) STATE[channel] = state;
	      }

	      if (typeof channel_group != 'undefined' && stateStorage.getChannelGroup(channel_group) && stateStorage.getChannelGroup(channel_group).subscribed) {
	        if (state) STATE[channel_group] = state;
	        data['channel-group'] = channel_group;

	        if (!channel) {
	          channel = ',';
	        }
	      }

	      data['state'] = JSON.stringify(state);

	      if (config.isInstanceIdEnabled()) {
	        data['instanceid'] = keychain.getInstanceId();
	      }

	      if (state) {
	        url = [networking.getStandardOrigin(), 'v2', 'presence', 'sub-key', keychain.getSubscribeKey(), 'channel', channel, 'uuid', uuid, 'data'];
	      } else {
	        url = [networking.getStandardOrigin(), 'v2', 'presence', 'sub-key', keychain.getSubscribeKey(), 'channel', channel, 'uuid', utils.encode(uuid)];
	      }

	      xdr({
	        callback: jsonp,
	        data: networking.prepareParams(data),
	        success: function success(response) {
	          _responders2.default.callback(response, callback, err);
	        },
	        fail: function fail(response) {
	          _responders2.default.error(response, err);
	        },
	        url: url

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
	      return stateStorage.generate_channel_list(true);
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

	      var channels = utils.encode(stateStorage.generate_channel_list(true).join(','));
	      var channel_groups = stateStorage.generate_channel_group_list(true).join(',');

	      if (!channels) channels = ',';
	      if (channel_groups) data['channel-group'] = channel_groups;

	      if (config.isInstanceIdEnabled()) {
	        data['instanceid'] = keychain.getInstanceId();
	      }

	      if (config.isRequestIdEnabled()) {
	        data['requestid'] = utils.generateUUID();
	      }

	      xdr({
	        callback: jsonp,
	        data: networking.prepareParams(data),
	        url: [networking.getStandardOrigin(), 'v2', 'presence', 'sub-key', keychain.getSubscribeKey(), 'channel', channels, 'heartbeat'],
	        success: function success(response) {
	          _responders2.default.callback(response, callback, err);
	        },
	        fail: function fail(response) {
	          _responders2.default.error(response, err);
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
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	//     uuid.js
	//
	//     Copyright (c) 2010-2012 Robert Kieffer
	//     MIT License - http://opensource.org/licenses/mit-license.php

	// Unique ID creation requires a high quality random # generator.  We feature
	// detect to determine the best RNG source, normalizing to a function that
	// returns 128-bits of randomness, since that's what's usually required
	var _rng = __webpack_require__(6);

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
/* 6 */
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
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _keychain = __webpack_require__(8);

	var _keychain2 = _interopRequireDefault(_keychain);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var utils = __webpack_require__(9);

	var _class = function () {
	  /* items that must be passed with each request. */

	  function _class(xdr, keychain) {
	    var ssl = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
	    var origin = arguments.length <= 3 || arguments[3] === undefined ? 'pubsub.pubnub.com' : arguments[3];

	    _classCallCheck(this, _class);

	    this._xdr = xdr;
	    this._keychain = keychain;

	    this._maxSubDomain = 20;
	    this._currentSubDomain = Math.floor(Math.random() * this._maxSubDomain);

	    this._providedFQDN = (ssl ? 'https://' : 'http://') + origin;
	    this._coreParams = {};

	    // create initial origins
	    this.shiftStandardOrigin(false);
	    this.shiftSubscribeOrigin(false);
	  }

	  _createClass(_class, [{
	    key: 'setCoreParams',
	    value: function setCoreParams(params) {
	      this._coreParams = params;
	      return this;
	    }
	  }, {
	    key: 'addCoreParam',
	    value: function addCoreParam(key, value) {
	      this._coreParams[key] = value;
	    }

	    /*
	      Fuses the provided endpoint specific params (from data) with instance params
	    */

	  }, {
	    key: 'prepareParams',
	    value: function prepareParams(data) {
	      if (!data) data = {};
	      utils.each(this._coreParams, function (key, value) {
	        if (!(key in data)) data[key] = value;
	      });
	      return data;
	    }
	  }, {
	    key: 'nextOrigin',
	    value: function nextOrigin(failover) {
	      // if a custom origin is supplied, use do not bother with shuffling subdomains
	      if (this._providedFQDN.indexOf('pubsub.') === -1) {
	        return this._providedFQDN;
	      }

	      var newSubDomain = void 0;

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
	    key: 'provisionDeviceForPush',
	    value: function provisionDeviceForPush(deviceId, _ref2) {
	      var data = _ref2.data;
	      var callback = _ref2.callback;
	      var success = _ref2.success;
	      var fail = _ref2.fail;

	      var url = [this.getStandardOrigin(), 'v1', 'push', 'sub-key', this._keychain.getSubscribeKey(), 'devices', deviceId];

	      this._xdr({ data: data, callback: callback, success: success, fail: fail, url: url });
	    }
	  }, {
	    key: 'performGrant',
	    value: function performGrant(_ref3) {
	      var data = _ref3.data;
	      var callback = _ref3.callback;
	      var success = _ref3.success;
	      var fail = _ref3.fail;

	      var url = [this.getStandardOrigin(), 'v1', 'auth', 'grant', 'sub-key', this._keychain.getSubscribeKey()];

	      this._xdr({ data: data, callback: callback, success: success, fail: fail, url: url });
	    }
	  }, {
	    key: 'performAudit',
	    value: function performAudit(_ref4) {
	      var data = _ref4.data;
	      var callback = _ref4.callback;
	      var success = _ref4.success;
	      var fail = _ref4.fail;

	      var url = [this.getStandardOrigin(), 'v1', 'auth', 'audit', 'sub-key', this._keychain.getSubscribeKey()];

	      this._xdr({ data: data, callback: callback, success: success, fail: fail, url: url });
	    }
	  }, {
	    key: 'fetchReplay',
	    value: function fetchReplay(source, destination, _ref5) {
	      var data = _ref5.data;
	      var callback = _ref5.callback;
	      var success = _ref5.success;
	      var fail = _ref5.fail;

	      var url = [this.getStandardOrigin(), 'v1', 'replay', this._keychain.getPublishKey(), this._keychain.getSubscribeKey(), source, destination];

	      this._xdr({ data: data, callback: callback, success: success, fail: fail, url: url });
	    }
	  }, {
	    key: 'fetchTime',
	    value: function fetchTime(jsonp, _ref6) {
	      var data = _ref6.data;
	      var callback = _ref6.callback;
	      var success = _ref6.success;
	      var fail = _ref6.fail;

	      var url = [this.getStandardOrigin(), 'time', jsonp];

	      this._xdr({ data: data, callback: callback, success: success, fail: fail, url: url });
	    }
	  }, {
	    key: 'fetchWhereNow',
	    value: function fetchWhereNow(uuid, _ref7) {
	      var data = _ref7.data;
	      var callback = _ref7.callback;
	      var success = _ref7.success;
	      var fail = _ref7.fail;

	      var url = [this.getStandardOrigin(), 'v2', 'presence', 'sub_key', this._keychain.getSubscribeKey(), 'uuid', utils.encode(uuid)];

	      this._xdr({ data: data, callback: callback, success: success, fail: fail, url: url });
	    }
	  }, {
	    key: 'fetchHereNow',
	    value: function fetchHereNow(channel, channel_group, _ref8) {
	      var data = _ref8.data;
	      var callback = _ref8.callback;
	      var success = _ref8.success;
	      var fail = _ref8.fail;

	      var url = [this.getStandardOrigin(), 'v2', 'presence', 'sub_key', this._keychain.getSubscribeKey()];

	      if (channel) {
	        url.push('channel');
	        url.push(utils.encode(channel));
	      }

	      if (channel_group && !channel) {
	        url.push('channel');
	        url.push(',');
	      }

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
/* 8 */
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
	    key: "setCipherKey",
	    value: function setCipherKey(cipherKey) {
	      this._cipherKey = cipherKey;
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
	    key: "getCipherKey",
	    value: function getCipherKey() {
	      return this._cipherKey;
	    }
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
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _uuid = __webpack_require__(5);

	var _uuid2 = _interopRequireDefault(_uuid);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/* eslint no-unused-expressions: 0, block-scoped-var: 0, no-redeclare: 0, guard-for-in: 0 */

	var defaultConfiguration = __webpack_require__(10);
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

	function _object_to_key_list(o) {
	  var l = [];
	  each(o, function (key) {
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
	    si += k + '=' + pamEncode(params[k]);
	    if (i !== l.length - 1) si += '&';
	  }
	  return si;
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
	  grep: grep,
	  _get_pam_sign_input_from_params: _get_pam_sign_input_from_params,
	  _object_to_key_list_sorted: _object_to_key_list_sorted,
	  _object_to_key_list: _object_to_key_list
	};
	//# sourceMappingURL=utils.js.map


/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = {
		"PARAMSBIT": "&",
		"URLBIT": "/"
	};

/***/ },
/* 11 */
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
/* 12 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class() {
	    _classCallCheck(this, _class);

	    this._channelStorage = new Map();
	    this._channelGroupStorage = new Map();
	  }

	  _createClass(_class, [{
	    key: 'containsChannel',
	    value: function containsChannel(name) {
	      return this._channelStorage.has(name);
	    }
	  }, {
	    key: 'containsChannelGroup',
	    value: function containsChannelGroup(name) {
	      return this._channelGroupStorage.has(name);
	    }
	  }, {
	    key: 'getChannel',
	    value: function getChannel(name) {
	      return this._channelStorage.get(name);
	    }
	  }, {
	    key: 'getChannelGroup',
	    value: function getChannelGroup(name) {
	      return this._channelGroupStorage.get(name);
	    }
	  }, {
	    key: 'addChannel',
	    value: function addChannel(name, metadata) {
	      this._channelStorage.set(name, metadata);
	    }
	  }, {
	    key: 'addChannelGroup',
	    value: function addChannelGroup(name, metadata) {
	      this._channelGroupStorage.set(name, metadata);
	    }

	    /**
	     * Generate Subscription Channel List
	     * ==================================
	     * generate_channel_list(channels_object);
	     * nopresence (==include-presence) == false --> presence True
	     */

	  }, {
	    key: 'generate_channel_list',
	    value: function generate_channel_list(nopresence) {
	      var list = [];
	      this._channelStorage.forEach(function (status, channel) {
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

	  }, {
	    key: 'generate_channel_group_list',
	    value: function generate_channel_group_list(nopresence) {
	      var list = [];
	      this._channelGroupStorage.forEach(function (status, channel_group) {
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
	  }]);

	  return _class;
	}();

	exports.default = _class;
	//# sourceMappingURL=state.js.map


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _pick2 = __webpack_require__(14);

	var _pick3 = _interopRequireDefault(_pick2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class() {
	    _classCallCheck(this, _class);
	  }

	  _createClass(_class, null, [{
	    key: 'callback',
	    value: function callback(response, _callback, err) {
	      if ((typeof response === 'undefined' ? 'undefined' : _typeof(response)) === 'object') {
	        if (response.error) {
	          var preparedData = (0, _pick3.default)(response, ['message', 'payload']);
	          if (err) err(preparedData);
	          return;
	        }
	        if (response.payload) {
	          if (response.next_page) {
	            if (_callback) _callback(response.payload, response.next_page);
	          } else {
	            if (_callback) _callback(response.payload);
	          }
	          return;
	        }
	      }
	      if (_callback) _callback(response);
	    }
	  }, {
	    key: 'error',
	    value: function error(response, err) {
	      if ((typeof response === 'undefined' ? 'undefined' : _typeof(response)) === 'object' && response.error) {
	        var preparedData = (0, _pick3.default)(response, ['message', 'payload']);
	        if (err) return err(preparedData);
	      } else {
	        if (err) return err(response);
	      }
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;
	//# sourceMappingURL=responders.js.map


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var baseFlatten = __webpack_require__(15),
	    basePick = __webpack_require__(27),
	    rest = __webpack_require__(29);

	/**
	 * Creates an object composed of the picked `object` properties.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The source object.
	 * @param {...(string|string[])} [props] The property names to pick, specified
	 *  individually or in arrays.
	 * @returns {Object} Returns the new object.
	 * @example
	 *
	 * var object = { 'a': 1, 'b': '2', 'c': 3 };
	 *
	 * _.pick(object, ['a', 'c']);
	 * // => { 'a': 1, 'c': 3 }
	 */
	var pick = rest(function(object, props) {
	  return object == null ? {} : basePick(object, baseFlatten(props, 1));
	});

	module.exports = pick;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var arrayPush = __webpack_require__(16),
	    isArguments = __webpack_require__(17),
	    isArray = __webpack_require__(26),
	    isArrayLikeObject = __webpack_require__(18);

	/**
	 * The base implementation of `_.flatten` with support for restricting flattening.
	 *
	 * @private
	 * @param {Array} array The array to flatten.
	 * @param {number} depth The maximum recursion depth.
	 * @param {boolean} [isStrict] Restrict flattening to arrays-like objects.
	 * @param {Array} [result=[]] The initial result value.
	 * @returns {Array} Returns the new flattened array.
	 */
	function baseFlatten(array, depth, isStrict, result) {
	  result || (result = []);

	  var index = -1,
	      length = array.length;

	  while (++index < length) {
	    var value = array[index];
	    if (depth > 0 && isArrayLikeObject(value) &&
	        (isStrict || isArray(value) || isArguments(value))) {
	      if (depth > 1) {
	        // Recursively flatten arrays (susceptible to call stack limits).
	        baseFlatten(value, depth - 1, isStrict, result);
	      } else {
	        arrayPush(result, value);
	      }
	    } else if (!isStrict) {
	      result[result.length] = value;
	    }
	  }
	  return result;
	}

	module.exports = baseFlatten;


/***/ },
/* 16 */
/***/ function(module, exports) {

	/**
	 * Appends the elements of `values` to `array`.
	 *
	 * @private
	 * @param {Array} array The array to modify.
	 * @param {Array} values The values to append.
	 * @returns {Array} Returns `array`.
	 */
	function arrayPush(array, values) {
	  var index = -1,
	      length = values.length,
	      offset = array.length;

	  while (++index < length) {
	    array[offset + index] = values[index];
	  }
	  return array;
	}

	module.exports = arrayPush;


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var isArrayLikeObject = __webpack_require__(18);

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]';

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/** Built-in value references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;

	/**
	 * Checks if `value` is likely an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	function isArguments(value) {
	  // Safari 8.1 incorrectly makes `arguments.callee` enumerable in strict mode.
	  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
	    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
	}

	module.exports = isArguments;


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var isArrayLike = __webpack_require__(19),
	    isObjectLike = __webpack_require__(25);

	/**
	 * This method is like `_.isArrayLike` except that it also checks if `value`
	 * is an object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array-like object, else `false`.
	 * @example
	 *
	 * _.isArrayLikeObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLikeObject(document.body.children);
	 * // => true
	 *
	 * _.isArrayLikeObject('abc');
	 * // => false
	 *
	 * _.isArrayLikeObject(_.noop);
	 * // => false
	 */
	function isArrayLikeObject(value) {
	  return isObjectLike(value) && isArrayLike(value);
	}

	module.exports = isArrayLikeObject;


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var getLength = __webpack_require__(20),
	    isFunction = __webpack_require__(22),
	    isLength = __webpack_require__(24);

	/**
	 * Checks if `value` is array-like. A value is considered array-like if it's
	 * not a function and has a `value.length` that's an integer greater than or
	 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 * @example
	 *
	 * _.isArrayLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLike(document.body.children);
	 * // => true
	 *
	 * _.isArrayLike('abc');
	 * // => true
	 *
	 * _.isArrayLike(_.noop);
	 * // => false
	 */
	function isArrayLike(value) {
	  return value != null && isLength(getLength(value)) && !isFunction(value);
	}

	module.exports = isArrayLike;


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var baseProperty = __webpack_require__(21);

	/**
	 * Gets the "length" property value of `object`.
	 *
	 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
	 * that affects Safari on at least iOS 8.1-8.3 ARM64.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {*} Returns the "length" value.
	 */
	var getLength = baseProperty('length');

	module.exports = getLength;


/***/ },
/* 21 */
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new function.
	 */
	function baseProperty(key) {
	  return function(object) {
	    return object == null ? undefined : object[key];
	  };
	}

	module.exports = baseProperty;


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(23);

	/** `Object#toString` result references. */
	var funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]';

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 8 which returns 'object' for typed array and weak map constructors,
	  // and PhantomJS 1.9 which returns 'function' for `NodeList` instances.
	  var tag = isObject(value) ? objectToString.call(value) : '';
	  return tag == funcTag || tag == genTag;
	}

	module.exports = isFunction;


/***/ },
/* 23 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
	 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}

	module.exports = isObject;


/***/ },
/* 24 */
/***/ function(module, exports) {

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This function is loosely based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 * @example
	 *
	 * _.isLength(3);
	 * // => true
	 *
	 * _.isLength(Number.MIN_VALUE);
	 * // => false
	 *
	 * _.isLength(Infinity);
	 * // => false
	 *
	 * _.isLength('3');
	 * // => false
	 */
	function isLength(value) {
	  return typeof value == 'number' &&
	    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}

	module.exports = isLength;


/***/ },
/* 25 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}

	module.exports = isObjectLike;


/***/ },
/* 26 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @type {Function}
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */
	var isArray = Array.isArray;

	module.exports = isArray;


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var arrayReduce = __webpack_require__(28);

	/**
	 * The base implementation of `_.pick` without support for individual
	 * property names.
	 *
	 * @private
	 * @param {Object} object The source object.
	 * @param {string[]} props The property names to pick.
	 * @returns {Object} Returns the new object.
	 */
	function basePick(object, props) {
	  object = Object(object);
	  return arrayReduce(props, function(result, key) {
	    if (key in object) {
	      result[key] = object[key];
	    }
	    return result;
	  }, {});
	}

	module.exports = basePick;


/***/ },
/* 28 */
/***/ function(module, exports) {

	/**
	 * A specialized version of `_.reduce` for arrays without support for
	 * iteratee shorthands.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {*} [accumulator] The initial value.
	 * @param {boolean} [initAccum] Specify using the first element of `array` as the initial value.
	 * @returns {*} Returns the accumulated value.
	 */
	function arrayReduce(array, iteratee, accumulator, initAccum) {
	  var index = -1,
	      length = array.length;

	  if (initAccum && length) {
	    accumulator = array[++index];
	  }
	  while (++index < length) {
	    accumulator = iteratee(accumulator, array[index], index, array);
	  }
	  return accumulator;
	}

	module.exports = arrayReduce;


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var apply = __webpack_require__(30),
	    toInteger = __webpack_require__(31);

	/** Used as the `TypeError` message for "Functions" methods. */
	var FUNC_ERROR_TEXT = 'Expected a function';

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;

	/**
	 * Creates a function that invokes `func` with the `this` binding of the
	 * created function and arguments from `start` and beyond provided as an array.
	 *
	 * **Note:** This method is based on the [rest parameter](https://mdn.io/rest_parameters).
	 *
	 * @static
	 * @memberOf _
	 * @category Function
	 * @param {Function} func The function to apply a rest parameter to.
	 * @param {number} [start=func.length-1] The start position of the rest parameter.
	 * @returns {Function} Returns the new function.
	 * @example
	 *
	 * var say = _.rest(function(what, names) {
	 *   return what + ' ' + _.initial(names).join(', ') +
	 *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
	 * });
	 *
	 * say('hello', 'fred', 'barney', 'pebbles');
	 * // => 'hello fred, barney, & pebbles'
	 */
	function rest(func, start) {
	  if (typeof func != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  start = nativeMax(start === undefined ? (func.length - 1) : toInteger(start), 0);
	  return function() {
	    var args = arguments,
	        index = -1,
	        length = nativeMax(args.length - start, 0),
	        array = Array(length);

	    while (++index < length) {
	      array[index] = args[start + index];
	    }
	    switch (start) {
	      case 0: return func.call(this, array);
	      case 1: return func.call(this, args[0], array);
	      case 2: return func.call(this, args[0], args[1], array);
	    }
	    var otherArgs = Array(start + 1);
	    index = -1;
	    while (++index < start) {
	      otherArgs[index] = args[index];
	    }
	    otherArgs[start] = array;
	    return apply(func, this, otherArgs);
	  };
	}

	module.exports = rest;


/***/ },
/* 30 */
/***/ function(module, exports) {

	/**
	 * A faster alternative to `Function#apply`, this function invokes `func`
	 * with the `this` binding of `thisArg` and the arguments of `args`.
	 *
	 * @private
	 * @param {Function} func The function to invoke.
	 * @param {*} thisArg The `this` binding of `func`.
	 * @param {...*} args The arguments to invoke `func` with.
	 * @returns {*} Returns the result of `func`.
	 */
	function apply(func, thisArg, args) {
	  var length = args.length;
	  switch (length) {
	    case 0: return func.call(thisArg);
	    case 1: return func.call(thisArg, args[0]);
	    case 2: return func.call(thisArg, args[0], args[1]);
	    case 3: return func.call(thisArg, args[0], args[1], args[2]);
	  }
	  return func.apply(thisArg, args);
	}

	module.exports = apply;


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	var toNumber = __webpack_require__(32);

	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0,
	    MAX_INTEGER = 1.7976931348623157e+308;

	/**
	 * Converts `value` to an integer.
	 *
	 * **Note:** This function is loosely based on [`ToInteger`](http://www.ecma-international.org/ecma-262/6.0/#sec-tointeger).
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {number} Returns the converted integer.
	 * @example
	 *
	 * _.toInteger(3);
	 * // => 3
	 *
	 * _.toInteger(Number.MIN_VALUE);
	 * // => 0
	 *
	 * _.toInteger(Infinity);
	 * // => 1.7976931348623157e+308
	 *
	 * _.toInteger('3');
	 * // => 3
	 */
	function toInteger(value) {
	  if (!value) {
	    return value === 0 ? value : 0;
	  }
	  value = toNumber(value);
	  if (value === INFINITY || value === -INFINITY) {
	    var sign = (value < 0 ? -1 : 1);
	    return sign * MAX_INTEGER;
	  }
	  var remainder = value % 1;
	  return value === value ? (remainder ? value - remainder : value) : 0;
	}

	module.exports = toInteger;


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	var isFunction = __webpack_require__(22),
	    isObject = __webpack_require__(23);

	/** Used as references for various `Number` constants. */
	var NAN = 0 / 0;

	/** Used to match leading and trailing whitespace. */
	var reTrim = /^\s+|\s+$/g;

	/** Used to detect bad signed hexadecimal string values. */
	var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

	/** Used to detect binary string values. */
	var reIsBinary = /^0b[01]+$/i;

	/** Used to detect octal string values. */
	var reIsOctal = /^0o[0-7]+$/i;

	/** Built-in method references without a dependency on `root`. */
	var freeParseInt = parseInt;

	/**
	 * Converts `value` to a number.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {number} Returns the number.
	 * @example
	 *
	 * _.toNumber(3);
	 * // => 3
	 *
	 * _.toNumber(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toNumber(Infinity);
	 * // => Infinity
	 *
	 * _.toNumber('3');
	 * // => 3
	 */
	function toNumber(value) {
	  if (isObject(value)) {
	    var other = isFunction(value.valueOf) ? value.valueOf() : value;
	    value = isObject(other) ? (other + '') : other;
	  }
	  if (typeof value != 'string') {
	    return value === 0 ? value : +value;
	  }
	  value = value.replace(reTrim, '');
	  var isBinary = reIsBinary.test(value);
	  return (isBinary || reIsOctal.test(value))
	    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
	    : (reIsBadHex.test(value) ? NAN : +value);
	}

	module.exports = toNumber;


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _networking = __webpack_require__(7);

	var _networking2 = _interopRequireDefault(_networking);

	var _config = __webpack_require__(11);

	var _config2 = _interopRequireDefault(_config);

	var _keychain = __webpack_require__(8);

	var _keychain2 = _interopRequireDefault(_keychain);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class(_ref) {
	    var networking = _ref.networking;
	    var config = _ref.config;
	    var keychain = _ref.keychain;
	    var jsonp_cb = _ref.jsonp_cb;

	    _classCallCheck(this, _class);

	    this._networking = networking;
	    this._config = config;
	    this._keychain = keychain;
	    this._jsonp_cb = jsonp_cb;
	  }

	  _createClass(_class, [{
	    key: 'fetchTime',
	    value: function fetchTime(callback) {
	      var jsonp = this._jsonp_cb();

	      var data = {
	        uuid: this._keychain.getUUID(),
	        auth: this._keychain.getAuthKey()
	      };

	      if (this._config.isInstanceIdEnabled()) {
	        data.instanceid = this._keychain.getInstanceId();
	      }

	      var onSuccess = function onSuccess(response) {
	        callback(response[0]);
	      };

	      var onFail = function onFail() {
	        callback(0);
	      };

	      this._networking.fetchTime(jsonp, {
	        callback: jsonp,
	        data: this._networking.prepareParams(data),
	        success: onSuccess,
	        fail: onFail
	      });
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;
	//# sourceMappingURL=time.js.map


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _networking = __webpack_require__(7);

	var _networking2 = _interopRequireDefault(_networking);

	var _config = __webpack_require__(11);

	var _config2 = _interopRequireDefault(_config);

	var _keychain = __webpack_require__(8);

	var _keychain2 = _interopRequireDefault(_keychain);

	var _responders = __webpack_require__(13);

	var _responders2 = _interopRequireDefault(_responders);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class(_ref) {
	    var networking = _ref.networking;
	    var config = _ref.config;
	    var keychain = _ref.keychain;
	    var jsonp_cb = _ref.jsonp_cb;
	    var error = _ref.error;

	    _classCallCheck(this, _class);

	    this._networking = networking;
	    this._config = config;
	    this._keychain = keychain;
	    this._jsonp_cb = jsonp_cb;
	    this._error = error;
	  }

	  _createClass(_class, [{
	    key: 'hereNow',
	    value: function hereNow(args, argumentCallback) {
	      var callback = args.callback || argumentCallback;
	      var err = args.error || function () {};
	      var auth_key = args.auth_key || this._keychain.getAuthKey();
	      var channel = args.channel;
	      var channel_group = args.channel_group;
	      var jsonp = this._jsonp_cb();
	      var uuids = 'uuids' in args ? args.uuids : true;
	      var state = args.state;
	      var data = { uuid: this._keychain.getUUID(), auth: auth_key };

	      if (!uuids) data.disable_uuids = 1;
	      if (state) data.state = 1;

	      // Make sure we have a Channel
	      if (!callback) return this._error('Missing Callback');
	      if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');

	      if (jsonp !== 0) {
	        data.callback = jsonp;
	      }

	      if (channel_group) {
	        data['channel-group'] = channel_group;
	      }

	      if (this._config.isInstanceIdEnabled()) {
	        data.instanceid = this._keychain.getInstanceId();
	      }

	      this._networking.fetchHereNow(channel, channel_group, {
	        callback: jsonp,
	        data: this._networking.prepareParams(data),
	        success: function success(response) {
	          _responders2.default.callback(response, callback, err);
	        },
	        fail: function fail(response) {
	          _responders2.default.error(response, err);
	        }
	      });
	    }
	  }, {
	    key: 'whereNow',
	    value: function whereNow(args, argumentCallback) {
	      var callback = args.callback || argumentCallback;
	      var err = args.error || function () {};
	      var auth_key = args.auth_key || this._keychain.getAuthKey();
	      var jsonp = this._jsonp_cb();
	      var uuid = args.uuid || this._keychain.getUUID();
	      var data = { auth: auth_key };

	      // Make sure we have a Channel
	      if (!callback) return this._error('Missing Callback');
	      if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');

	      if (jsonp !== 0) {
	        data['callback'] = jsonp;
	      }

	      if (this._config.isInstanceIdEnabled()) {
	        data['instanceid'] = this._keychain.getInstanceId();
	      }

	      this._networking.fetchWhereNow(uuid, {
	        callback: jsonp,
	        data: this._networking.prepareParams(data),
	        success: function success(response) {
	          _responders2.default.callback(response, callback, err);
	        },
	        fail: function fail(response) {
	          _responders2.default.error(response, err);
	        }
	      });
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;
	//# sourceMappingURL=presence.js.map


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _networking = __webpack_require__(7);

	var _networking2 = _interopRequireDefault(_networking);

	var _keychain = __webpack_require__(8);

	var _keychain2 = _interopRequireDefault(_keychain);

	var _responders = __webpack_require__(13);

	var _responders2 = _interopRequireDefault(_responders);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class(_ref) {
	    var networking = _ref.networking;
	    var keychain = _ref.keychain;
	    var jsonp_cb = _ref.jsonp_cb;
	    var error = _ref.error;
	    var decrypt = _ref.decrypt;

	    _classCallCheck(this, _class);

	    this._networking = networking;
	    this._keychain = keychain;
	    this._jsonp_cb = jsonp_cb;
	    this._error = error;
	    this._decrypt = decrypt;
	  }

	  _createClass(_class, [{
	    key: 'fetchHistory',
	    value: function fetchHistory(args, argumentCallback) {
	      var _this = this;

	      var callback = args.callback || argumentCallback;
	      var count = args.count || args.limit || 100;
	      var reverse = args.reverse || 'false';
	      var err = args.error || function () {};
	      var auth_key = args.auth_key || this._keychain.getAuthKey();
	      var cipher_key = args.cipher_key;
	      var channel = args.channel;
	      var channel_group = args.channel_group;
	      var start = args.start;
	      var end = args.end;
	      var include_token = args.include_token;
	      var string_msg_token = args.string_message_token || false;
	      var jsonp = this._jsonp_cb();

	      // Make sure we have a Channel
	      if (!channel && !channel_group) return this._error('Missing Channel');
	      if (!callback) return this._error('Missing Callback');
	      if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');

	      var params = {
	        stringtoken: 'true',
	        count: count,
	        reverse: reverse,
	        auth: auth_key
	      };

	      if (channel_group) {
	        params['channel-group'] = channel_group;
	        if (!channel) {
	          channel = ',';
	        }
	      }
	      if (jsonp) params.callback = jsonp;
	      if (start) params.start = start;
	      if (end) params.end = end;
	      if (include_token) params.include_token = 'true';
	      if (string_msg_token) params.string_message_token = 'true';

	      // Send Message
	      this._networking.fetchHistory(channel, {
	        callback: jsonp,
	        data: this._networking.prepareParams(params),
	        success: function success(response) {
	          _this._handleHistoryResponse(response, err, callback, include_token, cipher_key);
	        },
	        fail: function fail(response) {
	          _responders2.default.error(response, err);
	        }
	      });
	    }
	  }, {
	    key: '_handleHistoryResponse',
	    value: function _handleHistoryResponse(response, err, callback, include_token, cipher_key) {
	      if ((typeof response === 'undefined' ? 'undefined' : _typeof(response)) === 'object' && response['error']) {
	        err({ message: response.message, payload: response.payload });
	        return;
	      }
	      var messages = response[0];
	      var decrypted_messages = [];
	      for (var a = 0; a < messages.length; a++) {
	        if (include_token) {
	          var _new_message = this._decrypt(messages[a].message, cipher_key);
	          var timetoken = messages[a].timetoken;
	          try {
	            decrypted_messages.push({ message: JSON.parse(_new_message), timetoken: timetoken });
	          } catch (e) {
	            decrypted_messages.push({ message: _new_message, timetoken: timetoken });
	          }
	        } else {
	          var new_message = this._decrypt(messages[a], cipher_key);
	          try {
	            decrypted_messages.push(JSON.parse(new_message));
	          } catch (e) {
	            decrypted_messages.push(new_message);
	          }
	        }
	      }
	      callback([decrypted_messages, response[1], response[2]]);
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;
	//# sourceMappingURL=history.js.map


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _networking = __webpack_require__(7);

	var _networking2 = _interopRequireDefault(_networking);

	var _keychain = __webpack_require__(8);

	var _keychain2 = _interopRequireDefault(_keychain);

	var _config = __webpack_require__(11);

	var _config2 = _interopRequireDefault(_config);

	var _responders = __webpack_require__(13);

	var _responders2 = _interopRequireDefault(_responders);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class(_ref) {
	    var networking = _ref.networking;
	    var keychain = _ref.keychain;
	    var jsonp_cb = _ref.jsonp_cb;
	    var error = _ref.error;
	    var config = _ref.config;

	    _classCallCheck(this, _class);

	    this._networking = networking;
	    this._keychain = keychain;
	    this._jsonp_cb = jsonp_cb;
	    this._error = error;
	    this._config = config;
	  }

	  _createClass(_class, [{
	    key: 'provisionDevice',
	    value: function provisionDevice(args) {
	      var callback = args.callback || function () {};
	      var auth_key = args.auth_key || this._keychain.getAuthKey();
	      var err = args.error || function () {};
	      var jsonp = this._jsonp_cb();
	      var channel = args.channel;
	      var op = args.op;
	      var gw_type = args.gw_type;
	      var device_id = args.device_id;

	      if (!device_id) return this._error('Missing Device ID (device_id)');
	      if (!gw_type) return this._error('Missing GW Type (gw_type: gcm or apns)');
	      if (!op) return this._error('Missing GW Operation (op: add or remove)');
	      if (!channel) return this._error('Missing gw destination Channel (channel)');
	      if (!this._keychain.getPublishKey()) return this._error('Missing Publish Key');
	      if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');

	      var params = { uuid: this._keychain.getUUID(), auth: auth_key, type: gw_type };

	      if (op === 'add') {
	        params.add = channel;
	      } else if (op === 'remove') {
	        params.remove = channel;
	      }

	      if (this._config.isInstanceIdEnabled()) {
	        params.instanceid = this._keychain.getInstanceId();
	      }

	      this._networking.provisionDeviceForPush(device_id, {
	        callback: jsonp,
	        data: params,
	        success: function success(response) {
	          _responders2.default.callback(response, callback, err);
	        },
	        fail: function fail(response) {
	          _responders2.default.error(response, err);
	        }
	      });
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;
	//# sourceMappingURL=push.js.map


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _networking = __webpack_require__(7);

	var _networking2 = _interopRequireDefault(_networking);

	var _config = __webpack_require__(11);

	var _config2 = _interopRequireDefault(_config);

	var _keychain = __webpack_require__(8);

	var _keychain2 = _interopRequireDefault(_keychain);

	var _responders = __webpack_require__(13);

	var _responders2 = _interopRequireDefault(_responders);

	var _utils = __webpack_require__(9);

	var _utils2 = _interopRequireDefault(_utils);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class(_ref) {
	    var networking = _ref.networking;
	    var config = _ref.config;
	    var keychain = _ref.keychain;
	    var jsonp_cb = _ref.jsonp_cb;
	    var error = _ref.error;
	    var hmac_SHA256 = _ref.hmac_SHA256;

	    _classCallCheck(this, _class);

	    this._networking = networking;
	    this._keychain = keychain;
	    this._config = config;
	    this._jsonp_cb = jsonp_cb;
	    this._error = error;
	    this._hmac_SHA256 = hmac_SHA256;
	  }

	  _createClass(_class, [{
	    key: 'performGrant',
	    value: function performGrant(args, argumentCallback) {
	      var callback = args.callback || argumentCallback;
	      var err = args.error || function () {};
	      var channel = args.channel || args.channels;
	      var channel_group = args.channel_group;
	      var jsonp = this._jsonp_cb();
	      var ttl = args.ttl;
	      var r = args.read ? '1' : '0';
	      var w = args.write ? '1' : '0';
	      var m = args.manage ? '1' : '0';
	      var auth_key = args.auth_key || args.auth_keys;

	      if (!callback) return this._error('Missing Callback');
	      if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');
	      if (!this._keychain.getPublishKey()) return this._error('Missing Publish Key');
	      if (!this._keychain.getSecretKey()) return this._error('Missing Secret Key');

	      var timestamp = Math.floor(new Date().getTime() / 1000);
	      var sign_input = this._keychain.getSubscribeKey() + '\n' + this._keychain.getPublishKey() + '\n' + 'grant' + '\n';

	      var data = { w: w, r: r, timestamp: timestamp };

	      if (args.manage) {
	        data.m = m;
	      }
	      if (_utils2.default.isArray(channel)) {
	        channel = channel.join(',');
	      }
	      if (_utils2.default.isArray(auth_key)) {
	        auth_key = auth_key.join(',');
	      }

	      if (typeof channel !== 'undefined' && channel !== null && channel.length > 0) {
	        data.channel = channel;
	      }

	      if (typeof channel_group !== 'undefined' && channel_group !== null && channel_group.length > 0) {
	        data['channel-group'] = channel_group;
	      }

	      if (jsonp !== 0) {
	        data.callback = jsonp;
	      }
	      if (ttl || ttl === 0) data.ttl = ttl;

	      if (auth_key) data.auth = auth_key;

	      data = this._networking.prepareParams(data);

	      if (!auth_key) delete data.auth;

	      sign_input += _utils2.default._get_pam_sign_input_from_params(data);

	      var signature = this._hmac_SHA256(sign_input, this._keychain.getSecretKey());

	      signature = signature.replace(/\+/g, '-');
	      signature = signature.replace(/\//g, '_');

	      data.signature = signature;

	      this._networking.performGrant({
	        callback: jsonp,
	        data: data,
	        success: function success(response) {
	          _responders2.default.callback(response, callback, err);
	        },
	        fail: function fail(response) {
	          _responders2.default.error(response, err);
	        }
	      });
	    }
	  }, {
	    key: 'performAudit',
	    value: function performAudit(args, argumentCallback) {
	      var callback = args.callback || argumentCallback;
	      var err = args.error || function () {};
	      var channel = args.channel;
	      var channel_group = args.channel_group;
	      var auth_key = args.auth_key;
	      var jsonp = this._jsonp_cb();

	      // Make sure we have a Channel
	      if (!callback) return this._error('Missing Callback');
	      if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');
	      if (!this._keychain.getPublishKey()) return this._error('Missing Publish Key');
	      if (!this._keychain.getSecretKey()) return this._error('Missing Secret Key');

	      var timestamp = Math.floor(new Date().getTime() / 1000);
	      var sign_input = this._keychain.getSubscribeKey() + '\n' + this._keychain.getPublishKey() + '\n' + 'audit' + '\n';

	      var data = { timestamp: timestamp };
	      if (jsonp !== 0) {
	        data.callback = jsonp;
	      }

	      if (typeof channel !== 'undefined' && channel !== null && channel.length > 0) {
	        data.channel = channel;
	      }

	      if (typeof channel_group !== 'undefined' && channel_group !== null && channel_group.length > 0) {
	        data['channel-group'] = channel_group;
	      }

	      if (auth_key) data.auth = auth_key;

	      data = this._networking.prepareParams(data);

	      if (!auth_key) delete data.auth;

	      sign_input += _utils2.default._get_pam_sign_input_from_params(data);

	      var signature = this._hmac_SHA256(sign_input, this._keychain.getSecretKey());

	      signature = signature.replace(/\+/g, '-');
	      signature = signature.replace(/\//g, '_');

	      data.signature = signature;
	      this._networking.performAudit({
	        callback: jsonp,
	        data: data,
	        success: function success(response) {
	          _responders2.default.callback(response, callback, err);
	        },
	        fail: function fail(response) {
	          _responders2.default.error(response, err);
	        }
	      });
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;
	//# sourceMappingURL=access.js.map


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _networking = __webpack_require__(7);

	var _networking2 = _interopRequireDefault(_networking);

	var _keychain = __webpack_require__(8);

	var _keychain2 = _interopRequireDefault(_keychain);

	var _responders = __webpack_require__(13);

	var _responders2 = _interopRequireDefault(_responders);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class(_ref) {
	    var networking = _ref.networking;
	    var keychain = _ref.keychain;
	    var jsonp_cb = _ref.jsonp_cb;
	    var error = _ref.error;

	    _classCallCheck(this, _class);

	    this._networking = networking;
	    this._keychain = keychain;
	    this._jsonp_cb = jsonp_cb;
	    this._error = error;
	  }

	  _createClass(_class, [{
	    key: 'performReplay',
	    value: function performReplay(args, argumentCallback) {
	      var callback = argumentCallback || args.callback || function () {};
	      var auth_key = args.auth_key || this._keychain.getAuthKey();
	      var source = args.source;
	      var destination = args.destination;
	      var err = args.error || args.error || function () {};
	      var stop = args.stop;
	      var start = args.start;
	      var end = args.end;
	      var reverse = args.reverse;
	      var limit = args.limit;
	      var jsonp = this._jsonp_cb();
	      var data = {};

	      // Check User Input
	      if (!source) return this._error('Missing Source Channel');
	      if (!destination) return this._error('Missing Destination Channel');
	      if (!this._keychain.getPublishKey()) return this._error('Missing Publish Key');
	      if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');

	      // Setup URL Params
	      if (jsonp !== 0) data.callback = jsonp;
	      if (stop) data.stop = 'all';
	      if (reverse) data.reverse = 'true';
	      if (start) data.start = start;
	      if (end) data.end = end;
	      if (limit) data.count = limit;

	      data.auth = auth_key;

	      // Start (or Stop) Replay!
	      this._networking.fetchReplay(source, destination, {
	        callback: jsonp,
	        success: function success(response) {
	          _responders2.default.callback(response, callback, err);
	        },
	        fail: function fail() {
	          callback([0, 'Disconnected']);
	        },
	        data: this._networking.prepareParams(data)
	      });
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;
	//# sourceMappingURL=replay.js.map


/***/ }
/******/ ])
});
;