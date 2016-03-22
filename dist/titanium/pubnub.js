/*! 4.0.0-beta1 / Titanium */
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

	'use strict';

	/* globals window, console, PLATFORM, Ti */
	/* eslint no-unused-expressions: 0, no-console: 0, camelcase: 0, curly: 0, no-redeclare: 0 */

	var crypto_obj = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../../vendor/umd_vendor/crypto-obj.js\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	var packageJSON = __webpack_require__(1);
	var pubNubCore = __webpack_require__(2);
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
	var db = function () {
	  return {
	    get: function get(key) {
	      Ti.App.Properties.getString('' + key);
	    },
	    set: function set(key, value) {
	      Ti.App.Properties.setString('' + key, '' + value);
	    }
	  };
	}();

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

	  var fail = function fail() {
	    if (failed) return;
	    failed = 1;
	    (setup.fail || function () {})();
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
	        data = JSON['parse'](body.join('').split('\r\n').slice(-1));
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
	    connected: function connected() {
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

	  var done = function done(failed) {
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

	  var finished = function finished() {
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

	  timer = pubNubCore.timeout(function () {
	    done(1);
	  }, pubNubCore.XHRTME);

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
	  unbind: function unbind(name) {
	    events.list[name] = [];
	  },
	  bind: function bind(name, fun) {
	    (events.list[name] = events.list[name] || []).push(fun);
	  },
	  fire: function fire(name, data) {
	    pubNubCore.each(events.list[name] || [], function (fun) {
	      fun(data);
	    });
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

	  var SELF = function SELF(setup) {
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

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = {
		"name": "pubnub",
		"preferGlobal": false,
		"version": "4.0.0-beta1",
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
			"event-emitter": "^0.3.4",
			"lodash": "^4.1.0",
			"loglevel": "^1.4.0",
			"q": "^1.4.1",
			"sinon-as-promised": "^4.0.0",
			"superagent": "^1.8.0",
			"uuid": "^2.0.1"
		},
		"noAnalyze": false,
		"devDependencies": {
			"babel-core": "^6.6.5",
			"babel-eslint": "5.0.0",
			"babel-plugin-transform-class-properties": "^6.6.0",
			"babel-plugin-transform-flow-strip-types": "^6.6.5",
			"babel-preset-es2015": "^6.6.0",
			"babel-register": "^6.6.5",
			"chai": "^3.5.0",
			"chai-as-promised": "^5.2.0",
			"eslint": "2.2.0",
			"eslint-config-airbnb": "6.0.2",
			"eslint-plugin-flowtype": "2.1.0",
			"eslint-plugin-mocha": "2.0.0",
			"eslint-plugin-react": "4.1.0",
			"flow-bin": "^0.22.1",
			"gulp": "^3.9.1",
			"gulp-babel": "^6.1.2",
			"gulp-clean": "^0.3.2",
			"gulp-exec": "^2.1.2",
			"gulp-flowtype": "^0.4.9",
			"gulp-mocha": "^2.2.0",
			"gulp-rename": "^1.2.2",
			"gulp-webpack": "^1.5.0",
			"imports-loader": "0.6.5",
			"json-loader": "0.5.4",
			"karma": "0.13.21",
			"karma-babel-preprocessor": "^6.0.1",
			"karma-chai": "0.1.0",
			"karma-chrome-launcher": "^0.2.2",
			"karma-mocha": "^0.2.2",
			"karma-phantomjs-launcher": "1.0.0",
			"karma-spec-reporter": "0.0.24",
			"mocha": "2.4.5",
			"node-uuid": "1.4.7",
			"phantomjs-prebuilt": "2.1.4",
			"proxyquire": "1.7.4",
			"run-sequence": "^1.1.5",
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
		}
	};

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = undefined;

	var _uuid = __webpack_require__(3);

	var _uuid2 = _interopRequireDefault(_uuid);

	var _networking = __webpack_require__(5);

	var _networking2 = _interopRequireDefault(_networking);

	var _keychain = __webpack_require__(13);

	var _keychain2 = _interopRequireDefault(_keychain);

	var _config = __webpack_require__(17);

	var _config2 = _interopRequireDefault(_config);

	var _state = __webpack_require__(20);

	var _state2 = _interopRequireDefault(_state);

	var _publish_queue = __webpack_require__(36);

	var _publish_queue2 = _interopRequireDefault(_publish_queue);

	var _index = __webpack_require__(14);

	var _index2 = _interopRequireDefault(_index);

	var _presence_heartbeat = __webpack_require__(37);

	var _presence_heartbeat2 = _interopRequireDefault(_presence_heartbeat);

	var _subscriber = __webpack_require__(41);

	var _subscriber2 = _interopRequireDefault(_subscriber);

	var _time = __webpack_require__(56);

	var _time2 = _interopRequireDefault(_time);

	var _presence = __webpack_require__(38);

	var _presence2 = _interopRequireDefault(_presence);

	var _history = __webpack_require__(57);

	var _history2 = _interopRequireDefault(_history);

	var _push = __webpack_require__(58);

	var _push2 = _interopRequireDefault(_push);

	var _access = __webpack_require__(59);

	var _access2 = _interopRequireDefault(_access);

	var _channel_groups = __webpack_require__(60);

	var _channel_groups2 = _interopRequireDefault(_channel_groups);

	var _subscribe = __webpack_require__(61);

	var _subscribe2 = _interopRequireDefault(_subscribe);

	var _publish = __webpack_require__(62);

	var _publish2 = _interopRequireDefault(_publish);

	var _flow_interfaces = __webpack_require__(55);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var packageJSON = __webpack_require__(1);

	var utils = __webpack_require__(18);

	function createInstance(setup) {
	  var sendBeacon = setup.sendBeacon;
	  var db = setup.db;
	  var _shutdown = setup.shutdown;


	  var callbacks = {
	    onMessage: setup.onMessage,
	    onStatus: setup.onStatus,
	    onPresence: setup.onPresence
	  };

	  var keychain = new _keychain2.default().setInstanceId(_uuid2.default.v4()).setAuthKey(setup.authKey || '').setSecretKey(setup.secretKey || '').setSubscribeKey(setup.subscribeKey).setPublishKey(setup.publishKey).setCipherKey(setup.cipherKey);

	  keychain.setUUID(setup.uuid || !setup.unique_uuid && db.get(keychain.getSubscribeKey() + 'uuid') || _uuid2.default.v4());

	  // write the new key to storage
	  db.set(keychain.getSubscribeKey() + 'uuid', keychain.getUUID());

	  var config = new _config2.default().setRequestIdConfig(setup.use_request_id || false).setPresenceTimeout(utils.validateHeartbeat(setup.heartbeat || setup.pnexpires || 0)).setSupressLeaveEvents(setup.noleave || 0)
	  // .setSubscribeWindow(+setup.windowing || DEF_WINDOWING)
	  // .setSubscribeTimeout((+setup.timeout || DEF_SUB_TIMEOUT) * constants.SECOND)
	  .setInstanceIdConfig(setup.instance_id || false);

	  config.setHeartbeatInterval(setup.heartbeat_interval || config.getPresenceTimeout() / 2 - 1);

	  // set timeout to how long a transaction request will wait for the server (default 15 seconds)
	  config.transactionalRequestTimeout = setup.transactionalRequestTimeout || 15 * 1000;
	  // set timeout to how long a subscribe event loop will run (default 310 seconds)
	  config.subscribeRequestTimeout = setup.subscribeRequestTimeout || 310 * 1000;
	  // set config on beacon (https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon) usage
	  config.useSendBeacon = setup.useSendBeacon || true;

	  var state = new _state2.default();
	  var crypto = new _index2.default({ keychain: keychain });
	  var networking = new _networking2.default({ config: config, keychain: keychain, crypto: crypto, sendBeacon: sendBeacon }, setup.ssl, setup.origin);
	  var publishQueue = new _publish_queue2.default({ networking: networking });
	  var subscriber = new _subscriber2.default({ networking: networking, state: state, callbacks: callbacks });

	  // initalize the endpoints
	  var timeEndpoint = new _time2.default({ networking: networking });
	  var historyEndpoint = new _history2.default({ networking: networking, crypto: crypto });
	  var channelGroupEndpoints = new _channel_groups2.default({ networking: networking });
	  var publishEndpoints = new _publish2.default({ publishQueue: publishQueue });
	  var pushEndpoints = new _push2.default({ networking: networking, publishQueue: publishQueue });

	  var presenceEndpoints = new _presence2.default({ keychain: keychain, config: config, networking: networking, state: state });

	  var accessEndpoints = new _access2.default({ keychain: keychain, config: config, networking: networking });

	  var subscribeEndpoints = new _subscribe2.default({ networking: networking, callbacks: callbacks, config: config, state: state });

	  var presenceHeartbeat = new _presence_heartbeat2.default({ config: config, state: state, presenceEndpoints: presenceEndpoints });
	  // let connectivity = new Connectivity({ eventEmitter, networking, timeEndpoint });

	  if (config.getPresenceTimeout() === 2) {
	    config.setHeartbeatInterval(1);
	  }

	  var SELF = {

	    accessManager: {
	      grant: accessEndpoints.grant.bind(accessEndpoints),
	      audit: accessEndpoints.audit.bind(accessEndpoints),
	      revoke: accessEndpoints.revoke.bind(accessEndpoints)
	    },

	    channelGroups: {
	      listGroups: channelGroupEndpoints.listGroups.bind(channelGroupEndpoints),
	      deleteGroup: channelGroupEndpoints.removeGroup.bind(channelGroupEndpoints),
	      listChannels: channelGroupEndpoints.listChannels.bind(channelGroupEndpoints),
	      addChannel: channelGroupEndpoints.addChannel.bind(channelGroupEndpoints),
	      removeChannel: channelGroupEndpoints.addChannel.bind(channelGroupEndpoints)
	    },

	    history: historyEndpoint.fetch.bind(historyEndpoint),
	    time: timeEndpoint.fetch.bind(timeEndpoint),

	    publish: publishEndpoints.publish.bind(publishEndpoints),
	    subscribe: subscribeEndpoints.subscribe.bind(subscribeEndpoints),
	    unsubscribe: subscribeEndpoints.unsubscribe.bind(subscribeEndpoints),

	    presence: {
	      hereNow: presenceEndpoints.hereNow.bind(presenceEndpoints),
	      whereNow: presenceEndpoints.whereNow.bind(presenceEndpoints),
	      getState: presenceEndpoints.getState.bind(presenceEndpoints),
	      setState: presenceEndpoints.setState.bind(presenceEndpoints)
	    },

	    push: {
	      addDeviceToPushChannel: pushEndpoints.addDeviceToPushChannel.bind(pushEndpoints),
	      removeDeviceFromPushChannel: pushEndpoints.removeDeviceFromPushChannel.bind(pushEndpoints),
	      send: pushEndpoints.send.bind(pushEndpoints)
	    },

	    getHeartbeat: function getHeartbeat() {
	      return config.getPresenceTimeout();
	    },
	    setHeartbeat: function setHeartbeat(heartbeat, heartbeat_interval) {
	      config.setPresenceTimeout(utils.validateHeartbeat(heartbeat, config.getPresenceTimeout(), error));
	      config.setHeartbeatInterval(heartbeat_interval || config.getPresenceTimeout() / 2 - 1);
	      if (config.getPresenceTimeout() === 2) {
	        config.setHeartbeatInterval(1);
	      }
	    },
	    getHeartbeatInterval: function getHeartbeatInterval() {
	      return config.getHeartbeatInterval();
	    },
	    setHeartbeatInterval: function setHeartbeatInterval(heartbeatInterval) {
	      config.setHeartbeatInterval(heartbeatInterval);
	    },
	    setAuthKey: function setAuthKey(auth) {
	      keychain.setAuthKey(auth);
	    },


	    setUUID: keychain.setUUID.bind(keychain),
	    getUUID: keychain.getUUID.bind(keychain),

	    setCipherKey: keychain.setCipherKey.bind(keychain),
	    getCipherKey: keychain.getCipherKey.bind(keychain),

	    getSubscribedChannels: state.getSubscribedChannels.bind(state),

	    stopTimers: function stopTimers() {
	      // connectivity.stop();
	      presenceHeartbeat.stop();
	    },
	    getVersion: function getVersion() {
	      return packageJSON.version;
	    },
	    shutdown: function shutdown() {
	      SELF.stopTimers();
	      if (_shutdown) _shutdown();
	    }
	  };

	  /*
	    create the connectivity element last, this will signal to other elements
	    that the SDK is connected to internet.
	  */
	  // connectivity.start();
	  subscriber.start();

	  return SELF;
	}
	exports.default = createInstance;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	//     uuid.js
	//
	//     Copyright (c) 2010-2012 Robert Kieffer
	//     MIT License - http://opensource.org/licenses/mit-license.php

	// Unique ID creation requires a high quality random # generator.  We feature
	// detect to determine the best RNG source, normalizing to a function that
	// returns 128-bits of randomness, since that's what's usually required
	var _rng = __webpack_require__(4);

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
/* 4 */
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
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _superagent = __webpack_require__(6);

	var _superagent2 = _interopRequireDefault(_superagent);

	var _keychain = __webpack_require__(13);

	var _keychain2 = _interopRequireDefault(_keychain);

	var _index = __webpack_require__(14);

	var _index2 = _interopRequireDefault(_index);

	var _responders = __webpack_require__(16);

	var _responders2 = _interopRequireDefault(_responders);

	var _config = __webpack_require__(17);

	var _config2 = _interopRequireDefault(_config);

	var _utils = __webpack_require__(18);

	var _utils2 = _interopRequireDefault(_utils);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class(_ref) {
	    var config = _ref.config;
	    var keychain = _ref.keychain;
	    var crypto = _ref.crypto;
	    var sendBeacon = _ref.sendBeacon;
	    var ssl = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
	    var origin = arguments.length <= 2 || arguments[2] === undefined ? 'pubsub.pubnub.com' : arguments[2];

	    _classCallCheck(this, _class);

	    this._config = config;
	    this._keychain = keychain;
	    this._crypto = crypto;
	    this._sendBeacon = sendBeacon;

	    this._r = new _responders2.default('#networking');

	    this._maxSubDomain = 20;
	    this._currentSubDomain = Math.floor(Math.random() * this._maxSubDomain);

	    this._providedFQDN = (ssl ? 'https://' : 'http://') + origin;
	    this._coreParams = {};

	    // create initial origins
	    this.shiftStandardOrigin(false);
	    this.shiftSubscribeOrigin(false);
	  } /* items that must be passed with each request. */

	  _createClass(_class, [{
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

	      _utils2.default.each(this._coreParams, function (key, value) {
	        if (!(key in data)) data[key] = value;
	      });

	      if (this._config.isInstanceIdEnabled()) {
	        data.instanceid = this._keychain.getInstanceId();
	      }

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
	        newSubDomain = _utils2.default.generateUUID().split('-')[0];
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
	    value: function fetchHistory(channel, incomingData, callback) {
	      if (!this._keychain.getSubscribeKey()) {
	        return callback(this._r.validationError('Missing Subscribe Key'));
	      }

	      var url = [this.getStandardOrigin(), 'v2', 'history', 'sub-key', this._keychain.getSubscribeKey(), 'channel', _utils2.default.encode(channel)];

	      var data = this.prepareParams(incomingData);

	      if (this._keychain.getAuthKey()) {
	        data.auth = this._keychain.getAuthKey();
	      }

	      this._xdr({ data: data, callback: callback, url: url });
	    }
	  }, {
	    key: 'performChannelGroupOperation',
	    value: function performChannelGroupOperation(channelGroup, mode, incomingData, callback) {
	      if (!this._keychain.getSubscribeKey()) {
	        return callback(this._r.validationError('Missing Subscribe Key'));
	      }

	      var url = [this.getStandardOrigin(), 'v1', 'channel-registration', 'sub-key', this._keychain.getSubscribeKey(), 'channel-group'];

	      if (channelGroup && channelGroup !== '*') {
	        url.push(channelGroup);
	      }

	      if (mode === 'remove') {
	        url.push('remove');
	      }

	      var data = this.prepareParams(incomingData);

	      if (this._keychain.getAuthKey()) {
	        data.auth = this._keychain.getAuthKey();
	      }

	      this._xdr({ data: data, callback: callback, url: url });
	    }
	  }, {
	    key: 'provisionDeviceForPush',
	    value: function provisionDeviceForPush(deviceId, incomingData, callback) {
	      if (!this._keychain.getSubscribeKey()) {
	        return callback(this._r.validationError('Missing Subscribe Key'));
	      }

	      if (!this._keychain.getPublishKey()) {
	        return callback(this._r.validationError('Missing Publish Key'));
	      }

	      var url = [this.getStandardOrigin(), 'v1', 'push', 'sub-key', this._keychain.getSubscribeKey(), 'devices', deviceId];
	      var data = this.prepareParams(incomingData);

	      data.uuid = this._keychain.getUUID();
	      data.auth = this._keychain.getAuthKey();

	      this._xdr({ data: data, url: url, callback: callback });
	    }
	  }, {
	    key: 'performGrant',
	    value: function performGrant(authKey, data, callback) {
	      if (!this._keychain.getSubscribeKey()) {
	        return callback(this._r.validationError('Missing Subscribe Key'));
	      }

	      if (!this._keychain.getPublishKey()) {
	        return callback(this._r.validationError('Missing Publish Key'));
	      }

	      if (!this._keychain.getSecretKey()) {
	        return callback(this._r.validationError('Missing Secret Key'));
	      }

	      var signInput = this._keychain.getSubscribeKey() + '\n' + this._keychain.getPublishKey() + '\n' + 'grant' + '\n';

	      var url = [this.getStandardOrigin(), 'v1', 'auth', 'grant', 'sub-key', this._keychain.getSubscribeKey()];

	      data.auth = authKey;

	      data = this.prepareParams(data);
	      signInput += _utils2.default._get_pam_sign_input_from_params(data);

	      var signature = this._crypto.HMACSHA256(signInput, this._keychain.getSecretKey());

	      signature = signature.replace(/\+/g, '-');
	      signature = signature.replace(/\//g, '_');

	      data.signature = signature;

	      this._xdr({ data: data, callback: callback, url: url });
	    }
	  }, {
	    key: 'performAudit',
	    value: function performAudit(authKey, data, callback) {
	      if (!this._keychain.getSubscribeKey()) {
	        return callback(this._r.validationError('Missing Subscribe Key'));
	      }

	      if (!this._keychain.getPublishKey()) {
	        return callback(this._r.validationError('Missing Publish Key'));
	      }

	      if (!this._keychain.getSecretKey()) {
	        return callback(this._r.validationError('Missing Secret Key'));
	      }

	      var signInput = this._keychain.getSubscribeKey() + '\n' + this._keychain.getPublishKey() + '\n' + 'audit' + '\n';

	      data.auth = authKey;
	      data = this.prepareParams(data);
	      signInput += _utils2.default._get_pam_sign_input_from_params(data);

	      var signature = this._crypto.HMACSHA256(signInput, this._keychain.getSecretKey());

	      signature = signature.replace(/\+/g, '-');
	      signature = signature.replace(/\//g, '_');

	      data.signature = signature;

	      var url = [this.getStandardOrigin(), 'v1', 'auth', 'audit', 'sub-key', this._keychain.getSubscribeKey()];

	      this._xdr({ data: data, callback: callback, url: url });
	    }
	  }, {
	    key: 'performHeartbeat',
	    value: function performHeartbeat(channels, incomingData, callback) {
	      if (!this._keychain.getSubscribeKey()) {
	        return callback(this._r.validationError('Missing Subscribe Key'));
	      }

	      var data = this.prepareParams(incomingData);

	      var url = [this.getStandardOrigin(), 'v2', 'presence', 'sub-key', this._keychain.getSubscribeKey(), 'channel', channels, 'heartbeat'];

	      this._xdr({ data: data, callback: callback, url: url });
	    }
	  }, {
	    key: 'performLeave',
	    value: function performLeave(channel, incomingData, callback) {
	      if (!this._keychain.getSubscribeKey()) {
	        return callback(this._r.validationError('Missing Subscribe Key'));
	      }

	      var data = this.prepareParams(incomingData);
	      var origin = this.nextOrigin(false);
	      var url = [origin, 'v2', 'presence', 'sub_key', this._keychain.getSubscribeKey(), 'channel', _utils2.default.encode(channel), 'leave'];

	      if (this._keychain.getAuthKey()) {
	        data.auth = this._keychain.getAuthKey();
	      }

	      if (this._keychain.getUUID()) {
	        data.uuid = this._keychain.getUUID();
	      }

	      if (this._config.useSendBeacon && this._sendBeacon) {
	        this._sendBeacon(_utils2.default.buildURL(url, data));
	      } else {
	        this._xdr({ data: data, callback: callback, url: url });
	      }
	    }
	  }, {
	    key: 'fetchTime',
	    value: function fetchTime(callback) {
	      var data = this.prepareParams({});
	      var url = [this.getStandardOrigin(), 'time', 0];

	      if (this._keychain.getUUID()) {
	        data.uuid = this._keychain.getUUID();
	      }

	      if (this._keychain.getAuthKey()) {
	        data.auth = this._keychain.getAuthKey();
	      }

	      this._xdr({ data: data, callback: callback, url: url });
	    }
	  }, {
	    key: 'fetchWhereNow',
	    value: function fetchWhereNow(uuid, callback) {
	      if (!this._keychain.getSubscribeKey()) {
	        return callback(this._r.validationError('Missing Subscribe Key'));
	      }

	      var data = this.prepareParams({});

	      if (this._keychain.getAuthKey()) {
	        data.auth = this._keychain.getAuthKey();
	      }

	      if (!uuid) {
	        uuid = this._keychain.getUUID();
	      }

	      var url = [this.getStandardOrigin(), 'v2', 'presence', 'sub-key', this._keychain.getSubscribeKey(), 'uuid', _utils2.default.encode(uuid)];

	      this._xdr({ data: data, callback: callback, url: url });
	    }
	  }, {
	    key: 'fetchHereNow',
	    value: function fetchHereNow(channel, channelGroup, incomingData, callback) {
	      if (!this._keychain.getSubscribeKey()) {
	        return callback(this._r.validationError('Missing Subscribe Key'));
	      }

	      var data = this.prepareParams(incomingData);

	      if (this._keychain.getUUID()) {
	        data.uuid = this._keychain.getUUID();
	      }

	      if (this._keychain.getAuthKey()) {
	        data.auth = this._keychain.getAuthKey();
	      }

	      var url = [this.getStandardOrigin(), 'v2', 'presence', 'sub-key', this._keychain.getSubscribeKey()];

	      if (channel) {
	        url.push('channel');
	        url.push(_utils2.default.encode(channel));
	      }

	      if (channelGroup && !channel) {
	        url.push('channel');
	        url.push(',');
	      }

	      this._xdr({ data: data, callback: callback, url: url });
	    }
	  }, {
	    key: 'setState',
	    value: function setState(channel, incomingData, callback) {
	      if (!this._keychain.getSubscribeKey()) {
	        return callback(this._r.validationError('Missing Subscribe Key'));
	      }

	      var data = this.prepareParams(incomingData);

	      var url = [this.getStandardOrigin(), 'v2', 'presence', 'sub-key', this._keychain.getSubscribeKey(), 'channel', channel, 'uuid', this._keychain.getUUID(), 'data'];

	      if (this._keychain.getAuthKey()) {
	        data.auth = this._keychain.getAuthKey();
	      }

	      data.state = JSON.stringify(data.state);

	      this._xdr({ data: data, callback: callback, url: url });
	    }
	  }, {
	    key: 'fetchState',
	    value: function fetchState(uuid, channel, incomingData, callback) {
	      if (!this._keychain.getSubscribeKey()) {
	        return callback(this._r.validationError('Missing Subscribe Key'));
	      }

	      if (!uuid) {
	        uuid = this._keychain.getUUID();
	      }

	      var data = this.prepareParams(incomingData);
	      var url = [this.getStandardOrigin(), 'v2', 'presence', 'sub-key', this._keychain.getSubscribeKey(), 'channel', channel, 'uuid', uuid];

	      if (this._keychain.getAuthKey()) {
	        data.auth = this._keychain.getAuthKey();
	      }

	      this._xdr({ data: data, callback: callback, url: url });
	    }
	  }, {
	    key: 'performPublish',
	    value: function performPublish(channel, msg, incomingData, mode, callback) {
	      if (!this._keychain.getSubscribeKey()) {
	        return callback(this._r.validationError('Missing Subscribe Key'));
	      }

	      if (!this._keychain.getPublishKey()) {
	        return callback(this._r.validationError('Missing Publish Key'));
	      }

	      var stringifiedMessage = JSON.stringify(msg);
	      var encryptedMessage = this._crypto.encrypt(stringifiedMessage);

	      var url = [this.getStandardOrigin(), 'publish', this._keychain.getPublishKey(), this._keychain.getSubscribeKey(), 0, _utils2.default.encode(channel), 0, _utils2.default.encode(encryptedMessage)];

	      var data = this.prepareParams(incomingData);

	      if (this._keychain.getUUID()) {
	        data.uuid = this._keychain.getUUID();
	      }

	      if (this._keychain.getAuthKey()) {
	        data.auth = this._keychain.getAuthKey();
	      }

	      if (mode === 'POST') {
	        this._postXDR({ data: data, callback: callback, url: url });
	      } else {
	        this._xdr({ data: data, callback: callback, url: url });
	      }
	    }
	  }, {
	    key: 'performSubscribe',
	    value: function performSubscribe(channels, incomingData, callback) {
	      if (!this._keychain.getSubscribeKey()) {
	        return callback(this._r.validationError('Missing Subscribe Key'));
	      }

	      var url = [this.getSubscribeOrigin(), 'v2', 'subscribe', this._keychain.getSubscribeKey(), _utils2.default.encode(channels), 0];

	      var data = this.prepareParams(incomingData);

	      if (this._keychain.getUUID()) {
	        data.uuid = this._keychain.getUUID();
	      }

	      if (this._keychain.getAuthKey()) {
	        data.auth = this._keychain.getAuthKey();
	      }

	      var timeout = this._config.subscribeRequestTimeout;

	      return this._xdr({ data: data, callback: callback, url: url, timeout: timeout });
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
	  }, {
	    key: '_postXDR',
	    value: function _postXDR(_ref2) {
	      var data = _ref2.data;
	      var url = _ref2.url;
	      var timeout = _ref2.timeout;
	      var callback = _ref2.callback;

	      var superagentConstruct = _superagent2.default.post(url.join('/')).query(data);
	      return this._abstractedXDR(superagentConstruct, timeout, callback);
	    }
	  }, {
	    key: '_xdr',
	    value: function _xdr(_ref3) {
	      var data = _ref3.data;
	      var url = _ref3.url;
	      var timeout = _ref3.timeout;
	      var callback = _ref3.callback;

	      var superagentConstruct = _superagent2.default.get(url.join('/')).query(data);
	      return this._abstractedXDR(superagentConstruct, timeout, callback);
	    }
	  }, {
	    key: '_abstractedXDR',
	    value: function _abstractedXDR(superagentConstruct, timeout, callback) {
	      return superagentConstruct.type('json').timeout(timeout || this._config.transactionalRequestTimeout).end(function (err, resp) {
	        if (err) return callback(err, null);

	        var parsedResponse = JSON.parse(resp.text);

	        if ((typeof parsedResponse === 'undefined' ? 'undefined' : _typeof(parsedResponse)) === 'object' && parsedResponse.error) {
	          return callback(parsedResponse.error, null);
	        }

	        if ((typeof parsedResponse === 'undefined' ? 'undefined' : _typeof(parsedResponse)) === 'object' && parsedResponse.payload) {
	          return callback(null, parsedResponse.payload);
	        }

	        callback(null, parsedResponse);
	      });
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */

	var Emitter = __webpack_require__(7);
	var reduce = __webpack_require__(8);
	var requestBase = __webpack_require__(9);
	var isObject = __webpack_require__(10);

	/**
	 * Root reference for iframes.
	 */

	var root;
	if (typeof window !== 'undefined') { // Browser window
	  root = window;
	} else if (typeof self !== 'undefined') { // Web Worker
	  root = self;
	} else { // Other environments
	  root = this;
	}

	/**
	 * Noop.
	 */

	function noop(){};

	/**
	 * Check if `obj` is a host object,
	 * we don't want to serialize these :)
	 *
	 * TODO: future proof, move to compoent land
	 *
	 * @param {Object} obj
	 * @return {Boolean}
	 * @api private
	 */

	function isHost(obj) {
	  var str = {}.toString.call(obj);

	  switch (str) {
	    case '[object File]':
	    case '[object Blob]':
	    case '[object FormData]':
	      return true;
	    default:
	      return false;
	  }
	}

	/**
	 * Expose `request`.
	 */

	var request = module.exports = __webpack_require__(12).bind(null, Request);

	/**
	 * Determine XHR.
	 */

	request.getXHR = function () {
	  if (root.XMLHttpRequest
	      && (!root.location || 'file:' != root.location.protocol
	          || !root.ActiveXObject)) {
	    return new XMLHttpRequest;
	  } else {
	    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
	  }
	  return false;
	};

	/**
	 * Removes leading and trailing whitespace, added to support IE.
	 *
	 * @param {String} s
	 * @return {String}
	 * @api private
	 */

	var trim = ''.trim
	  ? function(s) { return s.trim(); }
	  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

	/**
	 * Serialize the given `obj`.
	 *
	 * @param {Object} obj
	 * @return {String}
	 * @api private
	 */

	function serialize(obj) {
	  if (!isObject(obj)) return obj;
	  var pairs = [];
	  for (var key in obj) {
	    if (null != obj[key]) {
	      pushEncodedKeyValuePair(pairs, key, obj[key]);
	        }
	      }
	  return pairs.join('&');
	}

	/**
	 * Helps 'serialize' with serializing arrays.
	 * Mutates the pairs array.
	 *
	 * @param {Array} pairs
	 * @param {String} key
	 * @param {Mixed} val
	 */

	function pushEncodedKeyValuePair(pairs, key, val) {
	  if (Array.isArray(val)) {
	    return val.forEach(function(v) {
	      pushEncodedKeyValuePair(pairs, key, v);
	    });
	  }
	  pairs.push(encodeURIComponent(key)
	    + '=' + encodeURIComponent(val));
	}

	/**
	 * Expose serialization method.
	 */

	 request.serializeObject = serialize;

	 /**
	  * Parse the given x-www-form-urlencoded `str`.
	  *
	  * @param {String} str
	  * @return {Object}
	  * @api private
	  */

	function parseString(str) {
	  var obj = {};
	  var pairs = str.split('&');
	  var parts;
	  var pair;

	  for (var i = 0, len = pairs.length; i < len; ++i) {
	    pair = pairs[i];
	    parts = pair.split('=');
	    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
	  }

	  return obj;
	}

	/**
	 * Expose parser.
	 */

	request.parseString = parseString;

	/**
	 * Default MIME type map.
	 *
	 *     superagent.types.xml = 'application/xml';
	 *
	 */

	request.types = {
	  html: 'text/html',
	  json: 'application/json',
	  xml: 'application/xml',
	  urlencoded: 'application/x-www-form-urlencoded',
	  'form': 'application/x-www-form-urlencoded',
	  'form-data': 'application/x-www-form-urlencoded'
	};

	/**
	 * Default serialization map.
	 *
	 *     superagent.serialize['application/xml'] = function(obj){
	 *       return 'generated xml here';
	 *     };
	 *
	 */

	 request.serialize = {
	   'application/x-www-form-urlencoded': serialize,
	   'application/json': JSON.stringify
	 };

	 /**
	  * Default parsers.
	  *
	  *     superagent.parse['application/xml'] = function(str){
	  *       return { object parsed from str };
	  *     };
	  *
	  */

	request.parse = {
	  'application/x-www-form-urlencoded': parseString,
	  'application/json': JSON.parse
	};

	/**
	 * Parse the given header `str` into
	 * an object containing the mapped fields.
	 *
	 * @param {String} str
	 * @return {Object}
	 * @api private
	 */

	function parseHeader(str) {
	  var lines = str.split(/\r?\n/);
	  var fields = {};
	  var index;
	  var line;
	  var field;
	  var val;

	  lines.pop(); // trailing CRLF

	  for (var i = 0, len = lines.length; i < len; ++i) {
	    line = lines[i];
	    index = line.indexOf(':');
	    field = line.slice(0, index).toLowerCase();
	    val = trim(line.slice(index + 1));
	    fields[field] = val;
	  }

	  return fields;
	}

	/**
	 * Check if `mime` is json or has +json structured syntax suffix.
	 *
	 * @param {String} mime
	 * @return {Boolean}
	 * @api private
	 */

	function isJSON(mime) {
	  return /[\/+]json\b/.test(mime);
	}

	/**
	 * Return the mime type for the given `str`.
	 *
	 * @param {String} str
	 * @return {String}
	 * @api private
	 */

	function type(str){
	  return str.split(/ *; */).shift();
	};

	/**
	 * Return header field parameters.
	 *
	 * @param {String} str
	 * @return {Object}
	 * @api private
	 */

	function params(str){
	  return reduce(str.split(/ *; */), function(obj, str){
	    var parts = str.split(/ *= */)
	      , key = parts.shift()
	      , val = parts.shift();

	    if (key && val) obj[key] = val;
	    return obj;
	  }, {});
	};

	/**
	 * Initialize a new `Response` with the given `xhr`.
	 *
	 *  - set flags (.ok, .error, etc)
	 *  - parse header
	 *
	 * Examples:
	 *
	 *  Aliasing `superagent` as `request` is nice:
	 *
	 *      request = superagent;
	 *
	 *  We can use the promise-like API, or pass callbacks:
	 *
	 *      request.get('/').end(function(res){});
	 *      request.get('/', function(res){});
	 *
	 *  Sending data can be chained:
	 *
	 *      request
	 *        .post('/user')
	 *        .send({ name: 'tj' })
	 *        .end(function(res){});
	 *
	 *  Or passed to `.send()`:
	 *
	 *      request
	 *        .post('/user')
	 *        .send({ name: 'tj' }, function(res){});
	 *
	 *  Or passed to `.post()`:
	 *
	 *      request
	 *        .post('/user', { name: 'tj' })
	 *        .end(function(res){});
	 *
	 * Or further reduced to a single call for simple cases:
	 *
	 *      request
	 *        .post('/user', { name: 'tj' }, function(res){});
	 *
	 * @param {XMLHTTPRequest} xhr
	 * @param {Object} options
	 * @api private
	 */

	function Response(req, options) {
	  options = options || {};
	  this.req = req;
	  this.xhr = this.req.xhr;
	  // responseText is accessible only if responseType is '' or 'text' and on older browsers
	  this.text = ((this.req.method !='HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined')
	     ? this.xhr.responseText
	     : null;
	  this.statusText = this.req.xhr.statusText;
	  this.setStatusProperties(this.xhr.status);
	  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
	  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
	  // getResponseHeader still works. so we get content-type even if getting
	  // other headers fails.
	  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
	  this.setHeaderProperties(this.header);
	  this.body = this.req.method != 'HEAD'
	    ? this.parseBody(this.text ? this.text : this.xhr.response)
	    : null;
	}

	/**
	 * Get case-insensitive `field` value.
	 *
	 * @param {String} field
	 * @return {String}
	 * @api public
	 */

	Response.prototype.get = function(field){
	  return this.header[field.toLowerCase()];
	};

	/**
	 * Set header related properties:
	 *
	 *   - `.type` the content type without params
	 *
	 * A response of "Content-Type: text/plain; charset=utf-8"
	 * will provide you with a `.type` of "text/plain".
	 *
	 * @param {Object} header
	 * @api private
	 */

	Response.prototype.setHeaderProperties = function(header){
	  // content-type
	  var ct = this.header['content-type'] || '';
	  this.type = type(ct);

	  // params
	  var obj = params(ct);
	  for (var key in obj) this[key] = obj[key];
	};

	/**
	 * Parse the given body `str`.
	 *
	 * Used for auto-parsing of bodies. Parsers
	 * are defined on the `superagent.parse` object.
	 *
	 * @param {String} str
	 * @return {Mixed}
	 * @api private
	 */

	Response.prototype.parseBody = function(str){
	  var parse = request.parse[this.type];
	  return parse && str && (str.length || str instanceof Object)
	    ? parse(str)
	    : null;
	};

	/**
	 * Set flags such as `.ok` based on `status`.
	 *
	 * For example a 2xx response will give you a `.ok` of __true__
	 * whereas 5xx will be __false__ and `.error` will be __true__. The
	 * `.clientError` and `.serverError` are also available to be more
	 * specific, and `.statusType` is the class of error ranging from 1..5
	 * sometimes useful for mapping respond colors etc.
	 *
	 * "sugar" properties are also defined for common cases. Currently providing:
	 *
	 *   - .noContent
	 *   - .badRequest
	 *   - .unauthorized
	 *   - .notAcceptable
	 *   - .notFound
	 *
	 * @param {Number} status
	 * @api private
	 */

	Response.prototype.setStatusProperties = function(status){
	  // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
	  if (status === 1223) {
	    status = 204;
	  }

	  var type = status / 100 | 0;

	  // status / class
	  this.status = this.statusCode = status;
	  this.statusType = type;

	  // basics
	  this.info = 1 == type;
	  this.ok = 2 == type;
	  this.clientError = 4 == type;
	  this.serverError = 5 == type;
	  this.error = (4 == type || 5 == type)
	    ? this.toError()
	    : false;

	  // sugar
	  this.accepted = 202 == status;
	  this.noContent = 204 == status;
	  this.badRequest = 400 == status;
	  this.unauthorized = 401 == status;
	  this.notAcceptable = 406 == status;
	  this.notFound = 404 == status;
	  this.forbidden = 403 == status;
	};

	/**
	 * Return an `Error` representative of this response.
	 *
	 * @return {Error}
	 * @api public
	 */

	Response.prototype.toError = function(){
	  var req = this.req;
	  var method = req.method;
	  var url = req.url;

	  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
	  var err = new Error(msg);
	  err.status = this.status;
	  err.method = method;
	  err.url = url;

	  return err;
	};

	/**
	 * Expose `Response`.
	 */

	request.Response = Response;

	/**
	 * Initialize a new `Request` with the given `method` and `url`.
	 *
	 * @param {String} method
	 * @param {String} url
	 * @api public
	 */

	function Request(method, url) {
	  var self = this;
	  this._query = this._query || [];
	  this.method = method;
	  this.url = url;
	  this.header = {}; // preserves header name case
	  this._header = {}; // coerces header names to lowercase
	  this.on('end', function(){
	    var err = null;
	    var res = null;

	    try {
	      res = new Response(self);
	    } catch(e) {
	      err = new Error('Parser is unable to parse the response');
	      err.parse = true;
	      err.original = e;
	      // issue #675: return the raw response if the response parsing fails
	      err.rawResponse = self.xhr && self.xhr.responseText ? self.xhr.responseText : null;
	      // issue #876: return the http status code if the response parsing fails
	      err.statusCode = self.xhr && self.xhr.status ? self.xhr.status : null;
	      return self.callback(err);
	    }

	    self.emit('response', res);

	    if (err) {
	      return self.callback(err, res);
	    }

	    if (res.status >= 200 && res.status < 300) {
	      return self.callback(err, res);
	    }

	    var new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
	    new_err.original = err;
	    new_err.response = res;
	    new_err.status = res.status;

	    self.callback(new_err, res);
	  });
	}

	/**
	 * Mixin `Emitter` and `requestBase`.
	 */

	Emitter(Request.prototype);
	for (var key in requestBase) {
	  Request.prototype[key] = requestBase[key];
	}

	/**
	 * Abort the request, and clear potential timeout.
	 *
	 * @return {Request}
	 * @api public
	 */

	Request.prototype.abort = function(){
	  if (this.aborted) return;
	  this.aborted = true;
	  this.xhr.abort();
	  this.clearTimeout();
	  this.emit('abort');
	  return this;
	};

	/**
	 * Set Content-Type to `type`, mapping values from `request.types`.
	 *
	 * Examples:
	 *
	 *      superagent.types.xml = 'application/xml';
	 *
	 *      request.post('/')
	 *        .type('xml')
	 *        .send(xmlstring)
	 *        .end(callback);
	 *
	 *      request.post('/')
	 *        .type('application/xml')
	 *        .send(xmlstring)
	 *        .end(callback);
	 *
	 * @param {String} type
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.type = function(type){
	  this.set('Content-Type', request.types[type] || type);
	  return this;
	};

	/**
	 * Set responseType to `val`. Presently valid responseTypes are 'blob' and 
	 * 'arraybuffer'.
	 *
	 * Examples:
	 *
	 *      req.get('/')
	 *        .responseType('blob')
	 *        .end(callback);
	 *
	 * @param {String} val
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.responseType = function(val){
	  this._responseType = val;
	  return this;
	};

	/**
	 * Set Accept to `type`, mapping values from `request.types`.
	 *
	 * Examples:
	 *
	 *      superagent.types.json = 'application/json';
	 *
	 *      request.get('/agent')
	 *        .accept('json')
	 *        .end(callback);
	 *
	 *      request.get('/agent')
	 *        .accept('application/json')
	 *        .end(callback);
	 *
	 * @param {String} accept
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.accept = function(type){
	  this.set('Accept', request.types[type] || type);
	  return this;
	};

	/**
	 * Set Authorization field value with `user` and `pass`.
	 *
	 * @param {String} user
	 * @param {String} pass
	 * @param {Object} options with 'type' property 'auto' or 'basic' (default 'basic')
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.auth = function(user, pass, options){
	  if (!options) {
	    options = {
	      type: 'basic'
	    }
	  }

	  switch (options.type) {
	    case 'basic':
	      var str = btoa(user + ':' + pass);
	      this.set('Authorization', 'Basic ' + str);
	    break;

	    case 'auto':
	      this.username = user;
	      this.password = pass;
	    break;
	  }
	  return this;
	};

	/**
	* Add query-string `val`.
	*
	* Examples:
	*
	*   request.get('/shoes')
	*     .query('size=10')
	*     .query({ color: 'blue' })
	*
	* @param {Object|String} val
	* @return {Request} for chaining
	* @api public
	*/

	Request.prototype.query = function(val){
	  if ('string' != typeof val) val = serialize(val);
	  if (val) this._query.push(val);
	  return this;
	};

	/**
	 * Queue the given `file` as an attachment to the specified `field`,
	 * with optional `filename`.
	 *
	 * ``` js
	 * request.post('/upload')
	 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
	 *   .end(callback);
	 * ```
	 *
	 * @param {String} field
	 * @param {Blob|File} file
	 * @param {String} filename
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.attach = function(field, file, filename){
	  if (!this._formData) this._formData = new root.FormData();
	  this._formData.append(field, file, filename || file.name);
	  return this;
	};

	/**
	 * Send `data` as the request body, defaulting the `.type()` to "json" when
	 * an object is given.
	 *
	 * Examples:
	 *
	 *       // manual json
	 *       request.post('/user')
	 *         .type('json')
	 *         .send('{"name":"tj"}')
	 *         .end(callback)
	 *
	 *       // auto json
	 *       request.post('/user')
	 *         .send({ name: 'tj' })
	 *         .end(callback)
	 *
	 *       // manual x-www-form-urlencoded
	 *       request.post('/user')
	 *         .type('form')
	 *         .send('name=tj')
	 *         .end(callback)
	 *
	 *       // auto x-www-form-urlencoded
	 *       request.post('/user')
	 *         .type('form')
	 *         .send({ name: 'tj' })
	 *         .end(callback)
	 *
	 *       // defaults to x-www-form-urlencoded
	  *      request.post('/user')
	  *        .send('name=tobi')
	  *        .send('species=ferret')
	  *        .end(callback)
	 *
	 * @param {String|Object} data
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.send = function(data){
	  var obj = isObject(data);
	  var type = this._header['content-type'];

	  // merge
	  if (obj && isObject(this._data)) {
	    for (var key in data) {
	      this._data[key] = data[key];
	    }
	  } else if ('string' == typeof data) {
	    if (!type) this.type('form');
	    type = this._header['content-type'];
	    if ('application/x-www-form-urlencoded' == type) {
	      this._data = this._data
	        ? this._data + '&' + data
	        : data;
	    } else {
	      this._data = (this._data || '') + data;
	    }
	  } else {
	    this._data = data;
	  }

	  if (!obj || isHost(data)) return this;
	  if (!type) this.type('json');
	  return this;
	};

	/**
	 * Invoke the callback with `err` and `res`
	 * and handle arity check.
	 *
	 * @param {Error} err
	 * @param {Response} res
	 * @api private
	 */

	Request.prototype.callback = function(err, res){
	  var fn = this._callback;
	  this.clearTimeout();
	  fn(err, res);
	};

	/**
	 * Invoke callback with x-domain error.
	 *
	 * @api private
	 */

	Request.prototype.crossDomainError = function(){
	  var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
	  err.crossDomain = true;

	  err.status = this.status;
	  err.method = this.method;
	  err.url = this.url;

	  this.callback(err);
	};

	/**
	 * Invoke callback with timeout error.
	 *
	 * @api private
	 */

	Request.prototype.timeoutError = function(){
	  var timeout = this._timeout;
	  var err = new Error('timeout of ' + timeout + 'ms exceeded');
	  err.timeout = timeout;
	  this.callback(err);
	};

	/**
	 * Enable transmission of cookies with x-domain requests.
	 *
	 * Note that for this to work the origin must not be
	 * using "Access-Control-Allow-Origin" with a wildcard,
	 * and also must set "Access-Control-Allow-Credentials"
	 * to "true".
	 *
	 * @api public
	 */

	Request.prototype.withCredentials = function(){
	  this._withCredentials = true;
	  return this;
	};

	/**
	 * Initiate request, invoking callback `fn(res)`
	 * with an instanceof `Response`.
	 *
	 * @param {Function} fn
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.end = function(fn){
	  var self = this;
	  var xhr = this.xhr = request.getXHR();
	  var query = this._query.join('&');
	  var timeout = this._timeout;
	  var data = this._formData || this._data;

	  // store callback
	  this._callback = fn || noop;

	  // state change
	  xhr.onreadystatechange = function(){
	    if (4 != xhr.readyState) return;

	    // In IE9, reads to any property (e.g. status) off of an aborted XHR will
	    // result in the error "Could not complete the operation due to error c00c023f"
	    var status;
	    try { status = xhr.status } catch(e) { status = 0; }

	    if (0 == status) {
	      if (self.timedout) return self.timeoutError();
	      if (self.aborted) return;
	      return self.crossDomainError();
	    }
	    self.emit('end');
	  };

	  // progress
	  var handleProgress = function(e){
	    if (e.total > 0) {
	      e.percent = e.loaded / e.total * 100;
	    }
	    e.direction = 'download';
	    self.emit('progress', e);
	  };
	  if (this.hasListeners('progress')) {
	    xhr.onprogress = handleProgress;
	  }
	  try {
	    if (xhr.upload && this.hasListeners('progress')) {
	      xhr.upload.onprogress = handleProgress;
	    }
	  } catch(e) {
	    // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
	    // Reported here:
	    // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
	  }

	  // timeout
	  if (timeout && !this._timer) {
	    this._timer = setTimeout(function(){
	      self.timedout = true;
	      self.abort();
	    }, timeout);
	  }

	  // querystring
	  if (query) {
	    query = request.serializeObject(query);
	    this.url += ~this.url.indexOf('?')
	      ? '&' + query
	      : '?' + query;
	  }

	  // initiate request
	  if (this.username && this.password) {
	    xhr.open(this.method, this.url, true, this.username, this.password);
	  } else {
	    xhr.open(this.method, this.url, true);
	  }

	  // CORS
	  if (this._withCredentials) xhr.withCredentials = true;

	  // body
	  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
	    // serialize stuff
	    var contentType = this._header['content-type'];
	    var serialize = this._parser || request.serialize[contentType ? contentType.split(';')[0] : ''];
	    if (!serialize && isJSON(contentType)) serialize = request.serialize['application/json'];
	    if (serialize) data = serialize(data);
	  }

	  // set header fields
	  for (var field in this.header) {
	    if (null == this.header[field]) continue;
	    xhr.setRequestHeader(field, this.header[field]);
	  }

	  if (this._responseType) {
	    xhr.responseType = this._responseType;
	  }

	  // send stuff
	  this.emit('request', this);

	  // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
	  // We need null here if data is undefined
	  xhr.send(typeof data !== 'undefined' ? data : null);
	  return this;
	};


	/**
	 * Expose `Request`.
	 */

	request.Request = Request;

	/**
	 * GET `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} data or fn
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */

	request.get = function(url, data, fn){
	  var req = request('GET', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.query(data);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * HEAD `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} data or fn
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */

	request.head = function(url, data, fn){
	  var req = request('HEAD', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * DELETE `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */

	function del(url, fn){
	  var req = request('DELETE', url);
	  if (fn) req.end(fn);
	  return req;
	};

	request['del'] = del;
	request['delete'] = del;

	/**
	 * PATCH `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed} data
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */

	request.patch = function(url, data, fn){
	  var req = request('PATCH', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * POST `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed} data
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */

	request.post = function(url, data, fn){
	  var req = request('POST', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * PUT `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} data or fn
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */

	request.put = function(url, data, fn){
	  var req = request('PUT', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};


/***/ },
/* 7 */
/***/ function(module, exports) {

	
	/**
	 * Expose `Emitter`.
	 */

	module.exports = Emitter;

	/**
	 * Initialize a new `Emitter`.
	 *
	 * @api public
	 */

	function Emitter(obj) {
	  if (obj) return mixin(obj);
	};

	/**
	 * Mixin the emitter properties.
	 *
	 * @param {Object} obj
	 * @return {Object}
	 * @api private
	 */

	function mixin(obj) {
	  for (var key in Emitter.prototype) {
	    obj[key] = Emitter.prototype[key];
	  }
	  return obj;
	}

	/**
	 * Listen on the given `event` with `fn`.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.on =
	Emitter.prototype.addEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
	    .push(fn);
	  return this;
	};

	/**
	 * Adds an `event` listener that will be invoked a single
	 * time then automatically removed.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.once = function(event, fn){
	  function on() {
	    this.off(event, on);
	    fn.apply(this, arguments);
	  }

	  on.fn = fn;
	  this.on(event, on);
	  return this;
	};

	/**
	 * Remove the given callback for `event` or all
	 * registered callbacks.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.off =
	Emitter.prototype.removeListener =
	Emitter.prototype.removeAllListeners =
	Emitter.prototype.removeEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};

	  // all
	  if (0 == arguments.length) {
	    this._callbacks = {};
	    return this;
	  }

	  // specific event
	  var callbacks = this._callbacks['$' + event];
	  if (!callbacks) return this;

	  // remove all handlers
	  if (1 == arguments.length) {
	    delete this._callbacks['$' + event];
	    return this;
	  }

	  // remove specific handler
	  var cb;
	  for (var i = 0; i < callbacks.length; i++) {
	    cb = callbacks[i];
	    if (cb === fn || cb.fn === fn) {
	      callbacks.splice(i, 1);
	      break;
	    }
	  }
	  return this;
	};

	/**
	 * Emit `event` with the given args.
	 *
	 * @param {String} event
	 * @param {Mixed} ...
	 * @return {Emitter}
	 */

	Emitter.prototype.emit = function(event){
	  this._callbacks = this._callbacks || {};
	  var args = [].slice.call(arguments, 1)
	    , callbacks = this._callbacks['$' + event];

	  if (callbacks) {
	    callbacks = callbacks.slice(0);
	    for (var i = 0, len = callbacks.length; i < len; ++i) {
	      callbacks[i].apply(this, args);
	    }
	  }

	  return this;
	};

	/**
	 * Return array of callbacks for `event`.
	 *
	 * @param {String} event
	 * @return {Array}
	 * @api public
	 */

	Emitter.prototype.listeners = function(event){
	  this._callbacks = this._callbacks || {};
	  return this._callbacks['$' + event] || [];
	};

	/**
	 * Check if this emitter has `event` handlers.
	 *
	 * @param {String} event
	 * @return {Boolean}
	 * @api public
	 */

	Emitter.prototype.hasListeners = function(event){
	  return !! this.listeners(event).length;
	};


/***/ },
/* 8 */
/***/ function(module, exports) {

	
	/**
	 * Reduce `arr` with `fn`.
	 *
	 * @param {Array} arr
	 * @param {Function} fn
	 * @param {Mixed} initial
	 *
	 * TODO: combatible error handling?
	 */

	module.exports = function(arr, fn, initial){  
	  var idx = 0;
	  var len = arr.length;
	  var curr = arguments.length == 3
	    ? initial
	    : arr[idx++];

	  while (idx < len) {
	    curr = fn.call(null, curr, arr[idx], ++idx, arr);
	  }
	  
	  return curr;
	};

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module of mixed-in functions shared between node and client code
	 */
	var isObject = __webpack_require__(10);

	var FormData = __webpack_require__(11); // browserify compatible

	/**
	 * Clear previous timeout.
	 *
	 * @return {Request} for chaining
	 * @api public
	 */

	exports.clearTimeout = function _clearTimeout(){
	  this._timeout = 0;
	  clearTimeout(this._timer);
	  return this;
	};

	/**
	 * Force given parser
	 *
	 * Sets the body parser no matter type.
	 *
	 * @param {Function}
	 * @api public
	 */

	exports.parse = function parse(fn){
	  this._parser = fn;
	  return this;
	};

	/**
	 * Set timeout to `ms`.
	 *
	 * @param {Number} ms
	 * @return {Request} for chaining
	 * @api public
	 */

	exports.timeout = function timeout(ms){
	  this._timeout = ms;
	  return this;
	};

	/**
	 * Faux promise support
	 *
	 * @param {Function} fulfill
	 * @param {Function} reject
	 * @return {Request}
	 */

	exports.then = function then(fulfill, reject) {
	  return this.end(function(err, res) {
	    err ? reject(err) : fulfill(res);
	  });
	}

	/**
	 * Allow for extension
	 */

	exports.use = function use(fn) {
	  fn(this);
	  return this;
	}


	/**
	 * Get request header `field`.
	 * Case-insensitive.
	 *
	 * @param {String} field
	 * @return {String}
	 * @api public
	 */

	exports.get = function(field){
	  return this._header[field.toLowerCase()];
	};

	/**
	 * Get case-insensitive header `field` value.
	 * This is a deprecated internal API. Use `.get(field)` instead.
	 *
	 * (getHeader is no longer used internally by the superagent code base)
	 *
	 * @param {String} field
	 * @return {String}
	 * @api private
	 * @deprecated
	 */

	exports.getHeader = exports.get;

	/**
	 * Set header `field` to `val`, or multiple fields with one object.
	 * Case-insensitive.
	 *
	 * Examples:
	 *
	 *      req.get('/')
	 *        .set('Accept', 'application/json')
	 *        .set('X-API-Key', 'foobar')
	 *        .end(callback);
	 *
	 *      req.get('/')
	 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
	 *        .end(callback);
	 *
	 * @param {String|Object} field
	 * @param {String} val
	 * @return {Request} for chaining
	 * @api public
	 */

	exports.set = function(field, val){
	  if (isObject(field)) {
	    for (var key in field) {
	      this.set(key, field[key]);
	    }
	    return this;
	  }
	  this._header[field.toLowerCase()] = val;
	  this.header[field] = val;
	  return this;
	};

	/**
	 * Remove header `field`.
	 * Case-insensitive.
	 *
	 * Example:
	 *
	 *      req.get('/')
	 *        .unset('User-Agent')
	 *        .end(callback);
	 *
	 * @param {String} field
	 */
	exports.unset = function(field){
	  delete this._header[field.toLowerCase()];
	  delete this.header[field];
	  return this;
	};

	/**
	 * Write the field `name` and `val` for "multipart/form-data"
	 * request bodies.
	 *
	 * ``` js
	 * request.post('/upload')
	 *   .field('foo', 'bar')
	 *   .end(callback);
	 * ```
	 *
	 * @param {String} name
	 * @param {String|Blob|File|Buffer|fs.ReadStream} val
	 * @return {Request} for chaining
	 * @api public
	 */
	exports.field = function(name, val) {
	  if (!this._formData) this._formData = new FormData();
	  this._formData.append(name, val);
	  return this;
	};


/***/ },
/* 10 */
/***/ function(module, exports) {

	/**
	 * Check if `obj` is an object.
	 *
	 * @param {Object} obj
	 * @return {Boolean}
	 * @api private
	 */

	function isObject(obj) {
	  return null != obj && 'object' == typeof obj;
	}

	module.exports = isObject;


/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = FormData;

/***/ },
/* 12 */
/***/ function(module, exports) {

	// The node and browser modules expose versions of this with the
	// appropriate constructor function bound as first argument
	/**
	 * Issue a request:
	 *
	 * Examples:
	 *
	 *    request('GET', '/users').end(callback)
	 *    request('/users').end(callback)
	 *    request('/users', callback)
	 *
	 * @param {String} method
	 * @param {String|Function} url or callback
	 * @return {Request}
	 * @api public
	 */

	function request(RequestConstructor, method, url) {
	  // callback
	  if ('function' == typeof url) {
	    return new RequestConstructor('GET', method).end(url);
	  }

	  // url first
	  if (2 == arguments.length) {
	    return new RequestConstructor('GET', method);
	  }

	  return new RequestConstructor(method, url);
	}

	module.exports = request;


/***/ },
/* 13 */
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

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _keychain = __webpack_require__(13);

	var _keychain2 = _interopRequireDefault(_keychain);

	var _hmacSha = __webpack_require__(15);

	var _hmacSha2 = _interopRequireDefault(_hmacSha);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class(_ref) {
	    var keychain = _ref.keychain;

	    _classCallCheck(this, _class);

	    this._keychain = keychain;

	    this._iv = '0123456789012345';

	    this._allowedKeyEncodings = ['hex', 'utf8', 'base64', 'binary'];
	    this._allowedKeyLengths = [128, 256];
	    this._allowedModes = ['ecb', 'cbc'];

	    this._defaultOptions = {
	      encryptKey: true,
	      keyEncoding: 'utf8',
	      keyLength: 256,
	      mode: 'cbc'
	    };
	  }

	  _createClass(_class, [{
	    key: 'HMACSHA256',
	    value: function HMACSHA256(data) {
	      var hash = _hmacSha2.default.HmacSHA256(data, this._keychain.getSecretKey());
	      return hash.toString(_hmacSha2.default.enc.Base64);
	    }
	  }, {
	    key: 'SHA256',
	    value: function SHA256(s) {
	      return _hmacSha2.default.SHA256(s).toString(_hmacSha2.default.enc.Hex);
	    }
	  }, {
	    key: '_parseOptions',
	    value: function _parseOptions(incomingOptions) {
	      // Defaults
	      var options = incomingOptions || {};
	      if (!options.hasOwnProperty('encryptKey')) options.encryptKey = this._defaultOptions.encryptKey;
	      if (!options.hasOwnProperty('keyEncoding')) options.keyEncoding = this._defaultOptions.keyEncoding;
	      if (!options.hasOwnProperty('keyLength')) options.keyLength = this._defaultOptions.keyLength;
	      if (!options.hasOwnProperty('mode')) options.mode = this._defaultOptions.mode;

	      // Validation
	      if (this._allowedKeyEncodings.indexOf(options.keyEncoding.toLowerCase()) === -1) {
	        options.keyEncoding = this._defaultOptions.keyEncoding;
	      }

	      if (this._allowedKeyLengths.indexOf(parseInt(options.keyLength, 10)) === -1) {
	        options.keyLength = this._defaultOptions.keyLength;
	      }

	      if (this._allowedModes.indexOf(options.mode.toLowerCase()) === -1) {
	        options.mode = this._defaultOptions.mode;
	      }

	      return options;
	    }
	  }, {
	    key: '_decodeKey',
	    value: function _decodeKey(key, options) {
	      if (options.keyEncoding === 'base64') {
	        return _hmacSha2.default.enc.Base64.parse(key);
	      } else if (options.keyEncoding === 'hex') {
	        return _hmacSha2.default.enc.Hex.parse(key);
	      } else {
	        return key;
	      }
	    }
	  }, {
	    key: '_getPaddedKey',
	    value: function _getPaddedKey(key, options) {
	      key = this._decodeKey(key, options);
	      if (options.encryptKey) {
	        return _hmacSha2.default.enc.Utf8.parse(this.SHA256(key).slice(0, 32));
	      } else {
	        return key;
	      }
	    }
	  }, {
	    key: '_getMode',
	    value: function _getMode(options) {
	      if (options.mode === 'ecb') {
	        return _hmacSha2.default.mode.ECB;
	      } else {
	        return _hmacSha2.default.mode.CBC;
	      }
	    }
	  }, {
	    key: '_getIV',
	    value: function _getIV(options) {
	      return options.mode === 'cbc' ? _hmacSha2.default.enc.Utf8.parse(this._iv) : null;
	    }
	  }, {
	    key: 'encrypt',
	    value: function encrypt(data, options) {
	      if (!this._keychain.getCipherKey()) return data;
	      options = this._parseOptions(options);
	      var iv = this._getIV(options);
	      var mode = this._getMode(options);
	      var cipherKey = this._getPaddedKey(this._keychain.getCipherKey(), options);
	      var encryptedHexArray = _hmacSha2.default.AES.encrypt(data, cipherKey, { iv: iv, mode: mode }).ciphertext;
	      var base64Encrypted = encryptedHexArray.toString(_hmacSha2.default.enc.Base64);
	      return base64Encrypted || data;
	    }
	  }, {
	    key: 'decrypt',
	    value: function decrypt(data, options) {
	      if (!this._keychain.getCipherKey()) return data;
	      options = this._parseOptions(options);
	      var iv = this._getIV(options);
	      var mode = this._getMode(options);
	      var cipherKey = this._getPaddedKey(this._keychain.getCipherKey(), options);
	      try {
	        var ciphertext = _hmacSha2.default.enc.Base64.parse(data);
	        var plainJSON = _hmacSha2.default.AES.decrypt({ ciphertext: ciphertext }, cipherKey, { iv: iv, mode: mode }).toString(_hmacSha2.default.enc.Utf8);
	        var plaintext = JSON.parse(plainJSON);
	        return plaintext;
	      } catch (e) {
	        return null;
	      }
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;

/***/ },
/* 15 */
/***/ function(module, exports) {

	"use strict";

	/*eslint-disable */

	/*
	 CryptoJS v3.1.2
	 code.google.com/p/crypto-js
	 (c) 2009-2013 by Jeff Mott. All rights reserved.
	 code.google.com/p/crypto-js/wiki/License
	 */
	var CryptoJS = CryptoJS || function (h, s) {
	  var f = {},
	      g = f.lib = {},
	      q = function q() {},
	      m = g.Base = { extend: function extend(a) {
	      q.prototype = this;var c = new q();a && c.mixIn(a);c.hasOwnProperty("init") || (c.init = function () {
	        c.$super.init.apply(this, arguments);
	      });c.init.prototype = c;c.$super = this;return c;
	    }, create: function create() {
	      var a = this.extend();a.init.apply(a, arguments);return a;
	    }, init: function init() {}, mixIn: function mixIn(a) {
	      for (var c in a) {
	        a.hasOwnProperty(c) && (this[c] = a[c]);
	      }a.hasOwnProperty("toString") && (this.toString = a.toString);
	    }, clone: function clone() {
	      return this.init.prototype.extend(this);
	    } },
	      r = g.WordArray = m.extend({ init: function init(a, c) {
	      a = this.words = a || [];this.sigBytes = c != s ? c : 4 * a.length;
	    }, toString: function toString(a) {
	      return (a || k).stringify(this);
	    }, concat: function concat(a) {
	      var c = this.words,
	          d = a.words,
	          b = this.sigBytes;a = a.sigBytes;this.clamp();if (b % 4) for (var e = 0; e < a; e++) {
	        c[b + e >>> 2] |= (d[e >>> 2] >>> 24 - 8 * (e % 4) & 255) << 24 - 8 * ((b + e) % 4);
	      } else if (65535 < d.length) for (e = 0; e < a; e += 4) {
	        c[b + e >>> 2] = d[e >>> 2];
	      } else c.push.apply(c, d);this.sigBytes += a;return this;
	    }, clamp: function clamp() {
	      var a = this.words,
	          c = this.sigBytes;a[c >>> 2] &= 4294967295 << 32 - 8 * (c % 4);a.length = h.ceil(c / 4);
	    }, clone: function clone() {
	      var a = m.clone.call(this);a.words = this.words.slice(0);return a;
	    }, random: function random(a) {
	      for (var c = [], d = 0; d < a; d += 4) {
	        c.push(4294967296 * h.random() | 0);
	      }return new r.init(c, a);
	    } }),
	      l = f.enc = {},
	      k = l.Hex = { stringify: function stringify(a) {
	      var c = a.words;a = a.sigBytes;for (var d = [], b = 0; b < a; b++) {
	        var e = c[b >>> 2] >>> 24 - 8 * (b % 4) & 255;d.push((e >>> 4).toString(16));d.push((e & 15).toString(16));
	      }return d.join("");
	    }, parse: function parse(a) {
	      for (var c = a.length, d = [], b = 0; b < c; b += 2) {
	        d[b >>> 3] |= parseInt(a.substr(b, 2), 16) << 24 - 4 * (b % 8);
	      }return new r.init(d, c / 2);
	    } },
	      n = l.Latin1 = { stringify: function stringify(a) {
	      var c = a.words;a = a.sigBytes;for (var d = [], b = 0; b < a; b++) {
	        d.push(String.fromCharCode(c[b >>> 2] >>> 24 - 8 * (b % 4) & 255));
	      }return d.join("");
	    }, parse: function parse(a) {
	      for (var c = a.length, d = [], b = 0; b < c; b++) {
	        d[b >>> 2] |= (a.charCodeAt(b) & 255) << 24 - 8 * (b % 4);
	      }return new r.init(d, c);
	    } },
	      j = l.Utf8 = { stringify: function stringify(a) {
	      try {
	        return decodeURIComponent(escape(n.stringify(a)));
	      } catch (c) {
	        throw Error("Malformed UTF-8 data");
	      }
	    }, parse: function parse(a) {
	      return n.parse(unescape(encodeURIComponent(a)));
	    } },
	      u = g.BufferedBlockAlgorithm = m.extend({ reset: function reset() {
	      this._data = new r.init();this._nDataBytes = 0;
	    }, _append: function _append(a) {
	      "string" == typeof a && (a = j.parse(a));this._data.concat(a);this._nDataBytes += a.sigBytes;
	    }, _process: function _process(a) {
	      var c = this._data,
	          d = c.words,
	          b = c.sigBytes,
	          e = this.blockSize,
	          f = b / (4 * e),
	          f = a ? h.ceil(f) : h.max((f | 0) - this._minBufferSize, 0);a = f * e;b = h.min(4 * a, b);if (a) {
	        for (var g = 0; g < a; g += e) {
	          this._doProcessBlock(d, g);
	        }g = d.splice(0, a);c.sigBytes -= b;
	      }return new r.init(g, b);
	    }, clone: function clone() {
	      var a = m.clone.call(this);
	      a._data = this._data.clone();return a;
	    }, _minBufferSize: 0 });g.Hasher = u.extend({ cfg: m.extend(), init: function init(a) {
	      this.cfg = this.cfg.extend(a);this.reset();
	    }, reset: function reset() {
	      u.reset.call(this);this._doReset();
	    }, update: function update(a) {
	      this._append(a);this._process();return this;
	    }, finalize: function finalize(a) {
	      a && this._append(a);return this._doFinalize();
	    }, blockSize: 16, _createHelper: function _createHelper(a) {
	      return function (c, d) {
	        return new a.init(d).finalize(c);
	      };
	    }, _createHmacHelper: function _createHmacHelper(a) {
	      return function (c, d) {
	        return new t.HMAC.init(a, d).finalize(c);
	      };
	    } });var t = f.algo = {};return f;
	}(Math);

	// SHA256
	(function (h) {
	  for (var s = CryptoJS, f = s.lib, g = f.WordArray, q = f.Hasher, f = s.algo, m = [], r = [], l = function l(a) {
	    return 4294967296 * (a - (a | 0)) | 0;
	  }, k = 2, n = 0; 64 > n;) {
	    var j;a: {
	      j = k;for (var u = h.sqrt(j), t = 2; t <= u; t++) {
	        if (!(j % t)) {
	          j = !1;break a;
	        }
	      }j = !0;
	    }j && (8 > n && (m[n] = l(h.pow(k, 0.5))), r[n] = l(h.pow(k, 1 / 3)), n++);k++;
	  }var a = [],
	      f = f.SHA256 = q.extend({ _doReset: function _doReset() {
	      this._hash = new g.init(m.slice(0));
	    }, _doProcessBlock: function _doProcessBlock(c, d) {
	      for (var b = this._hash.words, e = b[0], f = b[1], g = b[2], j = b[3], h = b[4], m = b[5], n = b[6], q = b[7], p = 0; 64 > p; p++) {
	        if (16 > p) a[p] = c[d + p] | 0;else {
	          var k = a[p - 15],
	              l = a[p - 2];a[p] = ((k << 25 | k >>> 7) ^ (k << 14 | k >>> 18) ^ k >>> 3) + a[p - 7] + ((l << 15 | l >>> 17) ^ (l << 13 | l >>> 19) ^ l >>> 10) + a[p - 16];
	        }k = q + ((h << 26 | h >>> 6) ^ (h << 21 | h >>> 11) ^ (h << 7 | h >>> 25)) + (h & m ^ ~h & n) + r[p] + a[p];l = ((e << 30 | e >>> 2) ^ (e << 19 | e >>> 13) ^ (e << 10 | e >>> 22)) + (e & f ^ e & g ^ f & g);q = n;n = m;m = h;h = j + k | 0;j = g;g = f;f = e;e = k + l | 0;
	      }b[0] = b[0] + e | 0;b[1] = b[1] + f | 0;b[2] = b[2] + g | 0;b[3] = b[3] + j | 0;b[4] = b[4] + h | 0;b[5] = b[5] + m | 0;b[6] = b[6] + n | 0;b[7] = b[7] + q | 0;
	    }, _doFinalize: function _doFinalize() {
	      var a = this._data,
	          d = a.words,
	          b = 8 * this._nDataBytes,
	          e = 8 * a.sigBytes;
	      d[e >>> 5] |= 128 << 24 - e % 32;d[(e + 64 >>> 9 << 4) + 14] = h.floor(b / 4294967296);d[(e + 64 >>> 9 << 4) + 15] = b;a.sigBytes = 4 * d.length;this._process();return this._hash;
	    }, clone: function clone() {
	      var a = q.clone.call(this);a._hash = this._hash.clone();return a;
	    } });s.SHA256 = q._createHelper(f);s.HmacSHA256 = q._createHmacHelper(f);
	})(Math);

	// HMAC SHA256
	(function () {
	  var h = CryptoJS,
	      s = h.enc.Utf8;h.algo.HMAC = h.lib.Base.extend({ init: function init(f, g) {
	      f = this._hasher = new f.init();"string" == typeof g && (g = s.parse(g));var h = f.blockSize,
	          m = 4 * h;g.sigBytes > m && (g = f.finalize(g));g.clamp();for (var r = this._oKey = g.clone(), l = this._iKey = g.clone(), k = r.words, n = l.words, j = 0; j < h; j++) {
	        k[j] ^= 1549556828, n[j] ^= 909522486;
	      }r.sigBytes = l.sigBytes = m;this.reset();
	    }, reset: function reset() {
	      var f = this._hasher;f.reset();f.update(this._iKey);
	    }, update: function update(f) {
	      this._hasher.update(f);return this;
	    }, finalize: function finalize(f) {
	      var g = this._hasher;f = g.finalize(f);g.reset();return g.finalize(this._oKey.clone().concat(f));
	    } });
	})();

	// Base64
	(function () {
	  var u = CryptoJS,
	      p = u.lib.WordArray;u.enc.Base64 = { stringify: function stringify(d) {
	      var l = d.words,
	          p = d.sigBytes,
	          t = this._map;d.clamp();d = [];for (var r = 0; r < p; r += 3) {
	        for (var w = (l[r >>> 2] >>> 24 - 8 * (r % 4) & 255) << 16 | (l[r + 1 >>> 2] >>> 24 - 8 * ((r + 1) % 4) & 255) << 8 | l[r + 2 >>> 2] >>> 24 - 8 * ((r + 2) % 4) & 255, v = 0; 4 > v && r + 0.75 * v < p; v++) {
	          d.push(t.charAt(w >>> 6 * (3 - v) & 63));
	        }
	      }if (l = t.charAt(64)) for (; d.length % 4;) {
	        d.push(l);
	      }return d.join("");
	    }, parse: function parse(d) {
	      var l = d.length,
	          s = this._map,
	          t = s.charAt(64);t && (t = d.indexOf(t), -1 != t && (l = t));for (var t = [], r = 0, w = 0; w < l; w++) {
	        if (w % 4) {
	          var v = s.indexOf(d.charAt(w - 1)) << 2 * (w % 4),
	              b = s.indexOf(d.charAt(w)) >>> 6 - 2 * (w % 4);t[r >>> 2] |= (v | b) << 24 - 8 * (r % 4);r++;
	        }
	      }return p.create(t, r);
	    }, _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=" };
	})();

	// BlockCipher
	(function (u) {
	  function p(b, n, a, c, e, j, k) {
	    b = b + (n & a | ~n & c) + e + k;return (b << j | b >>> 32 - j) + n;
	  }function d(b, n, a, c, e, j, k) {
	    b = b + (n & c | a & ~c) + e + k;return (b << j | b >>> 32 - j) + n;
	  }function l(b, n, a, c, e, j, k) {
	    b = b + (n ^ a ^ c) + e + k;return (b << j | b >>> 32 - j) + n;
	  }function s(b, n, a, c, e, j, k) {
	    b = b + (a ^ (n | ~c)) + e + k;return (b << j | b >>> 32 - j) + n;
	  }for (var t = CryptoJS, r = t.lib, w = r.WordArray, v = r.Hasher, r = t.algo, b = [], x = 0; 64 > x; x++) {
	    b[x] = 4294967296 * u.abs(u.sin(x + 1)) | 0;
	  }r = r.MD5 = v.extend({ _doReset: function _doReset() {
	      this._hash = new w.init([1732584193, 4023233417, 2562383102, 271733878]);
	    },
	    _doProcessBlock: function _doProcessBlock(q, n) {
	      for (var a = 0; 16 > a; a++) {
	        var c = n + a,
	            e = q[c];q[c] = (e << 8 | e >>> 24) & 16711935 | (e << 24 | e >>> 8) & 4278255360;
	      }var a = this._hash.words,
	          c = q[n + 0],
	          e = q[n + 1],
	          j = q[n + 2],
	          k = q[n + 3],
	          z = q[n + 4],
	          r = q[n + 5],
	          t = q[n + 6],
	          w = q[n + 7],
	          v = q[n + 8],
	          A = q[n + 9],
	          B = q[n + 10],
	          C = q[n + 11],
	          u = q[n + 12],
	          D = q[n + 13],
	          E = q[n + 14],
	          x = q[n + 15],
	          f = a[0],
	          m = a[1],
	          g = a[2],
	          h = a[3],
	          f = p(f, m, g, h, c, 7, b[0]),
	          h = p(h, f, m, g, e, 12, b[1]),
	          g = p(g, h, f, m, j, 17, b[2]),
	          m = p(m, g, h, f, k, 22, b[3]),
	          f = p(f, m, g, h, z, 7, b[4]),
	          h = p(h, f, m, g, r, 12, b[5]),
	          g = p(g, h, f, m, t, 17, b[6]),
	          m = p(m, g, h, f, w, 22, b[7]),
	          f = p(f, m, g, h, v, 7, b[8]),
	          h = p(h, f, m, g, A, 12, b[9]),
	          g = p(g, h, f, m, B, 17, b[10]),
	          m = p(m, g, h, f, C, 22, b[11]),
	          f = p(f, m, g, h, u, 7, b[12]),
	          h = p(h, f, m, g, D, 12, b[13]),
	          g = p(g, h, f, m, E, 17, b[14]),
	          m = p(m, g, h, f, x, 22, b[15]),
	          f = d(f, m, g, h, e, 5, b[16]),
	          h = d(h, f, m, g, t, 9, b[17]),
	          g = d(g, h, f, m, C, 14, b[18]),
	          m = d(m, g, h, f, c, 20, b[19]),
	          f = d(f, m, g, h, r, 5, b[20]),
	          h = d(h, f, m, g, B, 9, b[21]),
	          g = d(g, h, f, m, x, 14, b[22]),
	          m = d(m, g, h, f, z, 20, b[23]),
	          f = d(f, m, g, h, A, 5, b[24]),
	          h = d(h, f, m, g, E, 9, b[25]),
	          g = d(g, h, f, m, k, 14, b[26]),
	          m = d(m, g, h, f, v, 20, b[27]),
	          f = d(f, m, g, h, D, 5, b[28]),
	          h = d(h, f, m, g, j, 9, b[29]),
	          g = d(g, h, f, m, w, 14, b[30]),
	          m = d(m, g, h, f, u, 20, b[31]),
	          f = l(f, m, g, h, r, 4, b[32]),
	          h = l(h, f, m, g, v, 11, b[33]),
	          g = l(g, h, f, m, C, 16, b[34]),
	          m = l(m, g, h, f, E, 23, b[35]),
	          f = l(f, m, g, h, e, 4, b[36]),
	          h = l(h, f, m, g, z, 11, b[37]),
	          g = l(g, h, f, m, w, 16, b[38]),
	          m = l(m, g, h, f, B, 23, b[39]),
	          f = l(f, m, g, h, D, 4, b[40]),
	          h = l(h, f, m, g, c, 11, b[41]),
	          g = l(g, h, f, m, k, 16, b[42]),
	          m = l(m, g, h, f, t, 23, b[43]),
	          f = l(f, m, g, h, A, 4, b[44]),
	          h = l(h, f, m, g, u, 11, b[45]),
	          g = l(g, h, f, m, x, 16, b[46]),
	          m = l(m, g, h, f, j, 23, b[47]),
	          f = s(f, m, g, h, c, 6, b[48]),
	          h = s(h, f, m, g, w, 10, b[49]),
	          g = s(g, h, f, m, E, 15, b[50]),
	          m = s(m, g, h, f, r, 21, b[51]),
	          f = s(f, m, g, h, u, 6, b[52]),
	          h = s(h, f, m, g, k, 10, b[53]),
	          g = s(g, h, f, m, B, 15, b[54]),
	          m = s(m, g, h, f, e, 21, b[55]),
	          f = s(f, m, g, h, v, 6, b[56]),
	          h = s(h, f, m, g, x, 10, b[57]),
	          g = s(g, h, f, m, t, 15, b[58]),
	          m = s(m, g, h, f, D, 21, b[59]),
	          f = s(f, m, g, h, z, 6, b[60]),
	          h = s(h, f, m, g, C, 10, b[61]),
	          g = s(g, h, f, m, j, 15, b[62]),
	          m = s(m, g, h, f, A, 21, b[63]);a[0] = a[0] + f | 0;a[1] = a[1] + m | 0;a[2] = a[2] + g | 0;a[3] = a[3] + h | 0;
	    }, _doFinalize: function _doFinalize() {
	      var b = this._data,
	          n = b.words,
	          a = 8 * this._nDataBytes,
	          c = 8 * b.sigBytes;n[c >>> 5] |= 128 << 24 - c % 32;var e = u.floor(a / 4294967296);n[(c + 64 >>> 9 << 4) + 15] = (e << 8 | e >>> 24) & 16711935 | (e << 24 | e >>> 8) & 4278255360;n[(c + 64 >>> 9 << 4) + 14] = (a << 8 | a >>> 24) & 16711935 | (a << 24 | a >>> 8) & 4278255360;b.sigBytes = 4 * (n.length + 1);this._process();b = this._hash;n = b.words;for (a = 0; 4 > a; a++) {
	        c = n[a], n[a] = (c << 8 | c >>> 24) & 16711935 | (c << 24 | c >>> 8) & 4278255360;
	      }return b;
	    }, clone: function clone() {
	      var b = v.clone.call(this);b._hash = this._hash.clone();return b;
	    } });t.MD5 = v._createHelper(r);t.HmacMD5 = v._createHmacHelper(r);
	})(Math);
	(function () {
	  var u = CryptoJS,
	      p = u.lib,
	      d = p.Base,
	      l = p.WordArray,
	      p = u.algo,
	      s = p.EvpKDF = d.extend({ cfg: d.extend({ keySize: 4, hasher: p.MD5, iterations: 1 }), init: function init(d) {
	      this.cfg = this.cfg.extend(d);
	    }, compute: function compute(d, r) {
	      for (var p = this.cfg, s = p.hasher.create(), b = l.create(), u = b.words, q = p.keySize, p = p.iterations; u.length < q;) {
	        n && s.update(n);var n = s.update(d).finalize(r);s.reset();for (var a = 1; a < p; a++) {
	          n = s.finalize(n), s.reset();
	        }b.concat(n);
	      }b.sigBytes = 4 * q;return b;
	    } });u.EvpKDF = function (d, l, p) {
	    return s.create(p).compute(d, l);
	  };
	})();

	// Cipher
	CryptoJS.lib.Cipher || function (u) {
	  var p = CryptoJS,
	      d = p.lib,
	      l = d.Base,
	      s = d.WordArray,
	      t = d.BufferedBlockAlgorithm,
	      r = p.enc.Base64,
	      w = p.algo.EvpKDF,
	      v = d.Cipher = t.extend({ cfg: l.extend(), createEncryptor: function createEncryptor(e, a) {
	      return this.create(this._ENC_XFORM_MODE, e, a);
	    }, createDecryptor: function createDecryptor(e, a) {
	      return this.create(this._DEC_XFORM_MODE, e, a);
	    }, init: function init(e, a, b) {
	      this.cfg = this.cfg.extend(b);this._xformMode = e;this._key = a;this.reset();
	    }, reset: function reset() {
	      t.reset.call(this);this._doReset();
	    }, process: function process(e) {
	      this._append(e);return this._process();
	    },
	    finalize: function finalize(e) {
	      e && this._append(e);return this._doFinalize();
	    }, keySize: 4, ivSize: 4, _ENC_XFORM_MODE: 1, _DEC_XFORM_MODE: 2, _createHelper: function _createHelper(e) {
	      return { encrypt: function encrypt(b, k, d) {
	          return ("string" == typeof k ? c : a).encrypt(e, b, k, d);
	        }, decrypt: function decrypt(b, k, d) {
	          return ("string" == typeof k ? c : a).decrypt(e, b, k, d);
	        } };
	    } });d.StreamCipher = v.extend({ _doFinalize: function _doFinalize() {
	      return this._process(!0);
	    }, blockSize: 1 });var b = p.mode = {},
	      x = function x(e, a, b) {
	    var c = this._iv;c ? this._iv = u : c = this._prevBlock;for (var d = 0; d < b; d++) {
	      e[a + d] ^= c[d];
	    }
	  },
	      q = (d.BlockCipherMode = l.extend({ createEncryptor: function createEncryptor(e, a) {
	      return this.Encryptor.create(e, a);
	    }, createDecryptor: function createDecryptor(e, a) {
	      return this.Decryptor.create(e, a);
	    }, init: function init(e, a) {
	      this._cipher = e;this._iv = a;
	    } })).extend();q.Encryptor = q.extend({ processBlock: function processBlock(e, a) {
	      var b = this._cipher,
	          c = b.blockSize;x.call(this, e, a, c);b.encryptBlock(e, a);this._prevBlock = e.slice(a, a + c);
	    } });q.Decryptor = q.extend({ processBlock: function processBlock(e, a) {
	      var b = this._cipher,
	          c = b.blockSize,
	          d = e.slice(a, a + c);b.decryptBlock(e, a);x.call(this, e, a, c);this._prevBlock = d;
	    } });b = b.CBC = q;q = (p.pad = {}).Pkcs7 = { pad: function pad(a, b) {
	      for (var c = 4 * b, c = c - a.sigBytes % c, d = c << 24 | c << 16 | c << 8 | c, l = [], n = 0; n < c; n += 4) {
	        l.push(d);
	      }c = s.create(l, c);a.concat(c);
	    }, unpad: function unpad(a) {
	      a.sigBytes -= a.words[a.sigBytes - 1 >>> 2] & 255;
	    } };d.BlockCipher = v.extend({ cfg: v.cfg.extend({ mode: b, padding: q }), reset: function reset() {
	      v.reset.call(this);var a = this.cfg,
	          b = a.iv,
	          a = a.mode;if (this._xformMode == this._ENC_XFORM_MODE) var c = a.createEncryptor;else c = a.createDecryptor, this._minBufferSize = 1;this._mode = c.call(a, this, b && b.words);
	    }, _doProcessBlock: function _doProcessBlock(a, b) {
	      this._mode.processBlock(a, b);
	    }, _doFinalize: function _doFinalize() {
	      var a = this.cfg.padding;if (this._xformMode == this._ENC_XFORM_MODE) {
	        a.pad(this._data, this.blockSize);var b = this._process(!0);
	      } else b = this._process(!0), a.unpad(b);return b;
	    }, blockSize: 4 });var n = d.CipherParams = l.extend({ init: function init(a) {
	      this.mixIn(a);
	    }, toString: function toString(a) {
	      return (a || this.formatter).stringify(this);
	    } }),
	      b = (p.format = {}).OpenSSL = { stringify: function stringify(a) {
	      var b = a.ciphertext;a = a.salt;return (a ? s.create([1398893684, 1701076831]).concat(a).concat(b) : b).toString(r);
	    }, parse: function parse(a) {
	      a = r.parse(a);var b = a.words;if (1398893684 == b[0] && 1701076831 == b[1]) {
	        var c = s.create(b.slice(2, 4));b.splice(0, 4);a.sigBytes -= 16;
	      }return n.create({ ciphertext: a, salt: c });
	    } },
	      a = d.SerializableCipher = l.extend({ cfg: l.extend({ format: b }), encrypt: function encrypt(a, b, c, d) {
	      d = this.cfg.extend(d);var l = a.createEncryptor(c, d);b = l.finalize(b);l = l.cfg;return n.create({ ciphertext: b, key: c, iv: l.iv, algorithm: a, mode: l.mode, padding: l.padding, blockSize: a.blockSize, formatter: d.format });
	    },
	    decrypt: function decrypt(a, b, c, d) {
	      d = this.cfg.extend(d);b = this._parse(b, d.format);return a.createDecryptor(c, d).finalize(b.ciphertext);
	    }, _parse: function _parse(a, b) {
	      return "string" == typeof a ? b.parse(a, this) : a;
	    } }),
	      p = (p.kdf = {}).OpenSSL = { execute: function execute(a, b, c, d) {
	      d || (d = s.random(8));a = w.create({ keySize: b + c }).compute(a, d);c = s.create(a.words.slice(b), 4 * c);a.sigBytes = 4 * b;return n.create({ key: a, iv: c, salt: d });
	    } },
	      c = d.PasswordBasedCipher = a.extend({ cfg: a.cfg.extend({ kdf: p }), encrypt: function encrypt(b, c, d, l) {
	      l = this.cfg.extend(l);d = l.kdf.execute(d, b.keySize, b.ivSize);l.iv = d.iv;b = a.encrypt.call(this, b, c, d.key, l);b.mixIn(d);return b;
	    }, decrypt: function decrypt(b, c, d, l) {
	      l = this.cfg.extend(l);c = this._parse(c, l.format);d = l.kdf.execute(d, b.keySize, b.ivSize, c.salt);l.iv = d.iv;return a.decrypt.call(this, b, c, d.key, l);
	    } });
	}();

	// AES
	(function () {
	  for (var u = CryptoJS, p = u.lib.BlockCipher, d = u.algo, l = [], s = [], t = [], r = [], w = [], v = [], b = [], x = [], q = [], n = [], a = [], c = 0; 256 > c; c++) {
	    a[c] = 128 > c ? c << 1 : c << 1 ^ 283;
	  }for (var e = 0, j = 0, c = 0; 256 > c; c++) {
	    var k = j ^ j << 1 ^ j << 2 ^ j << 3 ^ j << 4,
	        k = k >>> 8 ^ k & 255 ^ 99;l[e] = k;s[k] = e;var z = a[e],
	        F = a[z],
	        G = a[F],
	        y = 257 * a[k] ^ 16843008 * k;t[e] = y << 24 | y >>> 8;r[e] = y << 16 | y >>> 16;w[e] = y << 8 | y >>> 24;v[e] = y;y = 16843009 * G ^ 65537 * F ^ 257 * z ^ 16843008 * e;b[k] = y << 24 | y >>> 8;x[k] = y << 16 | y >>> 16;q[k] = y << 8 | y >>> 24;n[k] = y;e ? (e = z ^ a[a[a[G ^ z]]], j ^= a[a[j]]) : e = j = 1;
	  }var H = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54],
	      d = d.AES = p.extend({ _doReset: function _doReset() {
	      for (var a = this._key, c = a.words, d = a.sigBytes / 4, a = 4 * ((this._nRounds = d + 6) + 1), e = this._keySchedule = [], j = 0; j < a; j++) {
	        if (j < d) e[j] = c[j];else {
	          var k = e[j - 1];j % d ? 6 < d && 4 == j % d && (k = l[k >>> 24] << 24 | l[k >>> 16 & 255] << 16 | l[k >>> 8 & 255] << 8 | l[k & 255]) : (k = k << 8 | k >>> 24, k = l[k >>> 24] << 24 | l[k >>> 16 & 255] << 16 | l[k >>> 8 & 255] << 8 | l[k & 255], k ^= H[j / d | 0] << 24);e[j] = e[j - d] ^ k;
	        }
	      }c = this._invKeySchedule = [];for (d = 0; d < a; d++) {
	        j = a - d, k = d % 4 ? e[j] : e[j - 4], c[d] = 4 > d || 4 >= j ? k : b[l[k >>> 24]] ^ x[l[k >>> 16 & 255]] ^ q[l[k >>> 8 & 255]] ^ n[l[k & 255]];
	      }
	    }, encryptBlock: function encryptBlock(a, b) {
	      this._doCryptBlock(a, b, this._keySchedule, t, r, w, v, l);
	    }, decryptBlock: function decryptBlock(a, c) {
	      var d = a[c + 1];a[c + 1] = a[c + 3];a[c + 3] = d;this._doCryptBlock(a, c, this._invKeySchedule, b, x, q, n, s);d = a[c + 1];a[c + 1] = a[c + 3];a[c + 3] = d;
	    }, _doCryptBlock: function _doCryptBlock(a, b, c, d, e, j, l, f) {
	      for (var m = this._nRounds, g = a[b] ^ c[0], h = a[b + 1] ^ c[1], k = a[b + 2] ^ c[2], n = a[b + 3] ^ c[3], p = 4, r = 1; r < m; r++) {
	        var q = d[g >>> 24] ^ e[h >>> 16 & 255] ^ j[k >>> 8 & 255] ^ l[n & 255] ^ c[p++],
	            s = d[h >>> 24] ^ e[k >>> 16 & 255] ^ j[n >>> 8 & 255] ^ l[g & 255] ^ c[p++],
	            t = d[k >>> 24] ^ e[n >>> 16 & 255] ^ j[g >>> 8 & 255] ^ l[h & 255] ^ c[p++],
	            n = d[n >>> 24] ^ e[g >>> 16 & 255] ^ j[h >>> 8 & 255] ^ l[k & 255] ^ c[p++],
	            g = q,
	            h = s,
	            k = t;
	      }q = (f[g >>> 24] << 24 | f[h >>> 16 & 255] << 16 | f[k >>> 8 & 255] << 8 | f[n & 255]) ^ c[p++];s = (f[h >>> 24] << 24 | f[k >>> 16 & 255] << 16 | f[n >>> 8 & 255] << 8 | f[g & 255]) ^ c[p++];t = (f[k >>> 24] << 24 | f[n >>> 16 & 255] << 16 | f[g >>> 8 & 255] << 8 | f[h & 255]) ^ c[p++];n = (f[n >>> 24] << 24 | f[g >>> 16 & 255] << 16 | f[h >>> 8 & 255] << 8 | f[k & 255]) ^ c[p++];a[b] = q;a[b + 1] = s;a[b + 2] = t;a[b + 3] = n;
	    }, keySize: 8 });u.AES = p._createHelper(d);
	})();

	// Mode ECB
	CryptoJS.mode.ECB = function () {
	  var ECB = CryptoJS.lib.BlockCipherMode.extend();

	  ECB.Encryptor = ECB.extend({
	    processBlock: function processBlock(words, offset) {
	      this._cipher.encryptBlock(words, offset);
	    }
	  });

	  ECB.Decryptor = ECB.extend({
	    processBlock: function processBlock(words, offset) {
	      this._cipher.decryptBlock(words, offset);
	    }
	  });

	  return ECB;
	}();

	module.exports = CryptoJS;

/***/ },
/* 16 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class(componenetName) {
	    _classCallCheck(this, _class);

	    this._componentName = componenetName;
	  }

	  _createClass(_class, [{
	    key: 'callback',
	    value: function callback(response, _callback) {
	      if ((typeof response === 'undefined' ? 'undefined' : _typeof(response)) === 'object') {
	        if (response.error) {
	          this.error(response, _callback);
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
	    value: function error(response, callback) {
	      if ((typeof response === 'undefined' ? 'undefined' : _typeof(response)) === 'object' && response.error) {
	        var preparedData = _pick(response, ['message', 'payload']);
	        return this._createError(callback, preparedData, 'httpResultError');
	      } else {
	        return this._createError(callback, { message: response }, 'httpResultError');
	      }
	    }
	  }, {
	    key: 'validationError',
	    value: function validationError(message) {
	      return this._createError({ message: message }, 'validationError');
	    }
	  }, {
	    key: '_createError',
	    value: function _createError(errorPayload, type) {
	      errorPayload.component = this._componentName;
	      errorPayload.type = type;
	      return errorPayload;
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;

/***/ },
/* 17 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {

	  /*
	    how long to wait for the server when making transactional requests
	  */


	  /*
	    configuration to supress leave events; when a presence leave is performed
	    this configuration will disallow the leave event from happening
	  */


	  /*
	    how long the server will wait before declaring that the client is gone.
	  */


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
	    use send beacon API when unsubscribing.
	    https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon
	  */


	  /*
	    how long to wait for the server when running the subscribe loop
	  */


	  /*
	    how often (in seconds) the client should announce its presence to server
	  */


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
	    key: "setHeartbeatInterval",
	    value: function setHeartbeatInterval(configValue) {
	      this._heartbeatInterval = configValue;
	      return this;
	    }
	  }, {
	    key: "setPresenceTimeout",
	    value: function setPresenceTimeout(configValue) {
	      this._presenceTimeout = configValue;
	      return this;
	    }
	  }, {
	    key: "setSupressLeaveEvents",
	    value: function setSupressLeaveEvents(configValue) {
	      this._suppressLeaveEvents = configValue;
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
	  }, {
	    key: "isSuppressingLeaveEvents",
	    value: function isSuppressingLeaveEvents() {
	      return this._suppressLeaveEvents;
	    }
	  }, {
	    key: "getHeartbeatInterval",
	    value: function getHeartbeatInterval() {
	      return this._heartbeatInterval;
	    }
	  }, {
	    key: "getPresenceTimeout",
	    value: function getPresenceTimeout() {
	      return this._presenceTimeout;
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _uuid = __webpack_require__(3);

	var _uuid2 = _interopRequireDefault(_uuid);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/* eslint no-unused-expressions: 0, block-scoped-var: 0, no-redeclare: 0, guard-for-in: 0 */

	var defaultConfiguration = __webpack_require__(19);
	var NOW = 1;

	function rnow() {
	  return +new Date();
	}

	function unique() {
	  return 'x' + ++NOW + '' + +new Date();
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
	    var valueStr = (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' ? JSON.stringify(value) : value;
	    typeof value !== 'undefined' && value !== null && encode(valueStr).length > 0 && params.push(key + '=' + encode(valueStr));
	  });

	  url += '?' + params.join(defaultConfiguration.PARAMSBIT);
	  return url;
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
	  var l = _object_to_key_list_sorted(params);
	  return map(l, function (paramKey) {
	    return paramKey + '=' + pamEncode(params[paramKey]);
	  }).join('&');
	}

	function validateHeartbeat(heartbeat, cur_heartbeat, error) {
	  var err = false;

	  if (typeof heartbeat === 'undefined') {
	    return cur_heartbeat;
	  }

	  if (typeof heartbeat === 'number') {
	    if (heartbeat > defaultConfiguration._minimumHeartbeatInterval || heartbeat === 0) {
	      err = false;
	    } else {
	      err = true;
	    }
	  } else if (typeof heartbeat === 'boolean') {
	    if (!heartbeat) {
	      return 0;
	    } else {
	      return defaultConfiguration._defaultHeartbeatInterval;
	    }
	  } else {
	    err = true;
	  }

	  if (err) {
	    if (error) {
	      var errorMessage = 'Presence Heartbeat value invalid. Valid range ( x >';
	      errorMessage += defaultConfiguration._minimumHeartbeatInterval + ' or x = 0). Current Value : ';
	      errorMessage += cur_heartbeat || defaultConfiguration._minimumHeartbeatInterval;

	      error(errorMessage);
	    }
	    return cur_heartbeat || defaultConfiguration._minimumHeartbeatInterval;
	  } else return heartbeat;
	}

	function v2ChangeKey(o, ok, nk) {
	  if (typeof o[ok] !== 'undefined') {
	    var t = o[ok];
	    o[nk] = t;
	    delete o[ok];
	  }
	  return true;
	}

	function v2ExpandKeys(m) {
	  if (m.o) {
	    v2ChangeKey(m.o, 't', 'timetoken');
	    v2ChangeKey(m.o, 'r', 'regionCode');
	  }

	  if (m.p) {
	    v2ChangeKey(m.p, 't', 'timetoken');
	    v2ChangeKey(m.p, 'r', 'regionCode');
	  }

	  v2ChangeKey(m, 'a', 'shard');
	  v2ChangeKey(m, 'b', 'subscriptionMatch');
	  v2ChangeKey(m, 'c', 'channel');
	  v2ChangeKey(m, 'd', 'payload');
	  v2ChangeKey(m, 'ear', 'eatAfterReading');
	  v2ChangeKey(m, 'f', 'flags');
	  v2ChangeKey(m, 'i', 'issuing_client_id');
	  v2ChangeKey(m, 'k', 'subscribeKey');
	  v2ChangeKey(m, 's', 'sequenceNumber');
	  v2ChangeKey(m, 'o', 'originationTimetoken');
	  v2ChangeKey(m, 'p', 'publishTimetoken');
	  v2ChangeKey(m, 'r', 'replicationMap');
	  v2ChangeKey(m, 'u', 'userMetadata');
	  v2ChangeKey(m, 'w', 'waypointList');

	  return m;
	}

	module.exports = {
	  v2ExpandKeys: v2ExpandKeys,
	  buildURL: buildURL,
	  encode: encode,
	  each: each,
	  rnow: rnow,
	  isArray: isArray,
	  map: map,
	  pamEncode: pamEncode,
	  generateUUID: generateUUID,
	  timeout: timeout,
	  _get_pam_sign_input_from_params: _get_pam_sign_input_from_params,
	  _object_to_key_list_sorted: _object_to_key_list_sorted,
	  _object_to_key_list: _object_to_key_list,
	  validateHeartbeat: validateHeartbeat,
	  unique: unique
	};

/***/ },
/* 19 */
/***/ function(module, exports) {

	module.exports = {
		"PARAMSBIT": "&",
		"URLBIT": "/",
		"defaultHeartbeatInterval": 30,
		"minimumHeartbeatInterval": 5,
		"PRESENCE_SUFFIX": "-pnpres",
		"SECOND": 1000
	};

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _eventEmitter = __webpack_require__(21);

	var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  // V2 subscribe region selector

	  // this number gets sent on all subscribe calls to indicate the starting Point
	  // of information polling.

	  function _class() {
	    _classCallCheck(this, _class);

	    this._channelStorage = {};
	    this._channelGroupStorage = {};
	    this._presenceState = {};

	    this._eventEmitter = new _eventEmitter2.default();
	    this._subscribeTimeToken = '0';
	    this.filterExpression = '';
	  } // V2 subscribe filter expression


	  // state storage for each channel:
	  // key: channel / channel group
	  // value: json object of data


	  _createClass(_class, [{
	    key: 'containsChannel',
	    value: function containsChannel(name) {
	      return name in this._channelStorage;
	    }
	  }, {
	    key: 'containsChannelGroup',
	    value: function containsChannelGroup(name) {
	      return name in this._channelGroupStorage;
	    }
	  }, {
	    key: 'getChannel',
	    value: function getChannel(name) {
	      return this._channelStorage[name];
	    }
	  }, {
	    key: 'getChannelGroup',
	    value: function getChannelGroup(name) {
	      return this._channelGroupStorage[name];
	    }
	  }, {
	    key: 'addChannel',
	    value: function addChannel(name, metadata) {
	      this._channelStorage[name] = metadata;
	    }
	  }, {
	    key: 'removeChannel',
	    value: function removeChannel(key) {
	      delete this._channelStorage[key];
	    }
	  }, {
	    key: 'addChannelGroup',
	    value: function addChannelGroup(name, metadata) {
	      this._channelGroupStorage[name] = metadata;
	    }
	  }, {
	    key: 'removeFromPresenceState',
	    value: function removeFromPresenceState(name) {
	      delete this._presenceState[name];
	    }
	  }, {
	    key: 'isInPresenceState',
	    value: function isInPresenceState(name) {
	      return name in this._presenceState;
	    }
	  }, {
	    key: 'removeChannelGroup',
	    value: function removeChannelGroup(key) {
	      delete this._channelGroupStorage[key];
	    }
	  }, {
	    key: 'addToPresenceState',
	    value: function addToPresenceState(key, value) {
	      this._presenceState[key] = value;
	    }
	  }, {
	    key: 'getPresenceState',
	    value: function getPresenceState() {
	      return this._presenceState;
	    }
	  }, {
	    key: 'setSubscribeTimeToken',
	    value: function setSubscribeTimeToken(newTimeToken) {
	      this._subscribeTimeToken = newTimeToken;
	    }
	  }, {
	    key: 'getSubscribeTimeToken',
	    value: function getSubscribeTimeToken() {
	      return this._subscribeTimeToken;
	    }

	    // event emitters

	  }, {
	    key: 'onStateChange',
	    value: function onStateChange(callback) {
	      this._eventEmitter.on('onStateChange', callback);
	    }
	  }, {
	    key: 'onSubscriptionChange',
	    value: function onSubscriptionChange(callback) {
	      this._eventEmitter.on('onSubscriptionChange', callback);
	    }
	  }, {
	    key: 'announceStateChange',
	    value: function announceStateChange() {
	      this._eventEmitter.emit('onStateChange');
	    }
	  }, {
	    key: 'announceSubscriptionChange',
	    value: function announceSubscriptionChange() {
	      this._subscribeTimeToken = '0';
	      this._eventEmitter.emit('onSubscriptionChange');
	    }

	    // end event emitting.

	  }, {
	    key: 'getSubscribedChannels',
	    value: function getSubscribedChannels() {
	      return Object.keys(this._channelStorage);
	    }
	  }, {
	    key: 'getSubscribedChannelGroups',
	    value: function getSubscribedChannelGroups() {
	      return Object.keys(this._channelGroupStorage);
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var d        = __webpack_require__(22)
	  , callable = __webpack_require__(35)

	  , apply = Function.prototype.apply, call = Function.prototype.call
	  , create = Object.create, defineProperty = Object.defineProperty
	  , defineProperties = Object.defineProperties
	  , hasOwnProperty = Object.prototype.hasOwnProperty
	  , descriptor = { configurable: true, enumerable: false, writable: true }

	  , on, once, off, emit, methods, descriptors, base;

	on = function (type, listener) {
		var data;

		callable(listener);

		if (!hasOwnProperty.call(this, '__ee__')) {
			data = descriptor.value = create(null);
			defineProperty(this, '__ee__', descriptor);
			descriptor.value = null;
		} else {
			data = this.__ee__;
		}
		if (!data[type]) data[type] = listener;
		else if (typeof data[type] === 'object') data[type].push(listener);
		else data[type] = [data[type], listener];

		return this;
	};

	once = function (type, listener) {
		var once, self;

		callable(listener);
		self = this;
		on.call(this, type, once = function () {
			off.call(self, type, once);
			apply.call(listener, this, arguments);
		});

		once.__eeOnceListener__ = listener;
		return this;
	};

	off = function (type, listener) {
		var data, listeners, candidate, i;

		callable(listener);

		if (!hasOwnProperty.call(this, '__ee__')) return this;
		data = this.__ee__;
		if (!data[type]) return this;
		listeners = data[type];

		if (typeof listeners === 'object') {
			for (i = 0; (candidate = listeners[i]); ++i) {
				if ((candidate === listener) ||
						(candidate.__eeOnceListener__ === listener)) {
					if (listeners.length === 2) data[type] = listeners[i ? 0 : 1];
					else listeners.splice(i, 1);
				}
			}
		} else {
			if ((listeners === listener) ||
					(listeners.__eeOnceListener__ === listener)) {
				delete data[type];
			}
		}

		return this;
	};

	emit = function (type) {
		var i, l, listener, listeners, args;

		if (!hasOwnProperty.call(this, '__ee__')) return;
		listeners = this.__ee__[type];
		if (!listeners) return;

		if (typeof listeners === 'object') {
			l = arguments.length;
			args = new Array(l - 1);
			for (i = 1; i < l; ++i) args[i - 1] = arguments[i];

			listeners = listeners.slice();
			for (i = 0; (listener = listeners[i]); ++i) {
				apply.call(listener, this, args);
			}
		} else {
			switch (arguments.length) {
			case 1:
				call.call(listeners, this);
				break;
			case 2:
				call.call(listeners, this, arguments[1]);
				break;
			case 3:
				call.call(listeners, this, arguments[1], arguments[2]);
				break;
			default:
				l = arguments.length;
				args = new Array(l - 1);
				for (i = 1; i < l; ++i) {
					args[i - 1] = arguments[i];
				}
				apply.call(listeners, this, args);
			}
		}
	};

	methods = {
		on: on,
		once: once,
		off: off,
		emit: emit
	};

	descriptors = {
		on: d(on),
		once: d(once),
		off: d(off),
		emit: d(emit)
	};

	base = defineProperties({}, descriptors);

	module.exports = exports = function (o) {
		return (o == null) ? create(base) : defineProperties(Object(o), descriptors);
	};
	exports.methods = methods;


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var assign        = __webpack_require__(23)
	  , normalizeOpts = __webpack_require__(30)
	  , isCallable    = __webpack_require__(31)
	  , contains      = __webpack_require__(32)

	  , d;

	d = module.exports = function (dscr, value/*, options*/) {
		var c, e, w, options, desc;
		if ((arguments.length < 2) || (typeof dscr !== 'string')) {
			options = value;
			value = dscr;
			dscr = null;
		} else {
			options = arguments[2];
		}
		if (dscr == null) {
			c = w = true;
			e = false;
		} else {
			c = contains.call(dscr, 'c');
			e = contains.call(dscr, 'e');
			w = contains.call(dscr, 'w');
		}

		desc = { value: value, configurable: c, enumerable: e, writable: w };
		return !options ? desc : assign(normalizeOpts(options), desc);
	};

	d.gs = function (dscr, get, set/*, options*/) {
		var c, e, options, desc;
		if (typeof dscr !== 'string') {
			options = set;
			set = get;
			get = dscr;
			dscr = null;
		} else {
			options = arguments[3];
		}
		if (get == null) {
			get = undefined;
		} else if (!isCallable(get)) {
			options = get;
			get = set = undefined;
		} else if (set == null) {
			set = undefined;
		} else if (!isCallable(set)) {
			options = set;
			set = undefined;
		}
		if (dscr == null) {
			c = true;
			e = false;
		} else {
			c = contains.call(dscr, 'c');
			e = contains.call(dscr, 'e');
		}

		desc = { get: get, set: set, configurable: c, enumerable: e };
		return !options ? desc : assign(normalizeOpts(options), desc);
	};


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(24)()
		? Object.assign
		: __webpack_require__(25);


/***/ },
/* 24 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function () {
		var assign = Object.assign, obj;
		if (typeof assign !== 'function') return false;
		obj = { foo: 'raz' };
		assign(obj, { bar: 'dwa' }, { trzy: 'trzy' });
		return (obj.foo + obj.bar + obj.trzy) === 'razdwatrzy';
	};


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var keys  = __webpack_require__(26)
	  , value = __webpack_require__(29)

	  , max = Math.max;

	module.exports = function (dest, src/*, …srcn*/) {
		var error, i, l = max(arguments.length, 2), assign;
		dest = Object(value(dest));
		assign = function (key) {
			try { dest[key] = src[key]; } catch (e) {
				if (!error) error = e;
			}
		};
		for (i = 1; i < l; ++i) {
			src = arguments[i];
			keys(src).forEach(assign);
		}
		if (error !== undefined) throw error;
		return dest;
	};


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(27)()
		? Object.keys
		: __webpack_require__(28);


/***/ },
/* 27 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function () {
		try {
			Object.keys('primitive');
			return true;
		} catch (e) { return false; }
	};


/***/ },
/* 28 */
/***/ function(module, exports) {

	'use strict';

	var keys = Object.keys;

	module.exports = function (object) {
		return keys(object == null ? object : Object(object));
	};


/***/ },
/* 29 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (value) {
		if (value == null) throw new TypeError("Cannot use null or undefined");
		return value;
	};


/***/ },
/* 30 */
/***/ function(module, exports) {

	'use strict';

	var forEach = Array.prototype.forEach, create = Object.create;

	var process = function (src, obj) {
		var key;
		for (key in src) obj[key] = src[key];
	};

	module.exports = function (options/*, …options*/) {
		var result = create(null);
		forEach.call(arguments, function (options) {
			if (options == null) return;
			process(Object(options), result);
		});
		return result;
	};


/***/ },
/* 31 */
/***/ function(module, exports) {

	// Deprecated

	'use strict';

	module.exports = function (obj) { return typeof obj === 'function'; };


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(33)()
		? String.prototype.contains
		: __webpack_require__(34);


/***/ },
/* 33 */
/***/ function(module, exports) {

	'use strict';

	var str = 'razdwatrzy';

	module.exports = function () {
		if (typeof str.contains !== 'function') return false;
		return ((str.contains('dwa') === true) && (str.contains('foo') === false));
	};


/***/ },
/* 34 */
/***/ function(module, exports) {

	'use strict';

	var indexOf = String.prototype.indexOf;

	module.exports = function (searchString/*, position*/) {
		return indexOf.call(this, searchString, arguments[1]) > -1;
	};


/***/ },
/* 35 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (fn) {
		if (typeof fn !== 'function') throw new TypeError(fn + " is not a function");
		return fn;
	};


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _networking = __webpack_require__(5);

	var _networking2 = _interopRequireDefault(_networking);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	// disable one-at-a-time publishing queue and publish on call.

	var PublishItem = function PublishItem() {
	  _classCallCheck(this, PublishItem);
	};

	var _class = function () {
	  function _class(_ref) {
	    var networking = _ref.networking;
	    var _ref$parallelPublish = _ref.parallelPublish;
	    var parallelPublish = _ref$parallelPublish === undefined ? false : _ref$parallelPublish;

	    _classCallCheck(this, _class);

	    this._publishQueue = [];
	    this._networking = networking;
	    this._parallelPublish = parallelPublish;
	    this._isSending = false;
	  }

	  _createClass(_class, [{
	    key: 'newQueueable',
	    value: function newQueueable() {
	      return new PublishItem();
	    }
	  }, {
	    key: 'queueItem',
	    value: function queueItem(publishItem) {
	      this._publishQueue.push(publishItem);
	      this._sendNext();
	    }
	  }, {
	    key: '_sendNext',
	    value: function _sendNext() {
	      // if we have nothing to send, return right away.
	      if (this._publishQueue.length === 0) {
	        return;
	      }

	      // if parallel publish is enabled, always send.
	      if (this._parallelPublish) {
	        return this.__publishNext();
	      }

	      // if something is sending, wait for it to finish up.
	      if (this._isSending) {
	        return;
	      }

	      this._isSending = true;
	      this.__publishNext();
	    }
	  }, {
	    key: '__publishNext',
	    value: function __publishNext() {
	      var _this = this;

	      var _publishQueue$shift = this._publishQueue.shift();

	      var channel = _publishQueue$shift.channel;
	      var payload = _publishQueue$shift.payload;
	      var params = _publishQueue$shift.params;
	      var httpMethod = _publishQueue$shift.httpMethod;
	      var callback = _publishQueue$shift.callback;


	      var onPublish = function onPublish(err, response) {
	        _this._isSending = false;
	        _this._sendNext();
	        callback(err, response);
	      };

	      this._networking.performPublish(channel, payload, params, httpMethod, onPublish);
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* flow */

	var _config = __webpack_require__(17);

	var _config2 = _interopRequireDefault(_config);

	var _state = __webpack_require__(20);

	var _state2 = _interopRequireDefault(_state);

	var _presence = __webpack_require__(38);

	var _presence2 = _interopRequireDefault(_presence);

	var _logger = __webpack_require__(39);

	var _logger2 = _interopRequireDefault(_logger);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var constants = __webpack_require__(19);
	var logger = _logger2.default.getLogger('component/presenceHeartbeat');

	var _class = function () {
	  function _class(config, state, presence) {
	    _classCallCheck(this, _class);

	    this._state = state;
	    this._presence = presence;

	    // this._state.onSubscriptionChange(this.__start.bind(this));
	  }

	  /**
	    removes scheduled presence heartbeat executions and executes
	    a new presence heartbeat with the new interval
	  */


	  _createClass(_class, [{
	    key: '__start',
	    value: function __start() {
	      logger.debug('(re-)starting presence heartbeat');
	      this.__start();
	      this.__periodicHeartbeat();
	    }

	    /**
	      remove presence heartbeat schedules;
	    */

	  }, {
	    key: '__stop',
	    value: function __stop() {
	      logger.debug('stopping presence heartbeat');
	      clearTimeout(this._intervalId);
	      this._intervalId = null;
	    }
	  }, {
	    key: '__periodicHeartbeat',
	    value: function __periodicHeartbeat() {
	      var timeoutInterval = this._config.getHeartbeatInterval() * constants.SECOND;

	      // if the heartbeat interval is not within the allowed range, exit early
	      if (this._config.getHeartbeatInterval() < 1 || this._config.getHeartbeatInterval() > 500) {
	        logger.debug('interval is greater than 500 or below 1; aborting');
	        return;
	      }

	      // if there are no active channel / channel groups, bail out.
	      if (!this._state.getChannels(true).length && !this._state.getChannelGroups(true).length) {
	        logger.debug('there are no channels / channel groups to heartbeat; aborting');
	        return;
	      }

	      this._presence.heartbeat({
	        callback: function callback() {
	          this._intervalId = setTimeout(this._presence_heartbeat, timeoutInterval);
	        },
	        error: function error(e) {
	          if (this._error) {
	            this._error('Presence Heartbeat unable to reach Pubnub servers', e);
	          }

	          this._intervalId = setTimeout(this._presence_heartbeat, timeoutInterval);
	        }
	      });
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _networking = __webpack_require__(5);

	var _networking2 = _interopRequireDefault(_networking);

	var _state = __webpack_require__(20);

	var _state2 = _interopRequireDefault(_state);

	var _logger = __webpack_require__(39);

	var _logger2 = _interopRequireDefault(_logger);

	var _responders = __webpack_require__(16);

	var _responders2 = _interopRequireDefault(_responders);

	var _utils = __webpack_require__(18);

	var _utils2 = _interopRequireDefault(_utils);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class(_ref) {
	    var networking = _ref.networking;
	    var state = _ref.state;

	    _classCallCheck(this, _class);

	    this._networking = networking;
	    this._state = state;
	    this._r = new _responders2.default('#endpoints/presence');
	    this._l = _logger2.default.getLogger('#endpoints/presence');
	  }

	  _createClass(_class, [{
	    key: 'hereNow',
	    value: function hereNow(args, callback) {
	      var channel = args.channel;
	      var channelGroup = args.channelGroup;
	      var _args$uuids = args.uuids;
	      var uuids = _args$uuids === undefined ? true : _args$uuids;
	      var state = args.state;

	      var data = {};

	      if (!uuids) data.disable_uuids = 1;
	      if (state) data.state = 1;

	      // Make sure we have a Channel
	      if (!callback) {
	        return this._l.error('Missing Callback');
	      }

	      if (channelGroup) {
	        data['channel-group'] = channelGroup;
	      }

	      this._networking.fetchHereNow(channel, channelGroup, data, callback);
	    }
	  }, {
	    key: 'whereNow',
	    value: function whereNow(args, callback) {
	      var uuid = args.uuid;


	      if (!callback) {
	        return this._l.error('Missing Callback');
	      }

	      this._networking.fetchWhereNow(uuid, callback);
	    }
	  }, {
	    key: 'getState',
	    value: function getState(args, callback) {
	      var uuid = args.uuid;
	      var channel = args.channel;
	      var channelGroup = args.channelGroup;

	      var data = {};

	      if (!callback) {
	        return this._l.error('Missing Callback');
	      }

	      if (!channel && !channelGroup) {
	        return callback(this._r.validationError('Channel or Channel Group must be supplied'));
	      }

	      if (channelGroup) {
	        data['channel-group'] = channelGroup;
	      }

	      if (!channel) {
	        channel = ',';
	      }

	      this._networking.fetchState(uuid, channel, data, callback);
	    }
	  }, {
	    key: 'setState',
	    value: function setState(args, callback) {
	      var _this = this;

	      var state = args.state;
	      var channel = args.channel;
	      var channelGroup = args.channelGroup;

	      var data = {};
	      var channelsWithPresence = [];
	      var channelGroupsWithPresence = [];

	      if (!callback) {
	        return this._l.error('Missing Callback');
	      }

	      if (!channel && !channelGroup) {
	        return callback(this._r.validationError('Channel or Channel Group must be supplied'));
	      }

	      if (!state) {
	        return callback(this._r.validationError('State must be supplied'));
	      }

	      data.state = state;

	      if (channel) {
	        var channelList = (channel.join ? channel.join(',') : '' + channel).split(',');
	        channelList.forEach(function (channel) {
	          if (_this._state.getChannel(channel)) {
	            _this._state.addToPresenceState(channel, state);
	            channelsWithPresence.push(channel);
	          }
	        });
	      }

	      if (channelGroup) {
	        var channelGroupList = (channelGroup.join ? channelGroup.join(',') : '' + channelGroup).split(',');
	        channelGroupList.forEach(function (channel) {
	          if (_this._state.getChannelGroup(channel)) {
	            _this._state.addToPresenceState(channel, state);
	            channelGroupsWithPresence.push(channel);
	          }
	        });
	      }

	      if (channelsWithPresence.length === 0 && channelGroupsWithPresence.length === 0) {
	        return callback(this._r.validationError('No subscriptions exists for the states'));
	      }

	      if (channelGroupsWithPresence.length > 0) {
	        data['channel-group'] = channelGroupsWithPresence.join(',');
	      }

	      if (channelsWithPresence.length === 0) {
	        channel = ',';
	      } else {
	        channel = channelsWithPresence.join(',');
	      }

	      this._networking.setState(channel, data, function (err, response) {
	        if (err) return callback(err, response);
	        _this._state.announceStateChange();
	        return callback(err, response);
	      });
	    }
	  }, {
	    key: 'heartbeat',
	    value: function heartbeat(args) {
	      var callback = args.callback || function () {};
	      var err = args.error || function () {};
	      var data = {
	        uuid: this._keychain.getUUID(),
	        auth: this._keychain.getAuthKey()
	      };

	      var st = JSON.stringify(this._state.getPresenceState());
	      if (st.length > 2) {
	        data.state = JSON.stringify(this._state.getPresenceState());
	      }

	      if (this._config.getPresenceTimeout() > 0 && this._config.getPresenceTimeout() < 320) {
	        data.heartbeat = this._config.getPresenceTimeout();
	      }

	      var channels = _utils2.default.encode(this._state.generate_channel_list(true).join(','));
	      var channelGroups = this._state.generate_channel_group_list(true).join(',');

	      if (!channels) channels = ',';
	      if (channelGroups) data['channel-group'] = channelGroups;

	      if (this._config.isInstanceIdEnabled()) {
	        data.instanceid = this._keychain.getInstanceId();
	      }

	      if (this._config.isRequestIdEnabled()) {
	        data.requestid = _utils2.default.generateUUID();
	      }

	      this._networking.performHeartbeat(channels, {
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

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _loglevel = __webpack_require__(40);

	var _loglevel2 = _interopRequireDefault(_loglevel);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var moduleLogger = function () {
	  function moduleLogger(moduleName) {
	    _classCallCheck(this, moduleLogger);

	    this._moduleName = moduleName;
	  }

	  _createClass(moduleLogger, [{
	    key: '__commonLogger',
	    value: function __commonLogger(level, payload) {
	      _loglevel2.default[level]({
	        component: this._moduleName,
	        data: payload,
	        timestamp: new Date()
	      });
	    }
	  }, {
	    key: 'error',
	    value: function error(payload) {
	      this.__commonLogger('error', payload);
	    }
	  }, {
	    key: 'debug',
	    value: function debug(payload) {
	      this.__commonLogger('debug', payload);
	    }
	  }]);

	  return moduleLogger;
	}();

	exports.default = {
	  getLogger: function getLogger(moduleName) {
	    return new moduleLogger(moduleName);
	  }
	};

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
	* loglevel - https://github.com/pimterry/loglevel
	*
	* Copyright (c) 2013 Tim Perry
	* Licensed under the MIT license.
	*/
	(function (root, definition) {
	    "use strict";
	    if (typeof module === 'object' && module.exports && "function" === 'function') {
	        module.exports = definition();
	    } else if (true) {
	        !(__WEBPACK_AMD_DEFINE_FACTORY__ = (definition), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else {
	        root.log = definition();
	    }
	}(this, function () {
	    "use strict";
	    var noop = function() {};
	    var undefinedType = "undefined";

	    function realMethod(methodName) {
	        if (typeof console === undefinedType) {
	            return false; // We can't build a real method without a console to log to
	        } else if (console[methodName] !== undefined) {
	            return bindMethod(console, methodName);
	        } else if (console.log !== undefined) {
	            return bindMethod(console, 'log');
	        } else {
	            return noop;
	        }
	    }

	    function bindMethod(obj, methodName) {
	        var method = obj[methodName];
	        if (typeof method.bind === 'function') {
	            return method.bind(obj);
	        } else {
	            try {
	                return Function.prototype.bind.call(method, obj);
	            } catch (e) {
	                // Missing bind shim or IE8 + Modernizr, fallback to wrapping
	                return function() {
	                    return Function.prototype.apply.apply(method, [obj, arguments]);
	                };
	            }
	        }
	    }

	    // these private functions always need `this` to be set properly

	    function enableLoggingWhenConsoleArrives(methodName, level, loggerName) {
	        return function () {
	            if (typeof console !== undefinedType) {
	                replaceLoggingMethods.call(this, level, loggerName);
	                this[methodName].apply(this, arguments);
	            }
	        };
	    }

	    function replaceLoggingMethods(level, loggerName) {
	        /*jshint validthis:true */
	        for (var i = 0; i < logMethods.length; i++) {
	            var methodName = logMethods[i];
	            this[methodName] = (i < level) ?
	                noop :
	                this.methodFactory(methodName, level, loggerName);
	        }
	    }

	    function defaultMethodFactory(methodName, level, loggerName) {
	        /*jshint validthis:true */
	        return realMethod(methodName) ||
	               enableLoggingWhenConsoleArrives.apply(this, arguments);
	    }

	    var logMethods = [
	        "trace",
	        "debug",
	        "info",
	        "warn",
	        "error"
	    ];

	    function Logger(name, defaultLevel, factory) {
	      var self = this;
	      var currentLevel;
	      var storageKey = "loglevel";
	      if (name) {
	        storageKey += ":" + name;
	      }

	      function persistLevelIfPossible(levelNum) {
	          var levelName = (logMethods[levelNum] || 'silent').toUpperCase();

	          // Use localStorage if available
	          try {
	              window.localStorage[storageKey] = levelName;
	              return;
	          } catch (ignore) {}

	          // Use session cookie as fallback
	          try {
	              window.document.cookie =
	                encodeURIComponent(storageKey) + "=" + levelName + ";";
	          } catch (ignore) {}
	      }

	      function getPersistedLevel() {
	          var storedLevel;

	          try {
	              storedLevel = window.localStorage[storageKey];
	          } catch (ignore) {}

	          if (typeof storedLevel === undefinedType) {
	              try {
	                  var cookie = window.document.cookie;
	                  var location = cookie.indexOf(
	                      encodeURIComponent(storageKey) + "=");
	                  if (location) {
	                      storedLevel = /^([^;]+)/.exec(cookie.slice(location))[1];
	                  }
	              } catch (ignore) {}
	          }

	          // If the stored level is not valid, treat it as if nothing was stored.
	          if (self.levels[storedLevel] === undefined) {
	              storedLevel = undefined;
	          }

	          return storedLevel;
	      }

	      /*
	       *
	       * Public API
	       *
	       */

	      self.levels = { "TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3,
	          "ERROR": 4, "SILENT": 5};

	      self.methodFactory = factory || defaultMethodFactory;

	      self.getLevel = function () {
	          return currentLevel;
	      };

	      self.setLevel = function (level, persist) {
	          if (typeof level === "string" && self.levels[level.toUpperCase()] !== undefined) {
	              level = self.levels[level.toUpperCase()];
	          }
	          if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
	              currentLevel = level;
	              if (persist !== false) {  // defaults to true
	                  persistLevelIfPossible(level);
	              }
	              replaceLoggingMethods.call(self, level, name);
	              if (typeof console === undefinedType && level < self.levels.SILENT) {
	                  return "No console available for logging";
	              }
	          } else {
	              throw "log.setLevel() called with invalid level: " + level;
	          }
	      };

	      self.setDefaultLevel = function (level) {
	          if (!getPersistedLevel()) {
	              self.setLevel(level, false);
	          }
	      };

	      self.enableAll = function(persist) {
	          self.setLevel(self.levels.TRACE, persist);
	      };

	      self.disableAll = function(persist) {
	          self.setLevel(self.levels.SILENT, persist);
	      };

	      // Initialize with the right level
	      var initialLevel = getPersistedLevel();
	      if (initialLevel == null) {
	          initialLevel = defaultLevel == null ? "WARN" : defaultLevel;
	      }
	      self.setLevel(initialLevel, false);
	    }

	    /*
	     *
	     * Package-level API
	     *
	     */

	    var defaultLogger = new Logger();

	    var _loggersByName = {};
	    defaultLogger.getLogger = function getLogger(name) {
	        if (typeof name !== "string" || name === "") {
	          throw new TypeError("You must supply a name when creating a logger.");
	        }

	        var logger = _loggersByName[name];
	        if (!logger) {
	          logger = _loggersByName[name] = new Logger(
	            name, defaultLogger.getLevel(), defaultLogger.methodFactory);
	        }
	        return logger;
	    };

	    // Grab the current global log variable in case of overwrite
	    var _log = (typeof window !== undefinedType) ? window.log : undefined;
	    defaultLogger.noConflict = function() {
	        if (typeof window !== undefinedType &&
	               window.log === defaultLogger) {
	            window.log = _log;
	        }

	        return defaultLogger;
	    };

	    return defaultLogger;
	}));


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _networking = __webpack_require__(5);

	var _networking2 = _interopRequireDefault(_networking);

	var _state = __webpack_require__(20);

	var _state2 = _interopRequireDefault(_state);

	var _logger = __webpack_require__(39);

	var _logger2 = _interopRequireDefault(_logger);

	var _superagent = __webpack_require__(6);

	var _superagent2 = _interopRequireDefault(_superagent);

	var _defaults = __webpack_require__(19);

	var _defaults2 = _interopRequireDefault(_defaults);

	var _utils = __webpack_require__(18);

	var _utils2 = _interopRequireDefault(_utils);

	var _endsWith2 = __webpack_require__(42);

	var _endsWith3 = _interopRequireDefault(_endsWith2);

	var _flow_interfaces = __webpack_require__(55);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class(_ref) {
	    var networking = _ref.networking;
	    var state = _ref.state;
	    var callbacks = _ref.callbacks;

	    _classCallCheck(this, _class);

	    this._networking = networking;
	    this._state = state;
	    this._callbacks = callbacks;
	    this._l = _logger2.default.getLogger('#iterator/subscriber');

	    this._state.onSubscriptionChange(this.start.bind(this));
	  }

	  _createClass(_class, [{
	    key: 'start',
	    value: function start() {
	      var _this = this;

	      // we can have only one operation on subscribe, cancel previous call.
	      this.stop();

	      var channels = [];
	      var channelGroups = [];
	      var data = {};

	      this._state.getSubscribedChannels().forEach(function (channelName) {
	        var channel = _this._state.getChannel(channelName);

	        channels.push(channel.name);

	        if (channel.enablePresence) {
	          channels.push(channel.name + _defaults2.default.PRESENCE_SUFFIX);
	        }
	      });

	      this._state.getSubscribedChannelGroups().forEach(function (channelGroupName) {
	        var channelGroup = _this._state.getChannelGroup(channelGroupName);

	        channelGroups.push(channelGroup.name);

	        if (channelGroup.enablePresence) {
	          channelGroups.push(channelGroup.name + _defaults2.default.PRESENCE_SUFFIX);
	        }
	      });

	      if (channels.length === 0 && channelGroups.length === 0) {
	        this._l.debug('channelList and channelGroupList is empty, aborting');
	        return;
	      }

	      var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
	      var callback = this.__handleSubscribeResponse.bind(this);

	      data.tt = this._state.getSubscribeTimeToken();

	      if (channelGroups.length > 0) {
	        data['channel-group'] = channelGroups.join(',');
	      }

	      if (this._state.filterExpression && this._state.filterExpression !== '') {
	        data['filter-expr'] = this._state.filterExpression;
	      }

	      if (this._state.subscribeRegion && this._state.subscribeRegion !== '') {
	        data.tr = this._state.subscribeRegion;
	      }

	      this._runningSuperagent = this._networking.performSubscribe(stringifiedChannels, data, callback);
	    }
	  }, {
	    key: '__handleSubscribeResponse',
	    value: function __handleSubscribeResponse(err, response) {
	      if (err) {
	        this.start();
	        return;
	      }

	      var _callbacks = this._callbacks;
	      var onMessage = _callbacks.onMessage;
	      var onPresence = _callbacks.onPresence;


	      console.log('response', response);

	      var payload = response.m ? response.m : [];
	      var timetoken = response.t.t;

	      payload.forEach(function (message) {
	        var isPresence = false;
	        var envelope = _utils2.default.v2ExpandKeys(message);

	        if (envelope.channel && (0, _endsWith3.default)(envelope.channel, _defaults2.default.PRESENCE_SUFFIX)) {
	          isPresence = true;
	          envelope.channel = envelope.channel.replace(_defaults2.default.PRESENCE_SUFFIX, '');
	        }

	        if (envelope.subscriptionMatch && (0, _endsWith3.default)(envelope.subscriptionMatch, _defaults2.default.PRESENCE_SUFFIX)) {
	          isPresence = true;
	          envelope.subscriptionMatch = envelope.subscriptionMatch.replace(_defaults2.default.PRESENCE_SUFFIX, '');
	        }

	        if (isPresence) {
	          onPresence(envelope);
	        } else {
	          onMessage(envelope);
	        }
	      });

	      this._state.setSubscribeTimeToken(timetoken);
	      this.start();
	    }
	  }, {
	    key: 'stop',
	    value: function stop() {
	      if (this._runningSuperagent) {
	        this._runningSuperagent.abort();
	        this._runningSuperagent = null;
	      }
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	var baseClamp = __webpack_require__(43),
	    toInteger = __webpack_require__(44),
	    toString = __webpack_require__(48);

	/**
	 * Checks if `string` ends with the given target string.
	 *
	 * @static
	 * @memberOf _
	 * @category String
	 * @param {string} [string=''] The string to search.
	 * @param {string} [target] The string to search for.
	 * @param {number} [position=string.length] The position to search from.
	 * @returns {boolean} Returns `true` if `string` ends with `target`, else `false`.
	 * @example
	 *
	 * _.endsWith('abc', 'c');
	 * // => true
	 *
	 * _.endsWith('abc', 'b');
	 * // => false
	 *
	 * _.endsWith('abc', 'b', 2);
	 * // => true
	 */
	function endsWith(string, target, position) {
	  string = toString(string);
	  target = typeof target == 'string' ? target : (target + '');

	  var length = string.length;
	  position = position === undefined
	    ? length
	    : baseClamp(toInteger(position), 0, length);

	  position -= target.length;
	  return position >= 0 && string.indexOf(target, position) == position;
	}

	module.exports = endsWith;


/***/ },
/* 43 */
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.clamp` which doesn't coerce arguments to numbers.
	 *
	 * @private
	 * @param {number} number The number to clamp.
	 * @param {number} [lower] The lower bound.
	 * @param {number} upper The upper bound.
	 * @returns {number} Returns the clamped number.
	 */
	function baseClamp(number, lower, upper) {
	  if (number === number) {
	    if (upper !== undefined) {
	      number = number <= upper ? number : upper;
	    }
	    if (lower !== undefined) {
	      number = number >= lower ? number : lower;
	    }
	  }
	  return number;
	}

	module.exports = baseClamp;


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	var toNumber = __webpack_require__(45);

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
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	var isFunction = __webpack_require__(46),
	    isObject = __webpack_require__(47);

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
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(47);

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
/* 47 */
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
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(49),
	    isSymbol = __webpack_require__(53);

	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0;

	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : undefined,
	    symbolToString = symbolProto ? symbolProto.toString : undefined;

	/**
	 * Converts `value` to a string if it's not one. An empty string is returned
	 * for `null` and `undefined` values. The sign of `-0` is preserved.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 * @example
	 *
	 * _.toString(null);
	 * // => ''
	 *
	 * _.toString(-0);
	 * // => '-0'
	 *
	 * _.toString([1, 2, 3]);
	 * // => '1,2,3'
	 */
	function toString(value) {
	  // Exit early for strings to avoid a performance hit in some environments.
	  if (typeof value == 'string') {
	    return value;
	  }
	  if (value == null) {
	    return '';
	  }
	  if (isSymbol(value)) {
	    return symbolToString ? symbolToString.call(value) : '';
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
	}

	module.exports = toString;


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	var root = __webpack_require__(50);

	/** Built-in value references. */
	var Symbol = root.Symbol;

	module.exports = Symbol;


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module, global) {var checkGlobal = __webpack_require__(52);

	/** Used to determine if values are of the language type `Object`. */
	var objectTypes = {
	  'function': true,
	  'object': true
	};

	/** Detect free variable `exports`. */
	var freeExports = (objectTypes[typeof exports] && exports && !exports.nodeType)
	  ? exports
	  : undefined;

	/** Detect free variable `module`. */
	var freeModule = (objectTypes[typeof module] && module && !module.nodeType)
	  ? module
	  : undefined;

	/** Detect free variable `global` from Node.js. */
	var freeGlobal = checkGlobal(freeExports && freeModule && typeof global == 'object' && global);

	/** Detect free variable `self`. */
	var freeSelf = checkGlobal(objectTypes[typeof self] && self);

	/** Detect free variable `window`. */
	var freeWindow = checkGlobal(objectTypes[typeof window] && window);

	/** Detect `this` as the global object. */
	var thisGlobal = checkGlobal(objectTypes[typeof this] && this);

	/**
	 * Used as a reference to the global object.
	 *
	 * The `this` value is used if it's the global object to avoid Greasemonkey's
	 * restricted `window` object, otherwise the `window` object is used.
	 */
	var root = freeGlobal ||
	  ((freeWindow !== (thisGlobal && thisGlobal.window)) && freeWindow) ||
	    freeSelf || thisGlobal || Function('return this')();

	module.exports = root;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(51)(module), (function() { return this; }())))

/***/ },
/* 51 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 52 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is a global object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {null|Object} Returns `value` if it's a global object, else `null`.
	 */
	function checkGlobal(value) {
	  return (value && value.Object === Object) ? value : null;
	}

	module.exports = checkGlobal;


/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	var isObjectLike = __webpack_require__(54);

	/** `Object#toString` result references. */
	var symbolTag = '[object Symbol]';

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/**
	 * Checks if `value` is classified as a `Symbol` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isSymbol(Symbol.iterator);
	 * // => true
	 *
	 * _.isSymbol('abc');
	 * // => false
	 */
	function isSymbol(value) {
	  return typeof value == 'symbol' ||
	    (isObjectLike(value) && objectToString.call(value) == symbolTag);
	}

	module.exports = isSymbol;


/***/ },
/* 54 */
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
/* 55 */
/***/ function(module, exports) {

	'use strict';

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _networking = __webpack_require__(5);

	var _networking2 = _interopRequireDefault(_networking);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class(_ref) {
	    var networking = _ref.networking;

	    _classCallCheck(this, _class);

	    this._networking = networking;
	  }

	  _createClass(_class, [{
	    key: 'fetch',
	    value: function fetch(callback) {
	      this._networking.fetchTime(function (err, response) {
	        if (err) return callback(err);
	        callback(null, response[0]);
	      });
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _networking = __webpack_require__(5);

	var _networking2 = _interopRequireDefault(_networking);

	var _index = __webpack_require__(14);

	var _index2 = _interopRequireDefault(_index);

	var _responders = __webpack_require__(16);

	var _responders2 = _interopRequireDefault(_responders);

	var _logger = __webpack_require__(39);

	var _logger2 = _interopRequireDefault(_logger);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	// TODO:
	var _class = function () {
	  function _class(_ref) {
	    var networking = _ref.networking;
	    var crypto = _ref.crypto;

	    _classCallCheck(this, _class);

	    this._networking = networking;
	    this._crypto = crypto;
	    this._r = new _responders2.default('#endpoints/history');
	    this._l = _logger2.default.getLogger('#endpoints/history');
	  }

	  _createClass(_class, [{
	    key: 'fetch',
	    value: function fetch(args, callback) {
	      var _this = this;

	      var channel = args.channel;
	      var channelGroup = args.channelGroup;
	      var start = args.start;
	      var end = args.end;
	      var includeToken = args.includeToken;


	      var count = args.count || args.limit || 100;
	      var reverse = args.reverse || 'false';
	      var stringMessageToken = args.stringMessageToken || false;

	      if (!channel && !channelGroup) {
	        return callback(this._r.validationError('Missing channel and/or channel group'));
	      }

	      if (!callback) {
	        return this._l.error('Missing Callback');
	      }

	      var params = { count: count, reverse: reverse, stringtoken: 'true' };

	      if (channelGroup) {
	        params['channel-group'] = channelGroup;
	        if (!channel) {
	          channel = ',';
	        }
	      }

	      if (start) params.start = start;
	      if (end) params.end = end;
	      if (includeToken) params.include_token = 'true';
	      if (stringMessageToken) params.string_message_token = 'true';

	      // Send Message
	      this._networking.fetchHistory(channel, params, function (err, resp) {
	        if (err) return callback(err, null);
	        callback(null, _this._parseResponse(resp, includeToken));
	      });
	    }
	  }, {
	    key: '_parseResponse',
	    value: function _parseResponse(response, includeToken) {
	      var _this2 = this;

	      var messages = response[0];
	      var decryptedMessages = [];
	      messages.forEach(function (payload) {
	        if (includeToken) {
	          var decryptedMessage = _this2._crypto.decrypt(payload.message);
	          var timetoken = payload.timetoken;

	          try {
	            decryptedMessages.push({ timetoken: timetoken, message: JSON.parse(decryptedMessage) });
	          } catch (e) {
	            decryptedMessages.push({ timetoken: timetoken, message: decryptedMessage });
	          }
	        } else {
	          var _decryptedMessage = _this2._crypto.decrypt(payload);
	          try {
	            decryptedMessages.push(JSON.parse(_decryptedMessage));
	          } catch (e) {
	            decryptedMessages.push(_decryptedMessage);
	          }
	        }
	      });
	      return [decryptedMessages, response[1], response[2]];
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _networking = __webpack_require__(5);

	var _networking2 = _interopRequireDefault(_networking);

	var _publish_queue = __webpack_require__(36);

	var _publish_queue2 = _interopRequireDefault(_publish_queue);

	var _responders = __webpack_require__(16);

	var _responders2 = _interopRequireDefault(_responders);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	// push notification destination.

	var _class = function () {
	  function _class(_ref) {
	    var networking = _ref.networking;
	    var publishQueue = _ref.publishQueue;

	    _classCallCheck(this, _class);

	    this._networking = networking;
	    this._publishQueue = publishQueue;
	    this._r = new _responders2.default('endpoints/push');
	  }

	  _createClass(_class, [{
	    key: 'addDeviceToPushChannel',
	    value: function addDeviceToPushChannel(args, callback) {
	      var pushGateway = args.pushGateway;
	      var device = args.device;
	      var channel = args.channel;

	      var payload = { operation: 'add', pushGateway: pushGateway, device: device, channel: channel };
	      this.__provisionDevice(payload, callback);
	    }
	  }, {
	    key: 'removeDeviceFromPushChannel',
	    value: function removeDeviceFromPushChannel(args, callback) {
	      var pushGateway = args.pushGateway;
	      var device = args.device;
	      var channel = args.channel;

	      var payload = { operation: 'remove', pushGateway: pushGateway, device: device, channel: channel };
	      this.__provisionDevice(payload, callback);
	    }
	  }, {
	    key: 'send',
	    value: function send(_ref2, callback) {
	      var apns = _ref2.apns;
	      var gcm = _ref2.gcm;
	      var mpns = _ref2.mpns;
	      var channel = _ref2.channel;

	      var payload = {};
	      var publishItem = this._publishQueue.newQueueable();

	      if (!channel) {
	        return callback(this._r.validationError('Missing Push Channel (channel)'));
	      }

	      if (!apns && !gcm && !mpns) {
	        return callback(this._r.validationError('Missing Push Payload (apns, gcm, mpns)'));
	      }

	      if (apns) {
	        payload.pn_apns = apns;
	      }

	      if (gcm) {
	        payload.pn_gcm = gcm;
	      }

	      if (mpns) {
	        payload.pn_mpns = mpns;
	      }

	      publishItem.payload = payload;
	      publishItem.channel = channel;
	      publishItem.params = {};
	      publishItem.httpMethod = 'GET';
	      publishItem.callback = callback;

	      this._publishQueue.queueItem(publishItem);
	    }
	  }, {
	    key: '__provisionDevice',
	    value: function __provisionDevice(args, callback) {
	      var operation = args.operation;
	      var pushGateway = args.pushGateway;
	      var device = args.device;
	      var channel = args.channel;


	      if (!device) {
	        return callback(this._r.validationError('Missing Device ID (device)'));
	      }

	      if (!pushGateway) {
	        return callback(this._r.validationError('Missing GW Type (pushGateway: gcm or apns)'));
	      }

	      if (!operation) {
	        return callback(this._r.validationError('Missing GW Operation (operation: add or remove)'));
	      }

	      if (!channel) {
	        return callback(this._r.validationError('Missing gw destination Channel (channel)'));
	      }

	      var data = {
	        type: pushGateway
	      };

	      if (operation === 'add') {
	        data.add = channel;
	      } else if (operation === 'remove') {
	        data.remove = channel;
	      }

	      this._networking.provisionDeviceForPush(device, data, callback);
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _networking = __webpack_require__(5);

	var _networking2 = _interopRequireDefault(_networking);

	var _logger = __webpack_require__(39);

	var _logger2 = _interopRequireDefault(_logger);

	var _responders = __webpack_require__(16);

	var _responders2 = _interopRequireDefault(_responders);

	var _utils = __webpack_require__(18);

	var _utils2 = _interopRequireDefault(_utils);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class(_ref) {
	    var networking = _ref.networking;

	    _classCallCheck(this, _class);

	    this._networking = networking;
	    this._r = new _responders2.default('#endpoints/PAM');
	    this._l = _logger2.default.getLogger('#endpoints/PAM');
	  }

	  _createClass(_class, [{
	    key: 'revoke',
	    value: function revoke(args, callback) {
	      args.read = false;
	      args.write = false;
	      this.grant(args, callback);
	    }
	  }, {
	    key: 'grant',
	    value: function grant(args, callback) {
	      var channel = args.channel;
	      var channelGroup = args.channelGroup;
	      var ttl = args.ttl;
	      var read = args.read;
	      var write = args.write;
	      var manage = args.manage;
	      var authKey = args.authKey;


	      var r = read ? '1' : '0';
	      var w = write ? '1' : '0';
	      var m = manage ? '1' : '0';

	      if (!callback) {
	        return this._l.error('Missing Callback');
	      }

	      var timestamp = Math.floor(new Date().getTime() / 1000);

	      var data = { w: w, r: r, timestamp: timestamp };

	      if (typeof manage !== 'undefined') {
	        data.m = m;
	      }

	      if (_utils2.default.isArray(channel)) {
	        channel = channel.join(',');
	      }
	      if (_utils2.default.isArray(authKey)) {
	        authKey = authKey.join(',');
	      }

	      if (channel) {
	        data.channel = channel;
	      }

	      if (channelGroup) {
	        data['channel-group'] = channelGroup;
	      }

	      if (ttl || ttl === 0) {
	        data.ttl = ttl;
	      }

	      this._networking.performGrant(authKey, data, callback);
	    }
	  }, {
	    key: 'audit',
	    value: function audit(args, callback) {
	      var channel = args.channel;
	      var channelGroup = args.channelGroup;
	      var authKey = args.authKey;

	      // Make sure we have a Channel

	      if (!callback) {
	        return this._l.error('Missing Callback');
	      }

	      var timestamp = Math.floor(new Date().getTime() / 1000);
	      var data = { timestamp: timestamp };

	      if (channel) {
	        data.channel = channel;
	      }

	      if (channelGroup) {
	        data['channel-group'] = channelGroup;
	      }

	      this._networking.performAudit(authKey, data, callback);
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _networking = __webpack_require__(5);

	var _networking2 = _interopRequireDefault(_networking);

	var _logger = __webpack_require__(39);

	var _logger2 = _interopRequireDefault(_logger);

	var _responders = __webpack_require__(16);

	var _responders2 = _interopRequireDefault(_responders);

	var _utils = __webpack_require__(18);

	var _utils2 = _interopRequireDefault(_utils);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class(_ref) {
	    var networking = _ref.networking;

	    _classCallCheck(this, _class);

	    this._networking = networking;
	    this._r = new _responders2.default('#endpoints/history');
	    this._l = _logger2.default.getLogger('#endpoints/history');
	  }

	  // generic function to handle all channel group operations


	  _createClass(_class, [{
	    key: 'channelGroup',
	    value: function channelGroup(args, callback) {
	      var providedChannelGroupName = args.channelGroup;
	      var channels = args.channels || args.channel;
	      var effectiveChannelGroupName = '';

	      var data = {};
	      var mode = args.mode || 'add';

	      if (providedChannelGroupName) {
	        var splitChannelGroupName = providedChannelGroupName.split(':');

	        if (splitChannelGroupName.length > 1) {
	          effectiveChannelGroupName = splitChannelGroupName[1];
	        } else {
	          effectiveChannelGroupName = splitChannelGroupName[0];
	        }
	      }

	      if (channels) {
	        if (_utils2.default.isArray(channels)) {
	          channels = channels.join(',');
	        }
	        data[mode] = channels;
	      }

	      this._networking.performChannelGroupOperation(effectiveChannelGroupName, mode, data, callback);
	    }
	  }, {
	    key: 'listChannels',
	    value: function listChannels(args, callback) {
	      if (!args.channelGroup) {
	        return callback(this._r.validationError('Missing Channel Group'));
	      }

	      this.channelGroup(args, callback);
	    }
	  }, {
	    key: 'removeGroup',
	    value: function removeGroup(args, callback) {
	      var errorMessage = 'Use channel_group_remove_channel if you want to remove a channel from a group.';
	      if (!args.channelGroup) {
	        return callback(this._r.validationError('Missing Channel Group'));
	      }

	      if (args.channel) {
	        return callback(this._r.validationError(errorMessage));
	      }

	      args.mode = 'remove';
	      this.channelGroup(args, callback);
	    }
	  }, {
	    key: 'listGroups',
	    value: function listGroups(args, callback) {
	      this.channelGroup(args, callback);
	    }
	  }, {
	    key: 'addChannel',
	    value: function addChannel(args, callback) {
	      if (!args.channelGroup) {
	        return callback(this._r.validationError('Missing Channel Group'));
	      }

	      if (!args.channel && !args.channels) {
	        return callback(this._r.validationError('Missing Channel'));
	      }
	      this.channelGroup(args, callback);
	    }
	  }, {
	    key: 'removeChannel',
	    value: function removeChannel(args, callback) {
	      if (!args.channelGroup) {
	        return callback(this._r.validationError('Missing Channel Group'));
	      }
	      if (!args.channel && !args.channels) {
	        return callback(this._r.validationError('Missing Channel'));
	      }

	      args.mode = 'remove';
	      this.channelGroup(args, callback);
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _networking = __webpack_require__(5);

	var _networking2 = _interopRequireDefault(_networking);

	var _config = __webpack_require__(17);

	var _config2 = _interopRequireDefault(_config);

	var _state = __webpack_require__(20);

	var _state2 = _interopRequireDefault(_state);

	var _responders = __webpack_require__(16);

	var _responders2 = _interopRequireDefault(_responders);

	var _logger = __webpack_require__(39);

	var _logger2 = _interopRequireDefault(_logger);

	var _flow_interfaces = __webpack_require__(55);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class(_ref) {
	    var networking = _ref.networking;
	    var config = _ref.config;
	    var state = _ref.state;
	    var callbacks = _ref.callbacks;

	    _classCallCheck(this, _class);

	    this._networking = networking;
	    this._config = config;
	    this._state = state;
	    this._callbacks = callbacks;

	    this._r = new _responders2.default('#endpoints/subscribe');
	    this._l = _logger2.default.getLogger('#endpoints/subscribe');
	  }

	  _createClass(_class, [{
	    key: 'unsubscribe',
	    value: function unsubscribe(args) {
	      var _this = this;

	      var onStatus = this._callbacks.onStatus;
	      var _args$channels = args.channels;
	      var channels = _args$channels === undefined ? [] : _args$channels;
	      var _args$channelGroups = args.channelGroups;
	      var channelGroups = _args$channelGroups === undefined ? [] : _args$channelGroups;

	      var existingChannels = []; // matching channels to unsubscribe
	      var existingChannelGroups = []; // matching channel groups to unsubscribe
	      var data = {};

	      // Make sure we have a Channel
	      if (!onStatus) {
	        return this._l.error('Missing onStatus Callback');
	      }

	      if (channels.length === 0 && channelGroups.length === 0) {
	        return onStatus(this._r.validationError('Missing Channel or Channel Group'));
	      }

	      if (channels) {
	        channels.forEach(function (channel) {
	          if (_this._state.containsChannel(channel)) {
	            existingChannels.push(channel);
	          }
	        });
	      }

	      if (channelGroups) {
	        channelGroups.forEach(function (channelGroup) {
	          if (_this._state.containsChannelGroup(channelGroup)) {
	            existingChannelGroups.push(channelGroup);
	          }
	        });
	      }

	      // if NO channels && channel groups to unsubscribe, trigger a callback
	      if (existingChannels.length === 0 && existingChannelGroups.length === 0) {
	        return onStatus(this._r.validationError('already unsubscribed from all channel / channel groups'));
	      }

	      var stringifiedChannelParam = existingChannels.length > 0 ? existingChannels.join(',') : ',';

	      if (existingChannelGroups.length > 0) {
	        data['channel-group'] = existingChannelGroups.join(',');
	      }

	      this._networking.performLeave(stringifiedChannelParam, data, function (err, response) {
	        if (err) return onStatus(err, null);

	        _this._postUnsubscribeCleanup(existingChannels, existingChannelGroups);
	        _this._state.setSubscribeTimeToken(0);
	        _this._state.announceSubscriptionChange();
	        onStatus(null, { action: 'unsubscribe', status: 'finished', response: response });
	      });
	    }
	  }, {
	    key: '_postUnsubscribeCleanup',
	    value: function _postUnsubscribeCleanup(channels, channelGroups) {
	      var _this2 = this;

	      channels.forEach(function (channel) {
	        _this2._state.removeChannel(channel);
	        _this2._state.removeFromPresenceState(channel);
	      });

	      channelGroups.forEach(function (channelGroup) {
	        _this2._state.removeChannelGroup(channelGroup);
	        _this2._state.removeFromPresenceState(channelGroup);
	      });
	    }
	  }, {
	    key: 'subscribe',
	    value: function subscribe(args) {
	      var _this3 = this;

	      var _args$channels2 = args.channels;
	      var channels = _args$channels2 === undefined ? [] : _args$channels2;
	      var _args$channelGroups2 = args.channelGroups;
	      var channelGroups = _args$channelGroups2 === undefined ? [] : _args$channelGroups2;
	      var _args$enablePresence = args.enablePresence;
	      var enablePresence = _args$enablePresence === undefined ? false : _args$enablePresence;
	      var filterExpression = args.filterExpression;
	      var onStatus = this._callbacks.onStatus;


	      if (channels.length === 0 && channelGroups.length === 0) {
	        return onStatus(this._r.validationError('Missing Channel or Channel Group'));
	      }

	      channels.forEach(function (channel) {
	        _this3._state.addChannel(channel, { name: channel, enablePresence: enablePresence });
	      });

	      channelGroups.forEach(function (channelGroup) {
	        _this3._state.addChannelGroup(channelGroup, { name: channelGroup, enablePresence: enablePresence });
	      });

	      // always reset the expressions
	      this._state.filterExpression = '';

	      if (filterExpression) {
	        this._state.filterExpression = filterExpression;
	      }

	      this._state.announceSubscriptionChange();
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _publish_queue = __webpack_require__(36);

	var _publish_queue2 = _interopRequireDefault(_publish_queue);

	var _responders = __webpack_require__(16);

	var _responders2 = _interopRequireDefault(_responders);

	var _logger = __webpack_require__(39);

	var _logger2 = _interopRequireDefault(_logger);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	// psv2 supports filtering by metadata

	var _class = function () {
	  function _class(_ref) {
	    var publishQueue = _ref.publishQueue;

	    _classCallCheck(this, _class);

	    this._publishQueue = publishQueue;
	    this._r = new _responders2.default('#endpoints/publish');
	    this._l = _logger2.default.getLogger('#endpoints/publish');
	  }

	  _createClass(_class, [{
	    key: 'publish',
	    value: function publish(args, callback) {
	      var message = args.message;
	      var channel = args.channel;
	      var meta = args.meta;
	      var _args$sendByPost = args.sendByPost;
	      var sendByPost = _args$sendByPost === undefined ? false : _args$sendByPost;
	      var _args$storeInHistory = args.storeInHistory;
	      var storeInHistory = _args$storeInHistory === undefined ? true : _args$storeInHistory;


	      if (!message) {
	        return callback(this._r.validationError('Missing Message'));
	      }

	      if (!channel) {
	        return callback(this._r.validationError('Missing Channel'));
	      }

	      var params = {};
	      var publishItem = this._publishQueue.newQueueable();

	      if (!storeInHistory) {
	        params.store = '0';
	      }

	      if (meta && (typeof meta === 'undefined' ? 'undefined' : _typeof(meta)) === 'object') {
	        params.meta = JSON.stringify(meta);
	      }

	      publishItem.payload = message;
	      publishItem.channel = channel;
	      publishItem.params = params;
	      publishItem.httpMethod = sendByPost ? 'POST' : 'GET';
	      publishItem.callback = callback;

	      // Queue Message Send
	      this._publishQueue.queueItem(publishItem);
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;

/***/ }
/******/ ])
});
;