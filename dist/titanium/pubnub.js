/*! 4.21.6 / Consumer  */
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
	exports.default = undefined;

	var _pubnubCommon = __webpack_require__(1);

	var _pubnubCommon2 = _interopRequireDefault(_pubnubCommon);

	var _networking = __webpack_require__(39);

	var _networking2 = _interopRequireDefault(_networking);

	var _common = __webpack_require__(40);

	var _common2 = _interopRequireDefault(_common);

	var _titanium = __webpack_require__(41);

	var _flow_interfaces = __webpack_require__(5);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var PubNub = function (_PubNubCore) {
	  _inherits(PubNub, _PubNubCore);

	  function PubNub(setup) {
	    _classCallCheck(this, PubNub);

	    setup.db = new _common2.default();
	    setup.sdkFamily = 'TitaniumSDK';
	    setup.networking = new _networking2.default({ del: _titanium.del, get: _titanium.get, post: _titanium.post });

	    return _possibleConstructorReturn(this, (PubNub.__proto__ || Object.getPrototypeOf(PubNub)).call(this, setup));
	  }

	  return PubNub;
	}(_pubnubCommon2.default);

	exports.default = PubNub;
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

	var _fetch_messages = __webpack_require__(37);

	var fetchMessagesEndpointConfig = _interopRequireWildcard(_fetch_messages);

	var _time = __webpack_require__(12);

	var timeEndpointConfig = _interopRequireWildcard(_time);

	var _subscribe = __webpack_require__(38);

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

	    this.origin = setup.origin || 'pubsub.pndsn.com';
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
	      this.authKey = val;return this;
	    }
	  }, {
	    key: 'setCipherKey',
	    value: function setCipherKey(val) {
	      this.cipherKey = val;return this;
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
	      this.filterExpression = val;return this;
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
	      this._heartbeatInterval = val;return this;
	    }
	  }, {
	    key: 'getSubscribeTimeout',
	    value: function getSubscribeTimeout() {
	      return this._subscribeRequestTimeout;
	    }
	  }, {
	    key: 'setSubscribeTimeout',
	    value: function setSubscribeTimeout(val) {
	      this._subscribeRequestTimeout = val;return this;
	    }
	  }, {
	    key: 'getTransactionTimeout',
	    value: function getTransactionTimeout() {
	      return this._transactionalRequestTimeout;
	    }
	  }, {
	    key: 'setTransactionTimeout',
	    value: function setTransactionTimeout(val) {
	      this._transactionalRequestTimeout = val;return this;
	    }
	  }, {
	    key: 'isSendBeaconEnabled',
	    value: function isSendBeaconEnabled() {
	      return this._useSendBeacon;
	    }
	  }, {
	    key: 'setSendBeaconConfig',
	    value: function setSendBeaconConfig(val) {
	      this._useSendBeacon = val;return this;
	    }
	  }, {
	    key: 'getVersion',
	    value: function getVersion() {
	      return '4.21.6';
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
	        if (channelGroup in _this._channelGroups) _this._channelGroups[channelGroup].state = state;
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
	          withHeartbeats = _args$withHeartbeats === undefined ? true : _args$withHeartbeats;


	      if (!this._config.subscribeKey || this._config.subscribeKey === '') {
	        if (console && console.log) console.log('subscribe key missing; aborting subscribe');
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
	      this.adaptUnsubscribeChange({ channels: this.getSubscribedChannels(), channelGroups: this.getSubscribedChannelGroups() }, isOffline);
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
	        if (Object.keys(channelState).length) presenceState[channel] = channelState;
	      });

	      this.getSubscribedChannelGroups().forEach(function (channelGroup) {
	        var channelGroupState = _this5._channelGroups[channelGroup].state;
	        if (Object.keys(channelGroupState).length) presenceState[channelGroup] = channelGroupState;
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
	        state: presenceState }, onHeartbeat.bind(this));
	    }
	  }, {
	    key: '_startSubscribeLoop',
	    value: function _startSubscribeLoop() {
	      this._stopSubscribeLoop();
	      var channels = [];
	      var channelGroups = [];

	      Object.keys(this._channels).forEach(function (channel) {
	        return channels.push(channel);
	      });
	      Object.keys(this._presenceChannels).forEach(function (channel) {
	        return channels.push(channel + '-pnpres');
	      });

	      Object.keys(this._channelGroups).forEach(function (channelGroup) {
	        return channelGroups.push(channelGroup);
	      });
	      Object.keys(this._presenceChannelGroups).forEach(function (channelGroup) {
	        return channelGroups.push(channelGroup + '-pnpres');
	      });

	      if (channels.length === 0 && channelGroups.length === 0) {
	        return;
	      }

	      var subscribeArgs = {
	        channels: channels,
	        channelGroups: channelGroups,
	        timetoken: this._currentTimetoken,
	        filterExpression: this._config.filterExpression,
	        region: this._region
	      };

	      this._subscribeCall = this._subscribeEndpoint(subscribeArgs, this._processSubscribeResponse.bind(this));
	    }
	  }, {
	    key: '_processSubscribeResponse',
	    value: function _processSubscribeResponse(status, payload) {
	      var _this6 = this;

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
	            if (_this6._config.autoNetworkDetection && !_this6._isOnline) {
	              _this6._isOnline = true;
	              _this6._listenerManager.announceNetworkUp();
	            }
	            _this6.reconnect();
	            _this6._subscriptionStatusAnnounced = true;
	            var reconnectedAnnounce = {
	              category: _categories2.default.PNReconnectedCategory,
	              operation: status.operation,
	              lastTimetoken: _this6._lastTimetoken,
	              currentTimetoken: _this6._currentTimetoken
	            };
	            _this6._listenerManager.announceStatus(reconnectedAnnounce);
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
	          if (_this6._dedupingManager.isDuplicate(message)) {
	            return;
	          } else {
	            _this6._dedupingManager.addEntry(message);
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

	          _this6._listenerManager.announcePresence(announce);
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

	          if (_this6._config.cipherKey) {
	            _announce.message = _this6._crypto.decrypt(message.payload);
	          } else {
	            _announce.message = message.payload;
	          }

	          _this6._listenerManager.announceMessage(_announce);
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
	  var _incomingParams$chann2 = incomingParams.channelGroups,
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
/* 39 */
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
	      if (this._providedFQDN.indexOf('pubsub.') === -1) {
	        return this._providedFQDN;
	      }

	      var newSubDomain = void 0;

	      this._currentSubDomain = this._currentSubDomain + 1;

	      if (this._currentSubDomain >= this._maxSubDomain) {
	        this._currentSubDomain = 1;
	      }

	      newSubDomain = this._currentSubDomain.toString();

	      return this._providedFQDN.replace('pubsub', 'ps' + newSubDomain);
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
	      if (err.code === 'ENOTFOUND') return _categories2.default.PNNetworkIssuesCategory;
	      if (err.code === 'ECONNREFUSED') return _categories2.default.PNNetworkIssuesCategory;
	      if (err.code === 'ECONNRESET') return _categories2.default.PNNetworkIssuesCategory;
	      if (err.code === 'EAI_AGAIN') return _categories2.default.PNNetworkIssuesCategory;

	      if (err.status === 0 || err.hasOwnProperty('status') && typeof err.status === 'undefined') return _categories2.default.PNNetworkIssuesCategory;
	      if (err.timeout) return _categories2.default.PNTimeoutCategory;

	      if (err.code === 'ETIMEDOUT') return _categories2.default.PNNetworkIssuesCategory;

	      if (err.response) {
	        if (err.response.badRequest) return _categories2.default.PNBadRequestCategory;
	        if (err.response.forbidden) return _categories2.default.PNAccessDeniedCategory;
	      }

	      return _categories2.default.PNUnknownCategory;
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;
	module.exports = exports['default'];

/***/ }),
/* 40 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class() {
	    _classCallCheck(this, _class);

	    this.storage = {};
	  }

	  _createClass(_class, [{
	    key: "get",
	    value: function get(key) {
	      return this.storage[key];
	    }
	  }, {
	    key: "set",
	    value: function set(key, value) {
	      this.storage[key] = value;
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;
	module.exports = exports["default"];

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.get = get;
	exports.post = post;
	exports.del = del;

	var _flow_interfaces = __webpack_require__(5);

	var _utils = __webpack_require__(42);

	function log(url, qs, res) {
	  var _pickLogger = function _pickLogger() {
	    if (Ti && Ti.API && Ti.API.log) return Ti.API;
	    if (window && window.console && window.console.log) return window.console;
	    return console;
	  };

	  var start = new Date().getTime();
	  var timestamp = new Date().toISOString();
	  var logger = _pickLogger();
	  logger.log('<<<<<');
	  logger.log('[' + timestamp + ']', '\n', url, '\n', qs);
	  logger.log('-----');

	  var now = new Date().getTime();
	  var elapsed = now - start;
	  var timestampDone = new Date().toISOString();

	  logger.log('>>>>>>');
	  logger.log('[' + timestampDone + ' / ' + elapsed + ']', '\n', url, '\n', qs, '\n', res);
	  logger.log('-----');
	}

	function getHttpClient() {
	  if (Ti.Platform.osname === 'mobileweb') {
	    return new XMLHttpRequest();
	  } else {
	    return Ti.Network.createHTTPClient();
	  }
	}

	function keepAlive(xhr) {
	  if (Ti.Platform.osname !== 'mobileweb' && this._config.keepAlive) {
	    xhr.enableKeepAlive = true;
	  }
	}

	function xdr(xhr, method, url, params, body, endpoint, callback) {
	  var _this = this;

	  var status = {};
	  status.operation = endpoint.operation;

	  xhr.open(method, (0, _utils.buildUrl)(url, params), true);

	  keepAlive.call(this, xhr);

	  xhr.onload = function () {
	    status.error = false;

	    if (xhr.status) {
	      status.statusCode = xhr.status;
	    }

	    var resp = JSON.parse(xhr.responseText);

	    if (_this._config.logVerbosity) {
	      log(url, params, xhr.responseText);
	    }

	    return callback(status, resp);
	  };

	  xhr.onerror = function (e) {
	    status.error = true;
	    status.errorData = e.error;
	    status.category = _this._detectErrorCategory(e.error);
	    return callback(status, null);
	  };

	  xhr.timeout = Ti.Platform.osname === 'android' ? 2147483647 : Infinity;

	  xhr.send(body);
	}

	function get(params, endpoint, callback) {
	  var xhr = getHttpClient();

	  var url = this.getStandardOrigin() + endpoint.url;

	  return xdr.call(this, xhr, 'GET', url, params, {}, endpoint, callback);
	}

	function post(params, body, endpoint, callback) {
	  var xhr = getHttpClient();

	  var url = this.getStandardOrigin() + endpoint.url;

	  return xdr.call(this, xhr, 'POST', url, params, JSON.parse(body), endpoint, callback);
	}

	function del(params, endpoint, callback) {
	  var xhr = getHttpClient();

	  var url = this.getStandardOrigin() + endpoint.url;

	  return xdr.call(this, xhr, 'DELETE', url, params, {}, endpoint, callback);
	}

/***/ }),
/* 42 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	exports.encodedKeyValuePair = encodedKeyValuePair;
	exports.buildUrl = buildUrl;
	function encodedKeyValuePair(pairs, key, value) {
	  if (value != null) {
	    if (Array.isArray(value)) {
	      value.forEach(function (item) {
	        encodedKeyValuePair(pairs, key, item);
	      });
	    } else if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
	      Object.keys(value).forEach(function (subkey) {
	        encodedKeyValuePair(pairs, key + '[' + subkey + ']', value[subkey]);
	      });
	    } else {
	      pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
	    }
	  } else if (value === null) {
	    pairs.push(encodeURIComponent('' + encodeURIComponent(key)));
	  }
	}

	function buildUrl(url, params) {
	  var pairs = [];

	  Object.keys(params).forEach(function (key) {
	    encodedKeyValuePair(pairs, key, params[key]);
	  });

	  return url + '?' + pairs.join('&');
	}

/***/ })
/******/ ])
});
;