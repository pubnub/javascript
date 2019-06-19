/*! 4.24.2 / Consumer  */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["PubNub"] = factory();
	else
		root["PubNub"] = factory();
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
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _pubnubCommon = __webpack_require__(1);

	var _pubnubCommon2 = _interopRequireDefault(_pubnubCommon);

	var _networking = __webpack_require__(40);

	var _networking2 = _interopRequireDefault(_networking);

	var _web = __webpack_require__(41);

	var _web2 = _interopRequireDefault(_web);

	var _webNode = __webpack_require__(42);

	var _flow_interfaces = __webpack_require__(5);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	function sendBeacon(url) {
	  if (navigator && navigator.sendBeacon) {
	    navigator.sendBeacon(url);
	  } else {
	    return false;
	  }
	}

	var _class = function (_PubNubCore) {
	  _inherits(_class, _PubNubCore);

	  function _class(setup) {
	    _classCallCheck(this, _class);

	    var _setup$listenToBrowse = setup.listenToBrowserNetworkEvents,
	        listenToBrowserNetworkEvents = _setup$listenToBrowse === undefined ? true : _setup$listenToBrowse;


	    setup.db = _web2.default;
	    setup.sdkFamily = 'Web';
	    setup.networking = new _networking2.default({ del: _webNode.del, get: _webNode.get, post: _webNode.post, sendBeacon: sendBeacon });

	    var _this = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, setup));

	    if (listenToBrowserNetworkEvents) {
	      window.addEventListener('offline', function () {
	        _this.networkDownDetected();
	      });

	      window.addEventListener('online', function () {
	        _this.networkUpDetected();
	      });
	    }
	    return _this;
	  }

	  return _class;
	}(_pubnubCommon2.default);

	exports.default = _class;
	module.exports = exports['default'];

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _config = __webpack_require__(2);

	var _config2 = _interopRequireDefault(_config);

	var _index = __webpack_require__(6);

	var _index2 = _interopRequireDefault(_index);

	var _subscription_manager = __webpack_require__(8);

	var _subscription_manager2 = _interopRequireDefault(_subscription_manager);

	var _listener_manager = __webpack_require__(9);

	var _listener_manager2 = _interopRequireDefault(_listener_manager);

	var _endpoint = __webpack_require__(16);

	var _endpoint2 = _interopRequireDefault(_endpoint);

	var _add_channels = __webpack_require__(17);

	var addChannelsChannelGroupConfig = _interopRequireWildcard(_add_channels);

	var _remove_channels = __webpack_require__(18);

	var removeChannelsChannelGroupConfig = _interopRequireWildcard(_remove_channels);

	var _delete_group = __webpack_require__(19);

	var deleteChannelGroupConfig = _interopRequireWildcard(_delete_group);

	var _list_groups = __webpack_require__(20);

	var listChannelGroupsConfig = _interopRequireWildcard(_list_groups);

	var _list_channels = __webpack_require__(21);

	var listChannelsInChannelGroupConfig = _interopRequireWildcard(_list_channels);

	var _add_push_channels = __webpack_require__(22);

	var addPushChannelsConfig = _interopRequireWildcard(_add_push_channels);

	var _remove_push_channels = __webpack_require__(23);

	var removePushChannelsConfig = _interopRequireWildcard(_remove_push_channels);

	var _list_push_channels = __webpack_require__(24);

	var listPushChannelsConfig = _interopRequireWildcard(_list_push_channels);

	var _remove_device = __webpack_require__(25);

	var removeDevicePushConfig = _interopRequireWildcard(_remove_device);

	var _leave = __webpack_require__(26);

	var presenceLeaveEndpointConfig = _interopRequireWildcard(_leave);

	var _where_now = __webpack_require__(27);

	var presenceWhereNowEndpointConfig = _interopRequireWildcard(_where_now);

	var _heartbeat = __webpack_require__(28);

	var presenceHeartbeatEndpointConfig = _interopRequireWildcard(_heartbeat);

	var _get_state = __webpack_require__(29);

	var presenceGetStateConfig = _interopRequireWildcard(_get_state);

	var _set_state = __webpack_require__(30);

	var presenceSetStateConfig = _interopRequireWildcard(_set_state);

	var _here_now = __webpack_require__(31);

	var presenceHereNowConfig = _interopRequireWildcard(_here_now);

	var _audit = __webpack_require__(32);

	var auditEndpointConfig = _interopRequireWildcard(_audit);

	var _grant = __webpack_require__(33);

	var grantEndpointConfig = _interopRequireWildcard(_grant);

	var _publish = __webpack_require__(34);

	var publishEndpointConfig = _interopRequireWildcard(_publish);

	var _get_history = __webpack_require__(35);

	var historyEndpointConfig = _interopRequireWildcard(_get_history);

	var _delete_messages = __webpack_require__(36);

	var deleteMessagesEndpointConfig = _interopRequireWildcard(_delete_messages);

	var _message_counts = __webpack_require__(37);

	var messageCountsEndpointConfig = _interopRequireWildcard(_message_counts);

	var _fetch_messages = __webpack_require__(38);

	var fetchMessagesEndpointConfig = _interopRequireWildcard(_fetch_messages);

	var _time = __webpack_require__(12);

	var timeEndpointConfig = _interopRequireWildcard(_time);

	var _subscribe = __webpack_require__(39);

	var subscribeEndpointConfig = _interopRequireWildcard(_subscribe);

	var _operations = __webpack_require__(13);

	var _operations2 = _interopRequireDefault(_operations);

	var _categories = __webpack_require__(10);

	var _categories2 = _interopRequireDefault(_categories);

	var _flow_interfaces = __webpack_require__(5);

	var _uuid = __webpack_require__(3);

	var _uuid2 = _interopRequireDefault(_uuid);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class(setup) {
	    var _this = this;

	    _classCallCheck(this, _class);

	    var db = setup.db,
	        networking = setup.networking;


	    var config = this._config = new _config2.default({ setup: setup, db: db });
	    var crypto = new _index2.default({ config: config });

	    networking.init(config);

	    var modules = { config: config, networking: networking, crypto: crypto };

	    var timeEndpoint = _endpoint2.default.bind(this, modules, timeEndpointConfig);
	    var leaveEndpoint = _endpoint2.default.bind(this, modules, presenceLeaveEndpointConfig);
	    var heartbeatEndpoint = _endpoint2.default.bind(this, modules, presenceHeartbeatEndpointConfig);
	    var setStateEndpoint = _endpoint2.default.bind(this, modules, presenceSetStateConfig);
	    var subscribeEndpoint = _endpoint2.default.bind(this, modules, subscribeEndpointConfig);

	    var listenerManager = this._listenerManager = new _listener_manager2.default();

	    var subscriptionManager = new _subscription_manager2.default({
	      timeEndpoint: timeEndpoint,
	      leaveEndpoint: leaveEndpoint,
	      heartbeatEndpoint: heartbeatEndpoint,
	      setStateEndpoint: setStateEndpoint,
	      subscribeEndpoint: subscribeEndpoint,
	      crypto: modules.crypto,
	      config: modules.config,
	      listenerManager: listenerManager
	    });

	    this.addListener = listenerManager.addListener.bind(listenerManager);
	    this.removeListener = listenerManager.removeListener.bind(listenerManager);
	    this.removeAllListeners = listenerManager.removeAllListeners.bind(listenerManager);

	    this.channelGroups = {
	      listGroups: _endpoint2.default.bind(this, modules, listChannelGroupsConfig),
	      listChannels: _endpoint2.default.bind(this, modules, listChannelsInChannelGroupConfig),
	      addChannels: _endpoint2.default.bind(this, modules, addChannelsChannelGroupConfig),
	      removeChannels: _endpoint2.default.bind(this, modules, removeChannelsChannelGroupConfig),
	      deleteGroup: _endpoint2.default.bind(this, modules, deleteChannelGroupConfig)
	    };

	    this.push = {
	      addChannels: _endpoint2.default.bind(this, modules, addPushChannelsConfig),
	      removeChannels: _endpoint2.default.bind(this, modules, removePushChannelsConfig),
	      deleteDevice: _endpoint2.default.bind(this, modules, removeDevicePushConfig),
	      listChannels: _endpoint2.default.bind(this, modules, listPushChannelsConfig)
	    };

	    this.hereNow = _endpoint2.default.bind(this, modules, presenceHereNowConfig);
	    this.whereNow = _endpoint2.default.bind(this, modules, presenceWhereNowEndpointConfig);
	    this.getState = _endpoint2.default.bind(this, modules, presenceGetStateConfig);
	    this.setState = subscriptionManager.adaptStateChange.bind(subscriptionManager);

	    this.grant = _endpoint2.default.bind(this, modules, grantEndpointConfig);
	    this.audit = _endpoint2.default.bind(this, modules, auditEndpointConfig);

	    this.publish = _endpoint2.default.bind(this, modules, publishEndpointConfig);

	    this.fire = function (args, callback) {
	      args.replicate = false;
	      args.storeInHistory = false;
	      return _this.publish(args, callback);
	    };

	    this.history = _endpoint2.default.bind(this, modules, historyEndpointConfig);
	    this.deleteMessages = _endpoint2.default.bind(this, modules, deleteMessagesEndpointConfig);
	    this.messageCounts = _endpoint2.default.bind(this, modules, messageCountsEndpointConfig);
	    this.fetchMessages = _endpoint2.default.bind(this, modules, fetchMessagesEndpointConfig);

	    this.time = timeEndpoint;

	    this.subscribe = subscriptionManager.adaptSubscribeChange.bind(subscriptionManager);
	    this.presence = subscriptionManager.adaptPresenceChange.bind(subscriptionManager);
	    this.unsubscribe = subscriptionManager.adaptUnsubscribeChange.bind(subscriptionManager);
	    this.disconnect = subscriptionManager.disconnect.bind(subscriptionManager);
	    this.reconnect = subscriptionManager.reconnect.bind(subscriptionManager);

	    this.destroy = function (isOffline) {
	      subscriptionManager.unsubscribeAll(isOffline);
	      subscriptionManager.disconnect();
	    };

	    this.stop = this.destroy;

	    this.unsubscribeAll = subscriptionManager.unsubscribeAll.bind(subscriptionManager);

	    this.getSubscribedChannels = subscriptionManager.getSubscribedChannels.bind(subscriptionManager);
	    this.getSubscribedChannelGroups = subscriptionManager.getSubscribedChannelGroups.bind(subscriptionManager);

	    this.encrypt = crypto.encrypt.bind(crypto);
	    this.decrypt = crypto.decrypt.bind(crypto);

	    this.getAuthKey = modules.config.getAuthKey.bind(modules.config);
	    this.setAuthKey = modules.config.setAuthKey.bind(modules.config);
	    this.setCipherKey = modules.config.setCipherKey.bind(modules.config);
	    this.getUUID = modules.config.getUUID.bind(modules.config);
	    this.setUUID = modules.config.setUUID.bind(modules.config);
	    this.getFilterExpression = modules.config.getFilterExpression.bind(modules.config);
	    this.setFilterExpression = modules.config.setFilterExpression.bind(modules.config);

	    this.setHeartbeatInterval = modules.config.setHeartbeatInterval.bind(modules.config);

	    if (networking.hasModule('proxy')) {
	      this.setProxy = function (proxy) {
	        modules.config.setProxy(proxy);
	        _this.reconnect();
	      };
	    }
	  }

	  _createClass(_class, [{
	    key: 'getVersion',
	    value: function getVersion() {
	      return this._config.getVersion();
	    }
	  }, {
	    key: 'networkDownDetected',
	    value: function networkDownDetected() {
	      this._listenerManager.announceNetworkDown();

	      if (this._config.restore) {
	        this.disconnect();
	      } else {
	        this.destroy(true);
	      }
	    }
	  }, {
	    key: 'networkUpDetected',
	    value: function networkUpDetected() {
	      this._listenerManager.announceNetworkUp();
	      this.reconnect();
	    }
	  }], [{
	    key: 'generateUUID',
	    value: function generateUUID() {
	      return _uuid2.default.createUUID();
	    }
	  }]);

	  return _class;
	}();

	_class.OPERATIONS = _operations2.default;
	_class.CATEGORIES = _categories2.default;
	exports.default = _class;
	module.exports = exports['default'];

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _uuid = __webpack_require__(3);

	var _uuid2 = _interopRequireDefault(_uuid);

	var _flow_interfaces = __webpack_require__(5);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class(_ref) {
	    var setup = _ref.setup,
	        db = _ref.db;

	    _classCallCheck(this, _class);

	    this._db = db;

	    this.instanceId = 'pn-' + _uuid2.default.createUUID();
	    this.secretKey = setup.secretKey || setup.secret_key;
	    this.subscribeKey = setup.subscribeKey || setup.subscribe_key;
	    this.publishKey = setup.publishKey || setup.publish_key;
	    this.sdkName = setup.sdkName;
	    this.sdkFamily = setup.sdkFamily;
	    this.partnerId = setup.partnerId;
	    this.setAuthKey(setup.authKey);
	    this.setCipherKey(setup.cipherKey);

	    this.setFilterExpression(setup.filterExpression);

	    this.origin = setup.origin || 'ps.pndsn.com';
	    this.secure = setup.ssl || false;
	    this.restore = setup.restore || false;
	    this.proxy = setup.proxy;
	    this.keepAlive = setup.keepAlive;
	    this.keepAliveSettings = setup.keepAliveSettings;
	    this.autoNetworkDetection = setup.autoNetworkDetection || false;

	    this.dedupeOnSubscribe = setup.dedupeOnSubscribe || false;
	    this.maximumCacheSize = setup.maximumCacheSize || 100;

	    this.customEncrypt = setup.customEncrypt;
	    this.customDecrypt = setup.customDecrypt;

	    if (typeof location !== 'undefined' && location.protocol === 'https:') {
	      this.secure = true;
	    }

	    this.logVerbosity = setup.logVerbosity || false;
	    this.suppressLeaveEvents = setup.suppressLeaveEvents || false;

	    this.announceFailedHeartbeats = setup.announceFailedHeartbeats || true;
	    this.announceSuccessfulHeartbeats = setup.announceSuccessfulHeartbeats || false;

	    this.useInstanceId = setup.useInstanceId || false;
	    this.useRequestId = setup.useRequestId || false;

	    this.requestMessageCountThreshold = setup.requestMessageCountThreshold;

	    this.setTransactionTimeout(setup.transactionalRequestTimeout || 15 * 1000);

	    this.setSubscribeTimeout(setup.subscribeRequestTimeout || 310 * 1000);

	    this.setSendBeaconConfig(setup.useSendBeacon || true);

	    this.setPresenceTimeout(setup.presenceTimeout || 300);

	    if (setup.heartbeatInterval != null) {
	      this.setHeartbeatInterval(setup.heartbeatInterval);
	    }

	    this.setUUID(this._decideUUID(setup.uuid));
	  }

	  _createClass(_class, [{
	    key: 'getAuthKey',
	    value: function getAuthKey() {
	      return this.authKey;
	    }
	  }, {
	    key: 'setAuthKey',
	    value: function setAuthKey(val) {
	      this.authKey = val;
	      return this;
	    }
	  }, {
	    key: 'setCipherKey',
	    value: function setCipherKey(val) {
	      this.cipherKey = val;
	      return this;
	    }
	  }, {
	    key: 'getUUID',
	    value: function getUUID() {
	      return this.UUID;
	    }
	  }, {
	    key: 'setUUID',
	    value: function setUUID(val) {
	      if (this._db && this._db.set) this._db.set(this.subscribeKey + 'uuid', val);
	      this.UUID = val;
	      return this;
	    }
	  }, {
	    key: 'getFilterExpression',
	    value: function getFilterExpression() {
	      return this.filterExpression;
	    }
	  }, {
	    key: 'setFilterExpression',
	    value: function setFilterExpression(val) {
	      this.filterExpression = val;
	      return this;
	    }
	  }, {
	    key: 'getPresenceTimeout',
	    value: function getPresenceTimeout() {
	      return this._presenceTimeout;
	    }
	  }, {
	    key: 'setPresenceTimeout',
	    value: function setPresenceTimeout(val) {
	      this._presenceTimeout = val;
	      this.setHeartbeatInterval(this._presenceTimeout / 2 - 1);
	      return this;
	    }
	  }, {
	    key: 'setProxy',
	    value: function setProxy(proxy) {
	      this.proxy = proxy;
	    }
	  }, {
	    key: 'getHeartbeatInterval',
	    value: function getHeartbeatInterval() {
	      return this._heartbeatInterval;
	    }
	  }, {
	    key: 'setHeartbeatInterval',
	    value: function setHeartbeatInterval(val) {
	      this._heartbeatInterval = val;
	      return this;
	    }
	  }, {
	    key: 'getSubscribeTimeout',
	    value: function getSubscribeTimeout() {
	      return this._subscribeRequestTimeout;
	    }
	  }, {
	    key: 'setSubscribeTimeout',
	    value: function setSubscribeTimeout(val) {
	      this._subscribeRequestTimeout = val;
	      return this;
	    }
	  }, {
	    key: 'getTransactionTimeout',
	    value: function getTransactionTimeout() {
	      return this._transactionalRequestTimeout;
	    }
	  }, {
	    key: 'setTransactionTimeout',
	    value: function setTransactionTimeout(val) {
	      this._transactionalRequestTimeout = val;
	      return this;
	    }
	  }, {
	    key: 'isSendBeaconEnabled',
	    value: function isSendBeaconEnabled() {
	      return this._useSendBeacon;
	    }
	  }, {
	    key: 'setSendBeaconConfig',
	    value: function setSendBeaconConfig(val) {
	      this._useSendBeacon = val;
	      return this;
	    }
	  }, {
	    key: 'getVersion',
	    value: function getVersion() {
	      return '4.24.2';
	    }
	  }, {
	    key: '_decideUUID',
	    value: function _decideUUID(providedUUID) {
	      if (providedUUID) {
	        return providedUUID;
	      }

	      if (this._db && this._db.get && this._db.get(this.subscribeKey + 'uuid')) {
	        return this._db.get(this.subscribeKey + 'uuid');
	      }

	      return 'pn-' + _uuid2.default.createUUID();
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;
	module.exports = exports['default'];

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _lilUuid = __webpack_require__(4);

	var _lilUuid2 = _interopRequireDefault(_lilUuid);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = {
	  createUUID: function createUUID() {
	    if (_lilUuid2.default.uuid) {
	      return _lilUuid2.default.uuid();
	    } else {
	      return (0, _lilUuid2.default)();
	    }
	  }
	};
	module.exports = exports['default'];

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*! lil-uuid - v0.1 - MIT License - https://github.com/lil-js/uuid */
	(function (root, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))
	  } else if (typeof exports === 'object') {
	    factory(exports)
	    if (typeof module === 'object' && module !== null) {
	      module.exports = exports.uuid
	    }
	  } else {
	    factory((root.lil = root.lil || {}))
	  }
	}(this, function (exports) {
	  var VERSION = '0.1.0'
	  var uuidRegex = {
	    '3': /^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
	    '4': /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
	    '5': /^[0-9A-F]{8}-[0-9A-F]{4}-5[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
	    all: /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i
	  }

	  function uuid() {
	    var uuid = '', i, random
	    for (i = 0; i < 32; i++) {
	      random = Math.random() * 16 | 0;
	      if (i === 8 || i === 12 || i === 16 || i === 20) uuid += '-'
	      uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16)
	    }
	    return uuid
	  }

	  function isUUID(str, version) {
	    var pattern = uuidRegex[version || 'all']
	    return pattern && pattern.test(str) || false
	  }

	  uuid.isUUID = isUUID
	  uuid.VERSION = VERSION

	  exports.uuid = uuid
	  exports.isUUID = isUUID
	}));


/***/ }),
/* 5 */
/***/ (function(module, exports) {

	'use strict';

	module.exports = {};

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _config = __webpack_require__(2);

	var _config2 = _interopRequireDefault(_config);

	var _hmacSha = __webpack_require__(7);

	var _hmacSha2 = _interopRequireDefault(_hmacSha);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class(_ref) {
	    var config = _ref.config;

	    _classCallCheck(this, _class);

	    this._config = config;

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
	      var hash = _hmacSha2.default.HmacSHA256(data, this._config.secretKey);
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
	      var options = incomingOptions || {};
	      if (!options.hasOwnProperty('encryptKey')) options.encryptKey = this._defaultOptions.encryptKey;
	      if (!options.hasOwnProperty('keyEncoding')) options.keyEncoding = this._defaultOptions.keyEncoding;
	      if (!options.hasOwnProperty('keyLength')) options.keyLength = this._defaultOptions.keyLength;
	      if (!options.hasOwnProperty('mode')) options.mode = this._defaultOptions.mode;

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
	    value: function encrypt(data, customCipherKey, options) {
	      if (this._config.customEncrypt) {
	        return this._config.customEncrypt(data);
	      } else {
	        return this.pnEncrypt(data, customCipherKey, options);
	      }
	    }
	  }, {
	    key: 'decrypt',
	    value: function decrypt(data, customCipherKey, options) {
	      if (this._config.customDecrypt) {
	        return this._config.customDecrypt(data);
	      } else {
	        return this.pnDecrypt(data, customCipherKey, options);
	      }
	    }
	  }, {
	    key: 'pnEncrypt',
	    value: function pnEncrypt(data, customCipherKey, options) {
	      if (!customCipherKey && !this._config.cipherKey) return data;
	      options = this._parseOptions(options);
	      var iv = this._getIV(options);
	      var mode = this._getMode(options);
	      var cipherKey = this._getPaddedKey(customCipherKey || this._config.cipherKey, options);
	      var encryptedHexArray = _hmacSha2.default.AES.encrypt(data, cipherKey, { iv: iv, mode: mode }).ciphertext;
	      var base64Encrypted = encryptedHexArray.toString(_hmacSha2.default.enc.Base64);
	      return base64Encrypted || data;
	    }
	  }, {
	    key: 'pnDecrypt',
	    value: function pnDecrypt(data, customCipherKey, options) {
	      if (!customCipherKey && !this._config.cipherKey) return data;
	      options = this._parseOptions(options);
	      var iv = this._getIV(options);
	      var mode = this._getMode(options);
	      var cipherKey = this._getPaddedKey(customCipherKey || this._config.cipherKey, options);
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
	module.exports = exports['default'];

/***/ }),
/* 7 */
/***/ (function(module, exports) {

	"use strict";

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

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _cryptography = __webpack_require__(6);

	var _cryptography2 = _interopRequireDefault(_cryptography);

	var _config2 = __webpack_require__(2);

	var _config3 = _interopRequireDefault(_config2);

	var _listener_manager = __webpack_require__(9);

	var _listener_manager2 = _interopRequireDefault(_listener_manager);

	var _reconnection_manager = __webpack_require__(11);

	var _reconnection_manager2 = _interopRequireDefault(_reconnection_manager);

	var _deduping_manager = __webpack_require__(14);

	var _deduping_manager2 = _interopRequireDefault(_deduping_manager);

	var _utils = __webpack_require__(15);

	var _utils2 = _interopRequireDefault(_utils);

	var _flow_interfaces = __webpack_require__(5);

	var _categories = __webpack_require__(10);

	var _categories2 = _interopRequireDefault(_categories);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class(_ref) {
	    var subscribeEndpoint = _ref.subscribeEndpoint,
	        leaveEndpoint = _ref.leaveEndpoint,
	        heartbeatEndpoint = _ref.heartbeatEndpoint,
	        setStateEndpoint = _ref.setStateEndpoint,
	        timeEndpoint = _ref.timeEndpoint,
	        config = _ref.config,
	        crypto = _ref.crypto,
	        listenerManager = _ref.listenerManager;

	    _classCallCheck(this, _class);

	    this._listenerManager = listenerManager;
	    this._config = config;

	    this._leaveEndpoint = leaveEndpoint;
	    this._heartbeatEndpoint = heartbeatEndpoint;
	    this._setStateEndpoint = setStateEndpoint;
	    this._subscribeEndpoint = subscribeEndpoint;

	    this._crypto = crypto;

	    this._channels = {};
	    this._presenceChannels = {};

	    this._heartbeatChannels = {};
	    this._heartbeatChannelGroups = {};

	    this._channelGroups = {};
	    this._presenceChannelGroups = {};

	    this._pendingChannelSubscriptions = [];
	    this._pendingChannelGroupSubscriptions = [];

	    this._currentTimetoken = 0;
	    this._lastTimetoken = 0;
	    this._storedTimetoken = null;

	    this._subscriptionStatusAnnounced = false;

	    this._isOnline = true;

	    this._reconnectionManager = new _reconnection_manager2.default({ timeEndpoint: timeEndpoint });
	    this._dedupingManager = new _deduping_manager2.default({ config: config });
	  }

	  _createClass(_class, [{
	    key: 'adaptStateChange',
	    value: function adaptStateChange(args, callback) {
	      var _this = this;

	      var state = args.state,
	          _args$channels = args.channels,
	          channels = _args$channels === undefined ? [] : _args$channels,
	          _args$channelGroups = args.channelGroups,
	          channelGroups = _args$channelGroups === undefined ? [] : _args$channelGroups;


	      channels.forEach(function (channel) {
	        if (channel in _this._channels) _this._channels[channel].state = state;
	      });

	      channelGroups.forEach(function (channelGroup) {
	        if (channelGroup in _this._channelGroups) {
	          _this._channelGroups[channelGroup].state = state;
	        }
	      });

	      return this._setStateEndpoint({ state: state, channels: channels, channelGroups: channelGroups }, callback);
	    }
	  }, {
	    key: 'adaptPresenceChange',
	    value: function adaptPresenceChange(args) {
	      var _this2 = this;

	      var connected = args.connected,
	          _args$channels2 = args.channels,
	          channels = _args$channels2 === undefined ? [] : _args$channels2,
	          _args$channelGroups2 = args.channelGroups,
	          channelGroups = _args$channelGroups2 === undefined ? [] : _args$channelGroups2;


	      if (connected) {
	        channels.forEach(function (channel) {
	          _this2._heartbeatChannels[channel] = { state: {} };
	        });

	        channelGroups.forEach(function (channelGroup) {
	          _this2._heartbeatChannelGroups[channelGroup] = { state: {} };
	        });
	      } else {
	        channels.forEach(function (channel) {
	          if (channel in _this2._heartbeatChannels) {
	            delete _this2._heartbeatChannels[channel];
	          }
	        });

	        channelGroups.forEach(function (channelGroup) {
	          if (channelGroup in _this2._heartbeatChannelGroups) {
	            delete _this2._heartbeatChannelGroups[channelGroup];
	          }
	        });

	        if (this._config.suppressLeaveEvents === false) {
	          this._leaveEndpoint({ channels: channels, channelGroups: channelGroups }, function (status) {
	            _this2._listenerManager.announceStatus(status);
	          });
	        }
	      }

	      this.reconnect();
	    }
	  }, {
	    key: 'adaptSubscribeChange',
	    value: function adaptSubscribeChange(args) {
	      var _this3 = this;

	      var timetoken = args.timetoken,
	          _args$channels3 = args.channels,
	          channels = _args$channels3 === undefined ? [] : _args$channels3,
	          _args$channelGroups3 = args.channelGroups,
	          channelGroups = _args$channelGroups3 === undefined ? [] : _args$channelGroups3,
	          _args$withPresence = args.withPresence,
	          withPresence = _args$withPresence === undefined ? false : _args$withPresence,
	          _args$withHeartbeats = args.withHeartbeats,
	          withHeartbeats = _args$withHeartbeats === undefined ? false : _args$withHeartbeats;


	      if (!this._config.subscribeKey || this._config.subscribeKey === '') {
	        if (console && console.log) {
	          console.log('subscribe key missing; aborting subscribe');
	        }
	        return;
	      }

	      if (timetoken) {
	        this._lastTimetoken = this._currentTimetoken;
	        this._currentTimetoken = timetoken;
	      }

	      if (this._currentTimetoken !== '0' && this._currentTimetoken !== 0) {
	        this._storedTimetoken = this._currentTimetoken;
	        this._currentTimetoken = 0;
	      }

	      channels.forEach(function (channel) {
	        _this3._channels[channel] = { state: {} };
	        if (withPresence) _this3._presenceChannels[channel] = {};
	        if (withHeartbeats) _this3._heartbeatChannels[channel] = {};

	        _this3._pendingChannelSubscriptions.push(channel);
	      });

	      channelGroups.forEach(function (channelGroup) {
	        _this3._channelGroups[channelGroup] = { state: {} };
	        if (withPresence) _this3._presenceChannelGroups[channelGroup] = {};
	        if (withHeartbeats) _this3._heartbeatChannelGroups[channelGroup] = {};

	        _this3._pendingChannelGroupSubscriptions.push(channelGroup);
	      });

	      this._subscriptionStatusAnnounced = false;
	      this.reconnect();
	    }
	  }, {
	    key: 'adaptUnsubscribeChange',
	    value: function adaptUnsubscribeChange(args, isOffline) {
	      var _this4 = this;

	      var _args$channels4 = args.channels,
	          channels = _args$channels4 === undefined ? [] : _args$channels4,
	          _args$channelGroups4 = args.channelGroups,
	          channelGroups = _args$channelGroups4 === undefined ? [] : _args$channelGroups4;

	      var actualChannels = [];
	      var actualChannelGroups = [];


	      channels.forEach(function (channel) {
	        if (channel in _this4._channels) {
	          delete _this4._channels[channel];
	          actualChannels.push(channel);

	          if (channel in _this4._heartbeatChannels) {
	            delete _this4._heartbeatChannels[channel];
	          }
	        }
	        if (channel in _this4._presenceChannels) {
	          delete _this4._presenceChannels[channel];
	          actualChannels.push(channel);
	        }
	      });

	      channelGroups.forEach(function (channelGroup) {
	        if (channelGroup in _this4._channelGroups) {
	          delete _this4._channelGroups[channelGroup];
	          actualChannelGroups.push(channelGroup);

	          if (channelGroup in _this4._heartbeatChannelGroups) {
	            delete _this4._heartbeatChannelGroups[channelGroup];
	          }
	        }
	        if (channelGroup in _this4._presenceChannelGroups) {
	          delete _this4._channelGroups[channelGroup];
	          actualChannelGroups.push(channelGroup);
	        }
	      });

	      if (actualChannels.length === 0 && actualChannelGroups.length === 0) {
	        return;
	      }

	      if (this._config.suppressLeaveEvents === false && !isOffline) {
	        this._leaveEndpoint({ channels: actualChannels, channelGroups: actualChannelGroups }, function (status) {
	          status.affectedChannels = actualChannels;
	          status.affectedChannelGroups = actualChannelGroups;
	          status.currentTimetoken = _this4._currentTimetoken;
	          status.lastTimetoken = _this4._lastTimetoken;
	          _this4._listenerManager.announceStatus(status);
	        });
	      }

	      if (Object.keys(this._channels).length === 0 && Object.keys(this._presenceChannels).length === 0 && Object.keys(this._channelGroups).length === 0 && Object.keys(this._presenceChannelGroups).length === 0) {
	        this._lastTimetoken = 0;
	        this._currentTimetoken = 0;
	        this._storedTimetoken = null;
	        this._region = null;
	        this._reconnectionManager.stopPolling();
	      }

	      this.reconnect();
	    }
	  }, {
	    key: 'unsubscribeAll',
	    value: function unsubscribeAll(isOffline) {
	      this.adaptUnsubscribeChange({
	        channels: this.getSubscribedChannels(),
	        channelGroups: this.getSubscribedChannelGroups()
	      }, isOffline);
	    }
	  }, {
	    key: 'getHeartbeatChannels',
	    value: function getHeartbeatChannels() {
	      return Object.keys(this._heartbeatChannels);
	    }
	  }, {
	    key: 'getHeartbeatChannelGroups',
	    value: function getHeartbeatChannelGroups() {
	      return Object.keys(this._heartbeatChannelGroups);
	    }
	  }, {
	    key: 'getSubscribedChannels',
	    value: function getSubscribedChannels() {
	      return Object.keys(this._channels);
	    }
	  }, {
	    key: 'getSubscribedChannelGroups',
	    value: function getSubscribedChannelGroups() {
	      return Object.keys(this._channelGroups);
	    }
	  }, {
	    key: 'reconnect',
	    value: function reconnect() {
	      this._startSubscribeLoop();
	      this._registerHeartbeatTimer();
	    }
	  }, {
	    key: 'disconnect',
	    value: function disconnect() {
	      this._stopSubscribeLoop();
	      this._stopHeartbeatTimer();
	      this._reconnectionManager.stopPolling();
	    }
	  }, {
	    key: '_registerHeartbeatTimer',
	    value: function _registerHeartbeatTimer() {
	      this._stopHeartbeatTimer();

	      if (this._config.getHeartbeatInterval() === 0) {
	        return;
	      }

	      this._performHeartbeatLoop();
	      this._heartbeatTimer = setInterval(this._performHeartbeatLoop.bind(this), this._config.getHeartbeatInterval() * 1000);
	    }
	  }, {
	    key: '_stopHeartbeatTimer',
	    value: function _stopHeartbeatTimer() {
	      if (this._heartbeatTimer) {
	        clearInterval(this._heartbeatTimer);
	        this._heartbeatTimer = null;
	      }
	    }
	  }, {
	    key: '_performHeartbeatLoop',
	    value: function _performHeartbeatLoop() {
	      var _this5 = this;

	      var heartbeatChannels = this.getHeartbeatChannels();

	      var heartbeatChannelGroups = this.getHeartbeatChannelGroups();

	      var presenceState = {};

	      if (heartbeatChannels.length === 0 && heartbeatChannelGroups.length === 0) {
	        return;
	      }

	      this.getSubscribedChannels().forEach(function (channel) {
	        var channelState = _this5._channels[channel].state;
	        if (Object.keys(channelState).length) {
	          presenceState[channel] = channelState;
	        }
	      });

	      this.getSubscribedChannelGroups().forEach(function (channelGroup) {
	        var channelGroupState = _this5._channelGroups[channelGroup].state;
	        if (Object.keys(channelGroupState).length) {
	          presenceState[channelGroup] = channelGroupState;
	        }
	      });

	      var onHeartbeat = function onHeartbeat(status) {
	        if (status.error && _this5._config.announceFailedHeartbeats) {
	          _this5._listenerManager.announceStatus(status);
	        }

	        if (status.error && _this5._config.autoNetworkDetection && _this5._isOnline) {
	          _this5._isOnline = false;
	          _this5.disconnect();
	          _this5._listenerManager.announceNetworkDown();
	          _this5.reconnect();
	        }

	        if (!status.error && _this5._config.announceSuccessfulHeartbeats) {
	          _this5._listenerManager.announceStatus(status);
	        }
	      };

	      this._heartbeatEndpoint({
	        channels: heartbeatChannels,
	        channelGroups: heartbeatChannelGroups,
	        state: presenceState
	      }, onHeartbeat.bind(this));
	    }
	  }, {
	    key: '_startSubscribeLoop',
	    value: function _startSubscribeLoop() {
	      var _this6 = this;

	      this._stopSubscribeLoop();
	      var presenceState = {};
	      var channels = [];
	      var channelGroups = [];

	      Object.keys(this._channels).forEach(function (channel) {
	        var channelState = _this6._channels[channel].state;

	        if (Object.keys(channelState).length) {
	          presenceState[channel] = channelState;
	        }

	        channels.push(channel);
	      });
	      Object.keys(this._presenceChannels).forEach(function (channel) {
	        channels.push(channel + '-pnpres');
	      });

	      Object.keys(this._channelGroups).forEach(function (channelGroup) {
	        var channelGroupState = _this6._channelGroups[channelGroup].state;

	        if (Object.keys(channelGroupState).length) {
	          presenceState[channelGroup] = channelGroupState;
	        }

	        channelGroups.push(channelGroup);
	      });
	      Object.keys(this._presenceChannelGroups).forEach(function (channelGroup) {
	        channelGroups.push(channelGroup + '-pnpres');
	      });

	      if (channels.length === 0 && channelGroups.length === 0) {
	        return;
	      }

	      var subscribeArgs = {
	        channels: channels,
	        channelGroups: channelGroups,
	        state: presenceState,
	        timetoken: this._currentTimetoken,
	        filterExpression: this._config.filterExpression,
	        region: this._region
	      };

	      this._subscribeCall = this._subscribeEndpoint(subscribeArgs, this._processSubscribeResponse.bind(this));
	    }
	  }, {
	    key: '_processSubscribeResponse',
	    value: function _processSubscribeResponse(status, payload) {
	      var _this7 = this;

	      if (status.error) {
	        if (status.category === _categories2.default.PNTimeoutCategory) {
	          this._startSubscribeLoop();
	        } else if (status.category === _categories2.default.PNNetworkIssuesCategory) {
	          this.disconnect();

	          if (status.error && this._config.autoNetworkDetection && this._isOnline) {
	            this._isOnline = false;
	            this._listenerManager.announceNetworkDown();
	          }

	          this._reconnectionManager.onReconnection(function () {
	            if (_this7._config.autoNetworkDetection && !_this7._isOnline) {
	              _this7._isOnline = true;
	              _this7._listenerManager.announceNetworkUp();
	            }
	            _this7.reconnect();
	            _this7._subscriptionStatusAnnounced = true;
	            var reconnectedAnnounce = {
	              category: _categories2.default.PNReconnectedCategory,
	              operation: status.operation,
	              lastTimetoken: _this7._lastTimetoken,
	              currentTimetoken: _this7._currentTimetoken
	            };
	            _this7._listenerManager.announceStatus(reconnectedAnnounce);
	          });

	          this._reconnectionManager.startPolling();
	          this._listenerManager.announceStatus(status);
	        } else if (status.category === _categories2.default.PNBadRequestCategory) {
	          this._stopHeartbeatTimer();
	          this._listenerManager.announceStatus(status);
	        } else {
	          this._listenerManager.announceStatus(status);
	        }

	        return;
	      }

	      if (this._storedTimetoken) {
	        this._currentTimetoken = this._storedTimetoken;
	        this._storedTimetoken = null;
	      } else {
	        this._lastTimetoken = this._currentTimetoken;
	        this._currentTimetoken = payload.metadata.timetoken;
	      }

	      if (!this._subscriptionStatusAnnounced) {
	        var connectedAnnounce = {};
	        connectedAnnounce.category = _categories2.default.PNConnectedCategory;
	        connectedAnnounce.operation = status.operation;
	        connectedAnnounce.affectedChannels = this._pendingChannelSubscriptions;
	        connectedAnnounce.subscribedChannels = this.getSubscribedChannels();
	        connectedAnnounce.affectedChannelGroups = this._pendingChannelGroupSubscriptions;
	        connectedAnnounce.lastTimetoken = this._lastTimetoken;
	        connectedAnnounce.currentTimetoken = this._currentTimetoken;
	        this._subscriptionStatusAnnounced = true;
	        this._listenerManager.announceStatus(connectedAnnounce);

	        this._pendingChannelSubscriptions = [];
	        this._pendingChannelGroupSubscriptions = [];
	      }

	      var messages = payload.messages || [];
	      var _config = this._config,
	          requestMessageCountThreshold = _config.requestMessageCountThreshold,
	          dedupeOnSubscribe = _config.dedupeOnSubscribe;


	      if (requestMessageCountThreshold && messages.length >= requestMessageCountThreshold) {
	        var countAnnouncement = {};
	        countAnnouncement.category = _categories2.default.PNRequestMessageCountExceededCategory;
	        countAnnouncement.operation = status.operation;
	        this._listenerManager.announceStatus(countAnnouncement);
	      }

	      messages.forEach(function (message) {
	        var channel = message.channel;
	        var subscriptionMatch = message.subscriptionMatch;
	        var publishMetaData = message.publishMetaData;

	        if (channel === subscriptionMatch) {
	          subscriptionMatch = null;
	        }

	        if (dedupeOnSubscribe) {
	          if (_this7._dedupingManager.isDuplicate(message)) {
	            return;
	          } else {
	            _this7._dedupingManager.addEntry(message);
	          }
	        }

	        if (_utils2.default.endsWith(message.channel, '-pnpres')) {
	          var announce = {};
	          announce.channel = null;
	          announce.subscription = null;

	          announce.actualChannel = subscriptionMatch != null ? channel : null;
	          announce.subscribedChannel = subscriptionMatch != null ? subscriptionMatch : channel;


	          if (channel) {
	            announce.channel = channel.substring(0, channel.lastIndexOf('-pnpres'));
	          }

	          if (subscriptionMatch) {
	            announce.subscription = subscriptionMatch.substring(0, subscriptionMatch.lastIndexOf('-pnpres'));
	          }

	          announce.action = message.payload.action;
	          announce.state = message.payload.data;
	          announce.timetoken = publishMetaData.publishTimetoken;
	          announce.occupancy = message.payload.occupancy;
	          announce.uuid = message.payload.uuid;
	          announce.timestamp = message.payload.timestamp;

	          if (message.payload.join) {
	            announce.join = message.payload.join;
	          }

	          if (message.payload.leave) {
	            announce.leave = message.payload.leave;
	          }

	          if (message.payload.timeout) {
	            announce.timeout = message.payload.timeout;
	          }

	          _this7._listenerManager.announcePresence(announce);
	        } else {
	          var _announce = {};
	          _announce.channel = null;
	          _announce.subscription = null;

	          _announce.actualChannel = subscriptionMatch != null ? channel : null;
	          _announce.subscribedChannel = subscriptionMatch != null ? subscriptionMatch : channel;


	          _announce.channel = channel;
	          _announce.subscription = subscriptionMatch;
	          _announce.timetoken = publishMetaData.publishTimetoken;
	          _announce.publisher = message.issuingClientId;

	          if (message.userMetadata) {
	            _announce.userMetadata = message.userMetadata;
	          }

	          if (_this7._config.cipherKey) {
	            _announce.message = _this7._crypto.decrypt(message.payload);
	          } else {
	            _announce.message = message.payload;
	          }

	          _this7._listenerManager.announceMessage(_announce);
	        }
	      });

	      this._region = payload.metadata.region;
	      this._startSubscribeLoop();
	    }
	  }, {
	    key: '_stopSubscribeLoop',
	    value: function _stopSubscribeLoop() {
	      if (this._subscribeCall) {
	        if (typeof this._subscribeCall.abort === 'function') {
	          this._subscribeCall.abort();
	        }
	        this._subscribeCall = null;
	      }
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;
	module.exports = exports['default'];

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _flow_interfaces = __webpack_require__(5);

	var _categories = __webpack_require__(10);

	var _categories2 = _interopRequireDefault(_categories);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class() {
	    _classCallCheck(this, _class);

	    this._listeners = [];
	  }

	  _createClass(_class, [{
	    key: 'addListener',
	    value: function addListener(newListeners) {
	      this._listeners.push(newListeners);
	    }
	  }, {
	    key: 'removeListener',
	    value: function removeListener(deprecatedListener) {
	      var newListeners = [];

	      this._listeners.forEach(function (listener) {
	        if (listener !== deprecatedListener) newListeners.push(listener);
	      });

	      this._listeners = newListeners;
	    }
	  }, {
	    key: 'removeAllListeners',
	    value: function removeAllListeners() {
	      this._listeners = [];
	    }
	  }, {
	    key: 'announcePresence',
	    value: function announcePresence(announce) {
	      this._listeners.forEach(function (listener) {
	        if (listener.presence) listener.presence(announce);
	      });
	    }
	  }, {
	    key: 'announceStatus',
	    value: function announceStatus(announce) {
	      this._listeners.forEach(function (listener) {
	        if (listener.status) listener.status(announce);
	      });
	    }
	  }, {
	    key: 'announceMessage',
	    value: function announceMessage(announce) {
	      this._listeners.forEach(function (listener) {
	        if (listener.message) listener.message(announce);
	      });
	    }
	  }, {
	    key: 'announceNetworkUp',
	    value: function announceNetworkUp() {
	      var networkStatus = {};
	      networkStatus.category = _categories2.default.PNNetworkUpCategory;
	      this.announceStatus(networkStatus);
	    }
	  }, {
	    key: 'announceNetworkDown',
	    value: function announceNetworkDown() {
	      var networkStatus = {};
	      networkStatus.category = _categories2.default.PNNetworkDownCategory;
	      this.announceStatus(networkStatus);
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;
	module.exports = exports['default'];

/***/ }),
/* 10 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = {
	  PNNetworkUpCategory: 'PNNetworkUpCategory',

	  PNNetworkDownCategory: 'PNNetworkDownCategory',

	  PNNetworkIssuesCategory: 'PNNetworkIssuesCategory',

	  PNTimeoutCategory: 'PNTimeoutCategory',

	  PNBadRequestCategory: 'PNBadRequestCategory',

	  PNAccessDeniedCategory: 'PNAccessDeniedCategory',

	  PNUnknownCategory: 'PNUnknownCategory',

	  PNReconnectedCategory: 'PNReconnectedCategory',

	  PNConnectedCategory: 'PNConnectedCategory',

	  PNRequestMessageCountExceededCategory: 'PNRequestMessageCountExceededCategory'

	};
	module.exports = exports['default'];

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _time = __webpack_require__(12);

	var _time2 = _interopRequireDefault(_time);

	var _flow_interfaces = __webpack_require__(5);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class(_ref) {
	    var timeEndpoint = _ref.timeEndpoint;

	    _classCallCheck(this, _class);

	    this._timeEndpoint = timeEndpoint;
	  }

	  _createClass(_class, [{
	    key: 'onReconnection',
	    value: function onReconnection(reconnectionCallback) {
	      this._reconnectionCallback = reconnectionCallback;
	    }
	  }, {
	    key: 'startPolling',
	    value: function startPolling() {
	      this._timeTimer = setInterval(this._performTimeLoop.bind(this), 3000);
	    }
	  }, {
	    key: 'stopPolling',
	    value: function stopPolling() {
	      clearInterval(this._timeTimer);
	    }
	  }, {
	    key: '_performTimeLoop',
	    value: function _performTimeLoop() {
	      var _this = this;

	      this._timeEndpoint(function (status) {
	        if (!status.error) {
	          clearInterval(_this._timeTimer);
	          _this._reconnectionCallback();
	        }
	      });
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;
	module.exports = exports['default'];

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getOperation = getOperation;
	exports.getURL = getURL;
	exports.getRequestTimeout = getRequestTimeout;
	exports.prepareParams = prepareParams;
	exports.isAuthSupported = isAuthSupported;
	exports.handleResponse = handleResponse;
	exports.validateParams = validateParams;

	var _flow_interfaces = __webpack_require__(5);

	var _operations = __webpack_require__(13);

	var _operations2 = _interopRequireDefault(_operations);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function getOperation() {
	  return _operations2.default.PNTimeOperation;
	}

	function getURL() {
	  return '/time/0';
	}

	function getRequestTimeout(_ref) {
	  var config = _ref.config;

	  return config.getTransactionTimeout();
	}

	function prepareParams() {
	  return {};
	}

	function isAuthSupported() {
	  return false;
	}

	function handleResponse(modules, serverResponse) {
	  return {
	    timetoken: serverResponse[0]
	  };
	}

	function validateParams() {}

/***/ }),
/* 13 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = {
	  PNTimeOperation: 'PNTimeOperation',

	  PNHistoryOperation: 'PNHistoryOperation',
	  PNDeleteMessagesOperation: 'PNDeleteMessagesOperation',
	  PNFetchMessagesOperation: 'PNFetchMessagesOperation',
	  PNMessageCounts: 'PNMessageCountsOperation',

	  PNSubscribeOperation: 'PNSubscribeOperation',
	  PNUnsubscribeOperation: 'PNUnsubscribeOperation',
	  PNPublishOperation: 'PNPublishOperation',

	  PNPushNotificationEnabledChannelsOperation: 'PNPushNotificationEnabledChannelsOperation',
	  PNRemoveAllPushNotificationsOperation: 'PNRemoveAllPushNotificationsOperation',

	  PNWhereNowOperation: 'PNWhereNowOperation',
	  PNSetStateOperation: 'PNSetStateOperation',
	  PNHereNowOperation: 'PNHereNowOperation',
	  PNGetStateOperation: 'PNGetStateOperation',
	  PNHeartbeatOperation: 'PNHeartbeatOperation',

	  PNChannelGroupsOperation: 'PNChannelGroupsOperation',
	  PNRemoveGroupOperation: 'PNRemoveGroupOperation',
	  PNChannelsForGroupOperation: 'PNChannelsForGroupOperation',
	  PNAddChannelsToGroupOperation: 'PNAddChannelsToGroupOperation',
	  PNRemoveChannelsFromGroupOperation: 'PNRemoveChannelsFromGroupOperation',

	  PNAccessManagerGrant: 'PNAccessManagerGrant',
	  PNAccessManagerAudit: 'PNAccessManagerAudit'
	};
	module.exports = exports['default'];

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _config = __webpack_require__(2);

	var _config2 = _interopRequireDefault(_config);

	var _flow_interfaces = __webpack_require__(5);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var hashCode = function hashCode(payload) {
	  var hash = 0;
	  if (payload.length === 0) return hash;
	  for (var i = 0; i < payload.length; i += 1) {
	    var character = payload.charCodeAt(i);
	    hash = (hash << 5) - hash + character;
	    hash = hash & hash;
	  }
	  return hash;
	};

	var _class = function () {
	  function _class(_ref) {
	    var config = _ref.config;

	    _classCallCheck(this, _class);

	    this.hashHistory = [];
	    this._config = config;
	  }

	  _createClass(_class, [{
	    key: 'getKey',
	    value: function getKey(message) {
	      var hashedPayload = hashCode(JSON.stringify(message.payload)).toString();
	      var timetoken = message.publishMetaData.publishTimetoken;
	      return timetoken + '-' + hashedPayload;
	    }
	  }, {
	    key: 'isDuplicate',
	    value: function isDuplicate(message) {
	      return this.hashHistory.includes(this.getKey(message));
	    }
	  }, {
	    key: 'addEntry',
	    value: function addEntry(message) {
	      if (this.hashHistory.length >= this._config.maximumCacheSize) {
	        this.hashHistory.shift();
	      }

	      this.hashHistory.push(this.getKey(message));
	    }
	  }, {
	    key: 'clearHistory',
	    value: function clearHistory() {
	      this.hashHistory = [];
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;
	module.exports = exports['default'];

/***/ }),
/* 15 */
/***/ (function(module, exports) {

	'use strict';

	function objectToList(o) {
	  var l = [];
	  Object.keys(o).forEach(function (key) {
	    return l.push(key);
	  });
	  return l;
	}

	function encodeString(input) {
	  return encodeURIComponent(input).replace(/[!~*'()]/g, function (x) {
	    return '%' + x.charCodeAt(0).toString(16).toUpperCase();
	  });
	}

	function objectToListSorted(o) {
	  return objectToList(o).sort();
	}

	function signPamFromParams(params) {
	  var l = objectToListSorted(params);
	  return l.map(function (paramKey) {
	    return paramKey + '=' + encodeString(params[paramKey]);
	  }).join('&');
	}

	function endsWith(searchString, suffix) {
	  return searchString.indexOf(suffix, this.length - suffix.length) !== -1;
	}

	function createPromise() {
	  var successResolve = void 0;
	  var failureResolve = void 0;
	  var promise = new Promise(function (fulfill, reject) {
	    successResolve = fulfill;
	    failureResolve = reject;
	  });

	  return { promise: promise, reject: failureResolve, fulfill: successResolve };
	}

	module.exports = { signPamFromParams: signPamFromParams, endsWith: endsWith, createPromise: createPromise, encodeString: encodeString };

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	exports.default = function (modules, endpoint) {
	  var networking = modules.networking,
	      config = modules.config;

	  var callback = null;
	  var promiseComponent = null;
	  var incomingParams = {};

	  if (endpoint.getOperation() === _operations2.default.PNTimeOperation || endpoint.getOperation() === _operations2.default.PNChannelGroupsOperation) {
	    callback = arguments.length <= 2 ? undefined : arguments[2];
	  } else {
	    incomingParams = arguments.length <= 2 ? undefined : arguments[2];
	    callback = arguments.length <= 3 ? undefined : arguments[3];
	  }

	  if (typeof Promise !== 'undefined' && !callback) {
	    promiseComponent = _utils2.default.createPromise();
	  }

	  var validationResult = endpoint.validateParams(modules, incomingParams);

	  if (validationResult) {
	    if (callback) {
	      return callback(createValidationError(validationResult));
	    } else if (promiseComponent) {
	      promiseComponent.reject(new PubNubError('Validation failed, check status for details', createValidationError(validationResult)));
	      return promiseComponent.promise;
	    }
	    return;
	  }

	  var outgoingParams = endpoint.prepareParams(modules, incomingParams);
	  var url = decideURL(endpoint, modules, incomingParams);
	  var callInstance = void 0;
	  var networkingParams = { url: url,
	    operation: endpoint.getOperation(),
	    timeout: endpoint.getRequestTimeout(modules)
	  };

	  outgoingParams.uuid = config.UUID;
	  outgoingParams.pnsdk = generatePNSDK(config);

	  if (config.useInstanceId) {
	    outgoingParams.instanceid = config.instanceId;
	  }

	  if (config.useRequestId) {
	    outgoingParams.requestid = _uuid2.default.createUUID();
	  }

	  if (endpoint.isAuthSupported() && config.getAuthKey()) {
	    outgoingParams.auth = config.getAuthKey();
	  }

	  if (config.secretKey) {
	    signRequest(modules, url, outgoingParams);
	  }

	  var onResponse = function onResponse(status, payload) {
	    if (status.error) {
	      if (callback) {
	        callback(status);
	      } else if (promiseComponent) {
	        promiseComponent.reject(new PubNubError('PubNub call failed, check status for details', status));
	      }
	      return;
	    }

	    var parsedPayload = endpoint.handleResponse(modules, payload, incomingParams);

	    if (callback) {
	      callback(status, parsedPayload);
	    } else if (promiseComponent) {
	      promiseComponent.fulfill(parsedPayload);
	    }
	  };

	  if (endpoint.usePost && endpoint.usePost(modules, incomingParams)) {
	    var payload = endpoint.postPayload(modules, incomingParams);
	    callInstance = networking.POST(outgoingParams, payload, networkingParams, onResponse);
	  } else if (endpoint.useDelete && endpoint.useDelete()) {
	    callInstance = networking.DELETE(outgoingParams, networkingParams, onResponse);
	  } else {
	    callInstance = networking.GET(outgoingParams, networkingParams, onResponse);
	  }

	  if (endpoint.getOperation() === _operations2.default.PNSubscribeOperation) {
	    return callInstance;
	  }

	  if (promiseComponent) {
	    return promiseComponent.promise;
	  }
	};

	var _uuid = __webpack_require__(3);

	var _uuid2 = _interopRequireDefault(_uuid);

	var _flow_interfaces = __webpack_require__(5);

	var _utils = __webpack_require__(15);

	var _utils2 = _interopRequireDefault(_utils);

	var _config = __webpack_require__(2);

	var _config2 = _interopRequireDefault(_config);

	var _operations = __webpack_require__(13);

	var _operations2 = _interopRequireDefault(_operations);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var PubNubError = function (_Error) {
	  _inherits(PubNubError, _Error);

	  function PubNubError(message, status) {
	    _classCallCheck(this, PubNubError);

	    var _this = _possibleConstructorReturn(this, (PubNubError.__proto__ || Object.getPrototypeOf(PubNubError)).call(this, message));

	    _this.name = _this.constructor.name;
	    _this.status = status;
	    _this.message = message;
	    return _this;
	  }

	  return PubNubError;
	}(Error);

	function createError(errorPayload, type) {
	  errorPayload.type = type;
	  errorPayload.error = true;
	  return errorPayload;
	}

	function createValidationError(message) {
	  return createError({ message: message }, 'validationError');
	}

	function decideURL(endpoint, modules, incomingParams) {
	  if (endpoint.usePost && endpoint.usePost(modules, incomingParams)) {
	    return endpoint.postURL(modules, incomingParams);
	  } else {
	    return endpoint.getURL(modules, incomingParams);
	  }
	}

	function generatePNSDK(config) {
	  if (config.sdkName) {
	    return config.sdkName;
	  }

	  var base = 'PubNub-JS-' + config.sdkFamily;

	  if (config.partnerId) {
	    base += '-' + config.partnerId;
	  }

	  base += '/' + config.getVersion();

	  return base;
	}

	function signRequest(modules, url, outgoingParams) {
	  var config = modules.config,
	      crypto = modules.crypto;


	  outgoingParams.timestamp = Math.floor(new Date().getTime() / 1000);
	  var signInput = config.subscribeKey + '\n' + config.publishKey + '\n' + url + '\n';
	  signInput += _utils2.default.signPamFromParams(outgoingParams);

	  var signature = crypto.HMACSHA256(signInput);
	  signature = signature.replace(/\+/g, '-');
	  signature = signature.replace(/\//g, '_');

	  outgoingParams.signature = signature;
	}

	module.exports = exports['default'];

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getOperation = getOperation;
	exports.validateParams = validateParams;
	exports.getURL = getURL;
	exports.getRequestTimeout = getRequestTimeout;
	exports.isAuthSupported = isAuthSupported;
	exports.prepareParams = prepareParams;
	exports.handleResponse = handleResponse;

	var _flow_interfaces = __webpack_require__(5);

	var _operations = __webpack_require__(13);

	var _operations2 = _interopRequireDefault(_operations);

	var _utils = __webpack_require__(15);

	var _utils2 = _interopRequireDefault(_utils);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function getOperation() {
	  return _operations2.default.PNAddChannelsToGroupOperation;
	}

	function validateParams(modules, incomingParams) {
	  var channels = incomingParams.channels,
	      channelGroup = incomingParams.channelGroup;
	  var config = modules.config;


	  if (!channelGroup) return 'Missing Channel Group';
	  if (!channels || channels.length === 0) return 'Missing Channels';
	  if (!config.subscribeKey) return 'Missing Subscribe Key';
	}

	function getURL(modules, incomingParams) {
	  var channelGroup = incomingParams.channelGroup;
	  var config = modules.config;

	  return '/v1/channel-registration/sub-key/' + config.subscribeKey + '/channel-group/' + _utils2.default.encodeString(channelGroup);
	}

	function getRequestTimeout(_ref) {
	  var config = _ref.config;

	  return config.getTransactionTimeout();
	}

	function isAuthSupported() {
	  return true;
	}

	function prepareParams(modules, incomingParams) {
	  var _incomingParams$chann = incomingParams.channels,
	      channels = _incomingParams$chann === undefined ? [] : _incomingParams$chann;


	  return {
	    add: channels.join(',')
	  };
	}

	function handleResponse() {
	  return {};
	}

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getOperation = getOperation;
	exports.validateParams = validateParams;
	exports.getURL = getURL;
	exports.getRequestTimeout = getRequestTimeout;
	exports.isAuthSupported = isAuthSupported;
	exports.prepareParams = prepareParams;
	exports.handleResponse = handleResponse;

	var _flow_interfaces = __webpack_require__(5);

	var _operations = __webpack_require__(13);

	var _operations2 = _interopRequireDefault(_operations);

	var _utils = __webpack_require__(15);

	var _utils2 = _interopRequireDefault(_utils);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function getOperation() {
	  return _operations2.default.PNRemoveChannelsFromGroupOperation;
	}

	function validateParams(modules, incomingParams) {
	  var channels = incomingParams.channels,
	      channelGroup = incomingParams.channelGroup;
	  var config = modules.config;


	  if (!channelGroup) return 'Missing Channel Group';
	  if (!channels || channels.length === 0) return 'Missing Channels';
	  if (!config.subscribeKey) return 'Missing Subscribe Key';
	}

	function getURL(modules, incomingParams) {
	  var channelGroup = incomingParams.channelGroup;
	  var config = modules.config;

	  return '/v1/channel-registration/sub-key/' + config.subscribeKey + '/channel-group/' + _utils2.default.encodeString(channelGroup);
	}

	function getRequestTimeout(_ref) {
	  var config = _ref.config;

	  return config.getTransactionTimeout();
	}

	function isAuthSupported() {
	  return true;
	}

	function prepareParams(modules, incomingParams) {
	  var _incomingParams$chann = incomingParams.channels,
	      channels = _incomingParams$chann === undefined ? [] : _incomingParams$chann;


	  return {
	    remove: channels.join(',')
	  };
	}

	function handleResponse() {
	  return {};
	}

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getOperation = getOperation;
	exports.validateParams = validateParams;
	exports.getURL = getURL;
	exports.isAuthSupported = isAuthSupported;
	exports.getRequestTimeout = getRequestTimeout;
	exports.prepareParams = prepareParams;
	exports.handleResponse = handleResponse;

	var _flow_interfaces = __webpack_require__(5);

	var _operations = __webpack_require__(13);

	var _operations2 = _interopRequireDefault(_operations);

	var _utils = __webpack_require__(15);

	var _utils2 = _interopRequireDefault(_utils);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function getOperation() {
	  return _operations2.default.PNRemoveGroupOperation;
	}

	function validateParams(modules, incomingParams) {
	  var channelGroup = incomingParams.channelGroup;
	  var config = modules.config;


	  if (!channelGroup) return 'Missing Channel Group';
	  if (!config.subscribeKey) return 'Missing Subscribe Key';
	}

	function getURL(modules, incomingParams) {
	  var channelGroup = incomingParams.channelGroup;
	  var config = modules.config;

	  return '/v1/channel-registration/sub-key/' + config.subscribeKey + '/channel-group/' + _utils2.default.encodeString(channelGroup) + '/remove';
	}

	function isAuthSupported() {
	  return true;
	}

	function getRequestTimeout(_ref) {
	  var config = _ref.config;

	  return config.getTransactionTimeout();
	}

	function prepareParams() {
	  return {};
	}

	function handleResponse() {
	  return {};
	}

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getOperation = getOperation;
	exports.validateParams = validateParams;
	exports.getURL = getURL;
	exports.getRequestTimeout = getRequestTimeout;
	exports.isAuthSupported = isAuthSupported;
	exports.prepareParams = prepareParams;
	exports.handleResponse = handleResponse;

	var _flow_interfaces = __webpack_require__(5);

	var _operations = __webpack_require__(13);

	var _operations2 = _interopRequireDefault(_operations);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function getOperation() {
	  return _operations2.default.PNChannelGroupsOperation;
	}

	function validateParams(modules) {
	  var config = modules.config;


	  if (!config.subscribeKey) return 'Missing Subscribe Key';
	}

	function getURL(modules) {
	  var config = modules.config;

	  return '/v1/channel-registration/sub-key/' + config.subscribeKey + '/channel-group';
	}

	function getRequestTimeout(_ref) {
	  var config = _ref.config;

	  return config.getTransactionTimeout();
	}

	function isAuthSupported() {
	  return true;
	}

	function prepareParams() {
	  return {};
	}

	function handleResponse(modules, serverResponse) {
	  return {
	    groups: serverResponse.payload.groups
	  };
	}

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getOperation = getOperation;
	exports.validateParams = validateParams;
	exports.getURL = getURL;
	exports.getRequestTimeout = getRequestTimeout;
	exports.isAuthSupported = isAuthSupported;
	exports.prepareParams = prepareParams;
	exports.handleResponse = handleResponse;

	var _flow_interfaces = __webpack_require__(5);

	var _operations = __webpack_require__(13);

	var _operations2 = _interopRequireDefault(_operations);

	var _utils = __webpack_require__(15);

	var _utils2 = _interopRequireDefault(_utils);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function getOperation() {
	  return _operations2.default.PNChannelsForGroupOperation;
	}

	function validateParams(modules, incomingParams) {
	  var channelGroup = incomingParams.channelGroup;
	  var config = modules.config;


	  if (!channelGroup) return 'Missing Channel Group';
	  if (!config.subscribeKey) return 'Missing Subscribe Key';
	}

	function getURL(modules, incomingParams) {
	  var channelGroup = incomingParams.channelGroup;
	  var config = modules.config;

	  return '/v1/channel-registration/sub-key/' + config.subscribeKey + '/channel-group/' + _utils2.default.encodeString(channelGroup);
	}

	function getRequestTimeout(_ref) {
	  var config = _ref.config;

	  return config.getTransactionTimeout();
	}

	function isAuthSupported() {
	  return true;
	}

	function prepareParams() {
	  return {};
	}

	function handleResponse(modules, serverResponse) {
	  return {
	    channels: serverResponse.payload.channels
	  };
	}

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getOperation = getOperation;
	exports.validateParams = validateParams;
	exports.getURL = getURL;
	exports.getRequestTimeout = getRequestTimeout;
	exports.isAuthSupported = isAuthSupported;
	exports.prepareParams = prepareParams;
	exports.handleResponse = handleResponse;

	var _flow_interfaces = __webpack_require__(5);

	var _operations = __webpack_require__(13);

	var _operations2 = _interopRequireDefault(_operations);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function getOperation() {
	  return _operations2.default.PNPushNotificationEnabledChannelsOperation;
	}

	function validateParams(modules, incomingParams) {
	  var device = incomingParams.device,
	      pushGateway = incomingParams.pushGateway,
	      channels = incomingParams.channels;
	  var config = modules.config;


	  if (!device) return 'Missing Device ID (device)';
	  if (!pushGateway) return 'Missing GW Type (pushGateway: gcm or apns)';
	  if (!channels || channels.length === 0) return 'Missing Channels';
	  if (!config.subscribeKey) return 'Missing Subscribe Key';
	}

	function getURL(modules, incomingParams) {
	  var device = incomingParams.device;
	  var config = modules.config;

	  return '/v1/push/sub-key/' + config.subscribeKey + '/devices/' + device;
	}

	function getRequestTimeout(_ref) {
	  var config = _ref.config;

	  return config.getTransactionTimeout();
	}

	function isAuthSupported() {
	  return true;
	}

	function prepareParams(modules, incomingParams) {
	  var pushGateway = incomingParams.pushGateway,
	      _incomingParams$chann = incomingParams.channels,
	      channels = _incomingParams$chann === undefined ? [] : _incomingParams$chann;

	  return { type: pushGateway, add: channels.join(',') };
	}

	function handleResponse() {
	  return {};
	}

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getOperation = getOperation;
	exports.validateParams = validateParams;
	exports.getURL = getURL;
	exports.getRequestTimeout = getRequestTimeout;
	exports.isAuthSupported = isAuthSupported;
	exports.prepareParams = prepareParams;
	exports.handleResponse = handleResponse;

	var _flow_interfaces = __webpack_require__(5);

	var _operations = __webpack_require__(13);

	var _operations2 = _interopRequireDefault(_operations);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function getOperation() {
	  return _operations2.default.PNPushNotificationEnabledChannelsOperation;
	}

	function validateParams(modules, incomingParams) {
	  var device = incomingParams.device,
	      pushGateway = incomingParams.pushGateway,
	      channels = incomingParams.channels;
	  var config = modules.config;


	  if (!device) return 'Missing Device ID (device)';
	  if (!pushGateway) return 'Missing GW Type (pushGateway: gcm or apns)';
	  if (!channels || channels.length === 0) return 'Missing Channels';
	  if (!config.subscribeKey) return 'Missing Subscribe Key';
	}

	function getURL(modules, incomingParams) {
	  var device = incomingParams.device;
	  var config = modules.config;

	  return '/v1/push/sub-key/' + config.subscribeKey + '/devices/' + device;
	}

	function getRequestTimeout(_ref) {
	  var config = _ref.config;

	  return config.getTransactionTimeout();
	}

	function isAuthSupported() {
	  return true;
	}

	function prepareParams(modules, incomingParams) {
	  var pushGateway = incomingParams.pushGateway,
	      _incomingParams$chann = incomingParams.channels,
	      channels = _incomingParams$chann === undefined ? [] : _incomingParams$chann;

	  return { type: pushGateway, remove: channels.join(',') };
	}

	function handleResponse() {
	  return {};
	}

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getOperation = getOperation;
	exports.validateParams = validateParams;
	exports.getURL = getURL;
	exports.getRequestTimeout = getRequestTimeout;
	exports.isAuthSupported = isAuthSupported;
	exports.prepareParams = prepareParams;
	exports.handleResponse = handleResponse;

	var _flow_interfaces = __webpack_require__(5);

	var _operations = __webpack_require__(13);

	var _operations2 = _interopRequireDefault(_operations);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function getOperation() {
	  return _operations2.default.PNPushNotificationEnabledChannelsOperation;
	}

	function validateParams(modules, incomingParams) {
	  var device = incomingParams.device,
	      pushGateway = incomingParams.pushGateway;
	  var config = modules.config;


	  if (!device) return 'Missing Device ID (device)';
	  if (!pushGateway) return 'Missing GW Type (pushGateway: gcm or apns)';
	  if (!config.subscribeKey) return 'Missing Subscribe Key';
	}

	function getURL(modules, incomingParams) {
	  var device = incomingParams.device;
	  var config = modules.config;

	  return '/v1/push/sub-key/' + config.subscribeKey + '/devices/' + device;
	}

	function getRequestTimeout(_ref) {
	  var config = _ref.config;

	  return config.getTransactionTimeout();
	}

	function isAuthSupported() {
	  return true;
	}

	function prepareParams(modules, incomingParams) {
	  var pushGateway = incomingParams.pushGateway;

	  return { type: pushGateway };
	}

	function handleResponse(modules, serverResponse) {
	  return { channels: serverResponse };
	}

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getOperation = getOperation;
	exports.validateParams = validateParams;
	exports.getURL = getURL;
	exports.getRequestTimeout = getRequestTimeout;
	exports.isAuthSupported = isAuthSupported;
	exports.prepareParams = prepareParams;
	exports.handleResponse = handleResponse;

	var _flow_interfaces = __webpack_require__(5);

	var _operations = __webpack_require__(13);

	var _operations2 = _interopRequireDefault(_operations);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function getOperation() {
	  return _operations2.default.PNRemoveAllPushNotificationsOperation;
	}

	function validateParams(modules, incomingParams) {
	  var device = incomingParams.device,
	      pushGateway = incomingParams.pushGateway;
	  var config = modules.config;


	  if (!device) return 'Missing Device ID (device)';
	  if (!pushGateway) return 'Missing GW Type (pushGateway: gcm or apns)';
	  if (!config.subscribeKey) return 'Missing Subscribe Key';
	}

	function getURL(modules, incomingParams) {
	  var device = incomingParams.device;
	  var config = modules.config;

	  return '/v1/push/sub-key/' + config.subscribeKey + '/devices/' + device + '/remove';
	}

	function getRequestTimeout(_ref) {
	  var config = _ref.config;

	  return config.getTransactionTimeout();
	}

	function isAuthSupported() {
	  return true;
	}

	function prepareParams(modules, incomingParams) {
	  var pushGateway = incomingParams.pushGateway;

	  return { type: pushGateway };
	}

	function handleResponse() {
	  return {};
	}

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getOperation = getOperation;
	exports.validateParams = validateParams;
	exports.getURL = getURL;
	exports.getRequestTimeout = getRequestTimeout;
	exports.isAuthSupported = isAuthSupported;
	exports.prepareParams = prepareParams;
	exports.handleResponse = handleResponse;

	var _flow_interfaces = __webpack_require__(5);

	var _operations = __webpack_require__(13);

	var _operations2 = _interopRequireDefault(_operations);

	var _utils = __webpack_require__(15);

	var _utils2 = _interopRequireDefault(_utils);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function getOperation() {
	  return _operations2.default.PNUnsubscribeOperation;
	}

	function validateParams(modules) {
	  var config = modules.config;


	  if (!config.subscribeKey) return 'Missing Subscribe Key';
	}

	function getURL(modules, incomingParams) {
	  var config = modules.config;
	  var _incomingParams$chann = incomingParams.channels,
	      channels = _incomingParams$chann === undefined ? [] : _incomingParams$chann;

	  var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
	  return '/v2/presence/sub-key/' + config.subscribeKey + '/channel/' + _utils2.default.encodeString(stringifiedChannels) + '/leave';
	}

	function getRequestTimeout(_ref) {
	  var config = _ref.config;

	  return config.getTransactionTimeout();
	}

	function isAuthSupported() {
	  return true;
	}

	function prepareParams(modules, incomingParams) {
	  var _incomingParams$chann2 = incomingParams.channelGroups,
	      channelGroups = _incomingParams$chann2 === undefined ? [] : _incomingParams$chann2;

	  var params = {};

	  if (channelGroups.length > 0) {
	    params['channel-group'] = channelGroups.join(',');
	  }

	  return params;
	}

	function handleResponse() {
	  return {};
	}

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getOperation = getOperation;
	exports.validateParams = validateParams;
	exports.getURL = getURL;
	exports.getRequestTimeout = getRequestTimeout;
	exports.isAuthSupported = isAuthSupported;
	exports.prepareParams = prepareParams;
	exports.handleResponse = handleResponse;

	var _flow_interfaces = __webpack_require__(5);

	var _operations = __webpack_require__(13);

	var _operations2 = _interopRequireDefault(_operations);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function getOperation() {
	  return _operations2.default.PNWhereNowOperation;
	}

	function validateParams(modules) {
	  var config = modules.config;


	  if (!config.subscribeKey) return 'Missing Subscribe Key';
	}

	function getURL(modules, incomingParams) {
	  var config = modules.config;
	  var _incomingParams$uuid = incomingParams.uuid,
	      uuid = _incomingParams$uuid === undefined ? config.UUID : _incomingParams$uuid;

	  return '/v2/presence/sub-key/' + config.subscribeKey + '/uuid/' + uuid;
	}

	function getRequestTimeout(_ref) {
	  var config = _ref.config;

	  return config.getTransactionTimeout();
	}

	function isAuthSupported() {
	  return true;
	}

	function prepareParams() {
	  return {};
	}

	function handleResponse(modules, serverResponse) {
	  if (!serverResponse.payload) {
	    return { channels: [] };
	  }
	  return { channels: serverResponse.payload.channels };
	}

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getOperation = getOperation;
	exports.validateParams = validateParams;
	exports.getURL = getURL;
	exports.isAuthSupported = isAuthSupported;
	exports.getRequestTimeout = getRequestTimeout;
	exports.prepareParams = prepareParams;
	exports.handleResponse = handleResponse;

	var _flow_interfaces = __webpack_require__(5);

	var _operations = __webpack_require__(13);

	var _operations2 = _interopRequireDefault(_operations);

	var _utils = __webpack_require__(15);

	var _utils2 = _interopRequireDefault(_utils);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function getOperation() {
	  return _operations2.default.PNHeartbeatOperation;
	}

	function validateParams(modules) {
	  var config = modules.config;


	  if (!config.subscribeKey) return 'Missing Subscribe Key';
	}

	function getURL(modules, incomingParams) {
	  var config = modules.config;
	  var _incomingParams$chann = incomingParams.channels,
	      channels = _incomingParams$chann === undefined ? [] : _incomingParams$chann;

	  var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
	  return '/v2/presence/sub-key/' + config.subscribeKey + '/channel/' + _utils2.default.encodeString(stringifiedChannels) + '/heartbeat';
	}

	function isAuthSupported() {
	  return true;
	}

	function getRequestTimeout(_ref) {
	  var config = _ref.config;

	  return config.getTransactionTimeout();
	}

	function prepareParams(modules, incomingParams) {
	  var _incomingParams$chann2 = incomingParams.channelGroups,
	      channelGroups = _incomingParams$chann2 === undefined ? [] : _incomingParams$chann2,
	      _incomingParams$state = incomingParams.state,
	      state = _incomingParams$state === undefined ? {} : _incomingParams$state;
	  var config = modules.config;

	  var params = {};

	  if (channelGroups.length > 0) {
	    params['channel-group'] = channelGroups.join(',');
	  }

	  params.state = JSON.stringify(state);
	  params.heartbeat = config.getPresenceTimeout();
	  return params;
	}

	function handleResponse() {
	  return {};
	}

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getOperation = getOperation;
	exports.validateParams = validateParams;
	exports.getURL = getURL;
	exports.getRequestTimeout = getRequestTimeout;
	exports.isAuthSupported = isAuthSupported;
	exports.prepareParams = prepareParams;
	exports.handleResponse = handleResponse;

	var _flow_interfaces = __webpack_require__(5);

	var _operations = __webpack_require__(13);

	var _operations2 = _interopRequireDefault(_operations);

	var _utils = __webpack_require__(15);

	var _utils2 = _interopRequireDefault(_utils);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function getOperation() {
	  return _operations2.default.PNGetStateOperation;
	}

	function validateParams(modules) {
	  var config = modules.config;


	  if (!config.subscribeKey) return 'Missing Subscribe Key';
	}

	function getURL(modules, incomingParams) {
	  var config = modules.config;
	  var _incomingParams$uuid = incomingParams.uuid,
	      uuid = _incomingParams$uuid === undefined ? config.UUID : _incomingParams$uuid,
	      _incomingParams$chann = incomingParams.channels,
	      channels = _incomingParams$chann === undefined ? [] : _incomingParams$chann;

	  var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
	  return '/v2/presence/sub-key/' + config.subscribeKey + '/channel/' + _utils2.default.encodeString(stringifiedChannels) + '/uuid/' + uuid;
	}

	function getRequestTimeout(_ref) {
	  var config = _ref.config;

	  return config.getTransactionTimeout();
	}

	function isAuthSupported() {
	  return true;
	}

	function prepareParams(modules, incomingParams) {
	  var _incomingParams$chann2 = incomingParams.channelGroups,
	      channelGroups = _incomingParams$chann2 === undefined ? [] : _incomingParams$chann2;

	  var params = {};

	  if (channelGroups.length > 0) {
	    params['channel-group'] = channelGroups.join(',');
	  }

	  return params;
	}

	function handleResponse(modules, serverResponse, incomingParams) {
	  var _incomingParams$chann3 = incomingParams.channels,
	      channels = _incomingParams$chann3 === undefined ? [] : _incomingParams$chann3,
	      _incomingParams$chann4 = incomingParams.channelGroups,
	      channelGroups = _incomingParams$chann4 === undefined ? [] : _incomingParams$chann4;

	  var channelsResponse = {};

	  if (channels.length === 1 && channelGroups.length === 0) {
	    channelsResponse[channels[0]] = serverResponse.payload;
	  } else {
	    channelsResponse = serverResponse.payload;
	  }

	  return { channels: channelsResponse };
	}

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getOperation = getOperation;
	exports.validateParams = validateParams;
	exports.getURL = getURL;
	exports.getRequestTimeout = getRequestTimeout;
	exports.isAuthSupported = isAuthSupported;
	exports.prepareParams = prepareParams;
	exports.handleResponse = handleResponse;

	var _flow_interfaces = __webpack_require__(5);

	var _operations = __webpack_require__(13);

	var _operations2 = _interopRequireDefault(_operations);

	var _utils = __webpack_require__(15);

	var _utils2 = _interopRequireDefault(_utils);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function getOperation() {
	  return _operations2.default.PNSetStateOperation;
	}

	function validateParams(modules, incomingParams) {
	  var config = modules.config;
	  var state = incomingParams.state,
	      _incomingParams$chann = incomingParams.channels,
	      channels = _incomingParams$chann === undefined ? [] : _incomingParams$chann,
	      _incomingParams$chann2 = incomingParams.channelGroups,
	      channelGroups = _incomingParams$chann2 === undefined ? [] : _incomingParams$chann2;


	  if (!state) return 'Missing State';
	  if (!config.subscribeKey) return 'Missing Subscribe Key';
	  if (channels.length === 0 && channelGroups.length === 0) return 'Please provide a list of channels and/or channel-groups';
	}

	function getURL(modules, incomingParams) {
	  var config = modules.config;
	  var _incomingParams$chann3 = incomingParams.channels,
	      channels = _incomingParams$chann3 === undefined ? [] : _incomingParams$chann3;

	  var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
	  return '/v2/presence/sub-key/' + config.subscribeKey + '/channel/' + _utils2.default.encodeString(stringifiedChannels) + '/uuid/' + config.UUID + '/data';
	}

	function getRequestTimeout(_ref) {
	  var config = _ref.config;

	  return config.getTransactionTimeout();
	}

	function isAuthSupported() {
	  return true;
	}

	function prepareParams(modules, incomingParams) {
	  var state = incomingParams.state,
	      _incomingParams$chann4 = incomingParams.channelGroups,
	      channelGroups = _incomingParams$chann4 === undefined ? [] : _incomingParams$chann4;

	  var params = {};

	  params.state = JSON.stringify(state);

	  if (channelGroups.length > 0) {
	    params['channel-group'] = channelGroups.join(',');
	  }

	  return params;
	}

	function handleResponse(modules, serverResponse) {
	  return { state: serverResponse.payload };
	}

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getOperation = getOperation;
	exports.validateParams = validateParams;
	exports.getURL = getURL;
	exports.getRequestTimeout = getRequestTimeout;
	exports.isAuthSupported = isAuthSupported;
	exports.prepareParams = prepareParams;
	exports.handleResponse = handleResponse;

	var _flow_interfaces = __webpack_require__(5);

	var _operations = __webpack_require__(13);

	var _operations2 = _interopRequireDefault(_operations);

	var _utils = __webpack_require__(15);

	var _utils2 = _interopRequireDefault(_utils);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function getOperation() {
	  return _operations2.default.PNHereNowOperation;
	}

	function validateParams(modules) {
	  var config = modules.config;


	  if (!config.subscribeKey) return 'Missing Subscribe Key';
	}

	function getURL(modules, incomingParams) {
	  var config = modules.config;
	  var _incomingParams$chann = incomingParams.channels,
	      channels = _incomingParams$chann === undefined ? [] : _incomingParams$chann,
	      _incomingParams$chann2 = incomingParams.channelGroups,
	      channelGroups = _incomingParams$chann2 === undefined ? [] : _incomingParams$chann2;

	  var baseURL = '/v2/presence/sub-key/' + config.subscribeKey;

	  if (channels.length > 0 || channelGroups.length > 0) {
	    var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
	    baseURL += '/channel/' + _utils2.default.encodeString(stringifiedChannels);
	  }

	  return baseURL;
	}

	function getRequestTimeout(_ref) {
	  var config = _ref.config;

	  return config.getTransactionTimeout();
	}

	function isAuthSupported() {
	  return true;
	}

	function prepareParams(modules, incomingParams) {
	  var _incomingParams$chann3 = incomingParams.channelGroups,
	      channelGroups = _incomingParams$chann3 === undefined ? [] : _incomingParams$chann3,
	      _incomingParams$inclu = incomingParams.includeUUIDs,
	      includeUUIDs = _incomingParams$inclu === undefined ? true : _incomingParams$inclu,
	      _incomingParams$inclu2 = incomingParams.includeState,
	      includeState = _incomingParams$inclu2 === undefined ? false : _incomingParams$inclu2;

	  var params = {};

	  if (!includeUUIDs) params.disable_uuids = 1;
	  if (includeState) params.state = 1;

	  if (channelGroups.length > 0) {
	    params['channel-group'] = channelGroups.join(',');
	  }

	  return params;
	}

	function handleResponse(modules, serverResponse, incomingParams) {
	  var _incomingParams$chann4 = incomingParams.channels,
	      channels = _incomingParams$chann4 === undefined ? [] : _incomingParams$chann4,
	      _incomingParams$chann5 = incomingParams.channelGroups,
	      channelGroups = _incomingParams$chann5 === undefined ? [] : _incomingParams$chann5,
	      _incomingParams$inclu3 = incomingParams.includeUUIDs,
	      includeUUIDs = _incomingParams$inclu3 === undefined ? true : _incomingParams$inclu3,
	      _incomingParams$inclu4 = incomingParams.includeState,
	      includeState = _incomingParams$inclu4 === undefined ? false : _incomingParams$inclu4;


	  var prepareSingularChannel = function prepareSingularChannel() {
	    var response = {};
	    var occupantsList = [];
	    response.totalChannels = 1;
	    response.totalOccupancy = serverResponse.occupancy;
	    response.channels = {};
	    response.channels[channels[0]] = {
	      occupants: occupantsList,
	      name: channels[0],
	      occupancy: serverResponse.occupancy
	    };

	    if (includeUUIDs && serverResponse.uuids) {
	      serverResponse.uuids.forEach(function (uuidEntry) {
	        if (includeState) {
	          occupantsList.push({ state: uuidEntry.state, uuid: uuidEntry.uuid });
	        } else {
	          occupantsList.push({ state: null, uuid: uuidEntry });
	        }
	      });
	    }

	    return response;
	  };

	  var prepareMultipleChannel = function prepareMultipleChannel() {
	    var response = {};
	    response.totalChannels = serverResponse.payload.total_channels;
	    response.totalOccupancy = serverResponse.payload.total_occupancy;
	    response.channels = {};

	    Object.keys(serverResponse.payload.channels).forEach(function (channelName) {
	      var channelEntry = serverResponse.payload.channels[channelName];
	      var occupantsList = [];
	      response.channels[channelName] = {
	        occupants: occupantsList,
	        name: channelName,
	        occupancy: channelEntry.occupancy
	      };

	      if (includeUUIDs) {
	        channelEntry.uuids.forEach(function (uuidEntry) {
	          if (includeState) {
	            occupantsList.push({ state: uuidEntry.state, uuid: uuidEntry.uuid });
	          } else {
	            occupantsList.push({ state: null, uuid: uuidEntry });
	          }
	        });
	      }

	      return response;
	    });

	    return response;
	  };

	  var response = void 0;
	  if (channels.length > 1 || channelGroups.length > 0 || channelGroups.length === 0 && channels.length === 0) {
	    response = prepareMultipleChannel();
	  } else {
	    response = prepareSingularChannel();
	  }

	  return response;
	}

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getOperation = getOperation;
	exports.validateParams = validateParams;
	exports.getURL = getURL;
	exports.getRequestTimeout = getRequestTimeout;
	exports.isAuthSupported = isAuthSupported;
	exports.prepareParams = prepareParams;
	exports.handleResponse = handleResponse;

	var _flow_interfaces = __webpack_require__(5);

	var _operations = __webpack_require__(13);

	var _operations2 = _interopRequireDefault(_operations);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function getOperation() {
	  return _operations2.default.PNAccessManagerAudit;
	}

	function validateParams(modules) {
	  var config = modules.config;


	  if (!config.subscribeKey) return 'Missing Subscribe Key';
	}

	function getURL(modules) {
	  var config = modules.config;

	  return '/v2/auth/audit/sub-key/' + config.subscribeKey;
	}

	function getRequestTimeout(_ref) {
	  var config = _ref.config;

	  return config.getTransactionTimeout();
	}

	function isAuthSupported() {
	  return false;
	}

	function prepareParams(modules, incomingParams) {
	  var channel = incomingParams.channel,
	      channelGroup = incomingParams.channelGroup,
	      _incomingParams$authK = incomingParams.authKeys,
	      authKeys = _incomingParams$authK === undefined ? [] : _incomingParams$authK;

	  var params = {};

	  if (channel) {
	    params.channel = channel;
	  }

	  if (channelGroup) {
	    params['channel-group'] = channelGroup;
	  }

	  if (authKeys.length > 0) {
	    params.auth = authKeys.join(',');
	  }

	  return params;
	}

	function handleResponse(modules, serverResponse) {
	  return serverResponse.payload;
	}

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getOperation = getOperation;
	exports.validateParams = validateParams;
	exports.getURL = getURL;
	exports.getRequestTimeout = getRequestTimeout;
	exports.isAuthSupported = isAuthSupported;
	exports.prepareParams = prepareParams;
	exports.handleResponse = handleResponse;

	var _flow_interfaces = __webpack_require__(5);

	var _operations = __webpack_require__(13);

	var _operations2 = _interopRequireDefault(_operations);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function getOperation() {
	  return _operations2.default.PNAccessManagerGrant;
	}

	function validateParams(modules) {
	  var config = modules.config;


	  if (!config.subscribeKey) return 'Missing Subscribe Key';
	  if (!config.publishKey) return 'Missing Publish Key';
	  if (!config.secretKey) return 'Missing Secret Key';
	}

	function getURL(modules) {
	  var config = modules.config;

	  return '/v2/auth/grant/sub-key/' + config.subscribeKey;
	}

	function getRequestTimeout(_ref) {
	  var config = _ref.config;

	  return config.getTransactionTimeout();
	}

	function isAuthSupported() {
	  return false;
	}

	function prepareParams(modules, incomingParams) {
	  var _incomingParams$chann = incomingParams.channels,
	      channels = _incomingParams$chann === undefined ? [] : _incomingParams$chann,
	      _incomingParams$chann2 = incomingParams.channelGroups,
	      channelGroups = _incomingParams$chann2 === undefined ? [] : _incomingParams$chann2,
	      ttl = incomingParams.ttl,
	      _incomingParams$read = incomingParams.read,
	      read = _incomingParams$read === undefined ? false : _incomingParams$read,
	      _incomingParams$write = incomingParams.write,
	      write = _incomingParams$write === undefined ? false : _incomingParams$write,
	      _incomingParams$manag = incomingParams.manage,
	      manage = _incomingParams$manag === undefined ? false : _incomingParams$manag,
	      _incomingParams$authK = incomingParams.authKeys,
	      authKeys = _incomingParams$authK === undefined ? [] : _incomingParams$authK;

	  var params = {};

	  params.r = read ? '1' : '0';
	  params.w = write ? '1' : '0';
	  params.m = manage ? '1' : '0';

	  if (channels.length > 0) {
	    params.channel = channels.join(',');
	  }

	  if (channelGroups.length > 0) {
	    params['channel-group'] = channelGroups.join(',');
	  }

	  if (authKeys.length > 0) {
	    params.auth = authKeys.join(',');
	  }

	  if (ttl || ttl === 0) {
	    params.ttl = ttl;
	  }

	  return params;
	}

	function handleResponse() {
	  return {};
	}

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	exports.getOperation = getOperation;
	exports.validateParams = validateParams;
	exports.usePost = usePost;
	exports.getURL = getURL;
	exports.postURL = postURL;
	exports.getRequestTimeout = getRequestTimeout;
	exports.isAuthSupported = isAuthSupported;
	exports.postPayload = postPayload;
	exports.prepareParams = prepareParams;
	exports.handleResponse = handleResponse;

	var _flow_interfaces = __webpack_require__(5);

	var _operations = __webpack_require__(13);

	var _operations2 = _interopRequireDefault(_operations);

	var _utils = __webpack_require__(15);

	var _utils2 = _interopRequireDefault(_utils);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function prepareMessagePayload(modules, messagePayload) {
	  var crypto = modules.crypto,
	      config = modules.config;

	  var stringifiedPayload = JSON.stringify(messagePayload);

	  if (config.cipherKey) {
	    stringifiedPayload = crypto.encrypt(stringifiedPayload);
	    stringifiedPayload = JSON.stringify(stringifiedPayload);
	  }

	  return stringifiedPayload;
	}

	function getOperation() {
	  return _operations2.default.PNPublishOperation;
	}

	function validateParams(_ref, incomingParams) {
	  var config = _ref.config;
	  var message = incomingParams.message,
	      channel = incomingParams.channel;


	  if (!channel) return 'Missing Channel';
	  if (!message) return 'Missing Message';
	  if (!config.subscribeKey) return 'Missing Subscribe Key';
	}

	function usePost(modules, incomingParams) {
	  var _incomingParams$sendB = incomingParams.sendByPost,
	      sendByPost = _incomingParams$sendB === undefined ? false : _incomingParams$sendB;

	  return sendByPost;
	}

	function getURL(modules, incomingParams) {
	  var config = modules.config;
	  var channel = incomingParams.channel,
	      message = incomingParams.message;

	  var stringifiedPayload = prepareMessagePayload(modules, message);
	  return '/publish/' + config.publishKey + '/' + config.subscribeKey + '/0/' + _utils2.default.encodeString(channel) + '/0/' + _utils2.default.encodeString(stringifiedPayload);
	}

	function postURL(modules, incomingParams) {
	  var config = modules.config;
	  var channel = incomingParams.channel;

	  return '/publish/' + config.publishKey + '/' + config.subscribeKey + '/0/' + _utils2.default.encodeString(channel) + '/0';
	}

	function getRequestTimeout(_ref2) {
	  var config = _ref2.config;

	  return config.getTransactionTimeout();
	}

	function isAuthSupported() {
	  return true;
	}

	function postPayload(modules, incomingParams) {
	  var message = incomingParams.message;

	  return prepareMessagePayload(modules, message);
	}

	function prepareParams(modules, incomingParams) {
	  var meta = incomingParams.meta,
	      _incomingParams$repli = incomingParams.replicate,
	      replicate = _incomingParams$repli === undefined ? true : _incomingParams$repli,
	      storeInHistory = incomingParams.storeInHistory,
	      ttl = incomingParams.ttl;

	  var params = {};

	  if (storeInHistory != null) {
	    if (storeInHistory) {
	      params.store = '1';
	    } else {
	      params.store = '0';
	    }
	  }

	  if (ttl) {
	    params.ttl = ttl;
	  }

	  if (replicate === false) {
	    params.norep = 'true';
	  }

	  if (meta && (typeof meta === 'undefined' ? 'undefined' : _typeof(meta)) === 'object') {
	    params.meta = JSON.stringify(meta);
	  }

	  return params;
	}

	function handleResponse(modules, serverResponse) {
	  return { timetoken: serverResponse[2] };
	}

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getOperation = getOperation;
	exports.validateParams = validateParams;
	exports.getURL = getURL;
	exports.getRequestTimeout = getRequestTimeout;
	exports.isAuthSupported = isAuthSupported;
	exports.prepareParams = prepareParams;
	exports.handleResponse = handleResponse;

	var _flow_interfaces = __webpack_require__(5);

	var _operations = __webpack_require__(13);

	var _operations2 = _interopRequireDefault(_operations);

	var _utils = __webpack_require__(15);

	var _utils2 = _interopRequireDefault(_utils);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function __processMessage(modules, message) {
	  var config = modules.config,
	      crypto = modules.crypto;

	  if (!config.cipherKey) return message;

	  try {
	    return crypto.decrypt(message);
	  } catch (e) {
	    return message;
	  }
	}

	function getOperation() {
	  return _operations2.default.PNHistoryOperation;
	}

	function validateParams(modules, incomingParams) {
	  var channel = incomingParams.channel;
	  var config = modules.config;


	  if (!channel) return 'Missing channel';
	  if (!config.subscribeKey) return 'Missing Subscribe Key';
	}

	function getURL(modules, incomingParams) {
	  var channel = incomingParams.channel;
	  var config = modules.config;

	  return '/v2/history/sub-key/' + config.subscribeKey + '/channel/' + _utils2.default.encodeString(channel);
	}

	function getRequestTimeout(_ref) {
	  var config = _ref.config;

	  return config.getTransactionTimeout();
	}

	function isAuthSupported() {
	  return true;
	}

	function prepareParams(modules, incomingParams) {
	  var start = incomingParams.start,
	      end = incomingParams.end,
	      reverse = incomingParams.reverse,
	      _incomingParams$count = incomingParams.count,
	      count = _incomingParams$count === undefined ? 100 : _incomingParams$count,
	      _incomingParams$strin = incomingParams.stringifiedTimeToken,
	      stringifiedTimeToken = _incomingParams$strin === undefined ? false : _incomingParams$strin;

	  var outgoingParams = {
	    include_token: 'true'
	  };

	  outgoingParams.count = count;
	  if (start) outgoingParams.start = start;
	  if (end) outgoingParams.end = end;
	  if (stringifiedTimeToken) outgoingParams.string_message_token = 'true';
	  if (reverse != null) outgoingParams.reverse = reverse.toString();

	  return outgoingParams;
	}

	function handleResponse(modules, serverResponse) {
	  var response = {
	    messages: [],
	    startTimeToken: serverResponse[1],
	    endTimeToken: serverResponse[2]
	  };

	  serverResponse[0].forEach(function (serverHistoryItem) {
	    var item = {
	      timetoken: serverHistoryItem.timetoken,
	      entry: __processMessage(modules, serverHistoryItem.message)
	    };

	    response.messages.push(item);
	  });

	  return response;
	}

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getOperation = getOperation;
	exports.validateParams = validateParams;
	exports.useDelete = useDelete;
	exports.getURL = getURL;
	exports.getRequestTimeout = getRequestTimeout;
	exports.isAuthSupported = isAuthSupported;
	exports.prepareParams = prepareParams;
	exports.handleResponse = handleResponse;

	var _flow_interfaces = __webpack_require__(5);

	var _operations = __webpack_require__(13);

	var _operations2 = _interopRequireDefault(_operations);

	var _utils = __webpack_require__(15);

	var _utils2 = _interopRequireDefault(_utils);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function getOperation() {
	  return _operations2.default.PNDeleteMessagesOperation;
	}

	function validateParams(modules, incomingParams) {
	  var channel = incomingParams.channel;
	  var config = modules.config;


	  if (!channel) return 'Missing channel';
	  if (!config.subscribeKey) return 'Missing Subscribe Key';
	}

	function useDelete() {
	  return true;
	}

	function getURL(modules, incomingParams) {
	  var channel = incomingParams.channel;
	  var config = modules.config;


	  return '/v3/history/sub-key/' + config.subscribeKey + '/channel/' + _utils2.default.encodeString(channel);
	}

	function getRequestTimeout(_ref) {
	  var config = _ref.config;

	  return config.getTransactionTimeout();
	}

	function isAuthSupported() {
	  return true;
	}

	function prepareParams(modules, incomingParams) {
	  var start = incomingParams.start,
	      end = incomingParams.end;


	  var outgoingParams = {};

	  if (start) outgoingParams.start = start;
	  if (end) outgoingParams.end = end;

	  return outgoingParams;
	}

	function handleResponse(modules, serverResponse) {
	  return serverResponse.payload;
	}

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	exports.getOperation = getOperation;
	exports.validateParams = validateParams;
	exports.getURL = getURL;
	exports.getRequestTimeout = getRequestTimeout;
	exports.isAuthSupported = isAuthSupported;
	exports.prepareParams = prepareParams;
	exports.handleResponse = handleResponse;

	var _operations = __webpack_require__(13);

	var _operations2 = _interopRequireDefault(_operations);

	var _utils = __webpack_require__(15);

	var _utils2 = _interopRequireDefault(_utils);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function getOperation() {
	  return _operations2.default.PNMessageCounts;
	}

	function validateParams(modules, incomingParams) {
	  var channels = incomingParams.channels,
	      timetoken = incomingParams.timetoken,
	      channelTimetokens = incomingParams.channelTimetokens;
	  var config = modules.config;


	  if (!channels) return 'Missing channel';
	  if (timetoken && channelTimetokens) return 'timetoken and channelTimetokens are incompatible together';
	  if (timetoken && channelTimetokens && channelTimetokens.length > 1 && channels.length !== channelTimetokens.length) return 'Length of channelTimetokens and channels do not match';
	  if (!config.subscribeKey) return 'Missing Subscribe Key';
	}

	function getURL(modules, incomingParams) {
	  var channels = incomingParams.channels;
	  var config = modules.config;


	  var stringifiedChannels = channels.join(',');

	  return '/v3/history/sub-key/' + config.subscribeKey + '/message-counts/' + _utils2.default.encodeString(stringifiedChannels);
	}

	function getRequestTimeout(_ref) {
	  var config = _ref.config;

	  return config.getTransactionTimeout();
	}

	function isAuthSupported() {
	  return true;
	}

	function prepareParams(modules, incomingParams) {
	  var timetoken = incomingParams.timetoken,
	      channelTimetokens = incomingParams.channelTimetokens;

	  var outgoingParams = {};

	  if (channelTimetokens && channelTimetokens.length === 1) {
	    var _channelTimetokens = _slicedToArray(channelTimetokens, 1),
	        tt = _channelTimetokens[0];

	    outgoingParams.timetoken = tt;
	  } else if (channelTimetokens) {
	    outgoingParams.channelsTimetoken = channelTimetokens.join(',');
	  } else if (timetoken) {
	    outgoingParams.timetoken = timetoken;
	  }

	  return outgoingParams;
	}

	function handleResponse(modules, serverResponse) {
	  return { channels: serverResponse.channels };
	}

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getOperation = getOperation;
	exports.validateParams = validateParams;
	exports.getURL = getURL;
	exports.getRequestTimeout = getRequestTimeout;
	exports.isAuthSupported = isAuthSupported;
	exports.prepareParams = prepareParams;
	exports.handleResponse = handleResponse;

	var _flow_interfaces = __webpack_require__(5);

	var _operations = __webpack_require__(13);

	var _operations2 = _interopRequireDefault(_operations);

	var _utils = __webpack_require__(15);

	var _utils2 = _interopRequireDefault(_utils);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function __processMessage(modules, message) {
	  var config = modules.config,
	      crypto = modules.crypto;

	  if (!config.cipherKey) return message;

	  try {
	    return crypto.decrypt(message);
	  } catch (e) {
	    return message;
	  }
	}

	function getOperation() {
	  return _operations2.default.PNFetchMessagesOperation;
	}

	function validateParams(modules, incomingParams) {
	  var channels = incomingParams.channels;
	  var config = modules.config;


	  if (!channels || channels.length === 0) return 'Missing channels';
	  if (!config.subscribeKey) return 'Missing Subscribe Key';
	}

	function getURL(modules, incomingParams) {
	  var _incomingParams$chann = incomingParams.channels,
	      channels = _incomingParams$chann === undefined ? [] : _incomingParams$chann;
	  var config = modules.config;


	  var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
	  return '/v3/history/sub-key/' + config.subscribeKey + '/channel/' + _utils2.default.encodeString(stringifiedChannels);
	}

	function getRequestTimeout(_ref) {
	  var config = _ref.config;

	  return config.getTransactionTimeout();
	}

	function isAuthSupported() {
	  return true;
	}

	function prepareParams(modules, incomingParams) {
	  var start = incomingParams.start,
	      end = incomingParams.end,
	      count = incomingParams.count,
	      _incomingParams$strin = incomingParams.stringifiedTimeToken,
	      stringifiedTimeToken = _incomingParams$strin === undefined ? false : _incomingParams$strin;

	  var outgoingParams = {};

	  if (count) outgoingParams.max = count;
	  if (start) outgoingParams.start = start;
	  if (end) outgoingParams.end = end;
	  if (stringifiedTimeToken) outgoingParams.string_message_token = 'true';

	  return outgoingParams;
	}

	function handleResponse(modules, serverResponse) {
	  var response = {
	    channels: {}
	  };

	  Object.keys(serverResponse.channels || {}).forEach(function (channelName) {
	    response.channels[channelName] = [];

	    (serverResponse.channels[channelName] || []).forEach(function (messageEnvelope) {
	      var announce = {};
	      announce.channel = channelName;
	      announce.subscription = null;
	      announce.timetoken = messageEnvelope.timetoken;
	      announce.message = __processMessage(modules, messageEnvelope.message);
	      response.channels[channelName].push(announce);
	    });
	  });

	  return response;
	}

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getOperation = getOperation;
	exports.validateParams = validateParams;
	exports.getURL = getURL;
	exports.getRequestTimeout = getRequestTimeout;
	exports.isAuthSupported = isAuthSupported;
	exports.prepareParams = prepareParams;
	exports.handleResponse = handleResponse;

	var _flow_interfaces = __webpack_require__(5);

	var _operations = __webpack_require__(13);

	var _operations2 = _interopRequireDefault(_operations);

	var _utils = __webpack_require__(15);

	var _utils2 = _interopRequireDefault(_utils);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function getOperation() {
	  return _operations2.default.PNSubscribeOperation;
	}

	function validateParams(modules) {
	  var config = modules.config;


	  if (!config.subscribeKey) return 'Missing Subscribe Key';
	}

	function getURL(modules, incomingParams) {
	  var config = modules.config;
	  var _incomingParams$chann = incomingParams.channels,
	      channels = _incomingParams$chann === undefined ? [] : _incomingParams$chann;

	  var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
	  return '/v2/subscribe/' + config.subscribeKey + '/' + _utils2.default.encodeString(stringifiedChannels) + '/0';
	}

	function getRequestTimeout(_ref) {
	  var config = _ref.config;

	  return config.getSubscribeTimeout();
	}

	function isAuthSupported() {
	  return true;
	}

	function prepareParams(_ref2, incomingParams) {
	  var config = _ref2.config;
	  var state = incomingParams.state,
	      _incomingParams$chann2 = incomingParams.channelGroups,
	      channelGroups = _incomingParams$chann2 === undefined ? [] : _incomingParams$chann2,
	      timetoken = incomingParams.timetoken,
	      filterExpression = incomingParams.filterExpression,
	      region = incomingParams.region;

	  var params = {
	    heartbeat: config.getPresenceTimeout()
	  };

	  if (channelGroups.length > 0) {
	    params['channel-group'] = channelGroups.join(',');
	  }

	  if (filterExpression && filterExpression.length > 0) {
	    params['filter-expr'] = filterExpression;
	  }

	  if (Object.keys(state).length) {
	    params.state = JSON.stringify(state);
	  }

	  if (timetoken) {
	    params.tt = timetoken;
	  }

	  if (region) {
	    params.tr = region;
	  }

	  return params;
	}

	function handleResponse(modules, serverResponse) {
	  var messages = [];

	  serverResponse.m.forEach(function (rawMessage) {
	    var publishMetaData = {
	      publishTimetoken: rawMessage.p.t,
	      region: rawMessage.p.r
	    };
	    var parsedMessage = {
	      shard: parseInt(rawMessage.a, 10),
	      subscriptionMatch: rawMessage.b,
	      channel: rawMessage.c,
	      payload: rawMessage.d,
	      flags: rawMessage.f,
	      issuingClientId: rawMessage.i,
	      subscribeKey: rawMessage.k,
	      originationTimetoken: rawMessage.o,
	      userMetadata: rawMessage.u,
	      publishMetaData: publishMetaData
	    };
	    messages.push(parsedMessage);
	  });

	  var metadata = {
	    timetoken: serverResponse.t.t,
	    region: serverResponse.t.r
	  };

	  return { messages: messages, metadata: metadata };
	}

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _config = __webpack_require__(2);

	var _config2 = _interopRequireDefault(_config);

	var _categories = __webpack_require__(10);

	var _categories2 = _interopRequireDefault(_categories);

	var _flow_interfaces = __webpack_require__(5);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class(modules) {
	    var _this = this;

	    _classCallCheck(this, _class);

	    this._modules = {};

	    Object.keys(modules).forEach(function (key) {
	      _this._modules[key] = modules[key].bind(_this);
	    });
	  }

	  _createClass(_class, [{
	    key: 'init',
	    value: function init(config) {
	      this._config = config;

	      this._maxSubDomain = 20;
	      this._currentSubDomain = Math.floor(Math.random() * this._maxSubDomain);
	      this._providedFQDN = (this._config.secure ? 'https://' : 'http://') + this._config.origin;
	      this._coreParams = {};

	      this.shiftStandardOrigin();
	    }
	  }, {
	    key: 'nextOrigin',
	    value: function nextOrigin() {
	      if (this._providedFQDN.indexOf('ps.') === -1) {
	        return this._providedFQDN;
	      }

	      var newSubDomain = void 0;

	      this._currentSubDomain = this._currentSubDomain + 1;

	      if (this._currentSubDomain >= this._maxSubDomain) {
	        this._currentSubDomain = 1;
	      }

	      newSubDomain = this._currentSubDomain.toString();

	      return this._providedFQDN.replace('ps.', 'ps' + newSubDomain + '.');
	    }
	  }, {
	    key: 'hasModule',
	    value: function hasModule(name) {
	      return name in this._modules;
	    }
	  }, {
	    key: 'shiftStandardOrigin',
	    value: function shiftStandardOrigin() {
	      var failover = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

	      this._standardOrigin = this.nextOrigin(failover);

	      return this._standardOrigin;
	    }
	  }, {
	    key: 'getStandardOrigin',
	    value: function getStandardOrigin() {
	      return this._standardOrigin;
	    }
	  }, {
	    key: 'POST',
	    value: function POST(params, body, endpoint, callback) {
	      return this._modules.post(params, body, endpoint, callback);
	    }
	  }, {
	    key: 'GET',
	    value: function GET(params, endpoint, callback) {
	      return this._modules.get(params, endpoint, callback);
	    }
	  }, {
	    key: 'DELETE',
	    value: function DELETE(params, endpoint, callback) {
	      return this._modules.del(params, endpoint, callback);
	    }
	  }, {
	    key: '_detectErrorCategory',
	    value: function _detectErrorCategory(err) {
	      if (err.code === 'ENOTFOUND') {
	        return _categories2.default.PNNetworkIssuesCategory;
	      }
	      if (err.code === 'ECONNREFUSED') {
	        return _categories2.default.PNNetworkIssuesCategory;
	      }
	      if (err.code === 'ECONNRESET') {
	        return _categories2.default.PNNetworkIssuesCategory;
	      }
	      if (err.code === 'EAI_AGAIN') {
	        return _categories2.default.PNNetworkIssuesCategory;
	      }

	      if (err.status === 0 || err.hasOwnProperty('status') && typeof err.status === 'undefined') {
	        return _categories2.default.PNNetworkIssuesCategory;
	      }
	      if (err.timeout) return _categories2.default.PNTimeoutCategory;

	      if (err.code === 'ETIMEDOUT') {
	        return _categories2.default.PNNetworkIssuesCategory;
	      }

	      if (err.response) {
	        if (err.response.badRequest) {
	          return _categories2.default.PNBadRequestCategory;
	        }
	        if (err.response.forbidden) {
	          return _categories2.default.PNAccessDeniedCategory;
	        }
	      }

	      return _categories2.default.PNUnknownCategory;
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;
	module.exports = exports['default'];

/***/ }),
/* 41 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = {
	  get: function get(key) {
	    try {
	      return localStorage.getItem(key);
	    } catch (e) {
	      return null;
	    }
	  },
	  set: function set(key, data) {
	    try {
	      return localStorage.setItem(key, data);
	    } catch (e) {
	      return null;
	    }
	  }
	};
	module.exports = exports["default"];

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.get = get;
	exports.post = post;
	exports.del = del;

	var _superagent = __webpack_require__(43);

	var _superagent2 = _interopRequireDefault(_superagent);

	var _flow_interfaces = __webpack_require__(5);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function log(req) {
	  var _pickLogger = function _pickLogger() {
	    if (console && console.log) return console;
	    if (window && window.console && window.console.log) return window.console;
	    return console;
	  };

	  var start = new Date().getTime();
	  var timestamp = new Date().toISOString();
	  var logger = _pickLogger();
	  logger.log('<<<<<');
	  logger.log('[' + timestamp + ']', '\n', req.url, '\n', req.qs);
	  logger.log('-----');

	  req.on('response', function (res) {
	    var now = new Date().getTime();
	    var elapsed = now - start;
	    var timestampDone = new Date().toISOString();

	    logger.log('>>>>>>');
	    logger.log('[' + timestampDone + ' / ' + elapsed + ']', '\n', req.url, '\n', req.qs, '\n', res.text);
	    logger.log('-----');
	  });
	}

	function xdr(superagentConstruct, endpoint, callback) {
	  var _this = this;

	  if (this._config.logVerbosity) {
	    superagentConstruct = superagentConstruct.use(log);
	  }

	  if (this._config.proxy && this._modules.proxy) {
	    superagentConstruct = this._modules.proxy.call(this, superagentConstruct);
	  }

	  if (this._config.keepAlive && this._modules.keepAlive) {
	    superagentConstruct = this._modules.keepAlive(superagentConstruct);
	  }

	  return superagentConstruct.timeout(endpoint.timeout).end(function (err, resp) {
	    var parsedResponse = void 0;
	    var status = {};
	    status.error = err !== null;
	    status.operation = endpoint.operation;

	    if (resp && resp.status) {
	      status.statusCode = resp.status;
	    }

	    if (err) {
	      if (err.response && err.response.text && !_this._config.logVerbosity) {
	        try {
	          status.errorData = JSON.parse(err.response.text);
	        } catch (e) {
	          status.errorData = err;
	        }
	      } else {
	        status.errorData = err;
	      }
	      status.category = _this._detectErrorCategory(err);
	      return callback(status, null);
	    }

	    try {
	      parsedResponse = JSON.parse(resp.text);
	    } catch (e) {
	      status.errorData = resp;
	      status.error = true;
	      return callback(status, null);
	    }

	    if (parsedResponse.error && parsedResponse.error === 1 && parsedResponse.status && parsedResponse.message && parsedResponse.service) {
	      status.errorData = parsedResponse;
	      status.statusCode = parsedResponse.status;
	      status.error = true;
	      status.category = _this._detectErrorCategory(status);
	      return callback(status, null);
	    }

	    return callback(status, parsedResponse);
	  });
	}

	function get(params, endpoint, callback) {
	  var superagentConstruct = _superagent2.default.get(this.getStandardOrigin() + endpoint.url).query(params);
	  return xdr.call(this, superagentConstruct, endpoint, callback);
	}

	function post(params, body, endpoint, callback) {
	  var superagentConstruct = _superagent2.default.post(this.getStandardOrigin() + endpoint.url).query(params).send(body);
	  return xdr.call(this, superagentConstruct, endpoint, callback);
	}

	function del(params, endpoint, callback) {
	  var superagentConstruct = _superagent2.default.delete(this.getStandardOrigin() + endpoint.url).query(params);
	  return xdr.call(this, superagentConstruct, endpoint, callback);
	}

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Root reference for iframes.
	 */

	var root;
	if (typeof window !== 'undefined') { // Browser window
	  root = window;
	} else if (typeof self !== 'undefined') { // Web Worker
	  root = self;
	} else { // Other environments
	  console.warn("Using browser-only version of superagent in non-browser environment");
	  root = this;
	}

	var Emitter = __webpack_require__(44);
	var RequestBase = __webpack_require__(45);
	var isObject = __webpack_require__(46);
	var ResponseBase = __webpack_require__(47);
	var Agent = __webpack_require__(49);

	/**
	 * Noop.
	 */

	function noop(){};

	/**
	 * Expose `request`.
	 */

	var request = exports = module.exports = function(method, url) {
	  // callback
	  if ('function' == typeof url) {
	    return new exports.Request('GET', method).end(url);
	  }

	  // url first
	  if (1 == arguments.length) {
	    return new exports.Request('GET', method);
	  }

	  return new exports.Request(method, url);
	}

	exports.Request = Request;

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
	  throw Error("Browser-only version of superagent could not find XHR");
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
	    pushEncodedKeyValuePair(pairs, key, obj[key]);
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
	  if (val != null) {
	    if (Array.isArray(val)) {
	      val.forEach(function(v) {
	        pushEncodedKeyValuePair(pairs, key, v);
	      });
	    } else if (isObject(val)) {
	      for(var subkey in val) {
	        pushEncodedKeyValuePair(pairs, key + '[' + subkey + ']', val[subkey]);
	      }
	    } else {
	      pairs.push(encodeURIComponent(key)
	        + '=' + encodeURIComponent(val));
	    }
	  } else if (val === null) {
	    pairs.push(encodeURIComponent(key));
	  }
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
	  var pair;
	  var pos;

	  for (var i = 0, len = pairs.length; i < len; ++i) {
	    pair = pairs[i];
	    pos = pair.indexOf('=');
	    if (pos == -1) {
	      obj[decodeURIComponent(pair)] = '';
	    } else {
	      obj[decodeURIComponent(pair.slice(0, pos))] =
	        decodeURIComponent(pair.slice(pos + 1));
	    }
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
	  xml: 'text/xml',
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

	  for (var i = 0, len = lines.length; i < len; ++i) {
	    line = lines[i];
	    index = line.indexOf(':');
	    if (index === -1) { // could be empty line, just skip it
	      continue;
	    }
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
	  // should match /json or +json
	  // but not /json-seq
	  return /[\/+]json($|[^-\w])/.test(mime);
	}

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

	function Response(req) {
	  this.req = req;
	  this.xhr = this.req.xhr;
	  // responseText is accessible only if responseType is '' or 'text' and on older browsers
	  this.text = ((this.req.method !='HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined')
	     ? this.xhr.responseText
	     : null;
	  this.statusText = this.req.xhr.statusText;
	  var status = this.xhr.status;
	  // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
	  if (status === 1223) {
	    status = 204;
	  }
	  this._setStatusProperties(status);
	  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
	  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
	  // getResponseHeader still works. so we get content-type even if getting
	  // other headers fails.
	  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
	  this._setHeaderProperties(this.header);

	  if (null === this.text && req._responseType) {
	    this.body = this.xhr.response;
	  } else {
	    this.body = this.req.method != 'HEAD'
	      ? this._parseBody(this.text ? this.text : this.xhr.response)
	      : null;
	  }
	}

	ResponseBase(Response.prototype);

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

	Response.prototype._parseBody = function(str) {
	  var parse = request.parse[this.type];
	  if (this.req._parser) {
	    return this.req._parser(this, str);
	  }
	  if (!parse && isJSON(this.type)) {
	    parse = request.parse['application/json'];
	  }
	  return parse && str && (str.length || str instanceof Object)
	    ? parse(str)
	    : null;
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
	      if (self.xhr) {
	        // ie9 doesn't have 'response' property
	        err.rawResponse = typeof self.xhr.responseType == 'undefined' ? self.xhr.responseText : self.xhr.response;
	        // issue #876: return the http status code if the response parsing fails
	        err.status = self.xhr.status ? self.xhr.status : null;
	        err.statusCode = err.status; // backwards-compat only
	      } else {
	        err.rawResponse = null;
	        err.status = null;
	      }

	      return self.callback(err);
	    }

	    self.emit('response', res);

	    var new_err;
	    try {
	      if (!self._isResponseOK(res)) {
	        new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
	      }
	    } catch(custom_err) {
	      new_err = custom_err; // ok() callback can throw
	    }

	    // #1000 don't catch errors from the callback to avoid double calling it
	    if (new_err) {
	      new_err.original = err;
	      new_err.response = res;
	      new_err.status = res.status;
	      self.callback(new_err, res);
	    } else {
	      self.callback(null, res);
	    }
	  });
	}

	/**
	 * Mixin `Emitter` and `RequestBase`.
	 */

	Emitter(Request.prototype);
	RequestBase(Request.prototype);

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
	 * @param {String} [pass] optional in case of using 'bearer' as type
	 * @param {Object} options with 'type' property 'auto', 'basic' or 'bearer' (default 'basic')
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.auth = function(user, pass, options){
	  if (1 === arguments.length) pass = '';
	  if (typeof pass === 'object' && pass !== null) { // pass is optional and can be replaced with options
	    options = pass;
	    pass = '';
	  }
	  if (!options) {
	    options = {
	      type: 'function' === typeof btoa ? 'basic' : 'auto',
	    };
	  }

	  var encoder = function(string) {
	    if ('function' === typeof btoa) {
	      return btoa(string);
	    }
	    throw new Error('Cannot use basic auth, btoa is not a function');
	  };

	  return this._auth(user, pass, options, encoder);
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
	 * with optional `options` (or filename).
	 *
	 * ``` js
	 * request.post('/upload')
	 *   .attach('content', new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
	 *   .end(callback);
	 * ```
	 *
	 * @param {String} field
	 * @param {Blob|File} file
	 * @param {String|Object} options
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.attach = function(field, file, options){
	  if (file) {
	    if (this._data) {
	      throw Error("superagent can't mix .send() and .attach()");
	    }

	    this._getFormData().append(field, file, options || file.name);
	  }
	  return this;
	};

	Request.prototype._getFormData = function(){
	  if (!this._formData) {
	    this._formData = new root.FormData();
	  }
	  return this._formData;
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
	  if (this._shouldRetry(err, res)) {
	    return this._retry();
	  }

	  var fn = this._callback;
	  this.clearTimeout();

	  if (err) {
	    if (this._maxRetries) err.retries = this._retries - 1;
	    this.emit('error', err);
	  }

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

	// This only warns, because the request is still likely to work
	Request.prototype.buffer = Request.prototype.ca = Request.prototype.agent = function(){
	  console.warn("This is not supported in browser version of superagent");
	  return this;
	};

	// This throws, because it can't send/receive data as expected
	Request.prototype.pipe = Request.prototype.write = function(){
	  throw Error("Streaming is not supported in browser version of superagent");
	};

	/**
	 * Check if `obj` is a host object,
	 * we don't want to serialize these :)
	 *
	 * @param {Object} obj
	 * @return {Boolean}
	 * @api private
	 */
	Request.prototype._isHost = function _isHost(obj) {
	  // Native objects stringify to [object File], [object Blob], [object FormData], etc.
	  return obj && 'object' === typeof obj && !Array.isArray(obj) && Object.prototype.toString.call(obj) !== '[object Object]';
	}

	/**
	 * Initiate request, invoking callback `fn(res)`
	 * with an instanceof `Response`.
	 *
	 * @param {Function} fn
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.end = function(fn){
	  if (this._endCalled) {
	    console.warn("Warning: .end() was called twice. This is not supported in superagent");
	  }
	  this._endCalled = true;

	  // store callback
	  this._callback = fn || noop;

	  // querystring
	  this._finalizeQueryString();

	  return this._end();
	};

	Request.prototype._end = function() {
	  var self = this;
	  var xhr = (this.xhr = request.getXHR());
	  var data = this._formData || this._data;

	  this._setTimeouts();

	  // state change
	  xhr.onreadystatechange = function(){
	    var readyState = xhr.readyState;
	    if (readyState >= 2 && self._responseTimeoutTimer) {
	      clearTimeout(self._responseTimeoutTimer);
	    }
	    if (4 != readyState) {
	      return;
	    }

	    // In IE9, reads to any property (e.g. status) off of an aborted XHR will
	    // result in the error "Could not complete the operation due to error c00c023f"
	    var status;
	    try { status = xhr.status } catch(e) { status = 0; }

	    if (!status) {
	      if (self.timedout || self._aborted) return;
	      return self.crossDomainError();
	    }
	    self.emit('end');
	  };

	  // progress
	  var handleProgress = function(direction, e) {
	    if (e.total > 0) {
	      e.percent = e.loaded / e.total * 100;
	    }
	    e.direction = direction;
	    self.emit('progress', e);
	  };
	  if (this.hasListeners('progress')) {
	    try {
	      xhr.onprogress = handleProgress.bind(null, 'download');
	      if (xhr.upload) {
	        xhr.upload.onprogress = handleProgress.bind(null, 'upload');
	      }
	    } catch(e) {
	      // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
	      // Reported here:
	      // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
	    }
	  }

	  // initiate request
	  try {
	    if (this.username && this.password) {
	      xhr.open(this.method, this.url, true, this.username, this.password);
	    } else {
	      xhr.open(this.method, this.url, true);
	    }
	  } catch (err) {
	    // see #1149
	    return this.callback(err);
	  }

	  // CORS
	  if (this._withCredentials) xhr.withCredentials = true;

	  // body
	  if (!this._formData && 'GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !this._isHost(data)) {
	    // serialize stuff
	    var contentType = this._header['content-type'];
	    var serialize = this._serializer || request.serialize[contentType ? contentType.split(';')[0] : ''];
	    if (!serialize && isJSON(contentType)) {
	      serialize = request.serialize['application/json'];
	    }
	    if (serialize) data = serialize(data);
	  }

	  // set header fields
	  for (var field in this.header) {
	    if (null == this.header[field]) continue;

	    if (this.header.hasOwnProperty(field))
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

	request.agent = function() {
	  return new Agent();
	};

	["GET", "POST", "OPTIONS", "PATCH", "PUT", "DELETE"].forEach(function(method) {
	  Agent.prototype[method.toLowerCase()] = function(url, fn) {
	    var req = new request.Request(method, url);
	    this._setDefaults(req);
	    if (fn) {
	      req.end(fn);
	    }
	    return req;
	  };
	});

	Agent.prototype.del = Agent.prototype['delete'];

	/**
	 * GET `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} [data] or fn
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */

	request.get = function(url, data, fn) {
	  var req = request('GET', url);
	  if ('function' == typeof data) (fn = data), (data = null);
	  if (data) req.query(data);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * HEAD `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} [data] or fn
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */

	request.head = function(url, data, fn) {
	  var req = request('HEAD', url);
	  if ('function' == typeof data) (fn = data), (data = null);
	  if (data) req.query(data);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * OPTIONS query to `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} [data] or fn
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */

	request.options = function(url, data, fn) {
	  var req = request('OPTIONS', url);
	  if ('function' == typeof data) (fn = data), (data = null);
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * DELETE `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed} [data]
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */

	function del(url, data, fn) {
	  var req = request('DELETE', url);
	  if ('function' == typeof data) (fn = data), (data = null);
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	}

	request['del'] = del;
	request['delete'] = del;

	/**
	 * PATCH `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed} [data]
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */

	request.patch = function(url, data, fn) {
	  var req = request('PATCH', url);
	  if ('function' == typeof data) (fn = data), (data = null);
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * POST `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed} [data]
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */

	request.post = function(url, data, fn) {
	  var req = request('POST', url);
	  if ('function' == typeof data) (fn = data), (data = null);
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * PUT `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} [data] or fn
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */

	request.put = function(url, data, fn) {
	  var req = request('PUT', url);
	  if ('function' == typeof data) (fn = data), (data = null);
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

	
	/**
	 * Expose `Emitter`.
	 */

	if (true) {
	  module.exports = Emitter;
	}

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


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * Module of mixed-in functions shared between node and client code
	 */
	var isObject = __webpack_require__(46);

	/**
	 * Expose `RequestBase`.
	 */

	module.exports = RequestBase;

	/**
	 * Initialize a new `RequestBase`.
	 *
	 * @api public
	 */

	function RequestBase(obj) {
	  if (obj) return mixin(obj);
	}

	/**
	 * Mixin the prototype properties.
	 *
	 * @param {Object} obj
	 * @return {Object}
	 * @api private
	 */

	function mixin(obj) {
	  for (var key in RequestBase.prototype) {
	    obj[key] = RequestBase.prototype[key];
	  }
	  return obj;
	}

	/**
	 * Clear previous timeout.
	 *
	 * @return {Request} for chaining
	 * @api public
	 */

	RequestBase.prototype.clearTimeout = function _clearTimeout(){
	  clearTimeout(this._timer);
	  clearTimeout(this._responseTimeoutTimer);
	  delete this._timer;
	  delete this._responseTimeoutTimer;
	  return this;
	};

	/**
	 * Override default response body parser
	 *
	 * This function will be called to convert incoming data into request.body
	 *
	 * @param {Function}
	 * @api public
	 */

	RequestBase.prototype.parse = function parse(fn){
	  this._parser = fn;
	  return this;
	};

	/**
	 * Set format of binary response body.
	 * In browser valid formats are 'blob' and 'arraybuffer',
	 * which return Blob and ArrayBuffer, respectively.
	 *
	 * In Node all values result in Buffer.
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

	RequestBase.prototype.responseType = function(val){
	  this._responseType = val;
	  return this;
	};

	/**
	 * Override default request body serializer
	 *
	 * This function will be called to convert data set via .send or .attach into payload to send
	 *
	 * @param {Function}
	 * @api public
	 */

	RequestBase.prototype.serialize = function serialize(fn){
	  this._serializer = fn;
	  return this;
	};

	/**
	 * Set timeouts.
	 *
	 * - response timeout is time between sending request and receiving the first byte of the response. Includes DNS and connection time.
	 * - deadline is the time from start of the request to receiving response body in full. If the deadline is too short large files may not load at all on slow connections.
	 *
	 * Value of 0 or false means no timeout.
	 *
	 * @param {Number|Object} ms or {response, deadline}
	 * @return {Request} for chaining
	 * @api public
	 */

	RequestBase.prototype.timeout = function timeout(options){
	  if (!options || 'object' !== typeof options) {
	    this._timeout = options;
	    this._responseTimeout = 0;
	    return this;
	  }

	  for(var option in options) {
	    switch(option) {
	      case 'deadline':
	        this._timeout = options.deadline;
	        break;
	      case 'response':
	        this._responseTimeout = options.response;
	        break;
	      default:
	        console.warn("Unknown timeout option", option);
	    }
	  }
	  return this;
	};

	/**
	 * Set number of retry attempts on error.
	 *
	 * Failed requests will be retried 'count' times if timeout or err.code >= 500.
	 *
	 * @param {Number} count
	 * @param {Function} [fn]
	 * @return {Request} for chaining
	 * @api public
	 */

	RequestBase.prototype.retry = function retry(count, fn){
	  // Default to 1 if no count passed or true
	  if (arguments.length === 0 || count === true) count = 1;
	  if (count <= 0) count = 0;
	  this._maxRetries = count;
	  this._retries = 0;
	  this._retryCallback = fn;
	  return this;
	};

	var ERROR_CODES = [
	  'ECONNRESET',
	  'ETIMEDOUT',
	  'EADDRINFO',
	  'ESOCKETTIMEDOUT'
	];

	/**
	 * Determine if a request should be retried.
	 * (Borrowed from segmentio/superagent-retry)
	 *
	 * @param {Error} err
	 * @param {Response} [res]
	 * @returns {Boolean}
	 */
	RequestBase.prototype._shouldRetry = function(err, res) {
	  if (!this._maxRetries || this._retries++ >= this._maxRetries) {
	    return false;
	  }
	  if (this._retryCallback) {
	    try {
	      var override = this._retryCallback(err, res);
	      if (override === true) return true;
	      if (override === false) return false;
	      // undefined falls back to defaults
	    } catch(e) {
	      console.error(e);
	    }
	  }
	  if (res && res.status && res.status >= 500 && res.status != 501) return true;
	  if (err) {
	    if (err.code && ~ERROR_CODES.indexOf(err.code)) return true;
	    // Superagent timeout
	    if (err.timeout && err.code == 'ECONNABORTED') return true;
	    if (err.crossDomain) return true;
	  }
	  return false;
	};

	/**
	 * Retry request
	 *
	 * @return {Request} for chaining
	 * @api private
	 */

	RequestBase.prototype._retry = function() {

	  this.clearTimeout();

	  // node
	  if (this.req) {
	    this.req = null;
	    this.req = this.request();
	  }

	  this._aborted = false;
	  this.timedout = false;

	  return this._end();
	};

	/**
	 * Promise support
	 *
	 * @param {Function} resolve
	 * @param {Function} [reject]
	 * @return {Request}
	 */

	RequestBase.prototype.then = function then(resolve, reject) {
	  if (!this._fullfilledPromise) {
	    var self = this;
	    if (this._endCalled) {
	      console.warn("Warning: superagent request was sent twice, because both .end() and .then() were called. Never call .end() if you use promises");
	    }
	    this._fullfilledPromise = new Promise(function(innerResolve, innerReject) {
	      self.end(function(err, res) {
	        if (err) innerReject(err);
	        else innerResolve(res);
	      });
	    });
	  }
	  return this._fullfilledPromise.then(resolve, reject);
	};

	RequestBase.prototype['catch'] = function(cb) {
	  return this.then(undefined, cb);
	};

	/**
	 * Allow for extension
	 */

	RequestBase.prototype.use = function use(fn) {
	  fn(this);
	  return this;
	};

	RequestBase.prototype.ok = function(cb) {
	  if ('function' !== typeof cb) throw Error("Callback required");
	  this._okCallback = cb;
	  return this;
	};

	RequestBase.prototype._isResponseOK = function(res) {
	  if (!res) {
	    return false;
	  }

	  if (this._okCallback) {
	    return this._okCallback(res);
	  }

	  return res.status >= 200 && res.status < 300;
	};

	/**
	 * Get request header `field`.
	 * Case-insensitive.
	 *
	 * @param {String} field
	 * @return {String}
	 * @api public
	 */

	RequestBase.prototype.get = function(field){
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

	RequestBase.prototype.getHeader = RequestBase.prototype.get;

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

	RequestBase.prototype.set = function(field, val){
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
	RequestBase.prototype.unset = function(field){
	  delete this._header[field.toLowerCase()];
	  delete this.header[field];
	  return this;
	};

	/**
	 * Write the field `name` and `val`, or multiple fields with one object
	 * for "multipart/form-data" request bodies.
	 *
	 * ``` js
	 * request.post('/upload')
	 *   .field('foo', 'bar')
	 *   .end(callback);
	 *
	 * request.post('/upload')
	 *   .field({ foo: 'bar', baz: 'qux' })
	 *   .end(callback);
	 * ```
	 *
	 * @param {String|Object} name
	 * @param {String|Blob|File|Buffer|fs.ReadStream} val
	 * @return {Request} for chaining
	 * @api public
	 */
	RequestBase.prototype.field = function(name, val) {
	  // name should be either a string or an object.
	  if (null === name || undefined === name) {
	    throw new Error('.field(name, val) name can not be empty');
	  }

	  if (this._data) {
	    console.error(".field() can't be used if .send() is used. Please use only .send() or only .field() & .attach()");
	  }

	  if (isObject(name)) {
	    for (var key in name) {
	      this.field(key, name[key]);
	    }
	    return this;
	  }

	  if (Array.isArray(val)) {
	    for (var i in val) {
	      this.field(name, val[i]);
	    }
	    return this;
	  }

	  // val should be defined now
	  if (null === val || undefined === val) {
	    throw new Error('.field(name, val) val can not be empty');
	  }
	  if ('boolean' === typeof val) {
	    val = '' + val;
	  }
	  this._getFormData().append(name, val);
	  return this;
	};

	/**
	 * Abort the request, and clear potential timeout.
	 *
	 * @return {Request}
	 * @api public
	 */
	RequestBase.prototype.abort = function(){
	  if (this._aborted) {
	    return this;
	  }
	  this._aborted = true;
	  this.xhr && this.xhr.abort(); // browser
	  this.req && this.req.abort(); // node
	  this.clearTimeout();
	  this.emit('abort');
	  return this;
	};

	RequestBase.prototype._auth = function(user, pass, options, base64Encoder) {
	  switch (options.type) {
	    case 'basic':
	      this.set('Authorization', 'Basic ' + base64Encoder(user + ':' + pass));
	      break;

	    case 'auto':
	      this.username = user;
	      this.password = pass;
	      break;

	    case 'bearer': // usage would be .auth(accessToken, { type: 'bearer' })
	      this.set('Authorization', 'Bearer ' + user);
	      break;
	  }
	  return this;
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

	RequestBase.prototype.withCredentials = function(on) {
	  // This is browser-only functionality. Node side is no-op.
	  if (on == undefined) on = true;
	  this._withCredentials = on;
	  return this;
	};

	/**
	 * Set the max redirects to `n`. Does noting in browser XHR implementation.
	 *
	 * @param {Number} n
	 * @return {Request} for chaining
	 * @api public
	 */

	RequestBase.prototype.redirects = function(n){
	  this._maxRedirects = n;
	  return this;
	};

	/**
	 * Maximum size of buffered response body, in bytes. Counts uncompressed size.
	 * Default 200MB.
	 *
	 * @param {Number} n
	 * @return {Request} for chaining
	 */
	RequestBase.prototype.maxResponseSize = function(n){
	  if ('number' !== typeof n) {
	    throw TypeError("Invalid argument");
	  }
	  this._maxResponseSize = n;
	  return this;
	};

	/**
	 * Convert to a plain javascript object (not JSON string) of scalar properties.
	 * Note as this method is designed to return a useful non-this value,
	 * it cannot be chained.
	 *
	 * @return {Object} describing method, url, and data of this request
	 * @api public
	 */

	RequestBase.prototype.toJSON = function() {
	  return {
	    method: this.method,
	    url: this.url,
	    data: this._data,
	    headers: this._header,
	  };
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

	RequestBase.prototype.send = function(data){
	  var isObj = isObject(data);
	  var type = this._header['content-type'];

	  if (this._formData) {
	    console.error(".send() can't be used if .attach() or .field() is used. Please use only .send() or only .field() & .attach()");
	  }

	  if (isObj && !this._data) {
	    if (Array.isArray(data)) {
	      this._data = [];
	    } else if (!this._isHost(data)) {
	      this._data = {};
	    }
	  } else if (data && this._data && this._isHost(this._data)) {
	    throw Error("Can't merge these send calls");
	  }

	  // merge
	  if (isObj && isObject(this._data)) {
	    for (var key in data) {
	      this._data[key] = data[key];
	    }
	  } else if ('string' == typeof data) {
	    // default to x-www-form-urlencoded
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

	  if (!isObj || this._isHost(data)) {
	    return this;
	  }

	  // default to json
	  if (!type) this.type('json');
	  return this;
	};

	/**
	 * Sort `querystring` by the sort function
	 *
	 *
	 * Examples:
	 *
	 *       // default order
	 *       request.get('/user')
	 *         .query('name=Nick')
	 *         .query('search=Manny')
	 *         .sortQuery()
	 *         .end(callback)
	 *
	 *       // customized sort function
	 *       request.get('/user')
	 *         .query('name=Nick')
	 *         .query('search=Manny')
	 *         .sortQuery(function(a, b){
	 *           return a.length - b.length;
	 *         })
	 *         .end(callback)
	 *
	 *
	 * @param {Function} sort
	 * @return {Request} for chaining
	 * @api public
	 */

	RequestBase.prototype.sortQuery = function(sort) {
	  // _sort default to true but otherwise can be a function or boolean
	  this._sort = typeof sort === 'undefined' ? true : sort;
	  return this;
	};

	/**
	 * Compose querystring to append to req.url
	 *
	 * @api private
	 */
	RequestBase.prototype._finalizeQueryString = function(){
	  var query = this._query.join('&');
	  if (query) {
	    this.url += (this.url.indexOf('?') >= 0 ? '&' : '?') + query;
	  }
	  this._query.length = 0; // Makes the call idempotent

	  if (this._sort) {
	    var index = this.url.indexOf('?');
	    if (index >= 0) {
	      var queryArr = this.url.substring(index + 1).split('&');
	      if ('function' === typeof this._sort) {
	        queryArr.sort(this._sort);
	      } else {
	        queryArr.sort();
	      }
	      this.url = this.url.substring(0, index) + '?' + queryArr.join('&');
	    }
	  }
	};

	// For backwards compat only
	RequestBase.prototype._appendQueryString = function() {console.trace("Unsupported");}

	/**
	 * Invoke callback with timeout error.
	 *
	 * @api private
	 */

	RequestBase.prototype._timeoutError = function(reason, timeout, errno){
	  if (this._aborted) {
	    return;
	  }
	  var err = new Error(reason + timeout + 'ms exceeded');
	  err.timeout = timeout;
	  err.code = 'ECONNABORTED';
	  err.errno = errno;
	  this.timedout = true;
	  this.abort();
	  this.callback(err);
	};

	RequestBase.prototype._setTimeouts = function() {
	  var self = this;

	  // deadline
	  if (this._timeout && !this._timer) {
	    this._timer = setTimeout(function(){
	      self._timeoutError('Timeout of ', self._timeout, 'ETIME');
	    }, this._timeout);
	  }
	  // response timeout
	  if (this._responseTimeout && !this._responseTimeoutTimer) {
	    this._responseTimeoutTimer = setTimeout(function(){
	      self._timeoutError('Response timeout of ', self._responseTimeout, 'ETIMEDOUT');
	    }, this._responseTimeout);
	  }
	};


/***/ }),
/* 46 */
/***/ (function(module, exports) {

	'use strict';

	/**
	 * Check if `obj` is an object.
	 *
	 * @param {Object} obj
	 * @return {Boolean}
	 * @api private
	 */

	function isObject(obj) {
	  return null !== obj && 'object' === typeof obj;
	}

	module.exports = isObject;


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * Module dependencies.
	 */

	var utils = __webpack_require__(48);

	/**
	 * Expose `ResponseBase`.
	 */

	module.exports = ResponseBase;

	/**
	 * Initialize a new `ResponseBase`.
	 *
	 * @api public
	 */

	function ResponseBase(obj) {
	  if (obj) return mixin(obj);
	}

	/**
	 * Mixin the prototype properties.
	 *
	 * @param {Object} obj
	 * @return {Object}
	 * @api private
	 */

	function mixin(obj) {
	  for (var key in ResponseBase.prototype) {
	    obj[key] = ResponseBase.prototype[key];
	  }
	  return obj;
	}

	/**
	 * Get case-insensitive `field` value.
	 *
	 * @param {String} field
	 * @return {String}
	 * @api public
	 */

	ResponseBase.prototype.get = function(field) {
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

	ResponseBase.prototype._setHeaderProperties = function(header){
	    // TODO: moar!
	    // TODO: make this a util

	    // content-type
	    var ct = header['content-type'] || '';
	    this.type = utils.type(ct);

	    // params
	    var params = utils.params(ct);
	    for (var key in params) this[key] = params[key];

	    this.links = {};

	    // links
	    try {
	        if (header.link) {
	            this.links = utils.parseLinks(header.link);
	        }
	    } catch (err) {
	        // ignore
	    }
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

	ResponseBase.prototype._setStatusProperties = function(status){
	    var type = status / 100 | 0;

	    // status / class
	    this.status = this.statusCode = status;
	    this.statusType = type;

	    // basics
	    this.info = 1 == type;
	    this.ok = 2 == type;
	    this.redirect = 3 == type;
	    this.clientError = 4 == type;
	    this.serverError = 5 == type;
	    this.error = (4 == type || 5 == type)
	        ? this.toError()
	        : false;

	    // sugar
	    this.created = 201 == status;
	    this.accepted = 202 == status;
	    this.noContent = 204 == status;
	    this.badRequest = 400 == status;
	    this.unauthorized = 401 == status;
	    this.notAcceptable = 406 == status;
	    this.forbidden = 403 == status;
	    this.notFound = 404 == status;
	    this.unprocessableEntity = 422 == status;
	};


/***/ }),
/* 48 */
/***/ (function(module, exports) {

	'use strict';

	/**
	 * Return the mime type for the given `str`.
	 *
	 * @param {String} str
	 * @return {String}
	 * @api private
	 */

	exports.type = function(str){
	  return str.split(/ *; */).shift();
	};

	/**
	 * Return header field parameters.
	 *
	 * @param {String} str
	 * @return {Object}
	 * @api private
	 */

	exports.params = function(str){
	  return str.split(/ *; */).reduce(function(obj, str){
	    var parts = str.split(/ *= */);
	    var key = parts.shift();
	    var val = parts.shift();

	    if (key && val) obj[key] = val;
	    return obj;
	  }, {});
	};

	/**
	 * Parse Link header fields.
	 *
	 * @param {String} str
	 * @return {Object}
	 * @api private
	 */

	exports.parseLinks = function(str){
	  return str.split(/ *, */).reduce(function(obj, str){
	    var parts = str.split(/ *; */);
	    var url = parts[0].slice(1, -1);
	    var rel = parts[1].split(/ *= */)[1].slice(1, -1);
	    obj[rel] = url;
	    return obj;
	  }, {});
	};

	/**
	 * Strip content related fields from `header`.
	 *
	 * @param {Object} header
	 * @return {Object} header
	 * @api private
	 */

	exports.cleanHeader = function(header, changesOrigin){
	  delete header['content-type'];
	  delete header['content-length'];
	  delete header['transfer-encoding'];
	  delete header['host'];
	  // secuirty
	  if (changesOrigin) {
	    delete header['authorization'];
	    delete header['cookie'];
	  }
	  return header;
	};


/***/ }),
/* 49 */
/***/ (function(module, exports) {

	function Agent() {
	  this._defaults = [];
	}

	["use", "on", "once", "set", "query", "type", "accept", "auth", "withCredentials", "sortQuery", "retry", "ok", "redirects",
	 "timeout", "buffer", "serialize", "parse", "ca", "key", "pfx", "cert"].forEach(function(fn) {
	  /** Default setting for all requests from this agent */
	  Agent.prototype[fn] = function(/*varargs*/) {
	    this._defaults.push({fn:fn, arguments:arguments});
	    return this;
	  }
	});

	Agent.prototype._setDefaults = function(req) {
	    this._defaults.forEach(function(def) {
	      req[def.fn].apply(req, def.arguments);
	    });
	};

	module.exports = Agent;


/***/ })
/******/ ])
});
;