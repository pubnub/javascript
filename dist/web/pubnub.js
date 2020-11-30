/*! 4.29.10 / Consumer  */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["PubNub"] = factory();
	else
		root["PubNub"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 27);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _default = {
  PNTimeOperation: 'PNTimeOperation',
  PNHistoryOperation: 'PNHistoryOperation',
  PNDeleteMessagesOperation: 'PNDeleteMessagesOperation',
  PNFetchMessagesOperation: 'PNFetchMessagesOperation',
  PNMessageCounts: 'PNMessageCountsOperation',
  PNSubscribeOperation: 'PNSubscribeOperation',
  PNUnsubscribeOperation: 'PNUnsubscribeOperation',
  PNPublishOperation: 'PNPublishOperation',
  PNSignalOperation: 'PNSignalOperation',
  PNAddMessageActionOperation: 'PNAddActionOperation',
  PNRemoveMessageActionOperation: 'PNRemoveMessageActionOperation',
  PNGetMessageActionsOperation: 'PNGetMessageActionsOperation',
  PNCreateUserOperation: 'PNCreateUserOperation',
  PNUpdateUserOperation: 'PNUpdateUserOperation',
  PNDeleteUserOperation: 'PNDeleteUserOperation',
  PNGetUserOperation: 'PNGetUsersOperation',
  PNGetUsersOperation: 'PNGetUsersOperation',
  PNCreateSpaceOperation: 'PNCreateSpaceOperation',
  PNUpdateSpaceOperation: 'PNUpdateSpaceOperation',
  PNDeleteSpaceOperation: 'PNDeleteSpaceOperation',
  PNGetSpaceOperation: 'PNGetSpacesOperation',
  PNGetSpacesOperation: 'PNGetSpacesOperation',
  PNGetMembersOperation: 'PNGetMembersOperation',
  PNUpdateMembersOperation: 'PNUpdateMembersOperation',
  PNGetMembershipsOperation: 'PNGetMembershipsOperation',
  PNUpdateMembershipsOperation: 'PNUpdateMembershipsOperation',
  PNListFilesOperation: 'PNListFilesOperation',
  PNGenerateUploadUrlOperation: 'PNGenerateUploadUrlOperation',
  PNPublishFileOperation: 'PNPublishFileOperation',
  PNGetFileUrlOperation: 'PNGetFileUrlOperation',
  PNDownloadFileOperation: 'PNDownloadFileOperation',
  PNGetAllUUIDMetadataOperation: 'PNGetAllUUIDMetadataOperation',
  PNGetUUIDMetadataOperation: 'PNGetUUIDMetadataOperation',
  PNSetUUIDMetadataOperation: 'PNSetUUIDMetadataOperation',
  PNRemoveUUIDMetadataOperation: 'PNRemoveUUIDMetadataOperation',
  PNGetAllChannelMetadataOperation: 'PNGetAllChannelMetadataOperation',
  PNGetChannelMetadataOperation: 'PNGetChannelMetadataOperation',
  PNSetChannelMetadataOperation: 'PNSetChannelMetadataOperation',
  PNRemoveChannelMetadataOperation: 'PNRemoveChannelMetadataOperation',
  PNSetMembersOperation: 'PNSetMembersOperation',
  PNSetMembershipsOperation: 'PNSetMembershipsOperation',
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
  PNAccessManagerGrantToken: 'PNAccessManagerGrantToken',
  PNAccessManagerAudit: 'PNAccessManagerAudit'
};
exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

function objectToList(o) {
  var l = [];
  Object.keys(o).forEach(function (key) {
    return l.push(key);
  });
  return l;
}

function encodeString(input) {
  return encodeURIComponent(input).replace(/[!~*'()]/g, function (x) {
    return "%".concat(x.charCodeAt(0).toString(16).toUpperCase());
  });
}

function objectToListSorted(o) {
  return objectToList(o).sort();
}

function signPamFromParams(params) {
  var l = objectToListSorted(params);
  return l.map(function (paramKey) {
    return "".concat(paramKey, "=").concat(encodeString(params[paramKey]));
  }).join('&');
}

function endsWith(searchString, suffix) {
  return searchString.indexOf(suffix, this.length - suffix.length) !== -1;
}

function createPromise() {
  var successResolve;
  var failureResolve;
  var promise = new Promise(function (fulfill, reject) {
    successResolve = fulfill;
    failureResolve = reject;
  });
  return {
    promise: promise,
    reject: failureResolve,
    fulfill: successResolve
  };
}

var deprecationMessage = "The Objects v1 API has been deprecated.\nYou can learn more about Objects v2 API at https://www.pubnub.com/docs/web-javascript/api-reference-objects.\nIf you have questions about the Objects v2 API or require additional help with migrating to the new data model, please contact PubNub Support at support@pubnub.com.";

function deprecated(fn) {
  return function () {
    if (typeof process !== 'undefined') {
      var _process, _process$env;

      if (((_process = process) === null || _process === void 0 ? void 0 : (_process$env = _process.env) === null || _process$env === void 0 ? void 0 : "production") !== 'test') {
        console.warn(deprecationMessage);
      }
    }

    return fn.apply(void 0, arguments);
  };
}

module.exports = {
  signPamFromParams: signPamFromParams,
  endsWith: endsWith,
  createPromise: createPromise,
  encodeString: encodeString,
  deprecated: deprecated
};
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(39)))

/***/ }),
/* 4 */
/***/ (function(module, exports) {

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

module.exports = _defineProperty;

/***/ }),
/* 5 */
/***/ (function(module, exports) {

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;

/***/ }),
/* 6 */
/***/ (function(module, exports) {

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

module.exports = _createClass;

/***/ }),
/* 7 */
/***/ (function(module, exports) {

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

module.exports = _typeof;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(__webpack_require__(5));

var _createClass2 = _interopRequireDefault(__webpack_require__(6));

var _defineProperty2 = _interopRequireDefault(__webpack_require__(4));

var _uuid = _interopRequireDefault(__webpack_require__(17));

var _flow_interfaces = __webpack_require__(2);

var PRESENCE_TIMEOUT_MINIMUM = 20;
var PRESENCE_TIMEOUT_DEFAULT = 300;

var _default = function () {
  function _default(_ref) {
    var _setup$fileUploadPubl, _setup$useRandomIVs;

    var setup = _ref.setup,
        db = _ref.db;
    (0, _classCallCheck2["default"])(this, _default);
    (0, _defineProperty2["default"])(this, "_db", void 0);
    (0, _defineProperty2["default"])(this, "subscribeKey", void 0);
    (0, _defineProperty2["default"])(this, "publishKey", void 0);
    (0, _defineProperty2["default"])(this, "secretKey", void 0);
    (0, _defineProperty2["default"])(this, "cipherKey", void 0);
    (0, _defineProperty2["default"])(this, "authKey", void 0);
    (0, _defineProperty2["default"])(this, "UUID", void 0);
    (0, _defineProperty2["default"])(this, "proxy", void 0);
    (0, _defineProperty2["default"])(this, "instanceId", void 0);
    (0, _defineProperty2["default"])(this, "sdkName", void 0);
    (0, _defineProperty2["default"])(this, "sdkFamily", void 0);
    (0, _defineProperty2["default"])(this, "partnerId", void 0);
    (0, _defineProperty2["default"])(this, "filterExpression", void 0);
    (0, _defineProperty2["default"])(this, "suppressLeaveEvents", void 0);
    (0, _defineProperty2["default"])(this, "secure", void 0);
    (0, _defineProperty2["default"])(this, "origin", void 0);
    (0, _defineProperty2["default"])(this, "logVerbosity", void 0);
    (0, _defineProperty2["default"])(this, "useInstanceId", void 0);
    (0, _defineProperty2["default"])(this, "useRequestId", void 0);
    (0, _defineProperty2["default"])(this, "keepAlive", void 0);
    (0, _defineProperty2["default"])(this, "keepAliveSettings", void 0);
    (0, _defineProperty2["default"])(this, "autoNetworkDetection", void 0);
    (0, _defineProperty2["default"])(this, "announceSuccessfulHeartbeats", void 0);
    (0, _defineProperty2["default"])(this, "announceFailedHeartbeats", void 0);
    (0, _defineProperty2["default"])(this, "_presenceTimeout", void 0);
    (0, _defineProperty2["default"])(this, "_heartbeatInterval", void 0);
    (0, _defineProperty2["default"])(this, "_subscribeRequestTimeout", void 0);
    (0, _defineProperty2["default"])(this, "_transactionalRequestTimeout", void 0);
    (0, _defineProperty2["default"])(this, "_useSendBeacon", void 0);
    (0, _defineProperty2["default"])(this, "_PNSDKSuffix", void 0);
    (0, _defineProperty2["default"])(this, "requestMessageCountThreshold", void 0);
    (0, _defineProperty2["default"])(this, "restore", void 0);
    (0, _defineProperty2["default"])(this, "dedupeOnSubscribe", void 0);
    (0, _defineProperty2["default"])(this, "maximumCacheSize", void 0);
    (0, _defineProperty2["default"])(this, "customEncrypt", void 0);
    (0, _defineProperty2["default"])(this, "customDecrypt", void 0);
    (0, _defineProperty2["default"])(this, "fileUploadPublishRetryLimit", void 0);
    (0, _defineProperty2["default"])(this, "useRandomIVs", void 0);
    this._PNSDKSuffix = {};
    this._db = db;
    this.instanceId = "pn-".concat(_uuid["default"].createUUID());
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
    this.fileUploadPublishRetryLimit = (_setup$fileUploadPubl = setup.fileUploadPublishRetryLimit) !== null && _setup$fileUploadPubl !== void 0 ? _setup$fileUploadPubl : 5;
    this.useRandomIVs = (_setup$useRandomIVs = setup.useRandomIVs) !== null && _setup$useRandomIVs !== void 0 ? _setup$useRandomIVs : false;

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

    if (setup.presenceTimeout) {
      this.setPresenceTimeout(setup.presenceTimeout);
    } else {
      this._presenceTimeout = PRESENCE_TIMEOUT_DEFAULT;
    }

    if (setup.heartbeatInterval != null) {
      this.setHeartbeatInterval(setup.heartbeatInterval);
    }

    this.setUUID(this._decideUUID(setup.uuid));
  }

  (0, _createClass2["default"])(_default, [{
    key: "getAuthKey",
    value: function getAuthKey() {
      return this.authKey;
    }
  }, {
    key: "setAuthKey",
    value: function setAuthKey(val) {
      this.authKey = val;
      return this;
    }
  }, {
    key: "setCipherKey",
    value: function setCipherKey(val) {
      this.cipherKey = val;
      return this;
    }
  }, {
    key: "getUUID",
    value: function getUUID() {
      return this.UUID;
    }
  }, {
    key: "setUUID",
    value: function setUUID(val) {
      if (this._db && this._db.set) this._db.set("".concat(this.subscribeKey, "uuid"), val);
      this.UUID = val;
      return this;
    }
  }, {
    key: "getFilterExpression",
    value: function getFilterExpression() {
      return this.filterExpression;
    }
  }, {
    key: "setFilterExpression",
    value: function setFilterExpression(val) {
      this.filterExpression = val;
      return this;
    }
  }, {
    key: "getPresenceTimeout",
    value: function getPresenceTimeout() {
      return this._presenceTimeout;
    }
  }, {
    key: "setPresenceTimeout",
    value: function setPresenceTimeout(val) {
      if (val >= PRESENCE_TIMEOUT_MINIMUM) {
        this._presenceTimeout = val;
      } else {
        this._presenceTimeout = PRESENCE_TIMEOUT_MINIMUM;
        console.log('WARNING: Presence timeout is less than the minimum. Using minimum value: ', this._presenceTimeout);
      }

      this.setHeartbeatInterval(this._presenceTimeout / 2 - 1);
      return this;
    }
  }, {
    key: "setProxy",
    value: function setProxy(proxy) {
      this.proxy = proxy;
    }
  }, {
    key: "getHeartbeatInterval",
    value: function getHeartbeatInterval() {
      return this._heartbeatInterval;
    }
  }, {
    key: "setHeartbeatInterval",
    value: function setHeartbeatInterval(val) {
      this._heartbeatInterval = val;
      return this;
    }
  }, {
    key: "getSubscribeTimeout",
    value: function getSubscribeTimeout() {
      return this._subscribeRequestTimeout;
    }
  }, {
    key: "setSubscribeTimeout",
    value: function setSubscribeTimeout(val) {
      this._subscribeRequestTimeout = val;
      return this;
    }
  }, {
    key: "getTransactionTimeout",
    value: function getTransactionTimeout() {
      return this._transactionalRequestTimeout;
    }
  }, {
    key: "setTransactionTimeout",
    value: function setTransactionTimeout(val) {
      this._transactionalRequestTimeout = val;
      return this;
    }
  }, {
    key: "isSendBeaconEnabled",
    value: function isSendBeaconEnabled() {
      return this._useSendBeacon;
    }
  }, {
    key: "setSendBeaconConfig",
    value: function setSendBeaconConfig(val) {
      this._useSendBeacon = val;
      return this;
    }
  }, {
    key: "getVersion",
    value: function getVersion() {
      return '4.29.10';
    }
  }, {
    key: "_addPnsdkSuffix",
    value: function _addPnsdkSuffix(name, suffix) {
      this._PNSDKSuffix[name] = suffix;
    }
  }, {
    key: "_getPnsdkSuffix",
    value: function _getPnsdkSuffix(separator) {
      var _this = this;

      return Object.keys(this._PNSDKSuffix).reduce(function (result, key) {
        return result + separator + _this._PNSDKSuffix[key];
      }, '');
    }
  }, {
    key: "_decideUUID",
    value: function _decideUUID(providedUUID) {
      if (providedUUID) {
        return providedUUID;
      }

      if (this._db && this._db.get && this._db.get("".concat(this.subscribeKey, "uuid"))) {
        return this._db.get("".concat(this.subscribeKey, "uuid"));
      }

      return "pn-".concat(_uuid["default"].createUUID());
    }
  }]);
  return _default;
}();

exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

var arrayWithHoles = __webpack_require__(77);

var iterableToArrayLimit = __webpack_require__(78);

var unsupportedIterableToArray = __webpack_require__(79);

var nonIterableRest = __webpack_require__(81);

function _slicedToArray(arr, i) {
  return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || unsupportedIterableToArray(arr, i) || nonIterableRest();
}

module.exports = _slicedToArray;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _default = {
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
exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(72);


/***/ }),
/* 12 */
/***/ (function(module, exports) {

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

module.exports = _asyncToGenerator;

/***/ }),
/* 13 */
/***/ (function(module, exports) {

function _getPrototypeOf(o) {
  module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

module.exports = _getPrototypeOf;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

var setPrototypeOf = __webpack_require__(15);

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) setPrototypeOf(subClass, superClass);
}

module.exports = _inherits;

/***/ }),
/* 15 */
/***/ (function(module, exports) {

function _setPrototypeOf(o, p) {
  module.exports = _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

module.exports = _setPrototypeOf;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

var _typeof = __webpack_require__(7);

var assertThisInitialized = __webpack_require__(19);

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }

  return assertThisInitialized(self);
}

module.exports = _possibleConstructorReturn;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _lilUuid = _interopRequireDefault(__webpack_require__(31));

var _default = {
  createUUID: function createUUID() {
    if (_lilUuid["default"].uuid) {
      return _lilUuid["default"].uuid();
    } else {
      return (0, _lilUuid["default"])();
    }
  }
};
exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createValidationError = createValidationError;
exports.generatePNSDK = generatePNSDK;
exports.signRequest = signRequest;
exports["default"] = _default;
exports.PubNubError = void 0;

var _defineProperty2 = _interopRequireDefault(__webpack_require__(4));

var _classCallCheck2 = _interopRequireDefault(__webpack_require__(5));

var _inherits2 = _interopRequireDefault(__webpack_require__(14));

var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(16));

var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(13));

var _wrapNativeSuper2 = _interopRequireDefault(__webpack_require__(45));

var _uuid = _interopRequireDefault(__webpack_require__(17));

var _flow_interfaces = __webpack_require__(2);

var _utils = _interopRequireDefault(__webpack_require__(3));

var _config = _interopRequireDefault(__webpack_require__(8));

var _operations = _interopRequireDefault(__webpack_require__(1));

var _categories = _interopRequireDefault(__webpack_require__(10));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var PubNubError = function (_Error) {
  (0, _inherits2["default"])(PubNubError, _Error);

  var _super = _createSuper(PubNubError);

  function PubNubError(message, status) {
    var _this;

    (0, _classCallCheck2["default"])(this, PubNubError);
    _this = _super.call(this, message);
    _this.name = _this.constructor.name;
    _this.status = status;
    _this.message = message;
    return _this;
  }

  return PubNubError;
}((0, _wrapNativeSuper2["default"])(Error));

exports.PubNubError = PubNubError;

function createError(errorPayload, type) {
  errorPayload.type = type;
  errorPayload.error = true;
  return errorPayload;
}

function createValidationError(message) {
  return createError({
    message: message
  }, 'validationError');
}

function decideURL(endpoint, modules, incomingParams) {
  if (endpoint.usePost && endpoint.usePost(modules, incomingParams)) {
    return endpoint.postURL(modules, incomingParams);
  } else if (endpoint.usePatch && endpoint.usePatch(modules, incomingParams)) {
    return endpoint.patchURL(modules, incomingParams);
  } else if (endpoint.useGetFile && endpoint.useGetFile(modules, incomingParams)) {
    return endpoint.getFileURL(modules, incomingParams);
  } else {
    return endpoint.getURL(modules, incomingParams);
  }
}

function getAuthToken(endpoint, modules, incomingParams) {
  var token;

  if (endpoint.getAuthToken) {
    token = endpoint.getAuthToken(modules, incomingParams);
  }

  return token;
}

function generatePNSDK(config) {
  if (config.sdkName) {
    return config.sdkName;
  }

  var base = "PubNub-JS-".concat(config.sdkFamily);

  if (config.partnerId) {
    base += "-".concat(config.partnerId);
  }

  base += "/".concat(config.getVersion());

  var pnsdkSuffix = config._getPnsdkSuffix(' ');

  if (pnsdkSuffix.length > 0) {
    base += pnsdkSuffix;
  }

  return base;
}

function getHttpMethod(modules, endpoint, incomingParams) {
  if (endpoint.usePost && endpoint.usePost(modules, incomingParams)) {
    return 'POST';
  } else if (endpoint.usePatch && endpoint.usePatch(modules, incomingParams)) {
    return 'PATCH';
  } else if (endpoint.useDelete && endpoint.useDelete(modules, incomingParams)) {
    return 'DELETE';
  } else if (endpoint.useGetFile && endpoint.useGetFile(modules, incomingParams)) {
    return 'GETFILE';
  } else {
    return 'GET';
  }
}

function signRequest(modules, url, outgoingParams, incomingParams, endpoint) {
  var config = modules.config,
      crypto = modules.crypto;
  var httpMethod = getHttpMethod(modules, endpoint, incomingParams);
  outgoingParams.timestamp = Math.floor(new Date().getTime() / 1000);

  if (endpoint.getOperation() === 'PNPublishOperation' && endpoint.usePost && endpoint.usePost(modules, incomingParams)) {
    httpMethod = 'GET';
  }

  if (httpMethod === 'GETFILE') {
    httpMethod = 'GET';
  }

  var signInput = "".concat(httpMethod, "\n").concat(config.publishKey, "\n").concat(url, "\n").concat(_utils["default"].signPamFromParams(outgoingParams), "\n");

  if (httpMethod === 'POST') {
    var payload = endpoint.postPayload(modules, incomingParams);

    if (typeof payload === 'string') {
      signInput += payload;
    } else {
      signInput += JSON.stringify(payload);
    }
  } else if (httpMethod === 'PATCH') {
    var _payload = endpoint.patchPayload(modules, incomingParams);

    if (typeof _payload === 'string') {
      signInput += _payload;
    } else {
      signInput += JSON.stringify(_payload);
    }
  }

  var signature = "v2.".concat(crypto.HMACSHA256(signInput));
  signature = signature.replace(/\+/g, '-');
  signature = signature.replace(/\//g, '_');
  signature = signature.replace(/=+$/, '');
  outgoingParams.signature = signature;
}

function _default(modules, endpoint) {
  var networking = modules.networking,
      config = modules.config,
      telemetryManager = modules.telemetryManager;

  var requestId = _uuid["default"].createUUID();

  var callback = null;
  var promiseComponent = null;
  var incomingParams = {};

  if (endpoint.getOperation() === _operations["default"].PNTimeOperation || endpoint.getOperation() === _operations["default"].PNChannelGroupsOperation) {
    callback = arguments.length <= 2 ? undefined : arguments[2];
  } else {
    incomingParams = arguments.length <= 2 ? undefined : arguments[2];
    callback = arguments.length <= 3 ? undefined : arguments[3];
  }

  if (typeof Promise !== 'undefined' && !callback) {
    promiseComponent = _utils["default"].createPromise();
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
  var callInstance;
  var networkingParams = {
    url: url,
    operation: endpoint.getOperation(),
    timeout: endpoint.getRequestTimeout(modules),
    headers: endpoint.getRequestHeaders ? endpoint.getRequestHeaders() : {},
    ignoreBody: typeof endpoint.ignoreBody === 'function' ? endpoint.ignoreBody(modules) : false,
    forceBuffered: typeof endpoint.forceBuffered === 'function' ? endpoint.forceBuffered(modules, incomingParams) : null
  };
  outgoingParams.uuid = config.UUID;
  outgoingParams.pnsdk = generatePNSDK(config);
  var telemetryLatencies = telemetryManager.operationsLatencyForRequest();

  if (Object.keys(telemetryLatencies).length) {
    outgoingParams = _objectSpread(_objectSpread({}, outgoingParams), telemetryLatencies);
  }

  if (config.useInstanceId) {
    outgoingParams.instanceid = config.instanceId;
  }

  if (config.useRequestId) {
    outgoingParams.requestid = requestId;
  }

  if (endpoint.isAuthSupported()) {
    var token = getAuthToken(endpoint, modules, incomingParams);
    var tokenOrKey = token || config.getAuthKey();

    if (tokenOrKey) {
      outgoingParams.auth = tokenOrKey;
    }
  }

  if (config.secretKey) {
    signRequest(modules, url, outgoingParams, incomingParams, endpoint);
  }

  var onResponse = function onResponse(status, payload) {
    var _responseP;

    if (status.error) {
      if (callback) {
        callback(status);
      } else if (promiseComponent) {
        promiseComponent.reject(new PubNubError('PubNub call failed, check status for details', status));
      }

      return;
    }

    telemetryManager.stopLatencyMeasure(endpoint.getOperation(), requestId);
    var responseP = endpoint.handleResponse(modules, payload, incomingParams);

    if (typeof ((_responseP = responseP) === null || _responseP === void 0 ? void 0 : _responseP.then) !== 'function') {
      responseP = Promise.resolve(responseP);
    }

    responseP.then(function (result) {
      if (callback) {
        callback(status, result);
      } else if (promiseComponent) {
        promiseComponent.fulfill(result);
      }
    })["catch"](function (e) {
      if (callback) {
        var errorData = e;

        if (endpoint.getOperation() === _operations["default"].PNSubscribeOperation) {
          errorData = {
            statusCode: 400,
            error: true,
            operation: endpoint.getOperation(),
            errorData: e,
            category: _categories["default"].PNUnknownCategory
          };
        }

        callback(errorData, null);
      } else if (promiseComponent) {
        promiseComponent.reject(new PubNubError('PubNub call failed, check status for details', e));
      }
    });
  };

  telemetryManager.startLatencyMeasure(endpoint.getOperation(), requestId);

  if (getHttpMethod(modules, endpoint, incomingParams) === 'POST') {
    var payload = endpoint.postPayload(modules, incomingParams);
    callInstance = networking.POST(outgoingParams, payload, networkingParams, onResponse);
  } else if (getHttpMethod(modules, endpoint, incomingParams) === 'PATCH') {
    var _payload2 = endpoint.patchPayload(modules, incomingParams);

    callInstance = networking.PATCH(outgoingParams, _payload2, networkingParams, onResponse);
  } else if (getHttpMethod(modules, endpoint, incomingParams) === 'DELETE') {
    callInstance = networking.DELETE(outgoingParams, networkingParams, onResponse);
  } else if (getHttpMethod(modules, endpoint, incomingParams) === 'GETFILE') {
    callInstance = networking.GETFILE(outgoingParams, networkingParams, onResponse);
  } else {
    callInstance = networking.GET(outgoingParams, networkingParams, onResponse);
  }

  if (endpoint.getOperation() === _operations["default"].PNSubscribeOperation) {
    return callInstance;
  }

  if (promiseComponent) {
    return promiseComponent.promise;
  }
}

/***/ }),
/* 19 */
/***/ (function(module, exports) {

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

module.exports = _assertThisInitialized;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {

var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(__webpack_require__(5));

var _createClass2 = _interopRequireDefault(__webpack_require__(6));

var _defineProperty2 = _interopRequireDefault(__webpack_require__(4));

var _config = _interopRequireDefault(__webpack_require__(8));

var _hmacSha = _interopRequireDefault(__webpack_require__(22));

function bufferToWordArray(b) {
  var wa = [];
  var i;

  for (i = 0; i < b.length; i += 1) {
    wa[i / 4 | 0] |= b[i] << 24 - 8 * i;
  }

  return _hmacSha["default"].lib.WordArray.create(wa, b.length);
}

var _default = function () {
  function _default(_ref) {
    var config = _ref.config;
    (0, _classCallCheck2["default"])(this, _default);
    (0, _defineProperty2["default"])(this, "_config", void 0);
    (0, _defineProperty2["default"])(this, "_iv", void 0);
    (0, _defineProperty2["default"])(this, "_allowedKeyEncodings", void 0);
    (0, _defineProperty2["default"])(this, "_allowedKeyLengths", void 0);
    (0, _defineProperty2["default"])(this, "_allowedModes", void 0);
    (0, _defineProperty2["default"])(this, "_defaultOptions", void 0);
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

  (0, _createClass2["default"])(_default, [{
    key: "HMACSHA256",
    value: function HMACSHA256(data) {
      var hash = _hmacSha["default"].HmacSHA256(data, this._config.secretKey);

      return hash.toString(_hmacSha["default"].enc.Base64);
    }
  }, {
    key: "SHA256",
    value: function SHA256(s) {
      return _hmacSha["default"].SHA256(s).toString(_hmacSha["default"].enc.Hex);
    }
  }, {
    key: "_parseOptions",
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
    key: "_decodeKey",
    value: function _decodeKey(key, options) {
      if (options.keyEncoding === 'base64') {
        return _hmacSha["default"].enc.Base64.parse(key);
      } else if (options.keyEncoding === 'hex') {
        return _hmacSha["default"].enc.Hex.parse(key);
      } else {
        return key;
      }
    }
  }, {
    key: "_getPaddedKey",
    value: function _getPaddedKey(key, options) {
      key = this._decodeKey(key, options);

      if (options.encryptKey) {
        return _hmacSha["default"].enc.Utf8.parse(this.SHA256(key).slice(0, 32));
      } else {
        return key;
      }
    }
  }, {
    key: "_getMode",
    value: function _getMode(options) {
      if (options.mode === 'ecb') {
        return _hmacSha["default"].mode.ECB;
      } else {
        return _hmacSha["default"].mode.CBC;
      }
    }
  }, {
    key: "_getIV",
    value: function _getIV(options) {
      return options.mode === 'cbc' ? _hmacSha["default"].enc.Utf8.parse(this._iv) : null;
    }
  }, {
    key: "_getRandomIV",
    value: function _getRandomIV() {
      return _hmacSha["default"].lib.WordArray.random(16);
    }
  }, {
    key: "encrypt",
    value: function encrypt(data, customCipherKey, options) {
      if (this._config.customEncrypt) {
        return this._config.customEncrypt(data);
      } else {
        return this.pnEncrypt(data, customCipherKey, options);
      }
    }
  }, {
    key: "decrypt",
    value: function decrypt(data, customCipherKey, options) {
      if (this._config.customDecrypt) {
        return this._config.customDecrypt(data);
      } else {
        return this.pnDecrypt(data, customCipherKey, options);
      }
    }
  }, {
    key: "pnEncrypt",
    value: function pnEncrypt(data, customCipherKey, options) {
      if (!customCipherKey && !this._config.cipherKey) return data;
      options = this._parseOptions(options);

      var mode = this._getMode(options);

      var cipherKey = this._getPaddedKey(customCipherKey || this._config.cipherKey, options);

      if (this._config.useRandomIVs) {
        var waIv = this._getRandomIV();

        var waPayload = _hmacSha["default"].AES.encrypt(data, cipherKey, {
          iv: waIv,
          mode: mode
        }).ciphertext;

        return waIv.clone().concat(waPayload.clone()).toString(_hmacSha["default"].enc.Base64);
      } else {
        var iv = this._getIV(options);

        var encryptedHexArray = _hmacSha["default"].AES.encrypt(data, cipherKey, {
          iv: iv,
          mode: mode
        }).ciphertext;

        var base64Encrypted = encryptedHexArray.toString(_hmacSha["default"].enc.Base64);
        return base64Encrypted || data;
      }
    }
  }, {
    key: "pnDecrypt",
    value: function pnDecrypt(data, customCipherKey, options) {
      if (!customCipherKey && !this._config.cipherKey) return data;
      options = this._parseOptions(options);

      var mode = this._getMode(options);

      var cipherKey = this._getPaddedKey(customCipherKey || this._config.cipherKey, options);

      if (this._config.useRandomIVs) {
        var ciphertext = Buffer.from(data, 'base64');
        var iv = bufferToWordArray(ciphertext.slice(0, 16));
        var payload = bufferToWordArray(ciphertext.slice(16));

        try {
          var plainJSON = _hmacSha["default"].AES.decrypt({
            ciphertext: payload
          }, cipherKey, {
            iv: iv,
            mode: mode
          }).toString(_hmacSha["default"].enc.Utf8);

          var plaintext = JSON.parse(plainJSON);
          return plaintext;
        } catch (e) {
          return null;
        }
      } else {
        var _iv = this._getIV(options);

        try {
          var _ciphertext = _hmacSha["default"].enc.Base64.parse(data);

          var _plainJSON = _hmacSha["default"].AES.decrypt({
            ciphertext: _ciphertext
          }, cipherKey, {
            iv: _iv,
            mode: mode
          }).toString(_hmacSha["default"].enc.Utf8);

          var _plaintext = JSON.parse(_plainJSON);

          return _plaintext;
        } catch (e) {
          return null;
        }
      }
    }
  }]);
  return _default;
}();

exports["default"] = _default;
module.exports = exports.default;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(21).Buffer))

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */



var base64 = __webpack_require__(33)
var ieee754 = __webpack_require__(34)
var isArray = __webpack_require__(35)

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(32)))

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var CryptoJS = CryptoJS || function (h, s) {
  var f = {},
      g = f.lib = {},
      q = function q() {},
      m = g.Base = {
    extend: function extend(a) {
      q.prototype = this;
      var c = new q();
      a && c.mixIn(a);
      c.hasOwnProperty("init") || (c.init = function () {
        c.$super.init.apply(this, arguments);
      });
      c.init.prototype = c;
      c.$super = this;
      return c;
    },
    create: function create() {
      var a = this.extend();
      a.init.apply(a, arguments);
      return a;
    },
    init: function init() {},
    mixIn: function mixIn(a) {
      for (var c in a) {
        a.hasOwnProperty(c) && (this[c] = a[c]);
      }

      a.hasOwnProperty("toString") && (this.toString = a.toString);
    },
    clone: function clone() {
      return this.init.prototype.extend(this);
    }
  },
      r = g.WordArray = m.extend({
    init: function init(a, c) {
      a = this.words = a || [];
      this.sigBytes = c != s ? c : 4 * a.length;
    },
    toString: function toString(a) {
      return (a || k).stringify(this);
    },
    concat: function concat(a) {
      var c = this.words,
          d = a.words,
          b = this.sigBytes;
      a = a.sigBytes;
      this.clamp();
      if (b % 4) for (var e = 0; e < a; e++) {
        c[b + e >>> 2] |= (d[e >>> 2] >>> 24 - 8 * (e % 4) & 255) << 24 - 8 * ((b + e) % 4);
      } else if (65535 < d.length) for (e = 0; e < a; e += 4) {
        c[b + e >>> 2] = d[e >>> 2];
      } else c.push.apply(c, d);
      this.sigBytes += a;
      return this;
    },
    clamp: function clamp() {
      var a = this.words,
          c = this.sigBytes;
      a[c >>> 2] &= 4294967295 << 32 - 8 * (c % 4);
      a.length = h.ceil(c / 4);
    },
    clone: function clone() {
      var a = m.clone.call(this);
      a.words = this.words.slice(0);
      return a;
    },
    random: function random(a) {
      for (var c = [], d = 0; d < a; d += 4) {
        c.push(4294967296 * h.random() | 0);
      }

      return new r.init(c, a);
    }
  }),
      l = f.enc = {},
      k = l.Hex = {
    stringify: function stringify(a) {
      var c = a.words;
      a = a.sigBytes;

      for (var d = [], b = 0; b < a; b++) {
        var e = c[b >>> 2] >>> 24 - 8 * (b % 4) & 255;
        d.push((e >>> 4).toString(16));
        d.push((e & 15).toString(16));
      }

      return d.join("");
    },
    parse: function parse(a) {
      for (var c = a.length, d = [], b = 0; b < c; b += 2) {
        d[b >>> 3] |= parseInt(a.substr(b, 2), 16) << 24 - 4 * (b % 8);
      }

      return new r.init(d, c / 2);
    }
  },
      n = l.Latin1 = {
    stringify: function stringify(a) {
      var c = a.words;
      a = a.sigBytes;

      for (var d = [], b = 0; b < a; b++) {
        d.push(String.fromCharCode(c[b >>> 2] >>> 24 - 8 * (b % 4) & 255));
      }

      return d.join("");
    },
    parse: function parse(a) {
      for (var c = a.length, d = [], b = 0; b < c; b++) {
        d[b >>> 2] |= (a.charCodeAt(b) & 255) << 24 - 8 * (b % 4);
      }

      return new r.init(d, c);
    }
  },
      j = l.Utf8 = {
    stringify: function stringify(a) {
      try {
        return decodeURIComponent(escape(n.stringify(a)));
      } catch (c) {
        throw Error("Malformed UTF-8 data");
      }
    },
    parse: function parse(a) {
      return n.parse(unescape(encodeURIComponent(a)));
    }
  },
      u = g.BufferedBlockAlgorithm = m.extend({
    reset: function reset() {
      this._data = new r.init();
      this._nDataBytes = 0;
    },
    _append: function _append(a) {
      "string" == typeof a && (a = j.parse(a));

      this._data.concat(a);

      this._nDataBytes += a.sigBytes;
    },
    _process: function _process(a) {
      var c = this._data,
          d = c.words,
          b = c.sigBytes,
          e = this.blockSize,
          f = b / (4 * e),
          f = a ? h.ceil(f) : h.max((f | 0) - this._minBufferSize, 0);
      a = f * e;
      b = h.min(4 * a, b);

      if (a) {
        for (var g = 0; g < a; g += e) {
          this._doProcessBlock(d, g);
        }

        g = d.splice(0, a);
        c.sigBytes -= b;
      }

      return new r.init(g, b);
    },
    clone: function clone() {
      var a = m.clone.call(this);
      a._data = this._data.clone();
      return a;
    },
    _minBufferSize: 0
  });

  g.Hasher = u.extend({
    cfg: m.extend(),
    init: function init(a) {
      this.cfg = this.cfg.extend(a);
      this.reset();
    },
    reset: function reset() {
      u.reset.call(this);

      this._doReset();
    },
    update: function update(a) {
      this._append(a);

      this._process();

      return this;
    },
    finalize: function finalize(a) {
      a && this._append(a);
      return this._doFinalize();
    },
    blockSize: 16,
    _createHelper: function _createHelper(a) {
      return function (c, d) {
        return new a.init(d).finalize(c);
      };
    },
    _createHmacHelper: function _createHmacHelper(a) {
      return function (c, d) {
        return new t.HMAC.init(a, d).finalize(c);
      };
    }
  });
  var t = f.algo = {};
  return f;
}(Math);

(function (h) {
  for (var s = CryptoJS, f = s.lib, g = f.WordArray, q = f.Hasher, f = s.algo, m = [], r = [], l = function l(a) {
    return 4294967296 * (a - (a | 0)) | 0;
  }, k = 2, n = 0; 64 > n;) {
    var j;

    a: {
      j = k;

      for (var u = h.sqrt(j), t = 2; t <= u; t++) {
        if (!(j % t)) {
          j = !1;
          break a;
        }
      }

      j = !0;
    }

    j && (8 > n && (m[n] = l(h.pow(k, 0.5))), r[n] = l(h.pow(k, 1 / 3)), n++);
    k++;
  }

  var a = [],
      f = f.SHA256 = q.extend({
    _doReset: function _doReset() {
      this._hash = new g.init(m.slice(0));
    },
    _doProcessBlock: function _doProcessBlock(c, d) {
      for (var b = this._hash.words, e = b[0], f = b[1], g = b[2], j = b[3], h = b[4], m = b[5], n = b[6], q = b[7], p = 0; 64 > p; p++) {
        if (16 > p) a[p] = c[d + p] | 0;else {
          var k = a[p - 15],
              l = a[p - 2];
          a[p] = ((k << 25 | k >>> 7) ^ (k << 14 | k >>> 18) ^ k >>> 3) + a[p - 7] + ((l << 15 | l >>> 17) ^ (l << 13 | l >>> 19) ^ l >>> 10) + a[p - 16];
        }
        k = q + ((h << 26 | h >>> 6) ^ (h << 21 | h >>> 11) ^ (h << 7 | h >>> 25)) + (h & m ^ ~h & n) + r[p] + a[p];
        l = ((e << 30 | e >>> 2) ^ (e << 19 | e >>> 13) ^ (e << 10 | e >>> 22)) + (e & f ^ e & g ^ f & g);
        q = n;
        n = m;
        m = h;
        h = j + k | 0;
        j = g;
        g = f;
        f = e;
        e = k + l | 0;
      }

      b[0] = b[0] + e | 0;
      b[1] = b[1] + f | 0;
      b[2] = b[2] + g | 0;
      b[3] = b[3] + j | 0;
      b[4] = b[4] + h | 0;
      b[5] = b[5] + m | 0;
      b[6] = b[6] + n | 0;
      b[7] = b[7] + q | 0;
    },
    _doFinalize: function _doFinalize() {
      var a = this._data,
          d = a.words,
          b = 8 * this._nDataBytes,
          e = 8 * a.sigBytes;
      d[e >>> 5] |= 128 << 24 - e % 32;
      d[(e + 64 >>> 9 << 4) + 14] = h.floor(b / 4294967296);
      d[(e + 64 >>> 9 << 4) + 15] = b;
      a.sigBytes = 4 * d.length;

      this._process();

      return this._hash;
    },
    clone: function clone() {
      var a = q.clone.call(this);
      a._hash = this._hash.clone();
      return a;
    }
  });
  s.SHA256 = q._createHelper(f);
  s.HmacSHA256 = q._createHmacHelper(f);
})(Math);

(function () {
  var h = CryptoJS,
      s = h.enc.Utf8;
  h.algo.HMAC = h.lib.Base.extend({
    init: function init(f, g) {
      f = this._hasher = new f.init();
      "string" == typeof g && (g = s.parse(g));
      var h = f.blockSize,
          m = 4 * h;
      g.sigBytes > m && (g = f.finalize(g));
      g.clamp();

      for (var r = this._oKey = g.clone(), l = this._iKey = g.clone(), k = r.words, n = l.words, j = 0; j < h; j++) {
        k[j] ^= 1549556828, n[j] ^= 909522486;
      }

      r.sigBytes = l.sigBytes = m;
      this.reset();
    },
    reset: function reset() {
      var f = this._hasher;
      f.reset();
      f.update(this._iKey);
    },
    update: function update(f) {
      this._hasher.update(f);

      return this;
    },
    finalize: function finalize(f) {
      var g = this._hasher;
      f = g.finalize(f);
      g.reset();
      return g.finalize(this._oKey.clone().concat(f));
    }
  });
})();

(function () {
  var u = CryptoJS,
      p = u.lib.WordArray;
  u.enc.Base64 = {
    stringify: function stringify(d) {
      var l = d.words,
          p = d.sigBytes,
          t = this._map;
      d.clamp();
      d = [];

      for (var r = 0; r < p; r += 3) {
        for (var w = (l[r >>> 2] >>> 24 - 8 * (r % 4) & 255) << 16 | (l[r + 1 >>> 2] >>> 24 - 8 * ((r + 1) % 4) & 255) << 8 | l[r + 2 >>> 2] >>> 24 - 8 * ((r + 2) % 4) & 255, v = 0; 4 > v && r + 0.75 * v < p; v++) {
          d.push(t.charAt(w >>> 6 * (3 - v) & 63));
        }
      }

      if (l = t.charAt(64)) for (; d.length % 4;) {
        d.push(l);
      }
      return d.join("");
    },
    parse: function parse(d) {
      var l = d.length,
          s = this._map,
          t = s.charAt(64);
      t && (t = d.indexOf(t), -1 != t && (l = t));

      for (var t = [], r = 0, w = 0; w < l; w++) {
        if (w % 4) {
          var v = s.indexOf(d.charAt(w - 1)) << 2 * (w % 4),
              b = s.indexOf(d.charAt(w)) >>> 6 - 2 * (w % 4);
          t[r >>> 2] |= (v | b) << 24 - 8 * (r % 4);
          r++;
        }
      }

      return p.create(t, r);
    },
    _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
  };
})();

(function (u) {
  function p(b, n, a, c, e, j, k) {
    b = b + (n & a | ~n & c) + e + k;
    return (b << j | b >>> 32 - j) + n;
  }

  function d(b, n, a, c, e, j, k) {
    b = b + (n & c | a & ~c) + e + k;
    return (b << j | b >>> 32 - j) + n;
  }

  function l(b, n, a, c, e, j, k) {
    b = b + (n ^ a ^ c) + e + k;
    return (b << j | b >>> 32 - j) + n;
  }

  function s(b, n, a, c, e, j, k) {
    b = b + (a ^ (n | ~c)) + e + k;
    return (b << j | b >>> 32 - j) + n;
  }

  for (var t = CryptoJS, r = t.lib, w = r.WordArray, v = r.Hasher, r = t.algo, b = [], x = 0; 64 > x; x++) {
    b[x] = 4294967296 * u.abs(u.sin(x + 1)) | 0;
  }

  r = r.MD5 = v.extend({
    _doReset: function _doReset() {
      this._hash = new w.init([1732584193, 4023233417, 2562383102, 271733878]);
    },
    _doProcessBlock: function _doProcessBlock(q, n) {
      for (var a = 0; 16 > a; a++) {
        var c = n + a,
            e = q[c];
        q[c] = (e << 8 | e >>> 24) & 16711935 | (e << 24 | e >>> 8) & 4278255360;
      }

      var a = this._hash.words,
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
          m = s(m, g, h, f, A, 21, b[63]);
      a[0] = a[0] + f | 0;
      a[1] = a[1] + m | 0;
      a[2] = a[2] + g | 0;
      a[3] = a[3] + h | 0;
    },
    _doFinalize: function _doFinalize() {
      var b = this._data,
          n = b.words,
          a = 8 * this._nDataBytes,
          c = 8 * b.sigBytes;
      n[c >>> 5] |= 128 << 24 - c % 32;
      var e = u.floor(a / 4294967296);
      n[(c + 64 >>> 9 << 4) + 15] = (e << 8 | e >>> 24) & 16711935 | (e << 24 | e >>> 8) & 4278255360;
      n[(c + 64 >>> 9 << 4) + 14] = (a << 8 | a >>> 24) & 16711935 | (a << 24 | a >>> 8) & 4278255360;
      b.sigBytes = 4 * (n.length + 1);

      this._process();

      b = this._hash;
      n = b.words;

      for (a = 0; 4 > a; a++) {
        c = n[a], n[a] = (c << 8 | c >>> 24) & 16711935 | (c << 24 | c >>> 8) & 4278255360;
      }

      return b;
    },
    clone: function clone() {
      var b = v.clone.call(this);
      b._hash = this._hash.clone();
      return b;
    }
  });
  t.MD5 = v._createHelper(r);
  t.HmacMD5 = v._createHmacHelper(r);
})(Math);

(function () {
  var u = CryptoJS,
      p = u.lib,
      d = p.Base,
      l = p.WordArray,
      p = u.algo,
      s = p.EvpKDF = d.extend({
    cfg: d.extend({
      keySize: 4,
      hasher: p.MD5,
      iterations: 1
    }),
    init: function init(d) {
      this.cfg = this.cfg.extend(d);
    },
    compute: function compute(d, r) {
      for (var p = this.cfg, s = p.hasher.create(), b = l.create(), u = b.words, q = p.keySize, p = p.iterations; u.length < q;) {
        n && s.update(n);
        var n = s.update(d).finalize(r);
        s.reset();

        for (var a = 1; a < p; a++) {
          n = s.finalize(n), s.reset();
        }

        b.concat(n);
      }

      b.sigBytes = 4 * q;
      return b;
    }
  });

  u.EvpKDF = function (d, l, p) {
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
      v = d.Cipher = t.extend({
    cfg: l.extend(),
    createEncryptor: function createEncryptor(e, a) {
      return this.create(this._ENC_XFORM_MODE, e, a);
    },
    createDecryptor: function createDecryptor(e, a) {
      return this.create(this._DEC_XFORM_MODE, e, a);
    },
    init: function init(e, a, b) {
      this.cfg = this.cfg.extend(b);
      this._xformMode = e;
      this._key = a;
      this.reset();
    },
    reset: function reset() {
      t.reset.call(this);

      this._doReset();
    },
    process: function process(e) {
      this._append(e);

      return this._process();
    },
    finalize: function finalize(e) {
      e && this._append(e);
      return this._doFinalize();
    },
    keySize: 4,
    ivSize: 4,
    _ENC_XFORM_MODE: 1,
    _DEC_XFORM_MODE: 2,
    _createHelper: function _createHelper(e) {
      return {
        encrypt: function encrypt(b, k, d) {
          return ("string" == typeof k ? c : a).encrypt(e, b, k, d);
        },
        decrypt: function decrypt(b, k, d) {
          return ("string" == typeof k ? c : a).decrypt(e, b, k, d);
        }
      };
    }
  });
  d.StreamCipher = v.extend({
    _doFinalize: function _doFinalize() {
      return this._process(!0);
    },
    blockSize: 1
  });

  var b = p.mode = {},
      x = function x(e, a, b) {
    var c = this._iv;
    c ? this._iv = u : c = this._prevBlock;

    for (var d = 0; d < b; d++) {
      e[a + d] ^= c[d];
    }
  },
      q = (d.BlockCipherMode = l.extend({
    createEncryptor: function createEncryptor(e, a) {
      return this.Encryptor.create(e, a);
    },
    createDecryptor: function createDecryptor(e, a) {
      return this.Decryptor.create(e, a);
    },
    init: function init(e, a) {
      this._cipher = e;
      this._iv = a;
    }
  })).extend();

  q.Encryptor = q.extend({
    processBlock: function processBlock(e, a) {
      var b = this._cipher,
          c = b.blockSize;
      x.call(this, e, a, c);
      b.encryptBlock(e, a);
      this._prevBlock = e.slice(a, a + c);
    }
  });
  q.Decryptor = q.extend({
    processBlock: function processBlock(e, a) {
      var b = this._cipher,
          c = b.blockSize,
          d = e.slice(a, a + c);
      b.decryptBlock(e, a);
      x.call(this, e, a, c);
      this._prevBlock = d;
    }
  });
  b = b.CBC = q;
  q = (p.pad = {}).Pkcs7 = {
    pad: function pad(a, b) {
      for (var c = 4 * b, c = c - a.sigBytes % c, d = c << 24 | c << 16 | c << 8 | c, l = [], n = 0; n < c; n += 4) {
        l.push(d);
      }

      c = s.create(l, c);
      a.concat(c);
    },
    unpad: function unpad(a) {
      a.sigBytes -= a.words[a.sigBytes - 1 >>> 2] & 255;
    }
  };
  d.BlockCipher = v.extend({
    cfg: v.cfg.extend({
      mode: b,
      padding: q
    }),
    reset: function reset() {
      v.reset.call(this);
      var a = this.cfg,
          b = a.iv,
          a = a.mode;
      if (this._xformMode == this._ENC_XFORM_MODE) var c = a.createEncryptor;else c = a.createDecryptor, this._minBufferSize = 1;
      this._mode = c.call(a, this, b && b.words);
    },
    _doProcessBlock: function _doProcessBlock(a, b) {
      this._mode.processBlock(a, b);
    },
    _doFinalize: function _doFinalize() {
      var a = this.cfg.padding;

      if (this._xformMode == this._ENC_XFORM_MODE) {
        a.pad(this._data, this.blockSize);

        var b = this._process(!0);
      } else b = this._process(!0), a.unpad(b);

      return b;
    },
    blockSize: 4
  });
  var n = d.CipherParams = l.extend({
    init: function init(a) {
      this.mixIn(a);
    },
    toString: function toString(a) {
      return (a || this.formatter).stringify(this);
    }
  }),
      b = (p.format = {}).OpenSSL = {
    stringify: function stringify(a) {
      var b = a.ciphertext;
      a = a.salt;
      return (a ? s.create([1398893684, 1701076831]).concat(a).concat(b) : b).toString(r);
    },
    parse: function parse(a) {
      a = r.parse(a);
      var b = a.words;

      if (1398893684 == b[0] && 1701076831 == b[1]) {
        var c = s.create(b.slice(2, 4));
        b.splice(0, 4);
        a.sigBytes -= 16;
      }

      return n.create({
        ciphertext: a,
        salt: c
      });
    }
  },
      a = d.SerializableCipher = l.extend({
    cfg: l.extend({
      format: b
    }),
    encrypt: function encrypt(a, b, c, d) {
      d = this.cfg.extend(d);
      var l = a.createEncryptor(c, d);
      b = l.finalize(b);
      l = l.cfg;
      return n.create({
        ciphertext: b,
        key: c,
        iv: l.iv,
        algorithm: a,
        mode: l.mode,
        padding: l.padding,
        blockSize: a.blockSize,
        formatter: d.format
      });
    },
    decrypt: function decrypt(a, b, c, d) {
      d = this.cfg.extend(d);
      b = this._parse(b, d.format);
      return a.createDecryptor(c, d).finalize(b.ciphertext);
    },
    _parse: function _parse(a, b) {
      return "string" == typeof a ? b.parse(a, this) : a;
    }
  }),
      p = (p.kdf = {}).OpenSSL = {
    execute: function execute(a, b, c, d) {
      d || (d = s.random(8));
      a = w.create({
        keySize: b + c
      }).compute(a, d);
      c = s.create(a.words.slice(b), 4 * c);
      a.sigBytes = 4 * b;
      return n.create({
        key: a,
        iv: c,
        salt: d
      });
    }
  },
      c = d.PasswordBasedCipher = a.extend({
    cfg: a.cfg.extend({
      kdf: p
    }),
    encrypt: function encrypt(b, c, d, l) {
      l = this.cfg.extend(l);
      d = l.kdf.execute(d, b.keySize, b.ivSize);
      l.iv = d.iv;
      b = a.encrypt.call(this, b, c, d.key, l);
      b.mixIn(d);
      return b;
    },
    decrypt: function decrypt(b, c, d, l) {
      l = this.cfg.extend(l);
      c = this._parse(c, l.format);
      d = l.kdf.execute(d, b.keySize, b.ivSize, c.salt);
      l.iv = d.iv;
      return a.decrypt.call(this, b, c, d.key, l);
    }
  });
}();

(function () {
  for (var u = CryptoJS, p = u.lib.BlockCipher, d = u.algo, l = [], s = [], t = [], r = [], w = [], v = [], b = [], x = [], q = [], n = [], a = [], c = 0; 256 > c; c++) {
    a[c] = 128 > c ? c << 1 : c << 1 ^ 283;
  }

  for (var e = 0, j = 0, c = 0; 256 > c; c++) {
    var k = j ^ j << 1 ^ j << 2 ^ j << 3 ^ j << 4,
        k = k >>> 8 ^ k & 255 ^ 99;
    l[e] = k;
    s[k] = e;
    var z = a[e],
        F = a[z],
        G = a[F],
        y = 257 * a[k] ^ 16843008 * k;
    t[e] = y << 24 | y >>> 8;
    r[e] = y << 16 | y >>> 16;
    w[e] = y << 8 | y >>> 24;
    v[e] = y;
    y = 16843009 * G ^ 65537 * F ^ 257 * z ^ 16843008 * e;
    b[k] = y << 24 | y >>> 8;
    x[k] = y << 16 | y >>> 16;
    q[k] = y << 8 | y >>> 24;
    n[k] = y;
    e ? (e = z ^ a[a[a[G ^ z]]], j ^= a[a[j]]) : e = j = 1;
  }

  var H = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54],
      d = d.AES = p.extend({
    _doReset: function _doReset() {
      for (var a = this._key, c = a.words, d = a.sigBytes / 4, a = 4 * ((this._nRounds = d + 6) + 1), e = this._keySchedule = [], j = 0; j < a; j++) {
        if (j < d) e[j] = c[j];else {
          var k = e[j - 1];
          j % d ? 6 < d && 4 == j % d && (k = l[k >>> 24] << 24 | l[k >>> 16 & 255] << 16 | l[k >>> 8 & 255] << 8 | l[k & 255]) : (k = k << 8 | k >>> 24, k = l[k >>> 24] << 24 | l[k >>> 16 & 255] << 16 | l[k >>> 8 & 255] << 8 | l[k & 255], k ^= H[j / d | 0] << 24);
          e[j] = e[j - d] ^ k;
        }
      }

      c = this._invKeySchedule = [];

      for (d = 0; d < a; d++) {
        j = a - d, k = d % 4 ? e[j] : e[j - 4], c[d] = 4 > d || 4 >= j ? k : b[l[k >>> 24]] ^ x[l[k >>> 16 & 255]] ^ q[l[k >>> 8 & 255]] ^ n[l[k & 255]];
      }
    },
    encryptBlock: function encryptBlock(a, b) {
      this._doCryptBlock(a, b, this._keySchedule, t, r, w, v, l);
    },
    decryptBlock: function decryptBlock(a, c) {
      var d = a[c + 1];
      a[c + 1] = a[c + 3];
      a[c + 3] = d;

      this._doCryptBlock(a, c, this._invKeySchedule, b, x, q, n, s);

      d = a[c + 1];
      a[c + 1] = a[c + 3];
      a[c + 3] = d;
    },
    _doCryptBlock: function _doCryptBlock(a, b, c, d, e, j, l, f) {
      for (var m = this._nRounds, g = a[b] ^ c[0], h = a[b + 1] ^ c[1], k = a[b + 2] ^ c[2], n = a[b + 3] ^ c[3], p = 4, r = 1; r < m; r++) {
        var q = d[g >>> 24] ^ e[h >>> 16 & 255] ^ j[k >>> 8 & 255] ^ l[n & 255] ^ c[p++],
            s = d[h >>> 24] ^ e[k >>> 16 & 255] ^ j[n >>> 8 & 255] ^ l[g & 255] ^ c[p++],
            t = d[k >>> 24] ^ e[n >>> 16 & 255] ^ j[g >>> 8 & 255] ^ l[h & 255] ^ c[p++],
            n = d[n >>> 24] ^ e[g >>> 16 & 255] ^ j[h >>> 8 & 255] ^ l[k & 255] ^ c[p++],
            g = q,
            h = s,
            k = t;
      }

      q = (f[g >>> 24] << 24 | f[h >>> 16 & 255] << 16 | f[k >>> 8 & 255] << 8 | f[n & 255]) ^ c[p++];
      s = (f[h >>> 24] << 24 | f[k >>> 16 & 255] << 16 | f[n >>> 8 & 255] << 8 | f[g & 255]) ^ c[p++];
      t = (f[k >>> 24] << 24 | f[n >>> 16 & 255] << 16 | f[g >>> 8 & 255] << 8 | f[h & 255]) ^ c[p++];
      n = (f[n >>> 24] << 24 | f[g >>> 16 & 255] << 16 | f[h >>> 8 & 255] << 8 | f[k & 255]) ^ c[p++];
      a[b] = q;
      a[b + 1] = s;
      a[b + 2] = t;
      a[b + 3] = n;
    },
    keySize: 8
  });
  u.AES = p._createHelper(d);
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
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(__webpack_require__(5));

var _createClass2 = _interopRequireDefault(__webpack_require__(6));

var _defineProperty2 = _interopRequireDefault(__webpack_require__(4));

var _flow_interfaces = __webpack_require__(2);

var _categories = _interopRequireDefault(__webpack_require__(10));

var _default = function () {
  function _default() {
    (0, _classCallCheck2["default"])(this, _default);
    (0, _defineProperty2["default"])(this, "_listeners", void 0);
    this._listeners = [];
  }

  (0, _createClass2["default"])(_default, [{
    key: "addListener",
    value: function addListener(newListeners) {
      this._listeners.push(newListeners);
    }
  }, {
    key: "removeListener",
    value: function removeListener(deprecatedListener) {
      var newListeners = [];

      this._listeners.forEach(function (listener) {
        if (listener !== deprecatedListener) newListeners.push(listener);
      });

      this._listeners = newListeners;
    }
  }, {
    key: "removeAllListeners",
    value: function removeAllListeners() {
      this._listeners = [];
    }
  }, {
    key: "announcePresence",
    value: function announcePresence(announce) {
      this._listeners.forEach(function (listener) {
        if (listener.presence) listener.presence(announce);
      });
    }
  }, {
    key: "announceStatus",
    value: function announceStatus(announce) {
      this._listeners.forEach(function (listener) {
        if (listener.status) listener.status(announce);
      });
    }
  }, {
    key: "announceMessage",
    value: function announceMessage(announce) {
      this._listeners.forEach(function (listener) {
        if (listener.message) listener.message(announce);
      });
    }
  }, {
    key: "announceSignal",
    value: function announceSignal(announce) {
      this._listeners.forEach(function (listener) {
        if (listener.signal) listener.signal(announce);
      });
    }
  }, {
    key: "announceMessageAction",
    value: function announceMessageAction(announce) {
      this._listeners.forEach(function (listener) {
        if (listener.messageAction) listener.messageAction(announce);
      });
    }
  }, {
    key: "announceFile",
    value: function announceFile(announce) {
      this._listeners.forEach(function (listener) {
        if (listener.file) listener.file(announce);
      });
    }
  }, {
    key: "announceObjects",
    value: function announceObjects(announce) {
      this._listeners.forEach(function (listener) {
        if (listener.objects) listener.objects(announce);
      });
    }
  }, {
    key: "announceUser",
    value: function announceUser(announce) {
      this._listeners.forEach(function (listener) {
        if (listener.user) listener.user(announce);
      });
    }
  }, {
    key: "announceSpace",
    value: function announceSpace(announce) {
      this._listeners.forEach(function (listener) {
        if (listener.space) listener.space(announce);
      });
    }
  }, {
    key: "announceMembership",
    value: function announceMembership(announce) {
      this._listeners.forEach(function (listener) {
        if (listener.membership) listener.membership(announce);
      });
    }
  }, {
    key: "announceNetworkUp",
    value: function announceNetworkUp() {
      var networkStatus = {};
      networkStatus.category = _categories["default"].PNNetworkUpCategory;
      this.announceStatus(networkStatus);
    }
  }, {
    key: "announceNetworkDown",
    value: function announceNetworkDown() {
      var networkStatus = {};
      networkStatus.category = _categories["default"].PNNetworkDownCategory;
      this.announceStatus(networkStatus);
    }
  }]);
  return _default;
}();

exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

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

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

function getOperation() {
  return _operations["default"].PNTimeOperation;
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
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(__webpack_require__(5));

var _inherits2 = _interopRequireDefault(__webpack_require__(14));

var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(16));

var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(13));

var _typeof2 = _interopRequireDefault(__webpack_require__(7));

var _cborJs = _interopRequireDefault(__webpack_require__(28));

var _pubnubCommon = _interopRequireDefault(__webpack_require__(29));

var _networking = _interopRequireDefault(__webpack_require__(121));

var _hmacSha = _interopRequireDefault(__webpack_require__(22));

var _web = _interopRequireDefault(__webpack_require__(122));

var _common = _interopRequireDefault(__webpack_require__(123));

var _webNode = __webpack_require__(124);

var _flow_interfaces = __webpack_require__(2);

var _web2 = _interopRequireDefault(__webpack_require__(131));

var _web3 = _interopRequireDefault(__webpack_require__(132));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function sendBeacon(url) {
  if (navigator && navigator.sendBeacon) {
    navigator.sendBeacon(url);
  } else {
    return false;
  }
}

function base64ToBinary(base64String) {
  var parsedWordArray = _hmacSha["default"].enc.Base64.parse(base64String).words;

  var arrayBuffer = new ArrayBuffer(parsedWordArray.length * 4);
  var view = new Uint8Array(arrayBuffer);
  var filledArrayBuffer = null;
  var zeroBytesCount = 0;
  var byteOffset = 0;

  for (var wordIdx = 0; wordIdx < parsedWordArray.length; wordIdx += 1) {
    var word = parsedWordArray[wordIdx];
    byteOffset = wordIdx * 4;
    view[byteOffset] = (word & 0xff000000) >> 24;
    view[byteOffset + 1] = (word & 0x00ff0000) >> 16;
    view[byteOffset + 2] = (word & 0x0000ff00) >> 8;
    view[byteOffset + 3] = word & 0x000000ff;
  }

  for (var byteIdx = byteOffset + 3; byteIdx >= byteOffset; byteIdx -= 1) {
    if (view[byteIdx] === 0) {
      zeroBytesCount += 1;
    }
  }

  if (zeroBytesCount > 0) {
    filledArrayBuffer = view.buffer.slice(0, view.byteLength - zeroBytesCount);
  } else {
    filledArrayBuffer = view.buffer;
  }

  return filledArrayBuffer;
}

function stringifyBufferKeys(obj) {
  var isObject = function isObject(value) {
    return value && (0, _typeof2["default"])(value) === 'object' && value.constructor === Object;
  };

  var isString = function isString(value) {
    return typeof value === 'string' || value instanceof String;
  };

  var isNumber = function isNumber(value) {
    return typeof value === 'number' && isFinite(value);
  };

  if (!isObject(obj)) {
    return obj;
  }

  var normalizedObject = {};
  Object.keys(obj).forEach(function (key) {
    var keyIsString = isString(key);
    var stringifiedKey = key;
    var value = obj[key];

    if (Array.isArray(key) || keyIsString && key.indexOf(',') >= 0) {
      var bytes = keyIsString ? key.split(',') : key;
      stringifiedKey = bytes.reduce(function (string, _byte) {
        string += String.fromCharCode(_byte);
        return string;
      }, '');
    } else if (isNumber(key) || keyIsString && !isNaN(key)) {
      stringifiedKey = String.fromCharCode(keyIsString ? parseInt(key, 10) : 10);
    }

    normalizedObject[stringifiedKey] = isObject(value) ? stringifyBufferKeys(value) : value;
  });
  return normalizedObject;
}

var _default = function (_PubNubCore) {
  (0, _inherits2["default"])(_default, _PubNubCore);

  var _super = _createSuper(_default);

  function _default(setup) {
    var _this;

    (0, _classCallCheck2["default"])(this, _default);
    var _setup$listenToBrowse = setup.listenToBrowserNetworkEvents,
        listenToBrowserNetworkEvents = _setup$listenToBrowse === void 0 ? true : _setup$listenToBrowse;
    setup.db = _web["default"];
    setup.sdkFamily = 'Web';
    setup.networking = new _networking["default"]({
      del: _webNode.del,
      get: _webNode.get,
      post: _webNode.post,
      patch: _webNode.patch,
      sendBeacon: sendBeacon,
      getfile: _webNode.getfile,
      postfile: _webNode.postfile
    });
    setup.cbor = new _common["default"](function (arrayBuffer) {
      return stringifyBufferKeys(_cborJs["default"].decode(arrayBuffer));
    }, base64ToBinary);
    setup.PubNubFile = _web3["default"];
    setup.cryptography = new _web2["default"]();
    _this = _super.call(this, setup);

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

  return _default;
}(_pubnubCommon["default"]);

exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Patrick Gansterer <paroga@paroga.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function(global, undefined) { "use strict";
var POW_2_24 = Math.pow(2, -24),
    POW_2_32 = Math.pow(2, 32),
    POW_2_53 = Math.pow(2, 53);

function encode(value) {
  var data = new ArrayBuffer(256);
  var dataView = new DataView(data);
  var lastLength;
  var offset = 0;

  function ensureSpace(length) {
    var newByteLength = data.byteLength;
    var requiredLength = offset + length;
    while (newByteLength < requiredLength)
      newByteLength *= 2;
    if (newByteLength !== data.byteLength) {
      var oldDataView = dataView;
      data = new ArrayBuffer(newByteLength);
      dataView = new DataView(data);
      var uint32count = (offset + 3) >> 2;
      for (var i = 0; i < uint32count; ++i)
        dataView.setUint32(i * 4, oldDataView.getUint32(i * 4));
    }

    lastLength = length;
    return dataView;
  }
  function write() {
    offset += lastLength;
  }
  function writeFloat64(value) {
    write(ensureSpace(8).setFloat64(offset, value));
  }
  function writeUint8(value) {
    write(ensureSpace(1).setUint8(offset, value));
  }
  function writeUint8Array(value) {
    var dataView = ensureSpace(value.length);
    for (var i = 0; i < value.length; ++i)
      dataView.setUint8(offset + i, value[i]);
    write();
  }
  function writeUint16(value) {
    write(ensureSpace(2).setUint16(offset, value));
  }
  function writeUint32(value) {
    write(ensureSpace(4).setUint32(offset, value));
  }
  function writeUint64(value) {
    var low = value % POW_2_32;
    var high = (value - low) / POW_2_32;
    var dataView = ensureSpace(8);
    dataView.setUint32(offset, high);
    dataView.setUint32(offset + 4, low);
    write();
  }
  function writeTypeAndLength(type, length) {
    if (length < 24) {
      writeUint8(type << 5 | length);
    } else if (length < 0x100) {
      writeUint8(type << 5 | 24);
      writeUint8(length);
    } else if (length < 0x10000) {
      writeUint8(type << 5 | 25);
      writeUint16(length);
    } else if (length < 0x100000000) {
      writeUint8(type << 5 | 26);
      writeUint32(length);
    } else {
      writeUint8(type << 5 | 27);
      writeUint64(length);
    }
  }
  
  function encodeItem(value) {
    var i;

    if (value === false)
      return writeUint8(0xf4);
    if (value === true)
      return writeUint8(0xf5);
    if (value === null)
      return writeUint8(0xf6);
    if (value === undefined)
      return writeUint8(0xf7);
  
    switch (typeof value) {
      case "number":
        if (Math.floor(value) === value) {
          if (0 <= value && value <= POW_2_53)
            return writeTypeAndLength(0, value);
          if (-POW_2_53 <= value && value < 0)
            return writeTypeAndLength(1, -(value + 1));
        }
        writeUint8(0xfb);
        return writeFloat64(value);

      case "string":
        var utf8data = [];
        for (i = 0; i < value.length; ++i) {
          var charCode = value.charCodeAt(i);
          if (charCode < 0x80) {
            utf8data.push(charCode);
          } else if (charCode < 0x800) {
            utf8data.push(0xc0 | charCode >> 6);
            utf8data.push(0x80 | charCode & 0x3f);
          } else if (charCode < 0xd800) {
            utf8data.push(0xe0 | charCode >> 12);
            utf8data.push(0x80 | (charCode >> 6)  & 0x3f);
            utf8data.push(0x80 | charCode & 0x3f);
          } else {
            charCode = (charCode & 0x3ff) << 10;
            charCode |= value.charCodeAt(++i) & 0x3ff;
            charCode += 0x10000;

            utf8data.push(0xf0 | charCode >> 18);
            utf8data.push(0x80 | (charCode >> 12)  & 0x3f);
            utf8data.push(0x80 | (charCode >> 6)  & 0x3f);
            utf8data.push(0x80 | charCode & 0x3f);
          }
        }

        writeTypeAndLength(3, utf8data.length);
        return writeUint8Array(utf8data);

      default:
        var length;
        if (Array.isArray(value)) {
          length = value.length;
          writeTypeAndLength(4, length);
          for (i = 0; i < length; ++i)
            encodeItem(value[i]);
        } else if (value instanceof Uint8Array) {
          writeTypeAndLength(2, value.length);
          writeUint8Array(value);
        } else {
          var keys = Object.keys(value);
          length = keys.length;
          writeTypeAndLength(5, length);
          for (i = 0; i < length; ++i) {
            var key = keys[i];
            encodeItem(key);
            encodeItem(value[key]);
          }
        }
    }
  }
  
  encodeItem(value);

  if ("slice" in data)
    return data.slice(0, offset);
  
  var ret = new ArrayBuffer(offset);
  var retView = new DataView(ret);
  for (var i = 0; i < offset; ++i)
    retView.setUint8(i, dataView.getUint8(i));
  return ret;
}

function decode(data, tagger, simpleValue) {
  var dataView = new DataView(data);
  var offset = 0;
  
  if (typeof tagger !== "function")
    tagger = function(value) { return value; };
  if (typeof simpleValue !== "function")
    simpleValue = function() { return undefined; };

  function read(value, length) {
    offset += length;
    return value;
  }
  function readArrayBuffer(length) {
    return read(new Uint8Array(data, offset, length), length);
  }
  function readFloat16() {
    var tempArrayBuffer = new ArrayBuffer(4);
    var tempDataView = new DataView(tempArrayBuffer);
    var value = readUint16();

    var sign = value & 0x8000;
    var exponent = value & 0x7c00;
    var fraction = value & 0x03ff;
    
    if (exponent === 0x7c00)
      exponent = 0xff << 10;
    else if (exponent !== 0)
      exponent += (127 - 15) << 10;
    else if (fraction !== 0)
      return fraction * POW_2_24;
    
    tempDataView.setUint32(0, sign << 16 | exponent << 13 | fraction << 13);
    return tempDataView.getFloat32(0);
  }
  function readFloat32() {
    return read(dataView.getFloat32(offset), 4);
  }
  function readFloat64() {
    return read(dataView.getFloat64(offset), 8);
  }
  function readUint8() {
    return read(dataView.getUint8(offset), 1);
  }
  function readUint16() {
    return read(dataView.getUint16(offset), 2);
  }
  function readUint32() {
    return read(dataView.getUint32(offset), 4);
  }
  function readUint64() {
    return readUint32() * POW_2_32 + readUint32();
  }
  function readBreak() {
    if (dataView.getUint8(offset) !== 0xff)
      return false;
    offset += 1;
    return true;
  }
  function readLength(additionalInformation) {
    if (additionalInformation < 24)
      return additionalInformation;
    if (additionalInformation === 24)
      return readUint8();
    if (additionalInformation === 25)
      return readUint16();
    if (additionalInformation === 26)
      return readUint32();
    if (additionalInformation === 27)
      return readUint64();
    if (additionalInformation === 31)
      return -1;
    throw "Invalid length encoding";
  }
  function readIndefiniteStringLength(majorType) {
    var initialByte = readUint8();
    if (initialByte === 0xff)
      return -1;
    var length = readLength(initialByte & 0x1f);
    if (length < 0 || (initialByte >> 5) !== majorType)
      throw "Invalid indefinite length element";
    return length;
  }

  function appendUtf16data(utf16data, length) {
    for (var i = 0; i < length; ++i) {
      var value = readUint8();
      if (value & 0x80) {
        if (value < 0xe0) {
          value = (value & 0x1f) <<  6
                | (readUint8() & 0x3f);
          length -= 1;
        } else if (value < 0xf0) {
          value = (value & 0x0f) << 12
                | (readUint8() & 0x3f) << 6
                | (readUint8() & 0x3f);
          length -= 2;
        } else {
          value = (value & 0x0f) << 18
                | (readUint8() & 0x3f) << 12
                | (readUint8() & 0x3f) << 6
                | (readUint8() & 0x3f);
          length -= 3;
        }
      }

      if (value < 0x10000) {
        utf16data.push(value);
      } else {
        value -= 0x10000;
        utf16data.push(0xd800 | (value >> 10));
        utf16data.push(0xdc00 | (value & 0x3ff));
      }
    }
  }

  function decodeItem() {
    var initialByte = readUint8();
    var majorType = initialByte >> 5;
    var additionalInformation = initialByte & 0x1f;
    var i;
    var length;

    if (majorType === 7) {
      switch (additionalInformation) {
        case 25:
          return readFloat16();
        case 26:
          return readFloat32();
        case 27:
          return readFloat64();
      }
    }

    length = readLength(additionalInformation);
    if (length < 0 && (majorType < 2 || 6 < majorType))
      throw "Invalid length";

    switch (majorType) {
      case 0:
        return length;
      case 1:
        return -1 - length;
      case 2:
        if (length < 0) {
          var elements = [];
          var fullArrayLength = 0;
          while ((length = readIndefiniteStringLength(majorType)) >= 0) {
            fullArrayLength += length;
            elements.push(readArrayBuffer(length));
          }
          var fullArray = new Uint8Array(fullArrayLength);
          var fullArrayOffset = 0;
          for (i = 0; i < elements.length; ++i) {
            fullArray.set(elements[i], fullArrayOffset);
            fullArrayOffset += elements[i].length;
          }
          return fullArray;
        }
        return readArrayBuffer(length);
      case 3:
        var utf16data = [];
        if (length < 0) {
          while ((length = readIndefiniteStringLength(majorType)) >= 0)
            appendUtf16data(utf16data, length);
        } else
          appendUtf16data(utf16data, length);
        return String.fromCharCode.apply(null, utf16data);
      case 4:
        var retArray;
        if (length < 0) {
          retArray = [];
          while (!readBreak())
            retArray.push(decodeItem());
        } else {
          retArray = new Array(length);
          for (i = 0; i < length; ++i)
            retArray[i] = decodeItem();
        }
        return retArray;
      case 5:
        var retObject = {};
        for (i = 0; i < length || length < 0 && !readBreak(); ++i) {
          var key = decodeItem();
          retObject[key] = decodeItem();
        }
        return retObject;
      case 6:
        return tagger(decodeItem(), length);
      case 7:
        switch (length) {
          case 20:
            return false;
          case 21:
            return true;
          case 22:
            return null;
          case 23:
            return undefined;
          default:
            return simpleValue(length);
        }
    }
  }

  var ret = decodeItem();
  if (offset !== data.byteLength)
    throw "Remaining bytes";
  return ret;
}

var obj = { encode: encode, decode: decode };

if (true)
  !(__WEBPACK_AMD_DEFINE_FACTORY__ = (obj),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
				__WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
else {}

})(this);


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireWildcard = __webpack_require__(30);

var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(__webpack_require__(5));

var _createClass2 = _interopRequireDefault(__webpack_require__(6));

var _defineProperty2 = _interopRequireDefault(__webpack_require__(4));

var _config = _interopRequireDefault(__webpack_require__(8));

var _index = _interopRequireDefault(__webpack_require__(20));

var _subscription_manager = _interopRequireDefault(__webpack_require__(36));

var _telemetry_manager = _interopRequireDefault(__webpack_require__(40));

var _push_payload = _interopRequireDefault(__webpack_require__(41));

var _listener_manager = _interopRequireDefault(__webpack_require__(23));

var _token_manager = _interopRequireDefault(__webpack_require__(44));

var _endpoint = _interopRequireDefault(__webpack_require__(18));

var _utils = __webpack_require__(3);

var addChannelsChannelGroupConfig = _interopRequireWildcard(__webpack_require__(49));

var removeChannelsChannelGroupConfig = _interopRequireWildcard(__webpack_require__(50));

var deleteChannelGroupConfig = _interopRequireWildcard(__webpack_require__(51));

var listChannelGroupsConfig = _interopRequireWildcard(__webpack_require__(52));

var listChannelsInChannelGroupConfig = _interopRequireWildcard(__webpack_require__(53));

var addPushChannelsConfig = _interopRequireWildcard(__webpack_require__(54));

var removePushChannelsConfig = _interopRequireWildcard(__webpack_require__(55));

var listPushChannelsConfig = _interopRequireWildcard(__webpack_require__(56));

var removeDevicePushConfig = _interopRequireWildcard(__webpack_require__(57));

var presenceLeaveEndpointConfig = _interopRequireWildcard(__webpack_require__(58));

var presenceWhereNowEndpointConfig = _interopRequireWildcard(__webpack_require__(59));

var presenceHeartbeatEndpointConfig = _interopRequireWildcard(__webpack_require__(60));

var presenceGetStateConfig = _interopRequireWildcard(__webpack_require__(61));

var presenceSetStateConfig = _interopRequireWildcard(__webpack_require__(62));

var presenceHereNowConfig = _interopRequireWildcard(__webpack_require__(63));

var addMessageActionEndpointConfig = _interopRequireWildcard(__webpack_require__(64));

var removeMessageActionEndpointConfig = _interopRequireWildcard(__webpack_require__(65));

var getMessageActionEndpointConfig = _interopRequireWildcard(__webpack_require__(66));

var _file = __webpack_require__(25);

var fileUploadTypes = _interopRequireWildcard(__webpack_require__(67));

var _list_files = _interopRequireDefault(__webpack_require__(68));

var _generate_upload_url = _interopRequireDefault(__webpack_require__(69));

var _publish_file = _interopRequireDefault(__webpack_require__(70));

var _send_file = _interopRequireDefault(__webpack_require__(71));

var _get_file_url = _interopRequireDefault(__webpack_require__(73));

var _download_file = _interopRequireDefault(__webpack_require__(74));

var _delete_file = _interopRequireDefault(__webpack_require__(75));

var _get_all = _interopRequireDefault(__webpack_require__(76));

var _get = _interopRequireDefault(__webpack_require__(82));

var _set = _interopRequireDefault(__webpack_require__(83));

var _remove = _interopRequireDefault(__webpack_require__(84));

var _get_all2 = _interopRequireDefault(__webpack_require__(85));

var _get2 = _interopRequireDefault(__webpack_require__(86));

var _set2 = _interopRequireDefault(__webpack_require__(87));

var _remove2 = _interopRequireDefault(__webpack_require__(88));

var _get3 = _interopRequireDefault(__webpack_require__(89));

var _set3 = _interopRequireDefault(__webpack_require__(90));

var _get4 = _interopRequireDefault(__webpack_require__(91));

var _set4 = _interopRequireDefault(__webpack_require__(92));

var createUserEndpointConfig = _interopRequireWildcard(__webpack_require__(93));

var updateUserEndpointConfig = _interopRequireWildcard(__webpack_require__(94));

var deleteUserEndpointConfig = _interopRequireWildcard(__webpack_require__(95));

var getUserEndpointConfig = _interopRequireWildcard(__webpack_require__(96));

var getUsersEndpointConfig = _interopRequireWildcard(__webpack_require__(97));

var createSpaceEndpointConfig = _interopRequireWildcard(__webpack_require__(98));

var updateSpaceEndpointConfig = _interopRequireWildcard(__webpack_require__(99));

var deleteSpaceEndpointConfig = _interopRequireWildcard(__webpack_require__(100));

var getSpacesEndpointConfig = _interopRequireWildcard(__webpack_require__(101));

var getSpaceEndpointConfig = _interopRequireWildcard(__webpack_require__(102));

var getMembersEndpointConfig = _interopRequireWildcard(__webpack_require__(103));

var addMembersEndpointConfig = _interopRequireWildcard(__webpack_require__(104));

var updateMembersEndpointConfig = _interopRequireWildcard(__webpack_require__(105));

var removeMembersEndpointConfig = _interopRequireWildcard(__webpack_require__(106));

var getMembershipsEndpointConfig = _interopRequireWildcard(__webpack_require__(107));

var updateMembershipsEndpointConfig = _interopRequireWildcard(__webpack_require__(108));

var joinSpacesEndpointConfig = _interopRequireWildcard(__webpack_require__(109));

var leaveSpacesEndpointConfig = _interopRequireWildcard(__webpack_require__(110));

var auditEndpointConfig = _interopRequireWildcard(__webpack_require__(111));

var grantEndpointConfig = _interopRequireWildcard(__webpack_require__(112));

var grantTokenEndpointConfig = _interopRequireWildcard(__webpack_require__(113));

var publishEndpointConfig = _interopRequireWildcard(__webpack_require__(114));

var signalEndpointConfig = _interopRequireWildcard(__webpack_require__(115));

var historyEndpointConfig = _interopRequireWildcard(__webpack_require__(116));

var deleteMessagesEndpointConfig = _interopRequireWildcard(__webpack_require__(117));

var messageCountsEndpointConfig = _interopRequireWildcard(__webpack_require__(118));

var fetchMessagesEndpointConfig = _interopRequireWildcard(__webpack_require__(119));

var timeEndpointConfig = _interopRequireWildcard(__webpack_require__(24));

var subscribeEndpointConfig = _interopRequireWildcard(__webpack_require__(120));

var _operations = _interopRequireDefault(__webpack_require__(1));

var _categories = _interopRequireDefault(__webpack_require__(10));

var _flow_interfaces = __webpack_require__(2);

var _uuid = _interopRequireDefault(__webpack_require__(17));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var _default = function () {
  function _default(setup) {
    var _this = this;

    (0, _classCallCheck2["default"])(this, _default);
    (0, _defineProperty2["default"])(this, "_config", void 0);
    (0, _defineProperty2["default"])(this, "_telemetryManager", void 0);
    (0, _defineProperty2["default"])(this, "_listenerManager", void 0);
    (0, _defineProperty2["default"])(this, "_tokenManager", void 0);
    (0, _defineProperty2["default"])(this, "time", void 0);
    (0, _defineProperty2["default"])(this, "publish", void 0);
    (0, _defineProperty2["default"])(this, "fire", void 0);
    (0, _defineProperty2["default"])(this, "history", void 0);
    (0, _defineProperty2["default"])(this, "deleteMessages", void 0);
    (0, _defineProperty2["default"])(this, "messageCounts", void 0);
    (0, _defineProperty2["default"])(this, "fetchMessages", void 0);
    (0, _defineProperty2["default"])(this, "channelGroups", void 0);
    (0, _defineProperty2["default"])(this, "push", void 0);
    (0, _defineProperty2["default"])(this, "hereNow", void 0);
    (0, _defineProperty2["default"])(this, "whereNow", void 0);
    (0, _defineProperty2["default"])(this, "getState", void 0);
    (0, _defineProperty2["default"])(this, "setState", void 0);
    (0, _defineProperty2["default"])(this, "grant", void 0);
    (0, _defineProperty2["default"])(this, "grantToken", void 0);
    (0, _defineProperty2["default"])(this, "audit", void 0);
    (0, _defineProperty2["default"])(this, "subscribe", void 0);
    (0, _defineProperty2["default"])(this, "signal", void 0);
    (0, _defineProperty2["default"])(this, "presence", void 0);
    (0, _defineProperty2["default"])(this, "unsubscribe", void 0);
    (0, _defineProperty2["default"])(this, "unsubscribeAll", void 0);
    (0, _defineProperty2["default"])(this, "addMessageAction", void 0);
    (0, _defineProperty2["default"])(this, "removeMessageAction", void 0);
    (0, _defineProperty2["default"])(this, "getMessageActions", void 0);
    (0, _defineProperty2["default"])(this, "File", void 0);
    (0, _defineProperty2["default"])(this, "encryptFile", void 0);
    (0, _defineProperty2["default"])(this, "decryptFile", void 0);
    (0, _defineProperty2["default"])(this, "listFiles", void 0);
    (0, _defineProperty2["default"])(this, "sendFile", void 0);
    (0, _defineProperty2["default"])(this, "downloadFile", void 0);
    (0, _defineProperty2["default"])(this, "getFileUrl", void 0);
    (0, _defineProperty2["default"])(this, "deleteFile", void 0);
    (0, _defineProperty2["default"])(this, "publishFile", void 0);
    (0, _defineProperty2["default"])(this, "objects", void 0);
    (0, _defineProperty2["default"])(this, "createUser", void 0);
    (0, _defineProperty2["default"])(this, "updateUser", void 0);
    (0, _defineProperty2["default"])(this, "deleteUser", void 0);
    (0, _defineProperty2["default"])(this, "getUser", void 0);
    (0, _defineProperty2["default"])(this, "getUsers", void 0);
    (0, _defineProperty2["default"])(this, "createSpace", void 0);
    (0, _defineProperty2["default"])(this, "updateSpace", void 0);
    (0, _defineProperty2["default"])(this, "deleteSpace", void 0);
    (0, _defineProperty2["default"])(this, "getSpaces", void 0);
    (0, _defineProperty2["default"])(this, "getSpace", void 0);
    (0, _defineProperty2["default"])(this, "getMembers", void 0);
    (0, _defineProperty2["default"])(this, "addMembers", void 0);
    (0, _defineProperty2["default"])(this, "updateMembers", void 0);
    (0, _defineProperty2["default"])(this, "removeMembers", void 0);
    (0, _defineProperty2["default"])(this, "getMemberships", void 0);
    (0, _defineProperty2["default"])(this, "joinSpaces", void 0);
    (0, _defineProperty2["default"])(this, "updateMemberships", void 0);
    (0, _defineProperty2["default"])(this, "leaveSpaces", void 0);
    (0, _defineProperty2["default"])(this, "disconnect", void 0);
    (0, _defineProperty2["default"])(this, "reconnect", void 0);
    (0, _defineProperty2["default"])(this, "destroy", void 0);
    (0, _defineProperty2["default"])(this, "stop", void 0);
    (0, _defineProperty2["default"])(this, "getSubscribedChannels", void 0);
    (0, _defineProperty2["default"])(this, "getSubscribedChannelGroups", void 0);
    (0, _defineProperty2["default"])(this, "addListener", void 0);
    (0, _defineProperty2["default"])(this, "removeListener", void 0);
    (0, _defineProperty2["default"])(this, "removeAllListeners", void 0);
    (0, _defineProperty2["default"])(this, "parseToken", void 0);
    (0, _defineProperty2["default"])(this, "setToken", void 0);
    (0, _defineProperty2["default"])(this, "setTokens", void 0);
    (0, _defineProperty2["default"])(this, "getToken", void 0);
    (0, _defineProperty2["default"])(this, "getTokens", void 0);
    (0, _defineProperty2["default"])(this, "clearTokens", void 0);
    (0, _defineProperty2["default"])(this, "getAuthKey", void 0);
    (0, _defineProperty2["default"])(this, "setAuthKey", void 0);
    (0, _defineProperty2["default"])(this, "setCipherKey", void 0);
    (0, _defineProperty2["default"])(this, "setUUID", void 0);
    (0, _defineProperty2["default"])(this, "getUUID", void 0);
    (0, _defineProperty2["default"])(this, "getFilterExpression", void 0);
    (0, _defineProperty2["default"])(this, "setFilterExpression", void 0);
    (0, _defineProperty2["default"])(this, "setHeartbeatInterval", void 0);
    (0, _defineProperty2["default"])(this, "setProxy", void 0);
    (0, _defineProperty2["default"])(this, "encrypt", void 0);
    (0, _defineProperty2["default"])(this, "decrypt", void 0);
    var db = setup.db,
        networking = setup.networking,
        cbor = setup.cbor;
    var config = this._config = new _config["default"]({
      setup: setup,
      db: db
    });
    var crypto = new _index["default"]({
      config: config
    });
    var cryptography = setup.cryptography;
    networking.init(config);
    var tokenManager = this._tokenManager = new _token_manager["default"](config, cbor);
    var telemetryManager = this._telemetryManager = new _telemetry_manager["default"]({
      maximumSamplesCount: 60000
    });
    var modules = {
      config: config,
      networking: networking,
      crypto: crypto,
      cryptography: cryptography,
      tokenManager: tokenManager,
      telemetryManager: telemetryManager,
      PubNubFile: setup.PubNubFile
    };
    this.File = setup.PubNubFile;

    this.encryptFile = function (key, file) {
      return cryptography.encryptFile(key, file, _this.File);
    };

    this.decryptFile = function (key, file) {
      return cryptography.decryptFile(key, file, _this.File);
    };

    var timeEndpoint = _endpoint["default"].bind(this, modules, timeEndpointConfig);

    var leaveEndpoint = _endpoint["default"].bind(this, modules, presenceLeaveEndpointConfig);

    var heartbeatEndpoint = _endpoint["default"].bind(this, modules, presenceHeartbeatEndpointConfig);

    var setStateEndpoint = _endpoint["default"].bind(this, modules, presenceSetStateConfig);

    var subscribeEndpoint = _endpoint["default"].bind(this, modules, subscribeEndpointConfig);

    var listenerManager = this._listenerManager = new _listener_manager["default"]();
    var subscriptionManager = new _subscription_manager["default"]({
      timeEndpoint: timeEndpoint,
      leaveEndpoint: leaveEndpoint,
      heartbeatEndpoint: heartbeatEndpoint,
      setStateEndpoint: setStateEndpoint,
      subscribeEndpoint: subscribeEndpoint,
      crypto: modules.crypto,
      config: modules.config,
      listenerManager: listenerManager,
      getFileUrl: function getFileUrl(params) {
        return (0, _get_file_url["default"])(modules, params);
      }
    });
    this.addListener = listenerManager.addListener.bind(listenerManager);
    this.removeListener = listenerManager.removeListener.bind(listenerManager);
    this.removeAllListeners = listenerManager.removeAllListeners.bind(listenerManager);
    this.parseToken = tokenManager.parseToken.bind(tokenManager);
    this.setToken = tokenManager.setToken.bind(tokenManager);
    this.setTokens = tokenManager.setTokens.bind(tokenManager);
    this.getToken = tokenManager.getToken.bind(tokenManager);
    this.getTokens = tokenManager.getTokens.bind(tokenManager);
    this.clearTokens = tokenManager.clearTokens.bind(tokenManager);
    this.channelGroups = {
      listGroups: _endpoint["default"].bind(this, modules, listChannelGroupsConfig),
      listChannels: _endpoint["default"].bind(this, modules, listChannelsInChannelGroupConfig),
      addChannels: _endpoint["default"].bind(this, modules, addChannelsChannelGroupConfig),
      removeChannels: _endpoint["default"].bind(this, modules, removeChannelsChannelGroupConfig),
      deleteGroup: _endpoint["default"].bind(this, modules, deleteChannelGroupConfig)
    };
    this.push = {
      addChannels: _endpoint["default"].bind(this, modules, addPushChannelsConfig),
      removeChannels: _endpoint["default"].bind(this, modules, removePushChannelsConfig),
      deleteDevice: _endpoint["default"].bind(this, modules, removeDevicePushConfig),
      listChannels: _endpoint["default"].bind(this, modules, listPushChannelsConfig)
    };
    this.hereNow = _endpoint["default"].bind(this, modules, presenceHereNowConfig);
    this.whereNow = _endpoint["default"].bind(this, modules, presenceWhereNowEndpointConfig);
    this.getState = _endpoint["default"].bind(this, modules, presenceGetStateConfig);
    this.setState = subscriptionManager.adaptStateChange.bind(subscriptionManager);
    this.grant = _endpoint["default"].bind(this, modules, grantEndpointConfig);
    this.grantToken = _endpoint["default"].bind(this, modules, grantTokenEndpointConfig);
    this.audit = _endpoint["default"].bind(this, modules, auditEndpointConfig);
    this.publish = _endpoint["default"].bind(this, modules, publishEndpointConfig);

    this.fire = function (args, callback) {
      args.replicate = false;
      args.storeInHistory = false;
      return _this.publish(args, callback);
    };

    this.signal = _endpoint["default"].bind(this, modules, signalEndpointConfig);
    this.history = _endpoint["default"].bind(this, modules, historyEndpointConfig);
    this.deleteMessages = _endpoint["default"].bind(this, modules, deleteMessagesEndpointConfig);
    this.messageCounts = _endpoint["default"].bind(this, modules, messageCountsEndpointConfig);
    this.fetchMessages = _endpoint["default"].bind(this, modules, fetchMessagesEndpointConfig);
    this.addMessageAction = _endpoint["default"].bind(this, modules, addMessageActionEndpointConfig);
    this.removeMessageAction = _endpoint["default"].bind(this, modules, removeMessageActionEndpointConfig);
    this.getMessageActions = _endpoint["default"].bind(this, modules, getMessageActionEndpointConfig);
    this.listFiles = _endpoint["default"].bind(this, modules, _list_files["default"]);

    var generateUploadUrl = _endpoint["default"].bind(this, modules, _generate_upload_url["default"]);

    this.publishFile = _endpoint["default"].bind(this, modules, _publish_file["default"]);
    this.sendFile = (0, _send_file["default"])({
      generateUploadUrl: generateUploadUrl,
      publishFile: this.publishFile,
      modules: modules
    });

    this.getFileUrl = function (params) {
      return (0, _get_file_url["default"])(modules, params);
    };

    this.downloadFile = _endpoint["default"].bind(this, modules, _download_file["default"]);
    this.deleteFile = _endpoint["default"].bind(this, modules, _delete_file["default"]);
    this.objects = {
      getAllUUIDMetadata: _endpoint["default"].bind(this, modules, _get_all["default"]),
      getUUIDMetadata: _endpoint["default"].bind(this, modules, _get["default"]),
      setUUIDMetadata: _endpoint["default"].bind(this, modules, _set["default"]),
      removeUUIDMetadata: _endpoint["default"].bind(this, modules, _remove["default"]),
      getAllChannelMetadata: _endpoint["default"].bind(this, modules, _get_all2["default"]),
      getChannelMetadata: _endpoint["default"].bind(this, modules, _get2["default"]),
      setChannelMetadata: _endpoint["default"].bind(this, modules, _set2["default"]),
      removeChannelMetadata: _endpoint["default"].bind(this, modules, _remove2["default"]),
      getChannelMembers: _endpoint["default"].bind(this, modules, _get3["default"]),
      setChannelMembers: function setChannelMembers(parameters) {
        for (var _len = arguments.length, rest = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          rest[_key - 1] = arguments[_key];
        }

        return _endpoint["default"].call.apply(_endpoint["default"], [_this, modules, _set3["default"], _objectSpread({
          type: 'set'
        }, parameters)].concat(rest));
      },
      removeChannelMembers: function removeChannelMembers(parameters) {
        for (var _len2 = arguments.length, rest = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          rest[_key2 - 1] = arguments[_key2];
        }

        return _endpoint["default"].call.apply(_endpoint["default"], [_this, modules, _set3["default"], _objectSpread({
          type: 'delete'
        }, parameters)].concat(rest));
      },
      getMemberships: _endpoint["default"].bind(this, modules, _get4["default"]),
      setMemberships: function setMemberships(parameters) {
        for (var _len3 = arguments.length, rest = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
          rest[_key3 - 1] = arguments[_key3];
        }

        return _endpoint["default"].call.apply(_endpoint["default"], [_this, modules, _set4["default"], _objectSpread({
          type: 'set'
        }, parameters)].concat(rest));
      },
      removeMemberships: function removeMemberships(parameters) {
        for (var _len4 = arguments.length, rest = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
          rest[_key4 - 1] = arguments[_key4];
        }

        return _endpoint["default"].call.apply(_endpoint["default"], [_this, modules, _set4["default"], _objectSpread({
          type: 'delete'
        }, parameters)].concat(rest));
      }
    };
    this.createUser = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, createUserEndpointConfig));
    this.updateUser = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, updateUserEndpointConfig));
    this.deleteUser = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, deleteUserEndpointConfig));
    this.getUser = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, getUserEndpointConfig));
    this.getUsers = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, getUsersEndpointConfig));
    this.createSpace = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, createSpaceEndpointConfig));
    this.updateSpace = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, updateSpaceEndpointConfig));
    this.deleteSpace = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, deleteSpaceEndpointConfig));
    this.getSpaces = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, getSpacesEndpointConfig));
    this.getSpace = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, getSpaceEndpointConfig));
    this.addMembers = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, addMembersEndpointConfig));
    this.updateMembers = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, updateMembersEndpointConfig));
    this.removeMembers = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, removeMembersEndpointConfig));
    this.getMembers = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, getMembersEndpointConfig));
    this.getMemberships = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, getMembershipsEndpointConfig));
    this.joinSpaces = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, joinSpacesEndpointConfig));
    this.updateMemberships = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, updateMembershipsEndpointConfig));
    this.leaveSpaces = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, leaveSpacesEndpointConfig));
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

  (0, _createClass2["default"])(_default, [{
    key: "getVersion",
    value: function getVersion() {
      return this._config.getVersion();
    }
  }, {
    key: "_addPnsdkSuffix",
    value: function _addPnsdkSuffix(name, suffix) {
      this._config._addPnsdkSuffix(name, suffix);
    }
  }, {
    key: "networkDownDetected",
    value: function networkDownDetected() {
      this._listenerManager.announceNetworkDown();

      if (this._config.restore) {
        this.disconnect();
      } else {
        this.destroy(true);
      }
    }
  }, {
    key: "networkUpDetected",
    value: function networkUpDetected() {
      this._listenerManager.announceNetworkUp();

      this.reconnect();
    }
  }], [{
    key: "notificationPayload",
    value: function notificationPayload(title, body) {
      return new _push_payload["default"](title, body);
    }
  }, {
    key: "generateUUID",
    value: function generateUUID() {
      return _uuid["default"].createUUID();
    }
  }]);
  return _default;
}();

exports["default"] = _default;
(0, _defineProperty2["default"])(_default, "OPERATIONS", _operations["default"]);
(0, _defineProperty2["default"])(_default, "CATEGORIES", _categories["default"]);
module.exports = exports.default;

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

var _typeof = __webpack_require__(7);

function _getRequireWildcardCache() {
  if (typeof WeakMap !== "function") return null;
  var cache = new WeakMap();

  _getRequireWildcardCache = function _getRequireWildcardCache() {
    return cache;
  };

  return cache;
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  }

  if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") {
    return {
      "default": obj
    };
  }

  var cache = _getRequireWildcardCache();

  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }

  var newObj = {};
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;

  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;

      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }

  newObj["default"] = obj;

  if (cache) {
    cache.set(obj, newObj);
  }

  return newObj;
}

module.exports = _interopRequireWildcard;

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*! lil-uuid - v0.1 - MIT License - https://github.com/lil-js/uuid */
(function (root, factory) {
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))
  } else {}
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
/* 32 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}


/***/ }),
/* 34 */
/***/ (function(module, exports) {

exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}


/***/ }),
/* 35 */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _typeof2 = _interopRequireDefault(__webpack_require__(7));

var _classCallCheck2 = _interopRequireDefault(__webpack_require__(5));

var _createClass2 = _interopRequireDefault(__webpack_require__(6));

var _defineProperty2 = _interopRequireDefault(__webpack_require__(4));

var _cryptography = _interopRequireDefault(__webpack_require__(20));

var _config = _interopRequireDefault(__webpack_require__(8));

var _listener_manager = _interopRequireDefault(__webpack_require__(23));

var _reconnection_manager = _interopRequireDefault(__webpack_require__(37));

var _deduping_manager = _interopRequireDefault(__webpack_require__(38));

var _utils = _interopRequireDefault(__webpack_require__(3));

var _flow_interfaces = __webpack_require__(2);

var _categories = _interopRequireDefault(__webpack_require__(10));

var _default = function () {
  function _default(_ref) {
    var subscribeEndpoint = _ref.subscribeEndpoint,
        leaveEndpoint = _ref.leaveEndpoint,
        heartbeatEndpoint = _ref.heartbeatEndpoint,
        setStateEndpoint = _ref.setStateEndpoint,
        timeEndpoint = _ref.timeEndpoint,
        getFileUrl = _ref.getFileUrl,
        config = _ref.config,
        crypto = _ref.crypto,
        listenerManager = _ref.listenerManager;
    (0, _classCallCheck2["default"])(this, _default);
    (0, _defineProperty2["default"])(this, "_crypto", void 0);
    (0, _defineProperty2["default"])(this, "_config", void 0);
    (0, _defineProperty2["default"])(this, "_listenerManager", void 0);
    (0, _defineProperty2["default"])(this, "_reconnectionManager", void 0);
    (0, _defineProperty2["default"])(this, "_leaveEndpoint", void 0);
    (0, _defineProperty2["default"])(this, "_heartbeatEndpoint", void 0);
    (0, _defineProperty2["default"])(this, "_setStateEndpoint", void 0);
    (0, _defineProperty2["default"])(this, "_subscribeEndpoint", void 0);
    (0, _defineProperty2["default"])(this, "_getFileUrl", void 0);
    (0, _defineProperty2["default"])(this, "_channels", void 0);
    (0, _defineProperty2["default"])(this, "_presenceChannels", void 0);
    (0, _defineProperty2["default"])(this, "_heartbeatChannels", void 0);
    (0, _defineProperty2["default"])(this, "_heartbeatChannelGroups", void 0);
    (0, _defineProperty2["default"])(this, "_channelGroups", void 0);
    (0, _defineProperty2["default"])(this, "_presenceChannelGroups", void 0);
    (0, _defineProperty2["default"])(this, "_currentTimetoken", void 0);
    (0, _defineProperty2["default"])(this, "_lastTimetoken", void 0);
    (0, _defineProperty2["default"])(this, "_storedTimetoken", void 0);
    (0, _defineProperty2["default"])(this, "_region", void 0);
    (0, _defineProperty2["default"])(this, "_subscribeCall", void 0);
    (0, _defineProperty2["default"])(this, "_heartbeatTimer", void 0);
    (0, _defineProperty2["default"])(this, "_subscriptionStatusAnnounced", void 0);
    (0, _defineProperty2["default"])(this, "_autoNetworkDetection", void 0);
    (0, _defineProperty2["default"])(this, "_isOnline", void 0);
    (0, _defineProperty2["default"])(this, "_pendingChannelSubscriptions", void 0);
    (0, _defineProperty2["default"])(this, "_pendingChannelGroupSubscriptions", void 0);
    (0, _defineProperty2["default"])(this, "_dedupingManager", void 0);
    this._listenerManager = listenerManager;
    this._config = config;
    this._leaveEndpoint = leaveEndpoint;
    this._heartbeatEndpoint = heartbeatEndpoint;
    this._setStateEndpoint = setStateEndpoint;
    this._subscribeEndpoint = subscribeEndpoint;
    this._getFileUrl = getFileUrl;
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
    this._reconnectionManager = new _reconnection_manager["default"]({
      timeEndpoint: timeEndpoint
    });
    this._dedupingManager = new _deduping_manager["default"]({
      config: config
    });
  }

  (0, _createClass2["default"])(_default, [{
    key: "adaptStateChange",
    value: function adaptStateChange(args, callback) {
      var _this = this;

      var state = args.state,
          _args$channels = args.channels,
          channels = _args$channels === void 0 ? [] : _args$channels,
          _args$channelGroups = args.channelGroups,
          channelGroups = _args$channelGroups === void 0 ? [] : _args$channelGroups;
      channels.forEach(function (channel) {
        if (channel in _this._channels) _this._channels[channel].state = state;
      });
      channelGroups.forEach(function (channelGroup) {
        if (channelGroup in _this._channelGroups) {
          _this._channelGroups[channelGroup].state = state;
        }
      });
      return this._setStateEndpoint({
        state: state,
        channels: channels,
        channelGroups: channelGroups
      }, callback);
    }
  }, {
    key: "adaptPresenceChange",
    value: function adaptPresenceChange(args) {
      var _this2 = this;

      var connected = args.connected,
          _args$channels2 = args.channels,
          channels = _args$channels2 === void 0 ? [] : _args$channels2,
          _args$channelGroups2 = args.channelGroups,
          channelGroups = _args$channelGroups2 === void 0 ? [] : _args$channelGroups2;

      if (connected) {
        channels.forEach(function (channel) {
          _this2._heartbeatChannels[channel] = {
            state: {}
          };
        });
        channelGroups.forEach(function (channelGroup) {
          _this2._heartbeatChannelGroups[channelGroup] = {
            state: {}
          };
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
          this._leaveEndpoint({
            channels: channels,
            channelGroups: channelGroups
          }, function (status) {
            _this2._listenerManager.announceStatus(status);
          });
        }
      }

      this.reconnect();
    }
  }, {
    key: "adaptSubscribeChange",
    value: function adaptSubscribeChange(args) {
      var _this3 = this;

      var timetoken = args.timetoken,
          _args$channels3 = args.channels,
          channels = _args$channels3 === void 0 ? [] : _args$channels3,
          _args$channelGroups3 = args.channelGroups,
          channelGroups = _args$channelGroups3 === void 0 ? [] : _args$channelGroups3,
          _args$withPresence = args.withPresence,
          withPresence = _args$withPresence === void 0 ? false : _args$withPresence,
          _args$withHeartbeats = args.withHeartbeats,
          withHeartbeats = _args$withHeartbeats === void 0 ? false : _args$withHeartbeats;

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
        _this3._channels[channel] = {
          state: {}
        };
        if (withPresence) _this3._presenceChannels[channel] = {};
        if (withHeartbeats || _this3._config.getHeartbeatInterval()) _this3._heartbeatChannels[channel] = {};

        _this3._pendingChannelSubscriptions.push(channel);
      });
      channelGroups.forEach(function (channelGroup) {
        _this3._channelGroups[channelGroup] = {
          state: {}
        };
        if (withPresence) _this3._presenceChannelGroups[channelGroup] = {};
        if (withHeartbeats || _this3._config.getHeartbeatInterval()) _this3._heartbeatChannelGroups[channelGroup] = {};

        _this3._pendingChannelGroupSubscriptions.push(channelGroup);
      });
      this._subscriptionStatusAnnounced = false;
      this.reconnect();
    }
  }, {
    key: "adaptUnsubscribeChange",
    value: function adaptUnsubscribeChange(args, isOffline) {
      var _this4 = this;

      var _args$channels4 = args.channels,
          channels = _args$channels4 === void 0 ? [] : _args$channels4,
          _args$channelGroups4 = args.channelGroups,
          channelGroups = _args$channelGroups4 === void 0 ? [] : _args$channelGroups4;
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
        this._leaveEndpoint({
          channels: actualChannels,
          channelGroups: actualChannelGroups
        }, function (status) {
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
    key: "unsubscribeAll",
    value: function unsubscribeAll(isOffline) {
      this.adaptUnsubscribeChange({
        channels: this.getSubscribedChannels(),
        channelGroups: this.getSubscribedChannelGroups()
      }, isOffline);
    }
  }, {
    key: "getHeartbeatChannels",
    value: function getHeartbeatChannels() {
      return Object.keys(this._heartbeatChannels);
    }
  }, {
    key: "getHeartbeatChannelGroups",
    value: function getHeartbeatChannelGroups() {
      return Object.keys(this._heartbeatChannelGroups);
    }
  }, {
    key: "getSubscribedChannels",
    value: function getSubscribedChannels() {
      return Object.keys(this._channels);
    }
  }, {
    key: "getSubscribedChannelGroups",
    value: function getSubscribedChannelGroups() {
      return Object.keys(this._channelGroups);
    }
  }, {
    key: "reconnect",
    value: function reconnect() {
      this._startSubscribeLoop();

      this._registerHeartbeatTimer();
    }
  }, {
    key: "disconnect",
    value: function disconnect() {
      this._stopSubscribeLoop();

      this._stopHeartbeatTimer();

      this._reconnectionManager.stopPolling();
    }
  }, {
    key: "_registerHeartbeatTimer",
    value: function _registerHeartbeatTimer() {
      this._stopHeartbeatTimer();

      if (this._config.getHeartbeatInterval() === 0 || this._config.getHeartbeatInterval() === undefined) {
        return;
      }

      this._performHeartbeatLoop();

      this._heartbeatTimer = setInterval(this._performHeartbeatLoop.bind(this), this._config.getHeartbeatInterval() * 1000);
    }
  }, {
    key: "_stopHeartbeatTimer",
    value: function _stopHeartbeatTimer() {
      if (this._heartbeatTimer) {
        clearInterval(this._heartbeatTimer);
        this._heartbeatTimer = null;
      }
    }
  }, {
    key: "_performHeartbeatLoop",
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
    key: "_startSubscribeLoop",
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
        channels.push("".concat(channel, "-pnpres"));
      });
      Object.keys(this._channelGroups).forEach(function (channelGroup) {
        var channelGroupState = _this6._channelGroups[channelGroup].state;

        if (Object.keys(channelGroupState).length) {
          presenceState[channelGroup] = channelGroupState;
        }

        channelGroups.push(channelGroup);
      });
      Object.keys(this._presenceChannelGroups).forEach(function (channelGroup) {
        channelGroups.push("".concat(channelGroup, "-pnpres"));
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
    key: "_processSubscribeResponse",
    value: function _processSubscribeResponse(status, payload) {
      var _this7 = this;

      if (status.error) {
        if (status.category === _categories["default"].PNTimeoutCategory) {
          this._startSubscribeLoop();
        } else if (status.category === _categories["default"].PNNetworkIssuesCategory) {
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
              category: _categories["default"].PNReconnectedCategory,
              operation: status.operation,
              lastTimetoken: _this7._lastTimetoken,
              currentTimetoken: _this7._currentTimetoken
            };

            _this7._listenerManager.announceStatus(reconnectedAnnounce);
          });

          this._reconnectionManager.startPolling();

          this._listenerManager.announceStatus(status);
        } else if (status.category === _categories["default"].PNBadRequestCategory) {
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
        connectedAnnounce.category = _categories["default"].PNConnectedCategory;
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
      var _this$_config = this._config,
          requestMessageCountThreshold = _this$_config.requestMessageCountThreshold,
          dedupeOnSubscribe = _this$_config.dedupeOnSubscribe;

      if (requestMessageCountThreshold && messages.length >= requestMessageCountThreshold) {
        var countAnnouncement = {};
        countAnnouncement.category = _categories["default"].PNRequestMessageCountExceededCategory;
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

        if (_utils["default"].endsWith(message.channel, '-pnpres')) {
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
        } else if (message.messageType === 1) {
          var _announce = {};
          _announce.channel = null;
          _announce.subscription = null;
          _announce.channel = channel;
          _announce.subscription = subscriptionMatch;
          _announce.timetoken = publishMetaData.publishTimetoken;
          _announce.publisher = message.issuingClientId;

          if (message.userMetadata) {
            _announce.userMetadata = message.userMetadata;
          }

          _announce.message = message.payload;

          _this7._listenerManager.announceSignal(_announce);
        } else if (message.messageType === 2) {
          var _announce2 = {};
          _announce2.channel = null;
          _announce2.subscription = null;
          _announce2.channel = channel;
          _announce2.subscription = subscriptionMatch;
          _announce2.timetoken = publishMetaData.publishTimetoken;
          _announce2.publisher = message.issuingClientId;

          if (message.userMetadata) {
            _announce2.userMetadata = message.userMetadata;
          }

          _announce2.message = {
            event: message.payload.event,
            type: message.payload.type,
            data: message.payload.data
          };

          _this7._listenerManager.announceObjects(_announce2);

          if (message.payload.type === 'user') {
            _this7._listenerManager.announceUser(_announce2);
          } else if (message.payload.type === 'space') {
            _this7._listenerManager.announceSpace(_announce2);
          } else if (message.payload.type === 'membership') {
            _this7._listenerManager.announceMembership(_announce2);
          }
        } else if (message.messageType === 3) {
          var _announce3 = {};
          _announce3.channel = channel;
          _announce3.subscription = subscriptionMatch;
          _announce3.timetoken = publishMetaData.publishTimetoken;
          _announce3.publisher = message.issuingClientId;
          _announce3.data = {
            messageTimetoken: message.payload.data.messageTimetoken,
            actionTimetoken: message.payload.data.actionTimetoken,
            type: message.payload.data.type,
            uuid: message.issuingClientId,
            value: message.payload.data.value
          };
          _announce3.event = message.payload.event;

          _this7._listenerManager.announceMessageAction(_announce3);
        } else if (message.messageType === 4) {
          var _announce4 = {};
          _announce4.channel = channel;
          _announce4.subscription = subscriptionMatch;
          _announce4.timetoken = publishMetaData.publishTimetoken;
          _announce4.publisher = message.issuingClientId;
          var msgPayload = message.payload;

          if (_this7._config.cipherKey) {
            var decryptedPayload = _this7._crypto.decrypt(message.payload);

            if ((0, _typeof2["default"])(decryptedPayload) === 'object' && decryptedPayload !== null) {
              msgPayload = decryptedPayload;
            }
          }

          if (message.userMetadata) {
            _announce4.userMetadata = message.userMetadata;
          }

          _announce4.message = msgPayload.message;
          _announce4.file = {
            id: msgPayload.file.id,
            name: msgPayload.file.name,
            url: _this7._getFileUrl({
              id: msgPayload.file.id,
              name: msgPayload.file.name,
              channel: channel
            })
          };

          _this7._listenerManager.announceFile(_announce4);
        } else {
          var _announce5 = {};
          _announce5.channel = null;
          _announce5.subscription = null;
          _announce5.actualChannel = subscriptionMatch != null ? channel : null;
          _announce5.subscribedChannel = subscriptionMatch != null ? subscriptionMatch : channel;
          _announce5.channel = channel;
          _announce5.subscription = subscriptionMatch;
          _announce5.timetoken = publishMetaData.publishTimetoken;
          _announce5.publisher = message.issuingClientId;

          if (message.userMetadata) {
            _announce5.userMetadata = message.userMetadata;
          }

          if (_this7._config.cipherKey) {
            _announce5.message = _this7._crypto.decrypt(message.payload);
          } else {
            _announce5.message = message.payload;
          }

          _this7._listenerManager.announceMessage(_announce5);
        }
      });
      this._region = payload.metadata.region;

      this._startSubscribeLoop();
    }
  }, {
    key: "_stopSubscribeLoop",
    value: function _stopSubscribeLoop() {
      if (this._subscribeCall) {
        if (typeof this._subscribeCall.abort === 'function') {
          this._subscribeCall.abort();
        }

        this._subscribeCall = null;
      }
    }
  }]);
  return _default;
}();

exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(__webpack_require__(5));

var _createClass2 = _interopRequireDefault(__webpack_require__(6));

var _defineProperty2 = _interopRequireDefault(__webpack_require__(4));

var _time = _interopRequireDefault(__webpack_require__(24));

var _flow_interfaces = __webpack_require__(2);

var _default = function () {
  function _default(_ref) {
    var timeEndpoint = _ref.timeEndpoint;
    (0, _classCallCheck2["default"])(this, _default);
    (0, _defineProperty2["default"])(this, "_reconnectionCallback", void 0);
    (0, _defineProperty2["default"])(this, "_timeEndpoint", void 0);
    (0, _defineProperty2["default"])(this, "_timeTimer", void 0);
    this._timeEndpoint = timeEndpoint;
  }

  (0, _createClass2["default"])(_default, [{
    key: "onReconnection",
    value: function onReconnection(reconnectionCallback) {
      this._reconnectionCallback = reconnectionCallback;
    }
  }, {
    key: "startPolling",
    value: function startPolling() {
      this._timeTimer = setInterval(this._performTimeLoop.bind(this), 3000);
    }
  }, {
    key: "stopPolling",
    value: function stopPolling() {
      clearInterval(this._timeTimer);
    }
  }, {
    key: "_performTimeLoop",
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
  return _default;
}();

exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(__webpack_require__(5));

var _createClass2 = _interopRequireDefault(__webpack_require__(6));

var _defineProperty2 = _interopRequireDefault(__webpack_require__(4));

var _config = _interopRequireDefault(__webpack_require__(8));

var _flow_interfaces = __webpack_require__(2);

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

var _default = function () {
  function _default(_ref) {
    var config = _ref.config;
    (0, _classCallCheck2["default"])(this, _default);
    (0, _defineProperty2["default"])(this, "_config", void 0);
    (0, _defineProperty2["default"])(this, "hashHistory", void 0);
    this.hashHistory = [];
    this._config = config;
  }

  (0, _createClass2["default"])(_default, [{
    key: "getKey",
    value: function getKey(message) {
      var hashedPayload = hashCode(JSON.stringify(message.payload)).toString();
      var timetoken = message.publishMetaData.publishTimetoken;
      return "".concat(timetoken, "-").concat(hashedPayload);
    }
  }, {
    key: "isDuplicate",
    value: function isDuplicate(message) {
      return this.hashHistory.includes(this.getKey(message));
    }
  }, {
    key: "addEntry",
    value: function addEntry(message) {
      if (this.hashHistory.length >= this._config.maximumCacheSize) {
        this.hashHistory.shift();
      }

      this.hashHistory.push(this.getKey(message));
    }
  }, {
    key: "clearHistory",
    value: function clearHistory() {
      this.hashHistory = [];
    }
  }]);
  return _default;
}();

exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 39 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(__webpack_require__(5));

var _createClass2 = _interopRequireDefault(__webpack_require__(6));

var _defineProperty2 = _interopRequireDefault(__webpack_require__(4));

var _operations = _interopRequireDefault(__webpack_require__(1));

var _default = function () {
  function _default(configuration) {
    (0, _classCallCheck2["default"])(this, _default);
    (0, _defineProperty2["default"])(this, "_maximumSamplesCount", 100);
    (0, _defineProperty2["default"])(this, "_trackedLatencies", {});
    (0, _defineProperty2["default"])(this, "_latencies", {});
    this._maximumSamplesCount = configuration.maximumSamplesCount || this._maximumSamplesCount;
  }

  (0, _createClass2["default"])(_default, [{
    key: "operationsLatencyForRequest",
    value: function operationsLatencyForRequest() {
      var _this = this;

      var latencies = {};
      Object.keys(this._latencies).forEach(function (endpointName) {
        var operationLatencies = _this._latencies[endpointName];

        var averageLatency = _this._averageLatency(operationLatencies);

        if (averageLatency > 0) {
          latencies["l_".concat(endpointName)] = averageLatency;
        }
      });
      return latencies;
    }
  }, {
    key: "startLatencyMeasure",
    value: function startLatencyMeasure(operationType, identifier) {
      if (operationType === _operations["default"].PNSubscribeOperation || !identifier) {
        return;
      }

      this._trackedLatencies[identifier] = Date.now();
    }
  }, {
    key: "stopLatencyMeasure",
    value: function stopLatencyMeasure(operationType, identifier) {
      if (operationType === _operations["default"].PNSubscribeOperation || !identifier) {
        return;
      }

      var endpointName = this._endpointName(operationType);

      var endpointLatencies = this._latencies[endpointName];
      var startDate = this._trackedLatencies[identifier];

      if (!endpointLatencies) {
        endpointLatencies = this._latencies[endpointName] = [];
      }

      endpointLatencies.push(Date.now() - startDate);

      if (endpointLatencies.length > this._maximumSamplesCount) {
        endpointLatencies.splice(0, endpointLatencies.length - this._maximumSamplesCount);
      }

      delete this._trackedLatencies[identifier];
    }
  }, {
    key: "_averageLatency",
    value: function _averageLatency(latencies) {
      var arrayReduce = function arrayReduce(accumulatedLatency, latency) {
        return accumulatedLatency + latency;
      };

      return Math.floor(latencies.reduce(arrayReduce, 0) / latencies.length);
    }
  }, {
    key: "_endpointName",
    value: function _endpointName(operationType) {
      var operation = null;

      switch (operationType) {
        case _operations["default"].PNPublishOperation:
          operation = 'pub';
          break;

        case _operations["default"].PNSignalOperation:
          operation = 'sig';
          break;

        case _operations["default"].PNHistoryOperation:
        case _operations["default"].PNFetchMessagesOperation:
        case _operations["default"].PNDeleteMessagesOperation:
        case _operations["default"].PNMessageCounts:
          operation = 'hist';
          break;

        case _operations["default"].PNUnsubscribeOperation:
        case _operations["default"].PNWhereNowOperation:
        case _operations["default"].PNHereNowOperation:
        case _operations["default"].PNHeartbeatOperation:
        case _operations["default"].PNSetStateOperation:
        case _operations["default"].PNGetStateOperation:
          operation = 'pres';
          break;

        case _operations["default"].PNAddChannelsToGroupOperation:
        case _operations["default"].PNRemoveChannelsFromGroupOperation:
        case _operations["default"].PNChannelGroupsOperation:
        case _operations["default"].PNRemoveGroupOperation:
        case _operations["default"].PNChannelsForGroupOperation:
          operation = 'cg';
          break;

        case _operations["default"].PNPushNotificationEnabledChannelsOperation:
        case _operations["default"].PNRemoveAllPushNotificationsOperation:
          operation = 'push';
          break;

        case _operations["default"].PNCreateUserOperation:
        case _operations["default"].PNUpdateUserOperation:
        case _operations["default"].PNDeleteUserOperation:
        case _operations["default"].PNGetUserOperation:
        case _operations["default"].PNGetUsersOperation:
        case _operations["default"].PNCreateSpaceOperation:
        case _operations["default"].PNUpdateSpaceOperation:
        case _operations["default"].PNDeleteSpaceOperation:
        case _operations["default"].PNGetSpaceOperation:
        case _operations["default"].PNGetSpacesOperation:
        case _operations["default"].PNGetMembersOperation:
        case _operations["default"].PNUpdateMembersOperation:
        case _operations["default"].PNGetMembershipsOperation:
        case _operations["default"].PNUpdateMembershipsOperation:
          operation = 'obj';
          break;

        case _operations["default"].PNAddMessageActionOperation:
        case _operations["default"].PNRemoveMessageActionOperation:
        case _operations["default"].PNGetMessageActionsOperation:
          operation = 'msga';
          break;

        case _operations["default"].PNAccessManagerGrant:
        case _operations["default"].PNAccessManagerAudit:
          operation = 'pam';
          break;

        case _operations["default"].PNAccessManagerGrantToken:
          operation = 'pam3';
          break;

        default:
          operation = 'time';
          break;
      }

      return operation;
    }
  }]);
  return _default;
}();

exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.FCMNotificationPayload = exports.MPNSNotificationPayload = exports.APNSNotificationPayload = void 0;

var _objectWithoutProperties2 = _interopRequireDefault(__webpack_require__(42));

var _assertThisInitialized2 = _interopRequireDefault(__webpack_require__(19));

var _inherits2 = _interopRequireDefault(__webpack_require__(14));

var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(16));

var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(13));

var _classCallCheck2 = _interopRequireDefault(__webpack_require__(5));

var _createClass2 = _interopRequireDefault(__webpack_require__(6));

var _defineProperty2 = _interopRequireDefault(__webpack_require__(4));

var _flow_interfaces = __webpack_require__(2);

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var BaseNotificationPayload = function () {
  (0, _createClass2["default"])(BaseNotificationPayload, [{
    key: "payload",
    get: function get() {
      return this._payload;
    }
  }, {
    key: "title",
    set: function set(value) {
      this._title = value;
    }
  }, {
    key: "subtitle",
    set: function set(value) {
      this._subtitle = value;
    }
  }, {
    key: "body",
    set: function set(value) {
      this._body = value;
    }
  }, {
    key: "badge",
    set: function set(value) {
      this._badge = value;
    }
  }, {
    key: "sound",
    set: function set(value) {
      this._sound = value;
    }
  }]);

  function BaseNotificationPayload(payload, title, body) {
    (0, _classCallCheck2["default"])(this, BaseNotificationPayload);
    (0, _defineProperty2["default"])(this, "_subtitle", void 0);
    (0, _defineProperty2["default"])(this, "_payload", void 0);
    (0, _defineProperty2["default"])(this, "_badge", void 0);
    (0, _defineProperty2["default"])(this, "_sound", void 0);
    (0, _defineProperty2["default"])(this, "_title", void 0);
    (0, _defineProperty2["default"])(this, "_body", void 0);
    this._payload = payload;

    this._setDefaultPayloadStructure();

    this.title = title;
    this.body = body;
  }

  (0, _createClass2["default"])(BaseNotificationPayload, [{
    key: "_setDefaultPayloadStructure",
    value: function _setDefaultPayloadStructure() {}
  }, {
    key: "toObject",
    value: function toObject() {
      return {};
    }
  }]);
  return BaseNotificationPayload;
}();

var APNSNotificationPayload = function (_BaseNotificationPayl) {
  (0, _inherits2["default"])(APNSNotificationPayload, _BaseNotificationPayl);

  var _super = _createSuper(APNSNotificationPayload);

  function APNSNotificationPayload() {
    var _this;

    (0, _classCallCheck2["default"])(this, APNSNotificationPayload);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_configurations", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_apnsPushType", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_isSilent", void 0);
    return _this;
  }

  (0, _createClass2["default"])(APNSNotificationPayload, [{
    key: "_setDefaultPayloadStructure",
    value: function _setDefaultPayloadStructure() {
      this._payload.aps = {
        alert: {}
      };
    }
  }, {
    key: "toObject",
    value: function toObject() {
      var _this2 = this;

      var payload = _objectSpread({}, this._payload);

      var aps = payload.aps;
      var alert = aps.alert;

      if (this._isSilent) {
        aps['content-available'] = 1;
      }

      if (this._apnsPushType === 'apns2') {
        if (!this._configurations || !this._configurations.length) {
          throw new ReferenceError('APNS2 configuration is missing');
        }

        var configurations = [];

        this._configurations.forEach(function (configuration) {
          configurations.push(_this2._objectFromAPNS2Configuration(configuration));
        });

        if (configurations.length) {
          payload.pn_push = configurations;
        }
      }

      if (!alert || !Object.keys(alert).length) {
        delete aps.alert;
      }

      if (this._isSilent) {
        delete aps.alert;
        delete aps.badge;
        delete aps.sound;
        alert = {};
      }

      return this._isSilent || Object.keys(alert).length ? payload : null;
    }
  }, {
    key: "_objectFromAPNS2Configuration",
    value: function _objectFromAPNS2Configuration(configuration) {
      var _this3 = this;

      if (!configuration.targets || !configuration.targets.length) {
        throw new ReferenceError('At least one APNS2 target should be provided');
      }

      var targets = [];
      configuration.targets.forEach(function (target) {
        targets.push(_this3._objectFromAPNSTarget(target));
      });
      var collapseId = configuration.collapseId,
          expirationDate = configuration.expirationDate;
      var objectifiedConfiguration = {
        auth_method: 'token',
        targets: targets,
        version: 'v2'
      };

      if (collapseId && collapseId.length) {
        objectifiedConfiguration.collapse_id = collapseId;
      }

      if (expirationDate) {
        objectifiedConfiguration.expiration = expirationDate.toISOString();
      }

      return objectifiedConfiguration;
    }
  }, {
    key: "_objectFromAPNSTarget",
    value: function _objectFromAPNSTarget(target) {
      if (!target.topic || !target.topic.length) {
        throw new TypeError('Target \'topic\' undefined.');
      }

      var topic = target.topic,
          _target$environment = target.environment,
          environment = _target$environment === void 0 ? 'development' : _target$environment,
          _target$excludedDevic = target.excludedDevices,
          excludedDevices = _target$excludedDevic === void 0 ? [] : _target$excludedDevic;
      var objectifiedTarget = {
        topic: topic,
        environment: environment
      };

      if (excludedDevices.length) {
        objectifiedTarget.excluded_devices = excludedDevices;
      }

      return objectifiedTarget;
    }
  }, {
    key: "configurations",
    set: function set(value) {
      if (!value || !value.length) return;
      this._configurations = value;
    }
  }, {
    key: "notification",
    get: function get() {
      return this._payload.aps;
    }
  }, {
    key: "title",
    get: function get() {
      return this._title;
    },
    set: function set(value) {
      if (!value || !value.length) return;
      this._payload.aps.alert.title = value;
      this._title = value;
    }
  }, {
    key: "subtitle",
    get: function get() {
      return this._subtitle;
    },
    set: function set(value) {
      if (!value || !value.length) return;
      this._payload.aps.alert.subtitle = value;
      this._subtitle = value;
    }
  }, {
    key: "body",
    get: function get() {
      return this._body;
    },
    set: function set(value) {
      if (!value || !value.length) return;
      this._payload.aps.alert.body = value;
      this._body = value;
    }
  }, {
    key: "badge",
    get: function get() {
      return this._badge;
    },
    set: function set(value) {
      if (value === undefined || value === null) return;
      this._payload.aps.badge = value;
      this._badge = value;
    }
  }, {
    key: "sound",
    get: function get() {
      return this._sound;
    },
    set: function set(value) {
      if (!value || !value.length) return;
      this._payload.aps.sound = value;
      this._sound = value;
    }
  }, {
    key: "silent",
    set: function set(value) {
      this._isSilent = value;
    }
  }]);
  return APNSNotificationPayload;
}(BaseNotificationPayload);

exports.APNSNotificationPayload = APNSNotificationPayload;

var MPNSNotificationPayload = function (_BaseNotificationPayl2) {
  (0, _inherits2["default"])(MPNSNotificationPayload, _BaseNotificationPayl2);

  var _super2 = _createSuper(MPNSNotificationPayload);

  function MPNSNotificationPayload() {
    var _this4;

    (0, _classCallCheck2["default"])(this, MPNSNotificationPayload);

    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    _this4 = _super2.call.apply(_super2, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this4), "_backContent", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this4), "_backTitle", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this4), "_count", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this4), "_type", void 0);
    return _this4;
  }

  (0, _createClass2["default"])(MPNSNotificationPayload, [{
    key: "toObject",
    value: function toObject() {
      return Object.keys(this._payload).length ? _objectSpread({}, this._payload) : null;
    }
  }, {
    key: "backContent",
    get: function get() {
      return this._backContent;
    },
    set: function set(value) {
      if (!value || !value.length) return;
      this._payload.back_content = value;
      this._backContent = value;
    }
  }, {
    key: "backTitle",
    get: function get() {
      return this._backTitle;
    },
    set: function set(value) {
      if (!value || !value.length) return;
      this._payload.back_title = value;
      this._backTitle = value;
    }
  }, {
    key: "count",
    get: function get() {
      return this._count;
    },
    set: function set(value) {
      if (value === undefined || value === null) return;
      this._payload.count = value;
      this._count = value;
    }
  }, {
    key: "title",
    get: function get() {
      return this._title;
    },
    set: function set(value) {
      if (!value || !value.length) return;
      this._payload.title = value;
      this._title = value;
    }
  }, {
    key: "type",
    get: function get() {
      return this._type;
    },
    set: function set(value) {
      if (!value || !value.length) return;
      this._payload.type = value;
      this._type = value;
    }
  }, {
    key: "subtitle",
    get: function get() {
      return this.backTitle;
    },
    set: function set(value) {
      this.backTitle = value;
    }
  }, {
    key: "body",
    get: function get() {
      return this.backContent;
    },
    set: function set(value) {
      this.backContent = value;
    }
  }, {
    key: "badge",
    get: function get() {
      return this.count;
    },
    set: function set(value) {
      this.count = value;
    }
  }]);
  return MPNSNotificationPayload;
}(BaseNotificationPayload);

exports.MPNSNotificationPayload = MPNSNotificationPayload;

var FCMNotificationPayload = function (_BaseNotificationPayl3) {
  (0, _inherits2["default"])(FCMNotificationPayload, _BaseNotificationPayl3);

  var _super3 = _createSuper(FCMNotificationPayload);

  function FCMNotificationPayload() {
    var _this5;

    (0, _classCallCheck2["default"])(this, FCMNotificationPayload);

    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    _this5 = _super3.call.apply(_super3, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this5), "_isSilent", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this5), "_icon", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this5), "_tag", void 0);
    return _this5;
  }

  (0, _createClass2["default"])(FCMNotificationPayload, [{
    key: "_setDefaultPayloadStructure",
    value: function _setDefaultPayloadStructure() {
      this._payload.notification = {};
      this._payload.data = {};
    }
  }, {
    key: "toObject",
    value: function toObject() {
      var data = _objectSpread({}, this._payload.data);

      var notification = null;
      var payload = {};

      if (Object.keys(this._payload).length > 2) {
        var _this$_payload = this._payload,
            initialNotification = _this$_payload.notification,
            initialData = _this$_payload.data,
            additionalData = (0, _objectWithoutProperties2["default"])(_this$_payload, ["notification", "data"]);
        data = _objectSpread(_objectSpread({}, data), additionalData);
      }

      if (this._isSilent) {
        data.notification = this._payload.notification;
      } else {
        notification = this._payload.notification;
      }

      if (Object.keys(data).length) {
        payload.data = data;
      }

      if (notification && Object.keys(notification).length) {
        payload.notification = notification;
      }

      return Object.keys(payload).length ? payload : null;
    }
  }, {
    key: "notification",
    get: function get() {
      return this._payload.notification;
    }
  }, {
    key: "data",
    get: function get() {
      return this._payload.data;
    }
  }, {
    key: "title",
    get: function get() {
      return this._title;
    },
    set: function set(value) {
      if (!value || !value.length) return;
      this._payload.notification.title = value;
      this._title = value;
    }
  }, {
    key: "body",
    get: function get() {
      return this._body;
    },
    set: function set(value) {
      if (!value || !value.length) return;
      this._payload.notification.body = value;
      this._body = value;
    }
  }, {
    key: "sound",
    get: function get() {
      return this._sound;
    },
    set: function set(value) {
      if (!value || !value.length) return;
      this._payload.notification.sound = value;
      this._sound = value;
    }
  }, {
    key: "icon",
    get: function get() {
      return this._icon;
    },
    set: function set(value) {
      if (!value || !value.length) return;
      this._payload.notification.icon = value;
      this._icon = value;
    }
  }, {
    key: "tag",
    get: function get() {
      return this._tag;
    },
    set: function set(value) {
      if (!value || !value.length) return;
      this._payload.notification.tag = value;
      this._tag = value;
    }
  }, {
    key: "silent",
    set: function set(value) {
      this._isSilent = value;
    }
  }]);
  return FCMNotificationPayload;
}(BaseNotificationPayload);

exports.FCMNotificationPayload = FCMNotificationPayload;

var NotificationsPayload = function () {
  (0, _createClass2["default"])(NotificationsPayload, [{
    key: "debugging",
    set: function set(value) {
      this._debugging = value;
    }
  }, {
    key: "title",
    get: function get() {
      return this._title;
    }
  }, {
    key: "body",
    get: function get() {
      return this._body;
    }
  }, {
    key: "subtitle",
    get: function get() {
      return this._subtitle;
    },
    set: function set(value) {
      this._subtitle = value;
      this.apns.subtitle = value;
      this.mpns.subtitle = value;
      this.fcm.subtitle = value;
    }
  }, {
    key: "badge",
    get: function get() {
      return this._badge;
    },
    set: function set(value) {
      this._badge = value;
      this.apns.badge = value;
      this.mpns.badge = value;
      this.fcm.badge = value;
    }
  }, {
    key: "sound",
    get: function get() {
      return this._sound;
    },
    set: function set(value) {
      this._sound = value;
      this.apns.sound = value;
      this.mpns.sound = value;
      this.fcm.sound = value;
    }
  }]);

  function NotificationsPayload(title, body) {
    (0, _classCallCheck2["default"])(this, NotificationsPayload);
    (0, _defineProperty2["default"])(this, "_payload", void 0);
    (0, _defineProperty2["default"])(this, "_debugging", void 0);
    (0, _defineProperty2["default"])(this, "_subtitle", void 0);
    (0, _defineProperty2["default"])(this, "_badge", void 0);
    (0, _defineProperty2["default"])(this, "_sound", void 0);
    (0, _defineProperty2["default"])(this, "_title", void 0);
    (0, _defineProperty2["default"])(this, "_body", void 0);
    (0, _defineProperty2["default"])(this, "apns", void 0);
    (0, _defineProperty2["default"])(this, "mpns", void 0);
    (0, _defineProperty2["default"])(this, "fcm", void 0);
    this._payload = {
      apns: {},
      mpns: {},
      fcm: {}
    };
    this._title = title;
    this._body = body;
    this.apns = new APNSNotificationPayload(this._payload.apns, title, body);
    this.mpns = new MPNSNotificationPayload(this._payload.mpns, title, body);
    this.fcm = new FCMNotificationPayload(this._payload.fcm, title, body);
  }

  (0, _createClass2["default"])(NotificationsPayload, [{
    key: "buildPayload",
    value: function buildPayload(platforms) {
      var payload = {};

      if (platforms.includes('apns') || platforms.includes('apns2')) {
        this.apns._apnsPushType = platforms.includes('apns') ? 'apns' : 'apns2';
        var apnsPayload = this.apns.toObject();

        if (apnsPayload && Object.keys(apnsPayload).length) {
          payload.pn_apns = apnsPayload;
        }
      }

      if (platforms.includes('mpns')) {
        var mpnsPayload = this.mpns.toObject();

        if (mpnsPayload && Object.keys(mpnsPayload).length) {
          payload.pn_mpns = mpnsPayload;
        }
      }

      if (platforms.includes('fcm')) {
        var fcmPayload = this.fcm.toObject();

        if (fcmPayload && Object.keys(fcmPayload).length) {
          payload.pn_gcm = fcmPayload;
        }
      }

      if (Object.keys(payload).length && this._debugging) {
        payload.pn_debug = true;
      }

      return payload;
    }
  }]);
  return NotificationsPayload;
}();

var _default = NotificationsPayload;
exports["default"] = _default;

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

var objectWithoutPropertiesLoose = __webpack_require__(43);

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  var target = objectWithoutPropertiesLoose(source, excluded);
  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

module.exports = _objectWithoutProperties;

/***/ }),
/* 43 */
/***/ (function(module, exports) {

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

module.exports = _objectWithoutPropertiesLoose;

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _typeof2 = _interopRequireDefault(__webpack_require__(7));

var _classCallCheck2 = _interopRequireDefault(__webpack_require__(5));

var _createClass2 = _interopRequireDefault(__webpack_require__(6));

var _defineProperty2 = _interopRequireDefault(__webpack_require__(4));

var _config = _interopRequireDefault(__webpack_require__(8));

var _flow_interfaces = __webpack_require__(2);

var _default = function () {
  function _default(config, cbor) {
    (0, _classCallCheck2["default"])(this, _default);
    (0, _defineProperty2["default"])(this, "_config", void 0);
    (0, _defineProperty2["default"])(this, "_cbor", void 0);
    (0, _defineProperty2["default"])(this, "_userTokens", void 0);
    (0, _defineProperty2["default"])(this, "_spaceTokens", void 0);
    (0, _defineProperty2["default"])(this, "_userToken", void 0);
    (0, _defineProperty2["default"])(this, "_spaceToken", void 0);
    this._config = config;
    this._cbor = cbor;

    this._initializeTokens();
  }

  (0, _createClass2["default"])(_default, [{
    key: "_initializeTokens",
    value: function _initializeTokens() {
      this._userTokens = {};
      this._spaceTokens = {};
      this._userToken = undefined;
      this._spaceToken = undefined;
    }
  }, {
    key: "_setToken",
    value: function _setToken(token) {
      var _this = this;

      var tokenObject = this.parseToken(token);

      if (tokenObject && tokenObject.resources) {
        if (tokenObject.resources.users) {
          Object.keys(tokenObject.resources.users).forEach(function (id) {
            _this._userTokens[id] = token;
          });
        }

        if (tokenObject.resources.spaces) {
          Object.keys(tokenObject.resources.spaces).forEach(function (id) {
            _this._spaceTokens[id] = token;
          });
        }
      }

      if (tokenObject && tokenObject.patterns) {
        if (tokenObject.patterns.users && Object.keys(tokenObject.patterns.users).length > 0) {
          this._userToken = token;
        }

        if (tokenObject.patterns.spaces && Object.keys(tokenObject.patterns.spaces).length > 0) {
          this._spaceToken = token;
        }
      }
    }
  }, {
    key: "setToken",
    value: function setToken(token) {
      if (token && token.length > 0) {
        this._setToken(token);
      }
    }
  }, {
    key: "setTokens",
    value: function setTokens(tokens) {
      var _this2 = this;

      if (tokens && tokens.length && (0, _typeof2["default"])(tokens) === 'object') {
        tokens.forEach(function (token) {
          _this2.setToken(token);
        });
      }
    }
  }, {
    key: "getTokens",
    value: function getTokens(tokenDef) {
      var _this3 = this;

      var result = {
        users: {},
        spaces: {}
      };

      if (tokenDef) {
        if (tokenDef.user) {
          result.user = this._userToken;
        }

        if (tokenDef.space) {
          result.space = this._spaceToken;
        }

        if (tokenDef.users) {
          tokenDef.users.forEach(function (user) {
            result.users[user] = _this3._userTokens[user];
          });
        }

        if (tokenDef.space) {
          tokenDef.spaces.forEach(function (space) {
            result.spaces[space] = _this3._spaceTokens[space];
          });
        }
      } else {
        if (this._userToken) {
          result.user = this._userToken;
        }

        if (this._spaceToken) {
          result.space = this._spaceToken;
        }

        Object.keys(this._userTokens).forEach(function (user) {
          result.users[user] = _this3._userTokens[user];
        });
        Object.keys(this._spaceTokens).forEach(function (space) {
          result.spaces[space] = _this3._spaceTokens[space];
        });
      }

      return result;
    }
  }, {
    key: "getToken",
    value: function getToken(type, id) {
      var result;

      if (id) {
        if (type === 'user') {
          result = this._userTokens[id];
        } else if (type === 'space') {
          result = this._spaceTokens[id];
        }
      } else if (type === 'user') {
        result = this._userToken;
      } else if (type === 'space') {
        result = this._spaceToken;
      }

      return result;
    }
  }, {
    key: "extractPermissions",
    value: function extractPermissions(permissions) {
      var permissionsResult = {
        create: false,
        read: false,
        write: false,
        manage: false,
        "delete": false
      };

      if ((permissions & 16) === 16) {
        permissionsResult.create = true;
      }

      if ((permissions & 8) === 8) {
        permissionsResult["delete"] = true;
      }

      if ((permissions & 4) === 4) {
        permissionsResult.manage = true;
      }

      if ((permissions & 2) === 2) {
        permissionsResult.write = true;
      }

      if ((permissions & 1) === 1) {
        permissionsResult.read = true;
      }

      return permissionsResult;
    }
  }, {
    key: "parseToken",
    value: function parseToken(tokenString) {
      var _this4 = this;

      var parsed = this._cbor.decodeToken(tokenString);

      if (parsed !== undefined) {
        var userResourcePermissions = Object.keys(parsed.res.usr);
        var spaceResourcePermissions = Object.keys(parsed.res.spc);
        var userPatternPermissions = Object.keys(parsed.pat.usr);
        var spacePatternPermissions = Object.keys(parsed.pat.spc);
        var result = {
          version: parsed.v,
          timestamp: parsed.t,
          ttl: parsed.ttl
        };
        var userResources = userResourcePermissions.length > 0;
        var spaceResources = spaceResourcePermissions.length > 0;

        if (userResources || spaceResources) {
          result.resources = {};

          if (userResources) {
            result.resources.users = {};
            userResourcePermissions.forEach(function (id) {
              result.resources.users[id] = _this4.extractPermissions(parsed.res.usr[id]);
            });
          }

          if (spaceResources) {
            result.resources.spaces = {};
            spaceResourcePermissions.forEach(function (id) {
              result.resources.spaces[id] = _this4.extractPermissions(parsed.res.spc[id]);
            });
          }
        }

        var userPatterns = userPatternPermissions.length > 0;
        var spacePatterns = spacePatternPermissions.length > 0;

        if (userPatterns || spacePatterns) {
          result.patterns = {};

          if (userPatterns) {
            result.patterns.users = {};
            userPatternPermissions.forEach(function (id) {
              result.patterns.users[id] = _this4.extractPermissions(parsed.pat.usr[id]);
            });
          }

          if (spacePatterns) {
            result.patterns.spaces = {};
            spacePatternPermissions.forEach(function (id) {
              result.patterns.spaces[id] = _this4.extractPermissions(parsed.pat.spc[id]);
            });
          }
        }

        if (Object.keys(parsed.meta).length > 0) {
          result.meta = parsed.meta;
        }

        result.signature = parsed.sig;
        return result;
      } else {
        return undefined;
      }
    }
  }, {
    key: "clearTokens",
    value: function clearTokens() {
      this._initializeTokens();
    }
  }]);
  return _default;
}();

exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

var getPrototypeOf = __webpack_require__(13);

var setPrototypeOf = __webpack_require__(15);

var isNativeFunction = __webpack_require__(46);

var construct = __webpack_require__(47);

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  module.exports = _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return construct(Class, arguments, getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

module.exports = _wrapNativeSuper;

/***/ }),
/* 46 */
/***/ (function(module, exports) {

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

module.exports = _isNativeFunction;

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

var setPrototypeOf = __webpack_require__(15);

var isNativeReflectConstruct = __webpack_require__(48);

function _construct(Parent, args, Class) {
  if (isNativeReflectConstruct()) {
    module.exports = _construct = Reflect.construct;
  } else {
    module.exports = _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

module.exports = _construct;

/***/ }),
/* 48 */
/***/ (function(module, exports) {

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = _isNativeReflectConstruct;

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

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

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(3));

function getOperation() {
  return _operations["default"].PNAddChannelsToGroupOperation;
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
  return "/v1/channel-registration/sub-key/".concat(config.subscribeKey, "/channel-group/").concat(_utils["default"].encodeString(channelGroup));
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
      channels = _incomingParams$chann === void 0 ? [] : _incomingParams$chann;
  return {
    add: channels.join(',')
  };
}

function handleResponse() {
  return {};
}

/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

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

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(3));

function getOperation() {
  return _operations["default"].PNRemoveChannelsFromGroupOperation;
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
  return "/v1/channel-registration/sub-key/".concat(config.subscribeKey, "/channel-group/").concat(_utils["default"].encodeString(channelGroup));
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
      channels = _incomingParams$chann === void 0 ? [] : _incomingParams$chann;
  return {
    remove: channels.join(',')
  };
}

function handleResponse() {
  return {};
}

/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

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

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(3));

function getOperation() {
  return _operations["default"].PNRemoveGroupOperation;
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
  return "/v1/channel-registration/sub-key/".concat(config.subscribeKey, "/channel-group/").concat(_utils["default"].encodeString(channelGroup), "/remove");
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
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

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

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

function getOperation() {
  return _operations["default"].PNChannelGroupsOperation;
}

function validateParams(modules) {
  var config = modules.config;
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function getURL(modules) {
  var config = modules.config;
  return "/v1/channel-registration/sub-key/".concat(config.subscribeKey, "/channel-group");
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
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

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

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(3));

function getOperation() {
  return _operations["default"].PNChannelsForGroupOperation;
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
  return "/v1/channel-registration/sub-key/".concat(config.subscribeKey, "/channel-group/").concat(_utils["default"].encodeString(channelGroup));
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
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

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

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

function getOperation() {
  return _operations["default"].PNPushNotificationEnabledChannelsOperation;
}

function validateParams(modules, incomingParams) {
  var device = incomingParams.device,
      pushGateway = incomingParams.pushGateway,
      channels = incomingParams.channels,
      topic = incomingParams.topic;
  var config = modules.config;
  if (!device) return 'Missing Device ID (device)';
  if (!pushGateway) return 'Missing GW Type (pushGateway: gcm, apns or apns2)';
  if (pushGateway === 'apns2' && !topic) return 'Missing APNS2 topic';
  if (!channels || channels.length === 0) return 'Missing Channels';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function getURL(modules, incomingParams) {
  var device = incomingParams.device,
      pushGateway = incomingParams.pushGateway;
  var config = modules.config;

  if (pushGateway === 'apns2') {
    return "/v2/push/sub-key/".concat(config.subscribeKey, "/devices-apns2/").concat(device);
  }

  return "/v1/push/sub-key/".concat(config.subscribeKey, "/devices/").concat(device);
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
      channels = _incomingParams$chann === void 0 ? [] : _incomingParams$chann,
      _incomingParams$envir = incomingParams.environment,
      environment = _incomingParams$envir === void 0 ? 'development' : _incomingParams$envir,
      topic = incomingParams.topic;
  var parameters = {
    type: pushGateway,
    add: channels.join(',')
  };

  if (pushGateway === 'apns2') {
    parameters = Object.assign({}, parameters, {
      environment: environment,
      topic: topic
    });
    delete parameters.type;
  }

  return parameters;
}

function handleResponse() {
  return {};
}

/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

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

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

function getOperation() {
  return _operations["default"].PNPushNotificationEnabledChannelsOperation;
}

function validateParams(modules, incomingParams) {
  var device = incomingParams.device,
      pushGateway = incomingParams.pushGateway,
      channels = incomingParams.channels,
      topic = incomingParams.topic;
  var config = modules.config;
  if (!device) return 'Missing Device ID (device)';
  if (!pushGateway) return 'Missing GW Type (pushGateway: gcm, apns or apns2)';
  if (pushGateway === 'apns2' && !topic) return 'Missing APNS2 topic';
  if (!channels || channels.length === 0) return 'Missing Channels';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function getURL(modules, incomingParams) {
  var device = incomingParams.device,
      pushGateway = incomingParams.pushGateway;
  var config = modules.config;

  if (pushGateway === 'apns2') {
    return "/v2/push/sub-key/".concat(config.subscribeKey, "/devices-apns2/").concat(device);
  }

  return "/v1/push/sub-key/".concat(config.subscribeKey, "/devices/").concat(device);
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
      channels = _incomingParams$chann === void 0 ? [] : _incomingParams$chann,
      _incomingParams$envir = incomingParams.environment,
      environment = _incomingParams$envir === void 0 ? 'development' : _incomingParams$envir,
      topic = incomingParams.topic;
  var parameters = {
    type: pushGateway,
    remove: channels.join(',')
  };

  if (pushGateway === 'apns2') {
    parameters = Object.assign({}, parameters, {
      environment: environment,
      topic: topic
    });
    delete parameters.type;
  }

  return parameters;
}

function handleResponse() {
  return {};
}

/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

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

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

function getOperation() {
  return _operations["default"].PNPushNotificationEnabledChannelsOperation;
}

function validateParams(modules, incomingParams) {
  var device = incomingParams.device,
      pushGateway = incomingParams.pushGateway,
      topic = incomingParams.topic;
  var config = modules.config;
  if (!device) return 'Missing Device ID (device)';
  if (!pushGateway) return 'Missing GW Type (pushGateway: gcm, apns or apns2)';
  if (pushGateway === 'apns2' && !topic) return 'Missing APNS2 topic';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function getURL(modules, incomingParams) {
  var device = incomingParams.device,
      pushGateway = incomingParams.pushGateway;
  var config = modules.config;

  if (pushGateway === 'apns2') {
    return "/v2/push/sub-key/".concat(config.subscribeKey, "/devices-apns2/").concat(device);
  }

  return "/v1/push/sub-key/".concat(config.subscribeKey, "/devices/").concat(device);
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
      _incomingParams$envir = incomingParams.environment,
      environment = _incomingParams$envir === void 0 ? 'development' : _incomingParams$envir,
      topic = incomingParams.topic;
  var parameters = {
    type: pushGateway
  };

  if (pushGateway === 'apns2') {
    parameters = Object.assign({}, parameters, {
      environment: environment,
      topic: topic
    });
    delete parameters.type;
  }

  return parameters;
}

function handleResponse(modules, serverResponse) {
  return {
    channels: serverResponse
  };
}

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

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

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

function getOperation() {
  return _operations["default"].PNRemoveAllPushNotificationsOperation;
}

function validateParams(modules, incomingParams) {
  var device = incomingParams.device,
      pushGateway = incomingParams.pushGateway,
      topic = incomingParams.topic;
  var config = modules.config;
  if (!device) return 'Missing Device ID (device)';
  if (!pushGateway) return 'Missing GW Type (pushGateway: gcm, apns or apns2)';
  if (pushGateway === 'apns2' && !topic) return 'Missing APNS2 topic';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function getURL(modules, incomingParams) {
  var device = incomingParams.device,
      pushGateway = incomingParams.pushGateway;
  var config = modules.config;

  if (pushGateway === 'apns2') {
    return "/v2/push/sub-key/".concat(config.subscribeKey, "/devices-apns2/").concat(device, "/remove");
  }

  return "/v1/push/sub-key/".concat(config.subscribeKey, "/devices/").concat(device, "/remove");
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
      _incomingParams$envir = incomingParams.environment,
      environment = _incomingParams$envir === void 0 ? 'development' : _incomingParams$envir,
      topic = incomingParams.topic;
  var parameters = {
    type: pushGateway
  };

  if (pushGateway === 'apns2') {
    parameters = Object.assign({}, parameters, {
      environment: environment,
      topic: topic
    });
    delete parameters.type;
  }

  return parameters;
}

function handleResponse() {
  return {};
}

/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

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

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(3));

function getOperation() {
  return _operations["default"].PNUnsubscribeOperation;
}

function validateParams(modules) {
  var config = modules.config;
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function getURL(modules, incomingParams) {
  var config = modules.config;
  var _incomingParams$chann = incomingParams.channels,
      channels = _incomingParams$chann === void 0 ? [] : _incomingParams$chann;
  var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
  return "/v2/presence/sub-key/".concat(config.subscribeKey, "/channel/").concat(_utils["default"].encodeString(stringifiedChannels), "/leave");
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
      channelGroups = _incomingParams$chann2 === void 0 ? [] : _incomingParams$chann2;
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
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

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

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

function getOperation() {
  return _operations["default"].PNWhereNowOperation;
}

function validateParams(modules) {
  var config = modules.config;
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function getURL(modules, incomingParams) {
  var config = modules.config;
  var _incomingParams$uuid = incomingParams.uuid,
      uuid = _incomingParams$uuid === void 0 ? config.UUID : _incomingParams$uuid;
  return "/v2/presence/sub-key/".concat(config.subscribeKey, "/uuid/").concat(uuid);
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
    return {
      channels: []
    };
  }

  return {
    channels: serverResponse.payload.channels
  };
}

/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

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

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(3));

function getOperation() {
  return _operations["default"].PNHeartbeatOperation;
}

function validateParams(modules) {
  var config = modules.config;
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function getURL(modules, incomingParams) {
  var config = modules.config;
  var _incomingParams$chann = incomingParams.channels,
      channels = _incomingParams$chann === void 0 ? [] : _incomingParams$chann;
  var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
  return "/v2/presence/sub-key/".concat(config.subscribeKey, "/channel/").concat(_utils["default"].encodeString(stringifiedChannels), "/heartbeat");
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
      channelGroups = _incomingParams$chann2 === void 0 ? [] : _incomingParams$chann2,
      _incomingParams$state = incomingParams.state,
      state = _incomingParams$state === void 0 ? {} : _incomingParams$state;
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
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

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

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(3));

function getOperation() {
  return _operations["default"].PNGetStateOperation;
}

function validateParams(modules) {
  var config = modules.config;
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function getURL(modules, incomingParams) {
  var config = modules.config;
  var _incomingParams$uuid = incomingParams.uuid,
      uuid = _incomingParams$uuid === void 0 ? config.UUID : _incomingParams$uuid,
      _incomingParams$chann = incomingParams.channels,
      channels = _incomingParams$chann === void 0 ? [] : _incomingParams$chann;
  var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
  return "/v2/presence/sub-key/".concat(config.subscribeKey, "/channel/").concat(_utils["default"].encodeString(stringifiedChannels), "/uuid/").concat(uuid);
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
      channelGroups = _incomingParams$chann2 === void 0 ? [] : _incomingParams$chann2;
  var params = {};

  if (channelGroups.length > 0) {
    params['channel-group'] = channelGroups.join(',');
  }

  return params;
}

function handleResponse(modules, serverResponse, incomingParams) {
  var _incomingParams$chann3 = incomingParams.channels,
      channels = _incomingParams$chann3 === void 0 ? [] : _incomingParams$chann3,
      _incomingParams$chann4 = incomingParams.channelGroups,
      channelGroups = _incomingParams$chann4 === void 0 ? [] : _incomingParams$chann4;
  var channelsResponse = {};

  if (channels.length === 1 && channelGroups.length === 0) {
    channelsResponse[channels[0]] = serverResponse.payload;
  } else {
    channelsResponse = serverResponse.payload;
  }

  return {
    channels: channelsResponse
  };
}

/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

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

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(3));

function getOperation() {
  return _operations["default"].PNSetStateOperation;
}

function validateParams(modules, incomingParams) {
  var config = modules.config;
  var state = incomingParams.state,
      _incomingParams$chann = incomingParams.channels,
      channels = _incomingParams$chann === void 0 ? [] : _incomingParams$chann,
      _incomingParams$chann2 = incomingParams.channelGroups,
      channelGroups = _incomingParams$chann2 === void 0 ? [] : _incomingParams$chann2;
  if (!state) return 'Missing State';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
  if (channels.length === 0 && channelGroups.length === 0) return 'Please provide a list of channels and/or channel-groups';
}

function getURL(modules, incomingParams) {
  var config = modules.config;
  var _incomingParams$chann3 = incomingParams.channels,
      channels = _incomingParams$chann3 === void 0 ? [] : _incomingParams$chann3;
  var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
  return "/v2/presence/sub-key/".concat(config.subscribeKey, "/channel/").concat(_utils["default"].encodeString(stringifiedChannels), "/uuid/").concat(config.UUID, "/data");
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
      channelGroups = _incomingParams$chann4 === void 0 ? [] : _incomingParams$chann4;
  var params = {};
  params.state = JSON.stringify(state);

  if (channelGroups.length > 0) {
    params['channel-group'] = channelGroups.join(',');
  }

  return params;
}

function handleResponse(modules, serverResponse) {
  return {
    state: serverResponse.payload
  };
}

/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

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

var _defineProperty2 = _interopRequireDefault(__webpack_require__(4));

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(3));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function getOperation() {
  return _operations["default"].PNHereNowOperation;
}

function validateParams(modules) {
  var config = modules.config;
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function getURL(modules, incomingParams) {
  var config = modules.config;
  var _incomingParams$chann = incomingParams.channels,
      channels = _incomingParams$chann === void 0 ? [] : _incomingParams$chann,
      _incomingParams$chann2 = incomingParams.channelGroups,
      channelGroups = _incomingParams$chann2 === void 0 ? [] : _incomingParams$chann2;
  var baseURL = "/v2/presence/sub-key/".concat(config.subscribeKey);

  if (channels.length > 0 || channelGroups.length > 0) {
    var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
    baseURL += "/channel/".concat(_utils["default"].encodeString(stringifiedChannels));
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
      channelGroups = _incomingParams$chann3 === void 0 ? [] : _incomingParams$chann3,
      _incomingParams$inclu = incomingParams.includeUUIDs,
      includeUUIDs = _incomingParams$inclu === void 0 ? true : _incomingParams$inclu,
      _incomingParams$inclu2 = incomingParams.includeState,
      includeState = _incomingParams$inclu2 === void 0 ? false : _incomingParams$inclu2,
      _incomingParams$query = incomingParams.queryParameters,
      queryParameters = _incomingParams$query === void 0 ? {} : _incomingParams$query;
  var params = {};
  if (!includeUUIDs) params.disable_uuids = 1;
  if (includeState) params.state = 1;

  if (channelGroups.length > 0) {
    params['channel-group'] = channelGroups.join(',');
  }

  params = _objectSpread(_objectSpread({}, params), queryParameters);
  return params;
}

function handleResponse(modules, serverResponse, incomingParams) {
  var _incomingParams$chann4 = incomingParams.channels,
      channels = _incomingParams$chann4 === void 0 ? [] : _incomingParams$chann4,
      _incomingParams$chann5 = incomingParams.channelGroups,
      channelGroups = _incomingParams$chann5 === void 0 ? [] : _incomingParams$chann5,
      _incomingParams$inclu3 = incomingParams.includeUUIDs,
      includeUUIDs = _incomingParams$inclu3 === void 0 ? true : _incomingParams$inclu3,
      _incomingParams$inclu4 = incomingParams.includeState,
      includeState = _incomingParams$inclu4 === void 0 ? false : _incomingParams$inclu4;

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
          occupantsList.push({
            state: uuidEntry.state,
            uuid: uuidEntry.uuid
          });
        } else {
          occupantsList.push({
            state: null,
            uuid: uuidEntry
          });
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
            occupantsList.push({
              state: uuidEntry.state,
              uuid: uuidEntry.uuid
            });
          } else {
            occupantsList.push({
              state: null,
              uuid: uuidEntry
            });
          }
        });
      }

      return response;
    });
    return response;
  };

  var response;

  if (channels.length > 1 || channelGroups.length > 0 || channelGroups.length === 0 && channels.length === 0) {
    response = prepareMultipleChannel();
  } else {
    response = prepareSingularChannel();
  }

  return response;
}

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperation = getOperation;
exports.validateParams = validateParams;
exports.usePost = usePost;
exports.postURL = postURL;
exports.getRequestTimeout = getRequestTimeout;
exports.getRequestHeaders = getRequestHeaders;
exports.isAuthSupported = isAuthSupported;
exports.prepareParams = prepareParams;
exports.postPayload = postPayload;
exports.handleResponse = handleResponse;

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

function getOperation() {
  return _operations["default"].PNAddMessageActionOperation;
}

function validateParams(_ref, incomingParams) {
  var config = _ref.config;
  var action = incomingParams.action,
      channel = incomingParams.channel,
      messageTimetoken = incomingParams.messageTimetoken;
  if (!messageTimetoken) return 'Missing message timetoken';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
  if (!channel) return 'Missing message channel';
  if (!action) return 'Missing Action';
  if (!action.value) return 'Missing Action.value';
  if (!action.type) return 'Missing Action.type';
  if (action.type.length > 15) return 'Action.type value exceed maximum length of 15';
}

function usePost() {
  return true;
}

function postURL(_ref2, incomingParams) {
  var config = _ref2.config;
  var channel = incomingParams.channel,
      messageTimetoken = incomingParams.messageTimetoken;
  return "/v1/message-actions/".concat(config.subscribeKey, "/channel/").concat(channel, "/message/").concat(messageTimetoken);
}

function getRequestTimeout(_ref3) {
  var config = _ref3.config;
  return config.getTransactionTimeout();
}

function getRequestHeaders() {
  return {
    'Content-Type': 'application/json'
  };
}

function isAuthSupported() {
  return true;
}

function prepareParams() {
  return {};
}

function postPayload(modules, incomingParams) {
  return incomingParams.action;
}

function handleResponse(modules, addMessageActionResponse) {
  return {
    data: addMessageActionResponse.data
  };
}

/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

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

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

function getOperation() {
  return _operations["default"].PNRemoveMessageActionOperation;
}

function validateParams(_ref, incomingParams) {
  var config = _ref.config;
  var channel = incomingParams.channel,
      actionTimetoken = incomingParams.actionTimetoken,
      messageTimetoken = incomingParams.messageTimetoken;
  if (!messageTimetoken) return 'Missing message timetoken';
  if (!actionTimetoken) return 'Missing action timetoken';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
  if (!channel) return 'Missing message channel';
}

function useDelete() {
  return true;
}

function getURL(_ref2, incomingParams) {
  var config = _ref2.config;
  var channel = incomingParams.channel,
      actionTimetoken = incomingParams.actionTimetoken,
      messageTimetoken = incomingParams.messageTimetoken;
  return "/v1/message-actions/".concat(config.subscribeKey, "/channel/").concat(channel, "/message/").concat(messageTimetoken, "/action/").concat(actionTimetoken);
}

function getRequestTimeout(_ref3) {
  var config = _ref3.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function prepareParams() {
  return {};
}

function handleResponse(modules, removeMessageActionResponse) {
  return {
    data: removeMessageActionResponse.data
  };
}

/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

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

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

function getOperation() {
  return _operations["default"].PNGetMessageActionsOperation;
}

function validateParams(_ref, incomingParams) {
  var config = _ref.config;
  var channel = incomingParams.channel;
  if (!config.subscribeKey) return 'Missing Subscribe Key';
  if (!channel) return 'Missing message channel';
}

function getURL(_ref2, incomingParams) {
  var config = _ref2.config;
  var channel = incomingParams.channel;
  return "/v1/message-actions/".concat(config.subscribeKey, "/channel/").concat(channel);
}

function getRequestTimeout(_ref3) {
  var config = _ref3.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function prepareParams(modules, incomingParams) {
  var limit = incomingParams.limit,
      start = incomingParams.start,
      end = incomingParams.end;
  var outgoingParams = {};
  if (limit) outgoingParams.limit = limit;
  if (start) outgoingParams.start = start;
  if (end) outgoingParams.end = end;
  return outgoingParams;
}

function handleResponse(modules, getMessageActionsResponse) {
  var response = {
    data: getMessageActionsResponse.data,
    start: null,
    end: null
  };

  if (response.data.length) {
    response.end = response.data[response.data.length - 1].actionTimetoken;
    response.start = response.data[0].actionTimetoken;
  }

  return response;
}

/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _operations = _interopRequireDefault(__webpack_require__(1));

var endpoint = {
  getOperation: function getOperation() {
    return _operations["default"].PNListFilesOperation;
  },
  validateParams: function validateParams(_, params) {
    if (!(params === null || params === void 0 ? void 0 : params.channel)) {
      return 'channel can\'t be empty';
    }
  },
  getURL: function getURL(_ref, params) {
    var config = _ref.config;
    return "/v1/files/".concat(config.subscribeKey, "/channels/").concat(params.channel, "/files");
  },
  getRequestTimeout: function getRequestTimeout(_ref2) {
    var config = _ref2.config;
    return config.getTransactionTimeout();
  },
  isAuthSupported: function isAuthSupported() {
    return true;
  },
  getAuthToken: function getAuthToken(_ref3) {
    var tokenManager = _ref3.tokenManager;
    return tokenManager.getToken('fileUpload');
  },
  prepareParams: function prepareParams(_, params) {
    var outParams = {};

    if (params.limit) {
      outParams.limit = params.limit;
    }

    if (params.next) {
      outParams.next = params.next;
    }

    return outParams;
  },
  handleResponse: function handleResponse(_, response) {
    return {
      status: response.status,
      data: response.data,
      next: response.next,
      count: response.count
    };
  }
};
var _default = endpoint;
exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _operations = _interopRequireDefault(__webpack_require__(1));

var endpoint = {
  getOperation: function getOperation() {
    return _operations["default"].PNGenerateUploadUrlOperation;
  },
  validateParams: function validateParams(_, params) {
    if (!(params === null || params === void 0 ? void 0 : params.channel)) {
      return 'channel can\'t be empty';
    }

    if (!(params === null || params === void 0 ? void 0 : params.name)) {
      return 'name can\'t be empty';
    }
  },
  usePost: function usePost() {
    return true;
  },
  postURL: function postURL(_ref, params) {
    var config = _ref.config;
    return "/v1/files/".concat(config.subscribeKey, "/channels/").concat(params.channel, "/generate-upload-url");
  },
  postPayload: function postPayload(_, params) {
    return {
      name: params.name
    };
  },
  getRequestTimeout: function getRequestTimeout(_ref2) {
    var config = _ref2.config;
    return config.getTransactionTimeout();
  },
  isAuthSupported: function isAuthSupported() {
    return true;
  },
  getAuthToken: function getAuthToken(_ref3) {
    var tokenManager = _ref3.tokenManager;
    return tokenManager.getToken('fileUpload');
  },
  prepareParams: function prepareParams() {
    return {};
  },
  handleResponse: function handleResponse(_, response) {
    return {
      status: response.status,
      data: response.data,
      file_upload_request: response.file_upload_request
    };
  }
};
var _default = endpoint;
exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _typeof2 = _interopRequireDefault(__webpack_require__(7));

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(3));

var preparePayload = function preparePayload(_ref, payload) {
  var crypto = _ref.crypto,
      config = _ref.config;
  var stringifiedPayload = JSON.stringify(payload);

  if (config.cipherKey) {
    stringifiedPayload = crypto.encrypt(stringifiedPayload);
    stringifiedPayload = JSON.stringify(stringifiedPayload);
  }

  return stringifiedPayload || '';
};

var endpoint = {
  getOperation: function getOperation() {
    return _operations["default"].PNPublishFileOperation;
  },
  validateParams: function validateParams(_, params) {
    if (!(params === null || params === void 0 ? void 0 : params.channel)) {
      return "channel can't be empty";
    }

    if (!(params === null || params === void 0 ? void 0 : params.fileId)) {
      return "file id can't be empty";
    }

    if (!(params === null || params === void 0 ? void 0 : params.fileName)) {
      return "file name can't be empty";
    }
  },
  getURL: function getURL(modules, params) {
    var _modules$config = modules.config,
        publishKey = _modules$config.publishKey,
        subscribeKey = _modules$config.subscribeKey;
    var message = {
      message: params.message,
      file: {
        name: params.fileName,
        id: params.fileId
      }
    };
    var payload = preparePayload(modules, message);
    return "/v1/files/publish-file/".concat(publishKey, "/").concat(subscribeKey, "/0/").concat(params.channel, "/0/").concat(_utils["default"].encodeString(payload));
  },
  getRequestTimeout: function getRequestTimeout(_ref2) {
    var config = _ref2.config;
    return config.getTransactionTimeout();
  },
  isAuthSupported: function isAuthSupported() {
    return true;
  },
  getAuthToken: function getAuthToken(_ref3) {
    var tokenManager = _ref3.tokenManager;
    return tokenManager.getToken('fileUpload');
  },
  prepareParams: function prepareParams(_, params) {
    var outParams = {};

    if (params.ttl) {
      outParams.ttl = params.ttl;
    }

    if (params.storeInHistory !== undefined) {
      outParams.store = params.storeInHistory ? '1' : '0';
    }

    if (params.meta && (0, _typeof2["default"])(params.meta) === 'object') {
      outParams.meta = JSON.stringify(params.meta);
    }

    return outParams;
  },
  handleResponse: function handleResponse(_, response) {
    return {
      timetoken: response['2']
    };
  }
};
var _default = endpoint;
exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(__webpack_require__(11));

var _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(12));

var _endpoint = __webpack_require__(18);

var getErrorFromResponse = function getErrorFromResponse(response) {
  return new Promise(function (resolve) {
    var result = '';
    response.on('data', function (data) {
      result += data.toString('utf8');
    });
    response.on('end', function () {
      resolve(result);
    });
  });
};

var sendFile = function sendFile(_ref) {
  var generateUploadUrl = _ref.generateUploadUrl,
      publishFile = _ref.publishFile,
      _ref$modules = _ref.modules,
      PubNubFile = _ref$modules.PubNubFile,
      config = _ref$modules.config,
      cryptography = _ref$modules.cryptography,
      networking = _ref$modules.networking;
  return function () {
    var _ref3 = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee(_ref2) {
      var channel, input, message, cipherKey, meta, ttl, storeInHistory, file, _yield$generateUpload, _yield$generateUpload2, url, formFields, _yield$generateUpload3, id, name, formFieldsWithMimeType, result, errorBody, reason, retries, wasSuccessful, publishResult;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              channel = _ref2.channel, input = _ref2.file, message = _ref2.message, cipherKey = _ref2.cipherKey, meta = _ref2.meta, ttl = _ref2.ttl, storeInHistory = _ref2.storeInHistory;

              if (channel) {
                _context.next = 3;
                break;
              }

              throw new _endpoint.PubNubError('Validation failed, check status for details', (0, _endpoint.createValidationError)("channel can't be empty"));

            case 3:
              if (input) {
                _context.next = 5;
                break;
              }

              throw new _endpoint.PubNubError('Validation failed, check status for details', (0, _endpoint.createValidationError)("file can't be empty"));

            case 5:
              file = PubNubFile.create(input);
              _context.next = 8;
              return generateUploadUrl({
                channel: channel,
                name: file.name
              });

            case 8:
              _yield$generateUpload = _context.sent;
              _yield$generateUpload2 = _yield$generateUpload.file_upload_request;
              url = _yield$generateUpload2.url;
              formFields = _yield$generateUpload2.form_fields;
              _yield$generateUpload3 = _yield$generateUpload.data;
              id = _yield$generateUpload3.id;
              name = _yield$generateUpload3.name;

              if (!(PubNubFile.supportsEncryptFile && (cipherKey !== null && cipherKey !== void 0 ? cipherKey : config.cipherKey))) {
                _context.next = 19;
                break;
              }

              _context.next = 18;
              return cryptography.encryptFile(cipherKey !== null && cipherKey !== void 0 ? cipherKey : config.cipherKey, file, PubNubFile);

            case 18:
              file = _context.sent;

            case 19:
              formFieldsWithMimeType = formFields;

              if (file.mimeType) {
                formFieldsWithMimeType = formFields.map(function (entry) {
                  if (entry.key === 'Content-Type') return {
                    key: entry.key,
                    value: file.mimeType
                  };else return entry;
                });
              }

              _context.prev = 21;

              if (!(PubNubFile.supportsFileUri && input.uri)) {
                _context.next = 34;
                break;
              }

              _context.t0 = networking;
              _context.t1 = url;
              _context.t2 = formFieldsWithMimeType;
              _context.next = 28;
              return file.toFileUri();

            case 28:
              _context.t3 = _context.sent;
              _context.next = 31;
              return _context.t0.POSTFILE.call(_context.t0, _context.t1, _context.t2, _context.t3);

            case 31:
              result = _context.sent;
              _context.next = 71;
              break;

            case 34:
              if (!PubNubFile.supportsFile) {
                _context.next = 46;
                break;
              }

              _context.t4 = networking;
              _context.t5 = url;
              _context.t6 = formFieldsWithMimeType;
              _context.next = 40;
              return file.toFile();

            case 40:
              _context.t7 = _context.sent;
              _context.next = 43;
              return _context.t4.POSTFILE.call(_context.t4, _context.t5, _context.t6, _context.t7);

            case 43:
              result = _context.sent;
              _context.next = 71;
              break;

            case 46:
              if (!PubNubFile.supportsBuffer) {
                _context.next = 58;
                break;
              }

              _context.t8 = networking;
              _context.t9 = url;
              _context.t10 = formFieldsWithMimeType;
              _context.next = 52;
              return file.toBuffer();

            case 52:
              _context.t11 = _context.sent;
              _context.next = 55;
              return _context.t8.POSTFILE.call(_context.t8, _context.t9, _context.t10, _context.t11);

            case 55:
              result = _context.sent;
              _context.next = 71;
              break;

            case 58:
              if (!PubNubFile.supportsBlob) {
                _context.next = 70;
                break;
              }

              _context.t12 = networking;
              _context.t13 = url;
              _context.t14 = formFieldsWithMimeType;
              _context.next = 64;
              return file.toBlob();

            case 64:
              _context.t15 = _context.sent;
              _context.next = 67;
              return _context.t12.POSTFILE.call(_context.t12, _context.t13, _context.t14, _context.t15);

            case 67:
              result = _context.sent;
              _context.next = 71;
              break;

            case 70:
              throw new Error('Unsupported environment');

            case 71:
              _context.next = 80;
              break;

            case 73:
              _context.prev = 73;
              _context.t16 = _context["catch"](21);
              _context.next = 77;
              return getErrorFromResponse(_context.t16.response);

            case 77:
              errorBody = _context.sent;
              reason = /<Message>(.*)<\/Message>/gi.exec(errorBody);
              throw new _endpoint.PubNubError(reason ? "Upload to bucket failed: ".concat(reason[1]) : 'Upload to bucket failed.', _context.t16);

            case 80:
              if (!(result.status !== 204)) {
                _context.next = 82;
                break;
              }

              throw new _endpoint.PubNubError('Upload to bucket was unsuccessful', result);

            case 82:
              retries = 5;
              wasSuccessful = false;
              publishResult = {
                timetoken: '0'
              };

            case 85:
              if (!(!wasSuccessful && retries > 0)) {
                _context.next = 98;
                break;
              }

              _context.prev = 86;
              _context.next = 89;
              return publishFile({
                channel: channel,
                message: message,
                fileId: id,
                fileName: name,
                meta: meta,
                storeInHistory: storeInHistory,
                ttl: ttl
              });

            case 89:
              publishResult = _context.sent;
              wasSuccessful = true;
              _context.next = 96;
              break;

            case 93:
              _context.prev = 93;
              _context.t17 = _context["catch"](86);
              retries -= 1;

            case 96:
              _context.next = 85;
              break;

            case 98:
              if (wasSuccessful) {
                _context.next = 102;
                break;
              }

              throw new _endpoint.PubNubError('Publish failed. You may want to execute that operation manually using pubnub.publishFile', {
                channel: channel,
                id: id,
                name: name
              });

            case 102:
              return _context.abrupt("return", {
                timetoken: publishResult.timetoken,
                id: id,
                name: name
              });

            case 103:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[21, 73], [86, 93]]);
    }));

    return function (_x) {
      return _ref3.apply(this, arguments);
    };
  }();
};

var _default = function _default(deps) {
  var f = sendFile(deps);
  return function (params, cb) {
    var resultP = f(params);

    if (typeof cb === 'function') {
      resultP.then(function (result) {
        return cb(null, result);
      })["catch"](function (error) {
        return cb(error, null);
      });
      return resultP;
    } else {
      return resultP;
    }
  };
};

exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
   true ? module.exports : undefined
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}


/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _endpoint = __webpack_require__(18);

var _default = function _default(modules, _ref) {
  var channel = _ref.channel,
      id = _ref.id,
      name = _ref.name;
  var config = modules.config;

  if (!channel) {
    throw new _endpoint.PubNubError('Validation failed, check status for details', (0, _endpoint.createValidationError)("channel can't be empty"));
  }

  if (!id) {
    throw new _endpoint.PubNubError('Validation failed, check status for details', (0, _endpoint.createValidationError)("file id can't be empty"));
  }

  if (!name) {
    throw new _endpoint.PubNubError('Validation failed, check status for details', (0, _endpoint.createValidationError)("file name can't be empty"));
  }

  var url = "/v1/files/".concat(config.subscribeKey, "/channels/").concat(channel, "/files/").concat(id, "/").concat(name);
  var params = {};
  params.uuid = config.getUUID();
  params.pnsdk = (0, _endpoint.generatePNSDK)(config);

  if (config.getAuthKey()) {
    params.auth = config.getAuthKey();
  }

  if (config.secretKey) {
    (0, _endpoint.signRequest)(modules, url, params, {}, {
      getOperation: function getOperation() {
        return 'PubNubGetFileUrlOperation';
      }
    });
  }

  var queryParams = Object.keys(params).map(function (key) {
    return "".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(params[key]));
  }).join('&');

  if (queryParams !== '') {
    return "https://".concat(config.origin).concat(url, "?").concat(queryParams);
  }

  return "https://".concat(config.origin).concat(url);
};

exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(__webpack_require__(11));

var _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(12));

var _operations = _interopRequireDefault(__webpack_require__(1));

var endpoint = {
  getOperation: function getOperation() {
    return _operations["default"].PNDownloadFileOperation;
  },
  validateParams: function validateParams(_, params) {
    if (!(params === null || params === void 0 ? void 0 : params.channel)) {
      return "channel can't be empty";
    }

    if (!(params === null || params === void 0 ? void 0 : params.name)) {
      return "name can't be empty";
    }

    if (!(params === null || params === void 0 ? void 0 : params.id)) {
      return "id can't be empty";
    }
  },
  useGetFile: function useGetFile() {
    return true;
  },
  getFileURL: function getFileURL(_ref, params) {
    var config = _ref.config;
    return "/v1/files/".concat(config.subscribeKey, "/channels/").concat(params.channel, "/files/").concat(params.id, "/").concat(params.name);
  },
  getRequestTimeout: function getRequestTimeout(_ref2) {
    var config = _ref2.config;
    return config.getTransactionTimeout();
  },
  isAuthSupported: function isAuthSupported() {
    return true;
  },
  ignoreBody: function ignoreBody() {
    return true;
  },
  forceBuffered: function forceBuffered() {
    return true;
  },
  prepareParams: function prepareParams() {
    return {};
  },
  handleResponse: function () {
    var _handleResponse = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee(_ref3, res, params) {
      var _res$response$name;

      var PubNubFile, config, cryptography, body, _params$cipherKey;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              PubNubFile = _ref3.PubNubFile, config = _ref3.config, cryptography = _ref3.cryptography;
              body = res.response.body;

              if (!(PubNubFile.supportsEncryptFile && config.cipherKey)) {
                _context.next = 6;
                break;
              }

              _context.next = 5;
              return cryptography.decrypt((_params$cipherKey = params.cipherKey) !== null && _params$cipherKey !== void 0 ? _params$cipherKey : config.cipherKey, body);

            case 5:
              body = _context.sent;

            case 6:
              return _context.abrupt("return", PubNubFile.create({
                data: body,
                name: (_res$response$name = res.response.name) !== null && _res$response$name !== void 0 ? _res$response$name : params.name,
                mimeType: res.response.type
              }));

            case 7:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    function handleResponse(_x, _x2, _x3) {
      return _handleResponse.apply(this, arguments);
    }

    return handleResponse;
  }()
};
var _default = endpoint;
exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _operations = _interopRequireDefault(__webpack_require__(1));

var endpoint = {
  getOperation: function getOperation() {
    return _operations["default"].PNListFilesOperation;
  },
  validateParams: function validateParams(_, params) {
    if (!(params === null || params === void 0 ? void 0 : params.channel)) {
      return "channel can't be empty";
    }

    if (!(params === null || params === void 0 ? void 0 : params.id)) {
      return "file id can't be empty";
    }

    if (!(params === null || params === void 0 ? void 0 : params.name)) {
      return "file name can't be empty";
    }
  },
  useDelete: function useDelete() {
    return true;
  },
  getURL: function getURL(_ref, params) {
    var config = _ref.config;
    return "/v1/files/".concat(config.subscribeKey, "/channels/").concat(params.channel, "/files/").concat(params.id, "/").concat(params.name);
  },
  getRequestTimeout: function getRequestTimeout(_ref2) {
    var config = _ref2.config;
    return config.getTransactionTimeout();
  },
  isAuthSupported: function isAuthSupported() {
    return true;
  },
  getAuthToken: function getAuthToken(_ref3) {
    var tokenManager = _ref3.tokenManager;
    return tokenManager.getToken('fileUpload');
  },
  prepareParams: function prepareParams() {
    return {};
  },
  handleResponse: function handleResponse(_, response) {
    return {
      status: response.status
    };
  }
};
var _default = endpoint;
exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slicedToArray2 = _interopRequireDefault(__webpack_require__(9));

var _operations = _interopRequireDefault(__webpack_require__(1));

var endpoint = {
  getOperation: function getOperation() {
    return _operations["default"].PNGetAllUUIDMetadataOperation;
  },
  validateParams: function validateParams() {},
  getURL: function getURL(_ref) {
    var config = _ref.config;
    return "/v2/objects/".concat(config.subscribeKey, "/uuids");
  },
  getRequestTimeout: function getRequestTimeout(_ref2) {
    var config = _ref2.config;
    return config.getTransactionTimeout();
  },
  isAuthSupported: function isAuthSupported() {
    return true;
  },
  getAuthToken: function getAuthToken(_ref3) {
    var tokenManager = _ref3.tokenManager;
    return tokenManager.getToken('user');
  },
  prepareParams: function prepareParams(_modules, params) {
    var _params$include, _params$include2, _params$page, _params$page3;

    var queryParams = {};

    if (params === null || params === void 0 ? void 0 : (_params$include = params.include) === null || _params$include === void 0 ? void 0 : _params$include.customFields) {
      queryParams.include = 'custom';
    }

    if (params === null || params === void 0 ? void 0 : (_params$include2 = params.include) === null || _params$include2 === void 0 ? void 0 : _params$include2.totalCount) {
      var _params$include3;

      queryParams.count = (_params$include3 = params.include) === null || _params$include3 === void 0 ? void 0 : _params$include3.totalCount;
    }

    if (params === null || params === void 0 ? void 0 : (_params$page = params.page) === null || _params$page === void 0 ? void 0 : _params$page.next) {
      var _params$page2;

      queryParams.start = (_params$page2 = params.page) === null || _params$page2 === void 0 ? void 0 : _params$page2.next;
    }

    if (params === null || params === void 0 ? void 0 : (_params$page3 = params.page) === null || _params$page3 === void 0 ? void 0 : _params$page3.prev) {
      var _params$page4;

      queryParams.end = (_params$page4 = params.page) === null || _params$page4 === void 0 ? void 0 : _params$page4.prev;
    }

    if (params === null || params === void 0 ? void 0 : params.filter) {
      queryParams.filter = params.filter;
    }

    queryParams.limit = params === null || params === void 0 ? void 0 : params.limit;

    if (params === null || params === void 0 ? void 0 : params.sort) {
      var _params$sort;

      queryParams.sort = Object.entries((_params$sort = params.sort) !== null && _params$sort !== void 0 ? _params$sort : {}).map(function (_ref4) {
        var _ref5 = (0, _slicedToArray2["default"])(_ref4, 2),
            key = _ref5[0],
            value = _ref5[1];

        if (value === 'asc' || value === 'desc') {
          return "".concat(key, ":").concat(value);
        } else {
          return key;
        }
      });
    }

    return queryParams;
  },
  handleResponse: function handleResponse(_, response) {
    return {
      status: response.status,
      data: response.data,
      totalCount: response.totalCount,
      next: response.next,
      prev: response.prev
    };
  }
};
var _default = endpoint;
exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 77 */
/***/ (function(module, exports) {

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

module.exports = _arrayWithHoles;

/***/ }),
/* 78 */
/***/ (function(module, exports) {

function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

module.exports = _iterableToArrayLimit;

/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

var arrayLikeToArray = __webpack_require__(80);

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
}

module.exports = _unsupportedIterableToArray;

/***/ }),
/* 80 */
/***/ (function(module, exports) {

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

module.exports = _arrayLikeToArray;

/***/ }),
/* 81 */
/***/ (function(module, exports) {

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

module.exports = _nonIterableRest;

/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _operations = _interopRequireDefault(__webpack_require__(1));

var endpoint = {
  getOperation: function getOperation() {
    return _operations["default"].PNGetUUIDMetadataOperation;
  },
  validateParams: function validateParams() {},
  getURL: function getURL(_ref, params) {
    var _params$uuid;

    var config = _ref.config;
    return "/v2/objects/".concat(config.subscribeKey, "/uuids/").concat((_params$uuid = params === null || params === void 0 ? void 0 : params.uuid) !== null && _params$uuid !== void 0 ? _params$uuid : config.getUUID());
  },
  getRequestTimeout: function getRequestTimeout(_ref2) {
    var config = _ref2.config;
    return config.getTransactionTimeout();
  },
  isAuthSupported: function isAuthSupported() {
    return true;
  },
  getAuthToken: function getAuthToken(_ref3) {
    var tokenManager = _ref3.tokenManager;
    return tokenManager.getToken('user');
  },
  prepareParams: function prepareParams(_ref4, params) {
    var _params$uuid2, _params$include$custo, _params$include;

    var config = _ref4.config;
    return {
      uuid: (_params$uuid2 = params === null || params === void 0 ? void 0 : params.uuid) !== null && _params$uuid2 !== void 0 ? _params$uuid2 : config.getUUID(),
      include: ((_params$include$custo = params === null || params === void 0 ? void 0 : (_params$include = params.include) === null || _params$include === void 0 ? void 0 : _params$include.customFields) !== null && _params$include$custo !== void 0 ? _params$include$custo : true) && 'custom'
    };
  },
  handleResponse: function handleResponse(_, response) {
    return {
      status: response.status,
      data: response.data
    };
  }
};
var _default = endpoint;
exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _operations = _interopRequireDefault(__webpack_require__(1));

var endpoint = {
  getOperation: function getOperation() {
    return _operations["default"].PNSetUUIDMetadataOperation;
  },
  validateParams: function validateParams(_, params) {
    if (!(params === null || params === void 0 ? void 0 : params.data)) {
      return 'Data cannot be empty';
    }
  },
  usePatch: function usePatch() {
    return true;
  },
  patchURL: function patchURL(_ref, params) {
    var _params$uuid;

    var config = _ref.config;
    return "/v2/objects/".concat(config.subscribeKey, "/uuids/").concat((_params$uuid = params === null || params === void 0 ? void 0 : params.uuid) !== null && _params$uuid !== void 0 ? _params$uuid : config.getUUID());
  },
  patchPayload: function patchPayload(_, params) {
    return params.data;
  },
  getRequestTimeout: function getRequestTimeout(_ref2) {
    var config = _ref2.config;
    return config.getTransactionTimeout();
  },
  isAuthSupported: function isAuthSupported() {
    return true;
  },
  getAuthToken: function getAuthToken(_ref3) {
    var tokenManager = _ref3.tokenManager;
    return tokenManager.getToken('user');
  },
  prepareParams: function prepareParams(_ref4, params) {
    var _params$uuid2, _params$include$custo, _params$include;

    var config = _ref4.config;
    return {
      uuid: (_params$uuid2 = params === null || params === void 0 ? void 0 : params.uuid) !== null && _params$uuid2 !== void 0 ? _params$uuid2 : config.getUUID(),
      include: ((_params$include$custo = params === null || params === void 0 ? void 0 : (_params$include = params.include) === null || _params$include === void 0 ? void 0 : _params$include.customFields) !== null && _params$include$custo !== void 0 ? _params$include$custo : true) && 'custom'
    };
  },
  handleResponse: function handleResponse(_, response) {
    return {
      status: response.status,
      data: response.data
    };
  }
};
var _default = endpoint;
exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _operations = _interopRequireDefault(__webpack_require__(1));

var endpoint = {
  getOperation: function getOperation() {
    return _operations["default"].PNRemoveUUIDMetadataOperation;
  },
  validateParams: function validateParams() {},
  getURL: function getURL(_ref, params) {
    var _params$uuid;

    var config = _ref.config;
    return "/v2/objects/".concat(config.subscribeKey, "/uuids/").concat((_params$uuid = params === null || params === void 0 ? void 0 : params.uuid) !== null && _params$uuid !== void 0 ? _params$uuid : config.getUUID());
  },
  useDelete: function useDelete() {
    return true;
  },
  getRequestTimeout: function getRequestTimeout(_ref2) {
    var config = _ref2.config;
    return config.getTransactionTimeout();
  },
  isAuthSupported: function isAuthSupported() {
    return true;
  },
  getAuthToken: function getAuthToken(_ref3) {
    var tokenManager = _ref3.tokenManager;
    return tokenManager.getToken('user');
  },
  prepareParams: function prepareParams(_ref4, params) {
    var _params$uuid2;

    var config = _ref4.config;
    return {
      uuid: (_params$uuid2 = params === null || params === void 0 ? void 0 : params.uuid) !== null && _params$uuid2 !== void 0 ? _params$uuid2 : config.getUUID()
    };
  },
  handleResponse: function handleResponse(_, response) {
    return {
      status: response.status,
      data: response.data
    };
  }
};
var _default = endpoint;
exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slicedToArray2 = _interopRequireDefault(__webpack_require__(9));

var _operations = _interopRequireDefault(__webpack_require__(1));

var endpoint = {
  getOperation: function getOperation() {
    return _operations["default"].PNGetAllChannelMetadataOperation;
  },
  validateParams: function validateParams() {},
  getURL: function getURL(_ref) {
    var config = _ref.config;
    return "/v2/objects/".concat(config.subscribeKey, "/channels");
  },
  getRequestTimeout: function getRequestTimeout(_ref2) {
    var config = _ref2.config;
    return config.getTransactionTimeout();
  },
  isAuthSupported: function isAuthSupported() {
    return true;
  },
  getAuthToken: function getAuthToken(_ref3) {
    var tokenManager = _ref3.tokenManager;
    return tokenManager.getToken('channel');
  },
  prepareParams: function prepareParams(_modules, params) {
    var _params$include, _params$include2, _params$page, _params$page3;

    var queryParams = {};

    if (params === null || params === void 0 ? void 0 : (_params$include = params.include) === null || _params$include === void 0 ? void 0 : _params$include.customFields) {
      queryParams.include = 'custom';
    }

    if (params === null || params === void 0 ? void 0 : (_params$include2 = params.include) === null || _params$include2 === void 0 ? void 0 : _params$include2.totalCount) {
      var _params$include3;

      queryParams.count = (_params$include3 = params.include) === null || _params$include3 === void 0 ? void 0 : _params$include3.totalCount;
    }

    if (params === null || params === void 0 ? void 0 : (_params$page = params.page) === null || _params$page === void 0 ? void 0 : _params$page.next) {
      var _params$page2;

      queryParams.start = (_params$page2 = params.page) === null || _params$page2 === void 0 ? void 0 : _params$page2.next;
    }

    if (params === null || params === void 0 ? void 0 : (_params$page3 = params.page) === null || _params$page3 === void 0 ? void 0 : _params$page3.prev) {
      var _params$page4;

      queryParams.end = (_params$page4 = params.page) === null || _params$page4 === void 0 ? void 0 : _params$page4.prev;
    }

    if (params === null || params === void 0 ? void 0 : params.filter) {
      queryParams.filter = params.filter;
    }

    if (params === null || params === void 0 ? void 0 : params.limit) {
      queryParams.limit = params.limit;
    }

    if (params === null || params === void 0 ? void 0 : params.sort) {
      var _params$sort;

      queryParams.sort = Object.entries((_params$sort = params.sort) !== null && _params$sort !== void 0 ? _params$sort : {}).map(function (_ref4) {
        var _ref5 = (0, _slicedToArray2["default"])(_ref4, 2),
            key = _ref5[0],
            value = _ref5[1];

        if (value === 'asc' || value === 'desc') {
          return "".concat(key, ":").concat(value);
        } else {
          return key;
        }
      });
    }

    return queryParams;
  },
  handleResponse: function handleResponse(_, response) {
    return {
      status: response.status,
      data: response.data,
      totalCount: response.totalCount,
      prev: response.prev,
      next: response.next
    };
  }
};
var _default = endpoint;
exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _operations = _interopRequireDefault(__webpack_require__(1));

var endpoint = {
  getOperation: function getOperation() {
    return _operations["default"].PNGetChannelMetadataOperation;
  },
  validateParams: function validateParams(_, params) {
    if (!(params === null || params === void 0 ? void 0 : params.channel)) {
      return 'Channel cannot be empty';
    }
  },
  getURL: function getURL(_ref, params) {
    var config = _ref.config;
    return "/v2/objects/".concat(config.subscribeKey, "/channels/").concat(params.channel);
  },
  getRequestTimeout: function getRequestTimeout(_ref2) {
    var config = _ref2.config;
    return config.getTransactionTimeout();
  },
  isAuthSupported: function isAuthSupported() {
    return true;
  },
  getAuthToken: function getAuthToken(_ref3) {
    var tokenManager = _ref3.tokenManager;
    return tokenManager.getToken('channel');
  },
  prepareParams: function prepareParams(_, params) {
    var _params$include$custo, _params$include;

    return {
      include: ((_params$include$custo = params === null || params === void 0 ? void 0 : (_params$include = params.include) === null || _params$include === void 0 ? void 0 : _params$include.customFields) !== null && _params$include$custo !== void 0 ? _params$include$custo : true) && 'custom'
    };
  },
  handleResponse: function handleResponse(_, response) {
    return {
      status: response.status,
      data: response.data
    };
  }
};
var _default = endpoint;
exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _operations = _interopRequireDefault(__webpack_require__(1));

var endpoint = {
  getOperation: function getOperation() {
    return _operations["default"].PNSetChannelMetadataOperation;
  },
  validateParams: function validateParams(_, params) {
    if (!(params === null || params === void 0 ? void 0 : params.channel)) {
      return 'Channel cannot be empty';
    }

    if (!(params === null || params === void 0 ? void 0 : params.data)) {
      return 'Data cannot be empty';
    }
  },
  usePatch: function usePatch() {
    return true;
  },
  patchURL: function patchURL(_ref, params) {
    var config = _ref.config;
    return "/v2/objects/".concat(config.subscribeKey, "/channels/").concat(params.channel);
  },
  patchPayload: function patchPayload(_, params) {
    return params.data;
  },
  getRequestTimeout: function getRequestTimeout(_ref2) {
    var config = _ref2.config;
    return config.getTransactionTimeout();
  },
  isAuthSupported: function isAuthSupported() {
    return true;
  },
  getAuthToken: function getAuthToken(_ref3) {
    var tokenManager = _ref3.tokenManager;
    return tokenManager.getToken('channel');
  },
  prepareParams: function prepareParams(_, params) {
    var _params$include$custo, _params$include;

    return {
      include: ((_params$include$custo = params === null || params === void 0 ? void 0 : (_params$include = params.include) === null || _params$include === void 0 ? void 0 : _params$include.customFields) !== null && _params$include$custo !== void 0 ? _params$include$custo : true) && 'custom'
    };
  },
  handleResponse: function handleResponse(_, response) {
    return {
      status: response.status,
      data: response.data
    };
  }
};
var _default = endpoint;
exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _operations = _interopRequireDefault(__webpack_require__(1));

var endpoint = {
  getOperation: function getOperation() {
    return _operations["default"].PNRemoveChannelMetadataOperation;
  },
  validateParams: function validateParams(_, params) {
    if (!(params === null || params === void 0 ? void 0 : params.channel)) {
      return 'Channel cannot be empty';
    }
  },
  getURL: function getURL(_ref, params) {
    var config = _ref.config;
    return "/v2/objects/".concat(config.subscribeKey, "/channels/").concat(params.channel);
  },
  useDelete: function useDelete() {
    return true;
  },
  getRequestTimeout: function getRequestTimeout(_ref2) {
    var config = _ref2.config;
    return config.getTransactionTimeout();
  },
  isAuthSupported: function isAuthSupported() {
    return true;
  },
  getAuthToken: function getAuthToken(_ref3) {
    var tokenManager = _ref3.tokenManager;
    return tokenManager.getToken('channel');
  },
  prepareParams: function prepareParams() {
    return {};
  },
  handleResponse: function handleResponse(_, response) {
    return {
      status: response.status,
      data: response.data
    };
  }
};
var _default = endpoint;
exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slicedToArray2 = _interopRequireDefault(__webpack_require__(9));

var _operations = _interopRequireDefault(__webpack_require__(1));

var endpoint = {
  getOperation: function getOperation() {
    return _operations["default"].PNGetMembersOperation;
  },
  validateParams: function validateParams(_, params) {
    if (!(params === null || params === void 0 ? void 0 : params.channel)) {
      return 'UUID cannot be empty';
    }
  },
  getURL: function getURL(_ref, params) {
    var config = _ref.config;
    return "/v2/objects/".concat(config.subscribeKey, "/channels/").concat(params.channel, "/uuids");
  },
  getRequestTimeout: function getRequestTimeout(_ref2) {
    var config = _ref2.config;
    return config.getTransactionTimeout();
  },
  isAuthSupported: function isAuthSupported() {
    return true;
  },
  getAuthToken: function getAuthToken(_ref3) {
    var tokenManager = _ref3.tokenManager;
    return tokenManager.getToken('member');
  },
  prepareParams: function prepareParams(_modules, params) {
    var _params$include4, _params$page, _params$page3, _params$limit;

    var queryParams = {};

    if (params === null || params === void 0 ? void 0 : params.include) {
      var _params$include, _params$include2, _params$include$UUIDF, _params$include3;

      queryParams.include = [];

      if ((_params$include = params.include) === null || _params$include === void 0 ? void 0 : _params$include.customFields) {
        queryParams.include.push('custom');
      }

      if ((_params$include2 = params.include) === null || _params$include2 === void 0 ? void 0 : _params$include2.customUUIDFields) {
        queryParams.include.push('uuid.custom');
      }

      if ((_params$include$UUIDF = (_params$include3 = params.include) === null || _params$include3 === void 0 ? void 0 : _params$include3.UUIDFields) !== null && _params$include$UUIDF !== void 0 ? _params$include$UUIDF : true) {
        queryParams.include.push('uuid');
      }

      queryParams.include = queryParams.include.join(',');
    }

    if (params === null || params === void 0 ? void 0 : (_params$include4 = params.include) === null || _params$include4 === void 0 ? void 0 : _params$include4.totalCount) {
      var _params$include5;

      queryParams.count = (_params$include5 = params.include) === null || _params$include5 === void 0 ? void 0 : _params$include5.totalCount;
    }

    if (params === null || params === void 0 ? void 0 : (_params$page = params.page) === null || _params$page === void 0 ? void 0 : _params$page.next) {
      var _params$page2;

      queryParams.start = (_params$page2 = params.page) === null || _params$page2 === void 0 ? void 0 : _params$page2.next;
    }

    if (params === null || params === void 0 ? void 0 : (_params$page3 = params.page) === null || _params$page3 === void 0 ? void 0 : _params$page3.prev) {
      var _params$page4;

      queryParams.end = (_params$page4 = params.page) === null || _params$page4 === void 0 ? void 0 : _params$page4.prev;
    }

    if (params === null || params === void 0 ? void 0 : params.filter) {
      queryParams.filter = params.filter;
    }

    queryParams.limit = (_params$limit = params === null || params === void 0 ? void 0 : params.limit) !== null && _params$limit !== void 0 ? _params$limit : 100;

    if (params === null || params === void 0 ? void 0 : params.sort) {
      var _params$sort;

      queryParams.sort = Object.entries((_params$sort = params.sort) !== null && _params$sort !== void 0 ? _params$sort : {}).map(function (_ref4) {
        var _ref5 = (0, _slicedToArray2["default"])(_ref4, 2),
            key = _ref5[0],
            value = _ref5[1];

        if (value === 'asc' || value === 'desc') {
          return "".concat(key, ":").concat(value);
        } else {
          return key;
        }
      });
    }

    return queryParams;
  },
  handleResponse: function handleResponse(_, response) {
    return {
      status: response.status,
      data: response.data,
      totalCount: response.totalCount,
      prev: response.prev,
      next: response.next
    };
  }
};
var _default = endpoint;
exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slicedToArray2 = _interopRequireDefault(__webpack_require__(9));

var _defineProperty2 = _interopRequireDefault(__webpack_require__(4));

var _operations = _interopRequireDefault(__webpack_require__(1));

var endpoint = {
  getOperation: function getOperation() {
    return _operations["default"].PNSetMembersOperation;
  },
  validateParams: function validateParams(_, params) {
    if (!(params === null || params === void 0 ? void 0 : params.channel)) {
      return 'Channel cannot be empty';
    }

    if (!(params === null || params === void 0 ? void 0 : params.uuids) || (params === null || params === void 0 ? void 0 : params.uuids.length) === 0) {
      return 'UUIDs cannot be empty';
    }
  },
  usePatch: function usePatch() {
    return true;
  },
  patchURL: function patchURL(_ref, params) {
    var config = _ref.config;
    return "/v2/objects/".concat(config.subscribeKey, "/channels/").concat(params.channel, "/uuids");
  },
  patchPayload: function patchPayload(_, params) {
    return (0, _defineProperty2["default"])({
      set: [],
      remove: []
    }, params.type, params.uuids.map(function (uuid) {
      if (typeof uuid === 'string') {
        return {
          uuid: {
            id: uuid
          }
        };
      } else {
        return {
          uuid: {
            id: uuid.id
          },
          custom: uuid.custom
        };
      }
    }));
  },
  getRequestTimeout: function getRequestTimeout(_ref3) {
    var config = _ref3.config;
    return config.getTransactionTimeout();
  },
  isAuthSupported: function isAuthSupported() {
    return true;
  },
  getAuthToken: function getAuthToken(_ref4) {
    var tokenManager = _ref4.tokenManager;
    return tokenManager.getToken('member');
  },
  prepareParams: function prepareParams(_modules, params) {
    var _params$include4, _params$page, _params$page3;

    var queryParams = {};

    if (params === null || params === void 0 ? void 0 : params.include) {
      var _params$include, _params$include2, _params$include3;

      queryParams.include = [];

      if ((_params$include = params.include) === null || _params$include === void 0 ? void 0 : _params$include.customFields) {
        queryParams.include.push('custom');
      }

      if ((_params$include2 = params.include) === null || _params$include2 === void 0 ? void 0 : _params$include2.customUUIDFields) {
        queryParams.include.push('uuid.custom');
      }

      if ((_params$include3 = params.include) === null || _params$include3 === void 0 ? void 0 : _params$include3.UUIDFields) {
        queryParams.include.push('uuid');
      }

      queryParams.include = queryParams.include.join(',');
    }

    if (params === null || params === void 0 ? void 0 : (_params$include4 = params.include) === null || _params$include4 === void 0 ? void 0 : _params$include4.totalCount) {
      queryParams.count = true;
    }

    if (params === null || params === void 0 ? void 0 : (_params$page = params.page) === null || _params$page === void 0 ? void 0 : _params$page.next) {
      var _params$page2;

      queryParams.start = (_params$page2 = params.page) === null || _params$page2 === void 0 ? void 0 : _params$page2.next;
    }

    if (params === null || params === void 0 ? void 0 : (_params$page3 = params.page) === null || _params$page3 === void 0 ? void 0 : _params$page3.prev) {
      var _params$page4;

      queryParams.end = (_params$page4 = params.page) === null || _params$page4 === void 0 ? void 0 : _params$page4.prev;
    }

    if (params === null || params === void 0 ? void 0 : params.filter) {
      queryParams.filter = params.filter;
    }

    if (params === null || params === void 0 ? void 0 : params.limit) {
      queryParams.limit = params.limit;
    }

    if (params === null || params === void 0 ? void 0 : params.sort) {
      var _params$sort;

      queryParams.sort = Object.entries((_params$sort = params.sort) !== null && _params$sort !== void 0 ? _params$sort : {}).map(function (_ref5) {
        var _ref6 = (0, _slicedToArray2["default"])(_ref5, 2),
            key = _ref6[0],
            value = _ref6[1];

        if (value === 'asc' || value === 'desc') {
          return "".concat(key, ":").concat(value);
        } else {
          return key;
        }
      });
    }

    return queryParams;
  },
  handleResponse: function handleResponse(_, response) {
    return {
      status: response.status,
      data: response.data,
      totalCount: response.totalCount,
      prev: response.prev,
      next: response.next
    };
  }
};
var _default = endpoint;
exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slicedToArray2 = _interopRequireDefault(__webpack_require__(9));

var _operations = _interopRequireDefault(__webpack_require__(1));

var endpoint = {
  getOperation: function getOperation() {
    return _operations["default"].PNGetMembershipsOperation;
  },
  validateParams: function validateParams(_, params) {
    if (!(params === null || params === void 0 ? void 0 : params.uuid)) {
      return 'UUID cannot be empty';
    }
  },
  getURL: function getURL(_ref, params) {
    var config = _ref.config;
    return "/v2/objects/".concat(config.subscribeKey, "/uuids/").concat(params.uuid, "/channels");
  },
  getRequestTimeout: function getRequestTimeout(_ref2) {
    var config = _ref2.config;
    return config.getTransactionTimeout();
  },
  isAuthSupported: function isAuthSupported() {
    return true;
  },
  getAuthToken: function getAuthToken(_ref3) {
    var tokenManager = _ref3.tokenManager;
    return tokenManager.getToken('membership');
  },
  prepareParams: function prepareParams(_modules, params) {
    var _params$include4, _params$page, _params$page3, _params$limit;

    var queryParams = {};

    if (params === null || params === void 0 ? void 0 : params.include) {
      var _params$include, _params$include2, _params$include3;

      queryParams.include = [];

      if ((_params$include = params.include) === null || _params$include === void 0 ? void 0 : _params$include.customFields) {
        queryParams.include.push('custom');
      }

      if ((_params$include2 = params.include) === null || _params$include2 === void 0 ? void 0 : _params$include2.customChannelFields) {
        queryParams.include.push('channel.custom');
      }

      if ((_params$include3 = params.include) === null || _params$include3 === void 0 ? void 0 : _params$include3.channelFields) {
        queryParams.include.push('channel');
      }

      queryParams.include = queryParams.include.join(',');
    }

    if (params === null || params === void 0 ? void 0 : (_params$include4 = params.include) === null || _params$include4 === void 0 ? void 0 : _params$include4.totalCount) {
      var _params$include5;

      queryParams.count = (_params$include5 = params.include) === null || _params$include5 === void 0 ? void 0 : _params$include5.totalCount;
    }

    if (params === null || params === void 0 ? void 0 : (_params$page = params.page) === null || _params$page === void 0 ? void 0 : _params$page.next) {
      var _params$page2;

      queryParams.start = (_params$page2 = params.page) === null || _params$page2 === void 0 ? void 0 : _params$page2.next;
    }

    if (params === null || params === void 0 ? void 0 : (_params$page3 = params.page) === null || _params$page3 === void 0 ? void 0 : _params$page3.prev) {
      var _params$page4;

      queryParams.end = (_params$page4 = params.page) === null || _params$page4 === void 0 ? void 0 : _params$page4.prev;
    }

    if (params === null || params === void 0 ? void 0 : params.filter) {
      queryParams.filter = params.filter;
    }

    queryParams.limit = (_params$limit = params === null || params === void 0 ? void 0 : params.limit) !== null && _params$limit !== void 0 ? _params$limit : 100;

    if (params === null || params === void 0 ? void 0 : params.sort) {
      var _params$sort;

      queryParams.sort = Object.entries((_params$sort = params.sort) !== null && _params$sort !== void 0 ? _params$sort : {}).map(function (_ref4) {
        var _ref5 = (0, _slicedToArray2["default"])(_ref4, 2),
            key = _ref5[0],
            value = _ref5[1];

        if (value === 'asc' || value === 'desc') {
          return "".concat(key, ":").concat(value);
        } else {
          return key;
        }
      });
    }

    return queryParams;
  },
  handleResponse: function handleResponse(_, response) {
    return {
      status: response.status,
      data: response.data,
      totalCount: response.totalCount,
      prev: response.prev,
      next: response.next
    };
  }
};
var _default = endpoint;
exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slicedToArray2 = _interopRequireDefault(__webpack_require__(9));

var _defineProperty2 = _interopRequireDefault(__webpack_require__(4));

var _operations = _interopRequireDefault(__webpack_require__(1));

var endpoint = {
  getOperation: function getOperation() {
    return _operations["default"].PNSetMembershipsOperation;
  },
  validateParams: function validateParams(_, params) {
    if (!(params === null || params === void 0 ? void 0 : params.channels) || (params === null || params === void 0 ? void 0 : params.channels.length) === 0) {
      return 'Channels cannot be empty';
    }
  },
  usePatch: function usePatch() {
    return true;
  },
  patchURL: function patchURL(_ref, params) {
    var _params$uuid;

    var config = _ref.config;
    return "/v2/objects/".concat(config.subscribeKey, "/uuids/").concat((_params$uuid = params.uuid) !== null && _params$uuid !== void 0 ? _params$uuid : config.getUUID(), "/channels");
  },
  patchPayload: function patchPayload(_, params) {
    return (0, _defineProperty2["default"])({
      set: [],
      remove: []
    }, params.type, params.channels.map(function (channel) {
      if (typeof channel === 'string') {
        return {
          channel: {
            id: channel
          }
        };
      } else {
        return {
          channel: {
            id: channel.id
          },
          custom: channel.custom
        };
      }
    }));
  },
  getRequestTimeout: function getRequestTimeout(_ref3) {
    var config = _ref3.config;
    return config.getTransactionTimeout();
  },
  isAuthSupported: function isAuthSupported() {
    return true;
  },
  getAuthToken: function getAuthToken(_ref4) {
    var tokenManager = _ref4.tokenManager;
    return tokenManager.getToken('membership');
  },
  prepareParams: function prepareParams(_modules, params) {
    var _params$include4, _params$page, _params$page3;

    var queryParams = {};

    if (params === null || params === void 0 ? void 0 : params.include) {
      var _params$include, _params$include2, _params$include3;

      queryParams.include = [];

      if ((_params$include = params.include) === null || _params$include === void 0 ? void 0 : _params$include.customFields) {
        queryParams.include.push('custom');
      }

      if ((_params$include2 = params.include) === null || _params$include2 === void 0 ? void 0 : _params$include2.customChannelFields) {
        queryParams.include.push('channel.custom');
      }

      if ((_params$include3 = params.include) === null || _params$include3 === void 0 ? void 0 : _params$include3.channelFields) {
        queryParams.include.push('channel');
      }

      queryParams.include = queryParams.include.join(',');
    }

    if (params === null || params === void 0 ? void 0 : (_params$include4 = params.include) === null || _params$include4 === void 0 ? void 0 : _params$include4.totalCount) {
      queryParams.count = true;
    }

    if (params === null || params === void 0 ? void 0 : (_params$page = params.page) === null || _params$page === void 0 ? void 0 : _params$page.next) {
      var _params$page2;

      queryParams.start = (_params$page2 = params.page) === null || _params$page2 === void 0 ? void 0 : _params$page2.next;
    }

    if (params === null || params === void 0 ? void 0 : (_params$page3 = params.page) === null || _params$page3 === void 0 ? void 0 : _params$page3.prev) {
      var _params$page4;

      queryParams.end = (_params$page4 = params.page) === null || _params$page4 === void 0 ? void 0 : _params$page4.prev;
    }

    if (params === null || params === void 0 ? void 0 : params.filter) {
      queryParams.filter = params.filter;
    }

    if (params === null || params === void 0 ? void 0 : params.limit) {
      queryParams.limit = params.limit;
    }

    if (params === null || params === void 0 ? void 0 : params.sort) {
      var _params$sort;

      queryParams.sort = Object.entries((_params$sort = params.sort) !== null && _params$sort !== void 0 ? _params$sort : {}).map(function (_ref5) {
        var _ref6 = (0, _slicedToArray2["default"])(_ref5, 2),
            key = _ref6[0],
            value = _ref6[1];

        if (value === 'asc' || value === 'desc') {
          return "".concat(key, ":").concat(value);
        } else {
          return key;
        }
      });
    }

    return queryParams;
  },
  handleResponse: function handleResponse(_, response) {
    return {
      status: response.status,
      data: response.data,
      totalCount: response.totalCount,
      prev: response.prev,
      next: response.next
    };
  }
};
var _default = endpoint;
exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperation = getOperation;
exports.validateParams = validateParams;
exports.usePost = usePost;
exports.getURL = getURL;
exports.postURL = postURL;
exports.getRequestTimeout = getRequestTimeout;
exports.isAuthSupported = isAuthSupported;
exports.getAuthToken = getAuthToken;
exports.prepareParams = prepareParams;
exports.postPayload = postPayload;
exports.handleResponse = handleResponse;

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

function prepareMessagePayload(modules, incomingParams) {
  return incomingParams;
}

function getOperation() {
  return _operations["default"].PNCreateUserOperation;
}

function validateParams(_ref, incomingParams) {
  var config = _ref.config;
  var id = incomingParams.id,
      name = incomingParams.name,
      custom = incomingParams.custom;
  if (!id) return 'Missing User.id';
  if (!name) return 'Missing User.name';
  if (!config.subscribeKey) return 'Missing Subscribe Key';

  if (custom) {
    if (!Object.values(custom).every(function (value) {
      return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
    })) {
      return 'Invalid custom type, only string, number and boolean values are allowed.';
    }
  }
}

function usePost() {
  return true;
}

function getURL(modules) {
  var config = modules.config;
  return "/v1/objects/".concat(config.subscribeKey, "/users");
}

function postURL(modules) {
  var config = modules.config;
  return "/v1/objects/".concat(config.subscribeKey, "/users");
}

function getRequestTimeout(_ref2) {
  var config = _ref2.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function getAuthToken(modules, incomingParams) {
  var token = modules.tokenManager.getToken('user', incomingParams.id) || modules.tokenManager.getToken('user');
  return token;
}

function prepareParams(modules, incomingParams) {
  var include = incomingParams.include;
  var params = {};

  if (!include) {
    include = {
      customFields: true
    };
  } else if (include.customFields === undefined) {
    include.customFields = true;
  }

  if (include) {
    var includes = [];

    if (include.customFields) {
      includes.push('custom');
    }

    var includesString = includes.join(',');

    if (includesString.length > 0) {
      params.include = includesString;
    }
  }

  return params;
}

function postPayload(modules, incomingParams) {
  return prepareMessagePayload(modules, incomingParams);
}

function handleResponse(modules, usersResponse) {
  return usersResponse;
}

/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperation = getOperation;
exports.validateParams = validateParams;
exports.usePatch = usePatch;
exports.getURL = getURL;
exports.patchURL = patchURL;
exports.getRequestTimeout = getRequestTimeout;
exports.isAuthSupported = isAuthSupported;
exports.getAuthToken = getAuthToken;
exports.prepareParams = prepareParams;
exports.patchPayload = patchPayload;
exports.handleResponse = handleResponse;

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

function prepareMessagePayload(modules, incomingParams) {
  return incomingParams;
}

function getOperation() {
  return _operations["default"].PNUpdateUserOperation;
}

function validateParams(_ref, incomingParams) {
  var config = _ref.config;
  var id = incomingParams.id,
      name = incomingParams.name,
      custom = incomingParams.custom;
  if (!id) return 'Missing User.id';
  if (!name) return 'Missing User.name';
  if (!config.subscribeKey) return 'Missing Subscribe Key';

  if (custom) {
    if (!Object.values(custom).every(function (value) {
      return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
    })) {
      return 'Invalid custom type, only string, number and boolean values are allowed.';
    }
  }
}

function usePatch() {
  return true;
}

function getURL(modules, incomingParams) {
  var config = modules.config;
  var id = incomingParams.id;
  return "/v1/objects/".concat(config.subscribeKey, "/users/").concat(id);
}

function patchURL(modules, incomingParams) {
  var config = modules.config;
  var id = incomingParams.id;
  return "/v1/objects/".concat(config.subscribeKey, "/users/").concat(id);
}

function getRequestTimeout(_ref2) {
  var config = _ref2.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function getAuthToken(modules, incomingParams) {
  var token = modules.tokenManager.getToken('user', incomingParams.id) || modules.tokenManager.getToken('user');
  return token;
}

function prepareParams(modules, incomingParams) {
  var include = incomingParams.include;
  var params = {};

  if (!include) {
    include = {
      customFields: true
    };
  } else if (include.customFields === undefined) {
    include.customFields = true;
  }

  if (include) {
    var includes = [];

    if (include.customFields) {
      includes.push('custom');
    }

    var includesString = includes.join(',');

    if (includesString.length > 0) {
      params.include = includesString;
    }
  }

  return params;
}

function patchPayload(modules, incomingParams) {
  return prepareMessagePayload(modules, incomingParams);
}

function handleResponse(modules, usersResponse) {
  return usersResponse;
}

/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperation = getOperation;
exports.validateParams = validateParams;
exports.useDelete = useDelete;
exports.getURL = getURL;
exports.getRequestTimeout = getRequestTimeout;
exports.isAuthSupported = isAuthSupported;
exports.getAuthToken = getAuthToken;
exports.prepareParams = prepareParams;
exports.handleResponse = handleResponse;

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

function getOperation() {
  return _operations["default"].PNDeleteUserOperation;
}

function validateParams(_ref, userId) {
  var config = _ref.config;
  if (!userId) return 'Missing UserId';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function useDelete() {
  return true;
}

function getURL(modules, userId) {
  var config = modules.config;
  return "/v1/objects/".concat(config.subscribeKey, "/users/").concat(userId);
}

function getRequestTimeout(_ref2) {
  var config = _ref2.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function getAuthToken(modules, userId) {
  var token = modules.tokenManager.getToken('user', userId) || modules.tokenManager.getToken('user');
  return token;
}

function prepareParams() {
  return {};
}

function handleResponse(modules, usersResponse) {
  return usersResponse;
}

/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperation = getOperation;
exports.validateParams = validateParams;
exports.getURL = getURL;
exports.getRequestTimeout = getRequestTimeout;
exports.isAuthSupported = isAuthSupported;
exports.getAuthToken = getAuthToken;
exports.prepareParams = prepareParams;
exports.handleResponse = handleResponse;

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

function getOperation() {
  return _operations["default"].PNGetUserOperation;
}

function validateParams(modules, incomingParams) {
  var userId = incomingParams.userId;
  if (!userId) return 'Missing userId';
}

function getURL(modules, incomingParams) {
  var config = modules.config;
  return "/v1/objects/".concat(config.subscribeKey, "/users/").concat(incomingParams.userId);
}

function getRequestTimeout(_ref) {
  var config = _ref.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function getAuthToken(modules, incomingParams) {
  var token = modules.tokenManager.getToken('user', incomingParams.userId) || modules.tokenManager.getToken('user');
  return token;
}

function prepareParams(modules, incomingParams) {
  var include = incomingParams.include;
  var params = {};

  if (!include) {
    include = {
      customFields: true
    };
  } else if (include.customFields === undefined) {
    include.customFields = true;
  }

  if (include) {
    var includes = [];

    if (include.customFields) {
      includes.push('custom');
    }

    var includesString = includes.join(',');

    if (includesString.length > 0) {
      params.include = includesString;
    }
  }

  return params;
}

function handleResponse(modules, usersResponse) {
  return usersResponse;
}

/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperation = getOperation;
exports.validateParams = validateParams;
exports.getURL = getURL;
exports.getRequestTimeout = getRequestTimeout;
exports.isAuthSupported = isAuthSupported;
exports.getAuthToken = getAuthToken;
exports.prepareParams = prepareParams;
exports.handleResponse = handleResponse;

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

function getOperation() {
  return _operations["default"].PNGetUsersOperation;
}

function validateParams() {}

function getURL(modules) {
  var config = modules.config;
  return "/v1/objects/".concat(config.subscribeKey, "/users");
}

function getRequestTimeout(_ref) {
  var config = _ref.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function getAuthToken(modules) {
  var token = modules.tokenManager.getToken('user');
  return token;
}

function prepareParams(modules, incomingParams) {
  var include = incomingParams.include,
      limit = incomingParams.limit,
      page = incomingParams.page,
      filter = incomingParams.filter;
  var params = {};

  if (limit) {
    params.limit = limit;
  }

  if (include) {
    var includes = [];

    if (include.totalCount) {
      params.count = true;
    }

    if (include.customFields) {
      includes.push('custom');
    }

    var includesString = includes.join(',');

    if (includesString.length > 0) {
      params.include = includesString;
    }
  }

  if (page) {
    if (page.next) {
      params.start = page.next;
    }

    if (page.prev) {
      params.end = page.prev;
    }
  }

  if (filter) {
    params.filter = filter;
  }

  return params;
}

function handleResponse(modules, usersResponse) {
  return usersResponse;
}

/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperation = getOperation;
exports.validateParams = validateParams;
exports.usePost = usePost;
exports.getURL = getURL;
exports.postURL = postURL;
exports.getRequestTimeout = getRequestTimeout;
exports.isAuthSupported = isAuthSupported;
exports.getAuthToken = getAuthToken;
exports.prepareParams = prepareParams;
exports.postPayload = postPayload;
exports.handleResponse = handleResponse;

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

function prepareMessagePayload(modules, incomingParams) {
  return incomingParams;
}

function getOperation() {
  return _operations["default"].PNCreateSpaceOperation;
}

function validateParams(_ref, incomingParams) {
  var config = _ref.config;
  var id = incomingParams.id,
      name = incomingParams.name,
      custom = incomingParams.custom;
  if (!id) return 'Missing Space.id';
  if (!name) return 'Missing Space.name';
  if (!config.subscribeKey) return 'Missing Subscribe Key';

  if (custom) {
    if (!Object.values(custom).every(function (value) {
      return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
    })) {
      return 'Invalid custom type, only string, number and boolean values are allowed.';
    }
  }
}

function usePost() {
  return true;
}

function getURL(modules) {
  var config = modules.config;
  return "/v1/objects/".concat(config.subscribeKey, "/spaces");
}

function postURL(modules) {
  var config = modules.config;
  return "/v1/objects/".concat(config.subscribeKey, "/spaces");
}

function getRequestTimeout(_ref2) {
  var config = _ref2.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function getAuthToken(modules, incomingParams) {
  var token = modules.tokenManager.getToken('space', incomingParams.id) || modules.tokenManager.getToken('space');
  return token;
}

function prepareParams(modules, incomingParams) {
  var include = incomingParams.include;
  var params = {};

  if (!include) {
    include = {
      customFields: true
    };
  } else if (include.customFields === undefined) {
    include.customFields = true;
  }

  if (include) {
    var includes = [];

    if (include.customFields) {
      includes.push('custom');
    }

    var includesString = includes.join(',');

    if (includesString.length > 0) {
      params.include = includesString;
    }
  }

  return params;
}

function postPayload(modules, incomingParams) {
  return prepareMessagePayload(modules, incomingParams);
}

function handleResponse(modules, spacesResponse) {
  return spacesResponse;
}

/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperation = getOperation;
exports.validateParams = validateParams;
exports.usePatch = usePatch;
exports.getURL = getURL;
exports.patchURL = patchURL;
exports.getRequestTimeout = getRequestTimeout;
exports.isAuthSupported = isAuthSupported;
exports.getAuthToken = getAuthToken;
exports.prepareParams = prepareParams;
exports.patchPayload = patchPayload;
exports.handleResponse = handleResponse;

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

function prepareMessagePayload(modules, incomingParams) {
  return incomingParams;
}

function getOperation() {
  return _operations["default"].PNUpdateSpaceOperation;
}

function validateParams(_ref, incomingParams) {
  var config = _ref.config;
  var id = incomingParams.id,
      name = incomingParams.name,
      custom = incomingParams.custom;
  if (!id) return 'Missing Space.id';
  if (!name) return 'Missing Space.name';
  if (!config.subscribeKey) return 'Missing Subscribe Key';

  if (custom) {
    if (!Object.values(custom).every(function (value) {
      return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
    })) {
      return 'Invalid custom type, only string, number and boolean values are allowed.';
    }
  }
}

function usePatch() {
  return true;
}

function getURL(modules, incomingParams) {
  var config = modules.config;
  var id = incomingParams.id;
  return "/v1/objects/".concat(config.subscribeKey, "/spaces/").concat(id);
}

function patchURL(modules, incomingParams) {
  var config = modules.config;
  var id = incomingParams.id;
  return "/v1/objects/".concat(config.subscribeKey, "/spaces/").concat(id);
}

function getRequestTimeout(_ref2) {
  var config = _ref2.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function getAuthToken(modules, incomingParams) {
  var token = modules.tokenManager.getToken('space', incomingParams.id) || modules.tokenManager.getToken('space');
  return token;
}

function prepareParams(modules, incomingParams) {
  var include = incomingParams.include;
  var params = {};

  if (!include) {
    include = {
      customFields: true
    };
  } else if (include.customFields === undefined) {
    include.customFields = true;
  }

  if (include) {
    var includes = [];

    if (include.customFields) {
      includes.push('custom');
    }

    var includesString = includes.join(',');

    if (includesString.length > 0) {
      params.include = includesString;
    }
  }

  return params;
}

function patchPayload(modules, incomingParams) {
  return prepareMessagePayload(modules, incomingParams);
}

function handleResponse(modules, spacesResponse) {
  return spacesResponse;
}

/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperation = getOperation;
exports.validateParams = validateParams;
exports.useDelete = useDelete;
exports.getURL = getURL;
exports.getRequestTimeout = getRequestTimeout;
exports.isAuthSupported = isAuthSupported;
exports.getAuthToken = getAuthToken;
exports.prepareParams = prepareParams;
exports.handleResponse = handleResponse;

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

function getOperation() {
  return _operations["default"].PNDeleteSpaceOperation;
}

function validateParams(_ref, spaceId) {
  var config = _ref.config;
  if (!spaceId) return 'Missing SpaceId';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function useDelete() {
  return true;
}

function getURL(modules, spaceId) {
  var config = modules.config;
  return "/v1/objects/".concat(config.subscribeKey, "/spaces/").concat(spaceId);
}

function getRequestTimeout(_ref2) {
  var config = _ref2.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function getAuthToken(modules, spaceId) {
  var token = modules.tokenManager.getToken('space', spaceId) || modules.tokenManager.getToken('space');
  return token;
}

function prepareParams() {
  return {};
}

function handleResponse(modules, spacesResponse) {
  return spacesResponse;
}

/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperation = getOperation;
exports.validateParams = validateParams;
exports.getURL = getURL;
exports.getRequestTimeout = getRequestTimeout;
exports.isAuthSupported = isAuthSupported;
exports.getAuthToken = getAuthToken;
exports.prepareParams = prepareParams;
exports.handleResponse = handleResponse;

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

function getOperation() {
  return _operations["default"].PNGetSpacesOperation;
}

function validateParams() {}

function getURL(modules) {
  var config = modules.config;
  return "/v1/objects/".concat(config.subscribeKey, "/spaces");
}

function getRequestTimeout(_ref) {
  var config = _ref.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function getAuthToken(modules) {
  var token = modules.tokenManager.getToken('space');
  return token;
}

function prepareParams(modules, incomingParams) {
  var include = incomingParams.include,
      limit = incomingParams.limit,
      page = incomingParams.page,
      filter = incomingParams.filter;
  var params = {};

  if (limit) {
    params.limit = limit;
  }

  if (include) {
    var includes = [];

    if (include.totalCount) {
      params.count = true;
    }

    if (include.customFields) {
      includes.push('custom');
    }

    var includesString = includes.join(',');

    if (includesString.length > 0) {
      params.include = includesString;
    }
  }

  if (page) {
    if (page.next) {
      params.start = page.next;
    }

    if (page.prev) {
      params.end = page.prev;
    }
  }

  if (filter) {
    params.filter = filter;
  }

  return params;
}

function handleResponse(modules, spacesResponse) {
  return spacesResponse;
}

/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperation = getOperation;
exports.validateParams = validateParams;
exports.getURL = getURL;
exports.getRequestTimeout = getRequestTimeout;
exports.isAuthSupported = isAuthSupported;
exports.getAuthToken = getAuthToken;
exports.prepareParams = prepareParams;
exports.handleResponse = handleResponse;

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

function getOperation() {
  return _operations["default"].PNGetSpaceOperation;
}

function validateParams(modules, incomingParams) {
  var spaceId = incomingParams.spaceId;
  if (!spaceId) return 'Missing spaceId';
}

function getURL(modules, incomingParams) {
  var config = modules.config;
  return "/v1/objects/".concat(config.subscribeKey, "/spaces/").concat(incomingParams.spaceId);
}

function getRequestTimeout(_ref) {
  var config = _ref.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function getAuthToken(modules, incomingParams) {
  var token = modules.tokenManager.getToken('space', incomingParams.spaceId) || modules.tokenManager.getToken('space');
  return token;
}

function prepareParams(modules, incomingParams) {
  var include = incomingParams.include;
  var params = {};

  if (!include) {
    include = {
      customFields: true
    };
  } else if (include.customFields === undefined) {
    include.customFields = true;
  }

  if (include) {
    var includes = [];

    if (include.customFields) {
      includes.push('custom');
    }

    var includesString = includes.join(',');

    if (includesString.length > 0) {
      params.include = includesString;
    }
  }

  return params;
}

function handleResponse(modules, spacesResponse) {
  return spacesResponse;
}

/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperation = getOperation;
exports.validateParams = validateParams;
exports.getURL = getURL;
exports.getRequestTimeout = getRequestTimeout;
exports.isAuthSupported = isAuthSupported;
exports.getAuthToken = getAuthToken;
exports.prepareParams = prepareParams;
exports.handleResponse = handleResponse;

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

function getOperation() {
  return _operations["default"].PNGetMembersOperation;
}

function validateParams(modules, incomingParams) {
  var spaceId = incomingParams.spaceId;
  if (!spaceId) return 'Missing spaceId';
}

function getURL(modules, incomingParams) {
  var config = modules.config;
  return "/v1/objects/".concat(config.subscribeKey, "/spaces/").concat(incomingParams.spaceId, "/users");
}

function getRequestTimeout(_ref) {
  var config = _ref.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function getAuthToken(modules, incomingParams) {
  var token = modules.tokenManager.getToken('space', incomingParams.spaceId) || modules.tokenManager.getToken('space');
  return token;
}

function prepareParams(modules, incomingParams) {
  var include = incomingParams.include,
      limit = incomingParams.limit,
      page = incomingParams.page,
      filter = incomingParams.filter;
  var params = {};

  if (limit) {
    params.limit = limit;
  }

  if (include) {
    var includes = [];

    if (include.totalCount) {
      params.count = true;
    }

    if (include.customFields) {
      includes.push('custom');
    }

    if (include.userFields) {
      includes.push('user');
    }

    if (include.customUserFields) {
      includes.push('user.custom');
    }

    var includesString = includes.join(',');

    if (includesString.length > 0) {
      params.include = includesString;
    }
  }

  if (page) {
    if (page.next) {
      params.start = page.next;
    }

    if (page.prev) {
      params.end = page.prev;
    }
  }

  if (filter) {
    params.filter = filter;
  }

  return params;
}

function handleResponse(modules, membersResponse) {
  return membersResponse;
}

/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperation = getOperation;
exports.validateParams = validateParams;
exports.getURL = getURL;
exports.patchURL = patchURL;
exports.usePatch = usePatch;
exports.getRequestTimeout = getRequestTimeout;
exports.isAuthSupported = isAuthSupported;
exports.getAuthToken = getAuthToken;
exports.prepareParams = prepareParams;
exports.patchPayload = patchPayload;
exports.handleResponse = handleResponse;

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

function prepareMessagePayload(modules, incomingParams) {
  var users = incomingParams.users;
  var payload = {};

  if (users && users.length > 0) {
    payload.add = [];
    users.forEach(function (addMember) {
      var currentAdd = {
        id: addMember.id
      };

      if (addMember.custom) {
        currentAdd.custom = addMember.custom;
      }

      payload.add.push(currentAdd);
    });
  }

  return payload;
}

function getOperation() {
  return _operations["default"].PNUpdateMembersOperation;
}

function validateParams(modules, incomingParams) {
  var spaceId = incomingParams.spaceId,
      users = incomingParams.users;
  if (!spaceId) return 'Missing spaceId';
  if (!users) return 'Missing users';
}

function getURL(modules, incomingParams) {
  var config = modules.config;
  return "/v1/objects/".concat(config.subscribeKey, "/spaces/").concat(incomingParams.spaceId, "/users");
}

function patchURL(modules, incomingParams) {
  var config = modules.config;
  return "/v1/objects/".concat(config.subscribeKey, "/spaces/").concat(incomingParams.spaceId, "/users");
}

function usePatch() {
  return true;
}

function getRequestTimeout(_ref) {
  var config = _ref.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function getAuthToken(modules, incomingParams) {
  var token = modules.tokenManager.getToken('space', incomingParams.spaceId) || modules.tokenManager.getToken('space');
  return token;
}

function prepareParams(modules, incomingParams) {
  var include = incomingParams.include,
      limit = incomingParams.limit,
      page = incomingParams.page;
  var params = {};

  if (limit) {
    params.limit = limit;
  }

  if (include) {
    var includes = [];

    if (include.totalCount) {
      params.count = true;
    }

    if (include.customFields) {
      includes.push('custom');
    }

    if (include.spaceFields) {
      includes.push('space');
    }

    if (include.customSpaceFields) {
      includes.push('space.custom');
    }

    var includesString = includes.join(',');

    if (includesString.length > 0) {
      params.include = includesString;
    }
  }

  if (page) {
    if (page.next) {
      params.start = page.next;
    }

    if (page.prev) {
      params.end = page.prev;
    }
  }

  return params;
}

function patchPayload(modules, incomingParams) {
  return prepareMessagePayload(modules, incomingParams);
}

function handleResponse(modules, membersResponse) {
  return membersResponse;
}

/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperation = getOperation;
exports.validateParams = validateParams;
exports.getURL = getURL;
exports.patchURL = patchURL;
exports.usePatch = usePatch;
exports.getRequestTimeout = getRequestTimeout;
exports.isAuthSupported = isAuthSupported;
exports.getAuthToken = getAuthToken;
exports.prepareParams = prepareParams;
exports.patchPayload = patchPayload;
exports.handleResponse = handleResponse;

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

function prepareMessagePayload(modules, incomingParams) {
  var addMembers = incomingParams.addMembers,
      updateMembers = incomingParams.updateMembers,
      removeMembers = incomingParams.removeMembers,
      users = incomingParams.users;
  var payload = {};

  if (addMembers && addMembers.length > 0) {
    payload.add = [];
    addMembers.forEach(function (addMember) {
      var currentAdd = {
        id: addMember.id
      };

      if (addMember.custom) {
        currentAdd.custom = addMember.custom;
      }

      payload.add.push(currentAdd);
    });
  }

  if (updateMembers && updateMembers.length > 0) {
    payload.update = [];
    updateMembers.forEach(function (updateMember) {
      var currentUpdate = {
        id: updateMember.id
      };

      if (updateMember.custom) {
        currentUpdate.custom = updateMember.custom;
      }

      payload.update.push(currentUpdate);
    });
  }

  if (users && users.length > 0) {
    payload.update = payload.update || [];
    users.forEach(function (updateMember) {
      var currentUpdate = {
        id: updateMember.id
      };

      if (updateMember.custom) {
        currentUpdate.custom = updateMember.custom;
      }

      payload.update.push(currentUpdate);
    });
  }

  if (removeMembers && removeMembers.length > 0) {
    payload.remove = [];
    removeMembers.forEach(function (removeMemberId) {
      payload.remove.push({
        id: removeMemberId
      });
    });
  }

  return payload;
}

function getOperation() {
  return _operations["default"].PNUpdateMembersOperation;
}

function validateParams(modules, incomingParams) {
  var spaceId = incomingParams.spaceId,
      users = incomingParams.users;
  if (!spaceId) return 'Missing spaceId';
  if (!users) return 'Missing users';
}

function getURL(modules, incomingParams) {
  var config = modules.config;
  return "/v1/objects/".concat(config.subscribeKey, "/spaces/").concat(incomingParams.spaceId, "/users");
}

function patchURL(modules, incomingParams) {
  var config = modules.config;
  return "/v1/objects/".concat(config.subscribeKey, "/spaces/").concat(incomingParams.spaceId, "/users");
}

function usePatch() {
  return true;
}

function getRequestTimeout(_ref) {
  var config = _ref.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function getAuthToken(modules, incomingParams) {
  var token = modules.tokenManager.getToken('space', incomingParams.spaceId) || modules.tokenManager.getToken('space');
  return token;
}

function prepareParams(modules, incomingParams) {
  var include = incomingParams.include,
      limit = incomingParams.limit,
      page = incomingParams.page;
  var params = {};

  if (limit) {
    params.limit = limit;
  }

  if (include) {
    var includes = [];

    if (include.totalCount) {
      params.count = true;
    }

    if (include.customFields) {
      includes.push('custom');
    }

    if (include.spaceFields) {
      includes.push('space');
    }

    if (include.customSpaceFields) {
      includes.push('space.custom');
    }

    var includesString = includes.join(',');

    if (includesString.length > 0) {
      params.include = includesString;
    }
  }

  if (page) {
    if (page.next) {
      params.start = page.next;
    }

    if (page.prev) {
      params.end = page.prev;
    }
  }

  return params;
}

function patchPayload(modules, incomingParams) {
  return prepareMessagePayload(modules, incomingParams);
}

function handleResponse(modules, membersResponse) {
  return membersResponse;
}

/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperation = getOperation;
exports.validateParams = validateParams;
exports.getURL = getURL;
exports.patchURL = patchURL;
exports.usePatch = usePatch;
exports.getRequestTimeout = getRequestTimeout;
exports.isAuthSupported = isAuthSupported;
exports.getAuthToken = getAuthToken;
exports.prepareParams = prepareParams;
exports.patchPayload = patchPayload;
exports.handleResponse = handleResponse;

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

function prepareMessagePayload(modules, incomingParams) {
  var users = incomingParams.users;
  var payload = {};

  if (users && users.length > 0) {
    payload.remove = [];
    users.forEach(function (removeMemberId) {
      payload.remove.push({
        id: removeMemberId
      });
    });
  }

  return payload;
}

function getOperation() {
  return _operations["default"].PNUpdateMembersOperation;
}

function validateParams(modules, incomingParams) {
  var spaceId = incomingParams.spaceId,
      users = incomingParams.users;
  if (!spaceId) return 'Missing spaceId';
  if (!users) return 'Missing users';
}

function getURL(modules, incomingParams) {
  var config = modules.config;
  return "/v1/objects/".concat(config.subscribeKey, "/spaces/").concat(incomingParams.spaceId, "/users");
}

function patchURL(modules, incomingParams) {
  var config = modules.config;
  return "/v1/objects/".concat(config.subscribeKey, "/spaces/").concat(incomingParams.spaceId, "/users");
}

function usePatch() {
  return true;
}

function getRequestTimeout(_ref) {
  var config = _ref.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function getAuthToken(modules, incomingParams) {
  var token = modules.tokenManager.getToken('space', incomingParams.spaceId) || modules.tokenManager.getToken('space');
  return token;
}

function prepareParams(modules, incomingParams) {
  var include = incomingParams.include,
      limit = incomingParams.limit,
      page = incomingParams.page;
  var params = {};

  if (limit) {
    params.limit = limit;
  }

  if (include) {
    var includes = [];

    if (include.totalCount) {
      params.count = true;
    }

    if (include.customFields) {
      includes.push('custom');
    }

    if (include.spaceFields) {
      includes.push('space');
    }

    if (include.customSpaceFields) {
      includes.push('space.custom');
    }

    var includesString = includes.join(',');

    if (includesString.length > 0) {
      params.include = includesString;
    }
  }

  if (page) {
    if (page.next) {
      params.start = page.next;
    }

    if (page.prev) {
      params.end = page.prev;
    }
  }

  return params;
}

function patchPayload(modules, incomingParams) {
  return prepareMessagePayload(modules, incomingParams);
}

function handleResponse(modules, membersResponse) {
  return membersResponse;
}

/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperation = getOperation;
exports.validateParams = validateParams;
exports.getURL = getURL;
exports.getRequestTimeout = getRequestTimeout;
exports.isAuthSupported = isAuthSupported;
exports.getAuthToken = getAuthToken;
exports.prepareParams = prepareParams;
exports.handleResponse = handleResponse;

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

function getOperation() {
  return _operations["default"].PNGetMembershipsOperation;
}

function validateParams(modules, incomingParams) {
  var userId = incomingParams.userId;
  if (!userId) return 'Missing userId';
}

function getURL(modules, incomingParams) {
  var config = modules.config;
  return "/v1/objects/".concat(config.subscribeKey, "/users/").concat(incomingParams.userId, "/spaces");
}

function getRequestTimeout(_ref) {
  var config = _ref.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function getAuthToken(modules, incomingParams) {
  var token = modules.tokenManager.getToken('user', incomingParams.userId) || modules.tokenManager.getToken('user');
  return token;
}

function prepareParams(modules, incomingParams) {
  var include = incomingParams.include,
      limit = incomingParams.limit,
      page = incomingParams.page,
      filter = incomingParams.filter;
  var params = {};

  if (limit) {
    params.limit = limit;
  }

  if (include) {
    var includes = [];

    if (include.totalCount) {
      params.count = true;
    }

    if (include.customFields) {
      includes.push('custom');
    }

    if (include.spaceFields) {
      includes.push('space');
    }

    if (include.customSpaceFields) {
      includes.push('space.custom');
    }

    var includesString = includes.join(',');

    if (includesString.length > 0) {
      params.include = includesString;
    }
  }

  if (page) {
    if (page.next) {
      params.start = page.next;
    }

    if (page.prev) {
      params.end = page.prev;
    }
  }

  if (filter) {
    params.filter = filter;
  }

  return params;
}

function handleResponse(modules, membershipsResponse) {
  return membershipsResponse;
}

/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperation = getOperation;
exports.validateParams = validateParams;
exports.getURL = getURL;
exports.patchURL = patchURL;
exports.usePatch = usePatch;
exports.getRequestTimeout = getRequestTimeout;
exports.isAuthSupported = isAuthSupported;
exports.getAuthToken = getAuthToken;
exports.prepareParams = prepareParams;
exports.patchPayload = patchPayload;
exports.handleResponse = handleResponse;

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

function prepareMessagePayload(modules, incomingParams) {
  var addMemberships = incomingParams.addMemberships,
      updateMemberships = incomingParams.updateMemberships,
      removeMemberships = incomingParams.removeMemberships,
      spaces = incomingParams.spaces;
  var payload = {};

  if (addMemberships && addMemberships.length > 0) {
    payload.add = [];
    addMemberships.forEach(function (addMembership) {
      var currentAdd = {
        id: addMembership.id
      };

      if (addMembership.custom) {
        currentAdd.custom = addMembership.custom;
      }

      payload.add.push(currentAdd);
    });
  }

  if (updateMemberships && updateMemberships.length > 0) {
    payload.update = [];
    updateMemberships.forEach(function (updateMembership) {
      var currentUpdate = {
        id: updateMembership.id
      };

      if (updateMembership.custom) {
        currentUpdate.custom = updateMembership.custom;
      }

      payload.update.push(currentUpdate);
    });
  }

  if (spaces && spaces.length > 0) {
    payload.update = payload.update || [];
    spaces.forEach(function (updateMembership) {
      var currentUpdate = {
        id: updateMembership.id
      };

      if (updateMembership.custom) {
        currentUpdate.custom = updateMembership.custom;
      }

      payload.update.push(currentUpdate);
    });
  }

  if (removeMemberships && removeMemberships.length > 0) {
    payload.remove = [];
    removeMemberships.forEach(function (removeMembershipId) {
      payload.remove.push({
        id: removeMembershipId
      });
    });
  }

  return payload;
}

function getOperation() {
  return _operations["default"].PNUpdateMembershipsOperation;
}

function validateParams(modules, incomingParams) {
  var userId = incomingParams.userId,
      spaces = incomingParams.spaces;
  if (!userId) return 'Missing userId';
  if (!spaces) return 'Missing spaces';
}

function getURL(modules, incomingParams) {
  var config = modules.config;
  return "/v1/objects/".concat(config.subscribeKey, "/users/").concat(incomingParams.userId, "/spaces");
}

function patchURL(modules, incomingParams) {
  var config = modules.config;
  return "/v1/objects/".concat(config.subscribeKey, "/users/").concat(incomingParams.userId, "/spaces");
}

function usePatch() {
  return true;
}

function getRequestTimeout(_ref) {
  var config = _ref.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function getAuthToken(modules, incomingParams) {
  var token = modules.tokenManager.getToken('user', incomingParams.userId) || modules.tokenManager.getToken('user');
  return token;
}

function prepareParams(modules, incomingParams) {
  var include = incomingParams.include,
      limit = incomingParams.limit,
      page = incomingParams.page;
  var params = {};

  if (limit) {
    params.limit = limit;
  }

  if (include) {
    var includes = [];

    if (include.totalCount) {
      params.count = true;
    }

    if (include.customFields) {
      includes.push('custom');
    }

    if (include.spaceFields) {
      includes.push('space');
    }

    if (include.customSpaceFields) {
      includes.push('space.custom');
    }

    var includesString = includes.join(',');

    if (includesString.length > 0) {
      params.include = includesString;
    }
  }

  if (page) {
    if (page.next) {
      params.start = page.next;
    }

    if (page.prev) {
      params.end = page.prev;
    }
  }

  return params;
}

function patchPayload(modules, incomingParams) {
  return prepareMessagePayload(modules, incomingParams);
}

function handleResponse(modules, membershipsResponse) {
  return membershipsResponse;
}

/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperation = getOperation;
exports.validateParams = validateParams;
exports.getURL = getURL;
exports.patchURL = patchURL;
exports.usePatch = usePatch;
exports.getRequestTimeout = getRequestTimeout;
exports.isAuthSupported = isAuthSupported;
exports.getAuthToken = getAuthToken;
exports.prepareParams = prepareParams;
exports.patchPayload = patchPayload;
exports.handleResponse = handleResponse;

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

function prepareMessagePayload(modules, incomingParams) {
  var spaces = incomingParams.spaces;
  var payload = {};

  if (spaces && spaces.length > 0) {
    payload.add = [];
    spaces.forEach(function (addMembership) {
      var currentAdd = {
        id: addMembership.id
      };

      if (addMembership.custom) {
        currentAdd.custom = addMembership.custom;
      }

      payload.add.push(currentAdd);
    });
  }

  return payload;
}

function getOperation() {
  return _operations["default"].PNUpdateMembershipsOperation;
}

function validateParams(modules, incomingParams) {
  var userId = incomingParams.userId,
      spaces = incomingParams.spaces;
  if (!userId) return 'Missing userId';
  if (!spaces) return 'Missing spaces';
}

function getURL(modules, incomingParams) {
  var config = modules.config;
  return "/v1/objects/".concat(config.subscribeKey, "/users/").concat(incomingParams.userId, "/spaces");
}

function patchURL(modules, incomingParams) {
  var config = modules.config;
  return "/v1/objects/".concat(config.subscribeKey, "/users/").concat(incomingParams.userId, "/spaces");
}

function usePatch() {
  return true;
}

function getRequestTimeout(_ref) {
  var config = _ref.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function getAuthToken(modules, incomingParams) {
  var token = modules.tokenManager.getToken('user', incomingParams.userId) || modules.tokenManager.getToken('user');
  return token;
}

function prepareParams(modules, incomingParams) {
  var include = incomingParams.include,
      limit = incomingParams.limit,
      page = incomingParams.page;
  var params = {};

  if (limit) {
    params.limit = limit;
  }

  if (include) {
    var includes = [];

    if (include.totalCount) {
      params.count = true;
    }

    if (include.customFields) {
      includes.push('custom');
    }

    if (include.spaceFields) {
      includes.push('space');
    }

    if (include.customSpaceFields) {
      includes.push('space.custom');
    }

    var includesString = includes.join(',');

    if (includesString.length > 0) {
      params.include = includesString;
    }
  }

  if (page) {
    if (page.next) {
      params.start = page.next;
    }

    if (page.prev) {
      params.end = page.prev;
    }
  }

  return params;
}

function patchPayload(modules, incomingParams) {
  return prepareMessagePayload(modules, incomingParams);
}

function handleResponse(modules, membershipsResponse) {
  return membershipsResponse;
}

/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperation = getOperation;
exports.validateParams = validateParams;
exports.getURL = getURL;
exports.patchURL = patchURL;
exports.usePatch = usePatch;
exports.getRequestTimeout = getRequestTimeout;
exports.isAuthSupported = isAuthSupported;
exports.getAuthToken = getAuthToken;
exports.prepareParams = prepareParams;
exports.patchPayload = patchPayload;
exports.handleResponse = handleResponse;

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

function prepareMessagePayload(modules, incomingParams) {
  var spaces = incomingParams.spaces;
  var payload = {};

  if (spaces && spaces.length > 0) {
    payload.remove = [];
    spaces.forEach(function (removeMembershipId) {
      payload.remove.push({
        id: removeMembershipId
      });
    });
  }

  return payload;
}

function getOperation() {
  return _operations["default"].PNUpdateMembershipsOperation;
}

function validateParams(modules, incomingParams) {
  var userId = incomingParams.userId,
      spaces = incomingParams.spaces;
  if (!userId) return 'Missing userId';
  if (!spaces) return 'Missing spaces';
}

function getURL(modules, incomingParams) {
  var config = modules.config;
  return "/v1/objects/".concat(config.subscribeKey, "/users/").concat(incomingParams.userId, "/spaces");
}

function patchURL(modules, incomingParams) {
  var config = modules.config;
  return "/v1/objects/".concat(config.subscribeKey, "/users/").concat(incomingParams.userId, "/spaces");
}

function usePatch() {
  return true;
}

function getRequestTimeout(_ref) {
  var config = _ref.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function getAuthToken(modules, incomingParams) {
  var token = modules.tokenManager.getToken('user', incomingParams.userId) || modules.tokenManager.getToken('user');
  return token;
}

function prepareParams(modules, incomingParams) {
  var include = incomingParams.include,
      limit = incomingParams.limit,
      page = incomingParams.page;
  var params = {};

  if (limit) {
    params.limit = limit;
  }

  if (include) {
    var includes = [];

    if (include.totalCount) {
      params.count = true;
    }

    if (include.customFields) {
      includes.push('custom');
    }

    if (include.spaceFields) {
      includes.push('space');
    }

    if (include.customSpaceFields) {
      includes.push('space.custom');
    }

    var includesString = includes.join(',');

    if (includesString.length > 0) {
      params.include = includesString;
    }
  }

  if (page) {
    if (page.next) {
      params.start = page.next;
    }

    if (page.prev) {
      params.end = page.prev;
    }
  }

  return params;
}

function patchPayload(modules, incomingParams) {
  return prepareMessagePayload(modules, incomingParams);
}

function handleResponse(modules, membershipsResponse) {
  return membershipsResponse;
}

/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

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

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

function getOperation() {
  return _operations["default"].PNAccessManagerAudit;
}

function validateParams(modules) {
  var config = modules.config;
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function getURL(modules) {
  var config = modules.config;
  return "/v2/auth/audit/sub-key/".concat(config.subscribeKey);
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
      authKeys = _incomingParams$authK === void 0 ? [] : _incomingParams$authK;
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
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

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

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

function getOperation() {
  return _operations["default"].PNAccessManagerGrant;
}

function validateParams(modules, incomingParams) {
  var config = modules.config;
  if (!config.subscribeKey) return 'Missing Subscribe Key';
  if (!config.publishKey) return 'Missing Publish Key';
  if (!config.secretKey) return 'Missing Secret Key';

  if (incomingParams.uuids != null && !incomingParams.authKeys) {
    return 'authKeys are required for grant request on uuids';
  }

  if (incomingParams.uuids != null && (incomingParams.channels != null || incomingParams.channelGroups != null)) {
    return 'Both channel/channelgroup and uuid cannot be used in the same request';
  }
}

function getURL(modules) {
  var config = modules.config;
  return "/v2/auth/grant/sub-key/".concat(config.subscribeKey);
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
      channels = _incomingParams$chann === void 0 ? [] : _incomingParams$chann,
      _incomingParams$chann2 = incomingParams.channelGroups,
      channelGroups = _incomingParams$chann2 === void 0 ? [] : _incomingParams$chann2,
      _incomingParams$uuids = incomingParams.uuids,
      uuids = _incomingParams$uuids === void 0 ? [] : _incomingParams$uuids,
      ttl = incomingParams.ttl,
      _incomingParams$read = incomingParams.read,
      read = _incomingParams$read === void 0 ? false : _incomingParams$read,
      _incomingParams$write = incomingParams.write,
      write = _incomingParams$write === void 0 ? false : _incomingParams$write,
      _incomingParams$manag = incomingParams.manage,
      manage = _incomingParams$manag === void 0 ? false : _incomingParams$manag,
      _incomingParams$get = incomingParams.get,
      get = _incomingParams$get === void 0 ? false : _incomingParams$get,
      _incomingParams$join = incomingParams.join,
      join = _incomingParams$join === void 0 ? false : _incomingParams$join,
      _incomingParams$updat = incomingParams.update,
      update = _incomingParams$updat === void 0 ? false : _incomingParams$updat,
      _incomingParams$authK = incomingParams.authKeys,
      authKeys = _incomingParams$authK === void 0 ? [] : _incomingParams$authK;
  var deleteParam = incomingParams["delete"];
  var params = {};
  params.r = read ? '1' : '0';
  params.w = write ? '1' : '0';
  params.m = manage ? '1' : '0';
  params.d = deleteParam ? '1' : '0';
  params.g = get ? '1' : '0';
  params.j = join ? '1' : '0';
  params.u = update ? '1' : '0';

  if (channels.length > 0) {
    params.channel = channels.join(',');
  }

  if (channelGroups.length > 0) {
    params['channel-group'] = channelGroups.join(',');
  }

  if (authKeys.length > 0) {
    params.auth = authKeys.join(',');
  }

  if (uuids.length > 0) {
    params['target-uuid'] = uuids.join(',');
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
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperation = getOperation;
exports.extractPermissions = extractPermissions;
exports.validateParams = validateParams;
exports.postURL = postURL;
exports.usePost = usePost;
exports.getRequestTimeout = getRequestTimeout;
exports.isAuthSupported = isAuthSupported;
exports.prepareParams = prepareParams;
exports.postPayload = postPayload;
exports.handleResponse = handleResponse;

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

function getOperation() {
  return _operations["default"].PNAccessManagerGrantToken;
}

function extractPermissions(permissions) {
  var permissionsResult = 0;

  if (permissions.create) {
    permissionsResult |= 16;
  }

  if (permissions["delete"]) {
    permissionsResult |= 8;
  }

  if (permissions.manage) {
    permissionsResult |= 4;
  }

  if (permissions.write) {
    permissionsResult |= 2;
  }

  if (permissions.read) {
    permissionsResult |= 1;
  }

  return permissionsResult;
}

function prepareMessagePayload(modules, incomingParams) {
  var ttl = incomingParams.ttl,
      resources = incomingParams.resources,
      patterns = incomingParams.patterns,
      meta = incomingParams.meta;
  var params = {
    ttl: 0,
    permissions: {
      resources: {
        channels: {},
        groups: {},
        users: {},
        spaces: {}
      },
      patterns: {
        channels: {},
        groups: {},
        users: {},
        spaces: {}
      },
      meta: {}
    }
  };

  if (resources) {
    var users = resources.users,
        spaces = resources.spaces;

    if (users) {
      Object.keys(users).forEach(function (user) {
        params.permissions.resources.users[user] = extractPermissions(users[user]);
      });
    }

    if (spaces) {
      Object.keys(spaces).forEach(function (space) {
        params.permissions.resources.spaces[space] = extractPermissions(spaces[space]);
      });
    }
  }

  if (patterns) {
    var _users = patterns.users,
        _spaces = patterns.spaces;

    if (_users) {
      Object.keys(_users).forEach(function (user) {
        params.permissions.patterns.users[user] = extractPermissions(_users[user]);
      });
    }

    if (_spaces) {
      Object.keys(_spaces).forEach(function (space) {
        params.permissions.patterns.spaces[space] = extractPermissions(_spaces[space]);
      });
    }
  }

  if (ttl || ttl === 0) {
    params.ttl = ttl;
  }

  if (meta) {
    params.permissions.meta = meta;
  }

  return params;
}

function validateParams(modules, incomingParams) {
  var config = modules.config;
  if (!config.subscribeKey) return 'Missing Subscribe Key';
  if (!config.publishKey) return 'Missing Publish Key';
  if (!config.secretKey) return 'Missing Secret Key';
  if (!incomingParams.resources && !incomingParams.patterns) return 'Missing either Resources or Patterns.';

  if (incomingParams.resources && (!incomingParams.resources.users || Object.keys(incomingParams.resources.users).length === 0) && (!incomingParams.resources.spaces || Object.keys(incomingParams.resources.spaces).length === 0) || incomingParams.patterns && (!incomingParams.patterns.users || Object.keys(incomingParams.patterns.users).length === 0) && (!incomingParams.patterns.spaces || Object.keys(incomingParams.patterns.spaces).length === 0)) {
    return 'Missing values for either Resources or Patterns.';
  }
}

function postURL(modules) {
  var config = modules.config;
  return "/v3/pam/".concat(config.subscribeKey, "/grant");
}

function usePost() {
  return true;
}

function getRequestTimeout(_ref) {
  var config = _ref.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return false;
}

function prepareParams() {
  return {};
}

function postPayload(modules, incomingParams) {
  return prepareMessagePayload(modules, incomingParams);
}

function handleResponse(modules, response) {
  var token = response.data.token;
  return token;
}

/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
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

var _typeof2 = _interopRequireDefault(__webpack_require__(7));

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(3));

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
  return _operations["default"].PNPublishOperation;
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
      sendByPost = _incomingParams$sendB === void 0 ? false : _incomingParams$sendB;
  return sendByPost;
}

function getURL(modules, incomingParams) {
  var config = modules.config;
  var channel = incomingParams.channel,
      message = incomingParams.message;
  var stringifiedPayload = prepareMessagePayload(modules, message);
  return "/publish/".concat(config.publishKey, "/").concat(config.subscribeKey, "/0/").concat(_utils["default"].encodeString(channel), "/0/").concat(_utils["default"].encodeString(stringifiedPayload));
}

function postURL(modules, incomingParams) {
  var config = modules.config;
  var channel = incomingParams.channel;
  return "/publish/".concat(config.publishKey, "/").concat(config.subscribeKey, "/0/").concat(_utils["default"].encodeString(channel), "/0");
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
      replicate = _incomingParams$repli === void 0 ? true : _incomingParams$repli,
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

  if (meta && (0, _typeof2["default"])(meta) === 'object') {
    params.meta = JSON.stringify(meta);
  }

  return params;
}

function handleResponse(modules, serverResponse) {
  return {
    timetoken: serverResponse[2]
  };
}

/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

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

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(3));

function prepareMessagePayload(modules, messagePayload) {
  var stringifiedPayload = JSON.stringify(messagePayload);
  return stringifiedPayload;
}

function getOperation() {
  return _operations["default"].PNSignalOperation;
}

function validateParams(_ref, incomingParams) {
  var config = _ref.config;
  var message = incomingParams.message,
      channel = incomingParams.channel;
  if (!channel) return 'Missing Channel';
  if (!message) return 'Missing Message';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function getURL(modules, incomingParams) {
  var config = modules.config;
  var channel = incomingParams.channel,
      message = incomingParams.message;
  var stringifiedPayload = prepareMessagePayload(modules, message);
  return "/signal/".concat(config.publishKey, "/").concat(config.subscribeKey, "/0/").concat(_utils["default"].encodeString(channel), "/0/").concat(_utils["default"].encodeString(stringifiedPayload));
}

function getRequestTimeout(_ref2) {
  var config = _ref2.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function prepareParams() {
  var params = {};
  return params;
}

function handleResponse(modules, serverResponse) {
  return {
    timetoken: serverResponse[2]
  };
}

/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

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

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(3));

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
  return _operations["default"].PNHistoryOperation;
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
  return "/v2/history/sub-key/".concat(config.subscribeKey, "/channel/").concat(_utils["default"].encodeString(channel));
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
      count = _incomingParams$count === void 0 ? 100 : _incomingParams$count,
      _incomingParams$strin = incomingParams.stringifiedTimeToken,
      stringifiedTimeToken = _incomingParams$strin === void 0 ? false : _incomingParams$strin,
      _incomingParams$inclu = incomingParams.includeMeta,
      includeMeta = _incomingParams$inclu === void 0 ? false : _incomingParams$inclu;
  var outgoingParams = {
    include_token: 'true'
  };
  outgoingParams.count = count;
  if (start) outgoingParams.start = start;
  if (end) outgoingParams.end = end;
  if (stringifiedTimeToken) outgoingParams.string_message_token = 'true';
  if (reverse != null) outgoingParams.reverse = reverse.toString();
  if (includeMeta) outgoingParams.include_meta = 'true';
  return outgoingParams;
}

function handleResponse(modules, serverResponse) {
  var response = {
    messages: [],
    startTimeToken: serverResponse[1],
    endTimeToken: serverResponse[2]
  };

  if (Array.isArray(serverResponse[0])) {
    serverResponse[0].forEach(function (serverHistoryItem) {
      var item = {
        timetoken: serverHistoryItem.timetoken,
        entry: __processMessage(modules, serverHistoryItem.message)
      };

      if (serverHistoryItem.meta) {
        item.meta = serverHistoryItem.meta;
      }

      response.messages.push(item);
    });
  }

  return response;
}

/***/ }),
/* 117 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

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

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(3));

function getOperation() {
  return _operations["default"].PNDeleteMessagesOperation;
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
  return "/v3/history/sub-key/".concat(config.subscribeKey, "/channel/").concat(_utils["default"].encodeString(channel));
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
/* 118 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

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

var _slicedToArray2 = _interopRequireDefault(__webpack_require__(9));

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(3));

function getOperation() {
  return _operations["default"].PNMessageCounts;
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
  return "/v3/history/sub-key/".concat(config.subscribeKey, "/message-counts/").concat(_utils["default"].encodeString(stringifiedChannels));
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
    var _channelTimetokens = (0, _slicedToArray2["default"])(channelTimetokens, 1),
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
  return {
    channels: serverResponse.channels
  };
}

/***/ }),
/* 119 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

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

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(3));

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
  return _operations["default"].PNFetchMessagesOperation;
}

function validateParams(modules, incomingParams) {
  var channels = incomingParams.channels,
      _incomingParams$inclu = incomingParams.includeMessageActions,
      includeMessageActions = _incomingParams$inclu === void 0 ? false : _incomingParams$inclu;
  var config = modules.config;
  if (!channels || channels.length === 0) return 'Missing channels';
  if (!config.subscribeKey) return 'Missing Subscribe Key';

  if (includeMessageActions && channels.length > 1) {
    throw new TypeError('History can return actions data for a single channel only. Either pass a single channel or disable the includeMessageActions flag.');
  }
}

function getURL(modules, incomingParams) {
  var _incomingParams$chann = incomingParams.channels,
      channels = _incomingParams$chann === void 0 ? [] : _incomingParams$chann,
      _incomingParams$inclu2 = incomingParams.includeMessageActions,
      includeMessageActions = _incomingParams$inclu2 === void 0 ? false : _incomingParams$inclu2;
  var config = modules.config;
  var endpoint = !includeMessageActions ? 'history' : 'history-with-actions';
  var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
  return "/v3/".concat(endpoint, "/sub-key/").concat(config.subscribeKey, "/channel/").concat(_utils["default"].encodeString(stringifiedChannels));
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
      stringifiedTimeToken = _incomingParams$strin === void 0 ? false : _incomingParams$strin,
      _incomingParams$inclu3 = incomingParams.includeMeta,
      includeMeta = _incomingParams$inclu3 === void 0 ? false : _incomingParams$inclu3,
      includeUuid = incomingParams.includeUuid,
      _incomingParams$inclu4 = incomingParams.includeUUID,
      includeUUID = _incomingParams$inclu4 === void 0 ? true : _incomingParams$inclu4,
      _incomingParams$inclu5 = incomingParams.includeMessageType,
      includeMessageType = _incomingParams$inclu5 === void 0 ? true : _incomingParams$inclu5;
  var outgoingParams = {};
  if (count) outgoingParams.max = count;
  if (start) outgoingParams.start = start;
  if (end) outgoingParams.end = end;
  if (stringifiedTimeToken) outgoingParams.string_message_token = 'true';
  if (includeMeta) outgoingParams.include_meta = 'true';
  if (includeUUID && includeUuid !== false) outgoingParams.include_uuid = 'true';
  if (includeMessageType) outgoingParams.include_message_type = 'true';
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
      announce.timetoken = messageEnvelope.timetoken;
      announce.message = __processMessage(modules, messageEnvelope.message);
      announce.messageType = messageEnvelope.message_type;
      announce.uuid = messageEnvelope.uuid;

      if (messageEnvelope.actions) {
        announce.actions = messageEnvelope.actions;
        announce.data = messageEnvelope.actions;
      }

      if (messageEnvelope.meta) {
        announce.meta = messageEnvelope.meta;
      }

      response.channels[channelName].push(announce);
    });
  });

  if (serverResponse.more) {
    response.more = serverResponse.more;
  }

  return response;
}

/***/ }),
/* 120 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

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

var _flow_interfaces = __webpack_require__(2);

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(3));

function getOperation() {
  return _operations["default"].PNSubscribeOperation;
}

function validateParams(modules) {
  var config = modules.config;
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function getURL(modules, incomingParams) {
  var config = modules.config;
  var _incomingParams$chann = incomingParams.channels,
      channels = _incomingParams$chann === void 0 ? [] : _incomingParams$chann;
  var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
  return "/v2/subscribe/".concat(config.subscribeKey, "/").concat(_utils["default"].encodeString(stringifiedChannels), "/0");
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
      channelGroups = _incomingParams$chann2 === void 0 ? [] : _incomingParams$chann2,
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
      messageType: rawMessage.e,
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
  return {
    messages: messages,
    metadata: metadata
  };
}

/***/ }),
/* 121 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(__webpack_require__(5));

var _createClass2 = _interopRequireDefault(__webpack_require__(6));

var _defineProperty2 = _interopRequireDefault(__webpack_require__(4));

var _config = _interopRequireDefault(__webpack_require__(8));

var _categories = _interopRequireDefault(__webpack_require__(10));

var _flow_interfaces = __webpack_require__(2);

var _default = function () {
  function _default(modules) {
    var _this = this;

    (0, _classCallCheck2["default"])(this, _default);
    (0, _defineProperty2["default"])(this, "_modules", void 0);
    (0, _defineProperty2["default"])(this, "_config", void 0);
    (0, _defineProperty2["default"])(this, "_maxSubDomain", void 0);
    (0, _defineProperty2["default"])(this, "_currentSubDomain", void 0);
    (0, _defineProperty2["default"])(this, "_standardOrigin", void 0);
    (0, _defineProperty2["default"])(this, "_subscribeOrigin", void 0);
    (0, _defineProperty2["default"])(this, "_providedFQDN", void 0);
    (0, _defineProperty2["default"])(this, "_requestTimeout", void 0);
    (0, _defineProperty2["default"])(this, "_coreParams", void 0);
    this._modules = {};
    Object.keys(modules).forEach(function (key) {
      _this._modules[key] = modules[key].bind(_this);
    });
  }

  (0, _createClass2["default"])(_default, [{
    key: "init",
    value: function init(config) {
      this._config = config;
      this._maxSubDomain = 20;
      this._currentSubDomain = Math.floor(Math.random() * this._maxSubDomain);
      this._providedFQDN = (this._config.secure ? 'https://' : 'http://') + this._config.origin;
      this._coreParams = {};
      this.shiftStandardOrigin();
    }
  }, {
    key: "nextOrigin",
    value: function nextOrigin() {
      if (!this._providedFQDN.match(/ps\.pndsn\.com$/i)) {
        return this._providedFQDN;
      }

      var newSubDomain;
      this._currentSubDomain += 1;

      if (this._currentSubDomain >= this._maxSubDomain) {
        this._currentSubDomain = 1;
      }

      newSubDomain = this._currentSubDomain.toString();
      return this._providedFQDN.replace('ps.pndsn.com', "ps".concat(newSubDomain, ".pndsn.com"));
    }
  }, {
    key: "hasModule",
    value: function hasModule(name) {
      return name in this._modules;
    }
  }, {
    key: "shiftStandardOrigin",
    value: function shiftStandardOrigin() {
      this._standardOrigin = this.nextOrigin();
      return this._standardOrigin;
    }
  }, {
    key: "getStandardOrigin",
    value: function getStandardOrigin() {
      return this._standardOrigin;
    }
  }, {
    key: "POSTFILE",
    value: function POSTFILE(url, fields, file) {
      return this._modules.postfile(url, fields, file);
    }
  }, {
    key: "GETFILE",
    value: function GETFILE(params, endpoint, callback) {
      return this._modules.getfile(params, endpoint, callback);
    }
  }, {
    key: "POST",
    value: function POST(params, body, endpoint, callback) {
      return this._modules.post(params, body, endpoint, callback);
    }
  }, {
    key: "PATCH",
    value: function PATCH(params, body, endpoint, callback) {
      return this._modules.patch(params, body, endpoint, callback);
    }
  }, {
    key: "GET",
    value: function GET(params, endpoint, callback) {
      return this._modules.get(params, endpoint, callback);
    }
  }, {
    key: "DELETE",
    value: function DELETE(params, endpoint, callback) {
      return this._modules.del(params, endpoint, callback);
    }
  }, {
    key: "_detectErrorCategory",
    value: function _detectErrorCategory(err) {
      if (err.code === 'ENOTFOUND') {
        return _categories["default"].PNNetworkIssuesCategory;
      }

      if (err.code === 'ECONNREFUSED') {
        return _categories["default"].PNNetworkIssuesCategory;
      }

      if (err.code === 'ECONNRESET') {
        return _categories["default"].PNNetworkIssuesCategory;
      }

      if (err.code === 'EAI_AGAIN') {
        return _categories["default"].PNNetworkIssuesCategory;
      }

      if (err.status === 0 || err.hasOwnProperty('status') && typeof err.status === 'undefined') {
        return _categories["default"].PNNetworkIssuesCategory;
      }

      if (err.timeout) return _categories["default"].PNTimeoutCategory;

      if (err.code === 'ETIMEDOUT') {
        return _categories["default"].PNNetworkIssuesCategory;
      }

      if (err.response) {
        if (err.response.badRequest) {
          return _categories["default"].PNBadRequestCategory;
        }

        if (err.response.forbidden) {
          return _categories["default"].PNAccessDeniedCategory;
        }
      }

      return _categories["default"].PNUnknownCategory;
    }
  }]);
  return _default;
}();

exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 122 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _default = {
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
exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 123 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _typeof2 = _interopRequireDefault(__webpack_require__(7));

var _classCallCheck2 = _interopRequireDefault(__webpack_require__(5));

var _createClass2 = _interopRequireDefault(__webpack_require__(6));

var _defineProperty2 = _interopRequireDefault(__webpack_require__(4));

var _default = function () {
  function _default(decode, base64ToBinary) {
    (0, _classCallCheck2["default"])(this, _default);
    (0, _defineProperty2["default"])(this, "_base64ToBinary", void 0);
    (0, _defineProperty2["default"])(this, "_cborReader", void 0);
    this._base64ToBinary = base64ToBinary;
    this._decode = decode;
  }

  (0, _createClass2["default"])(_default, [{
    key: "decodeToken",
    value: function decodeToken(tokenString) {
      var padding = '';

      if (tokenString.length % 4 === 3) {
        padding = '=';
      } else if (tokenString.length % 4 === 2) {
        padding = '==';
      }

      var cleaned = tokenString.replace(/-/gi, '+').replace(/_/gi, '/') + padding;

      var result = this._decode(this._base64ToBinary(cleaned));

      if ((0, _typeof2["default"])(result) === 'object') {
        return result;
      }

      return undefined;
    }
  }]);
  return _default;
}();

exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 124 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.postfile = postfile;
exports.getfile = getfile;
exports.get = get;
exports.post = post;
exports.patch = patch;
exports.del = del;

var _regenerator = _interopRequireDefault(__webpack_require__(11));

var _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(12));

var _superagent = _interopRequireDefault(__webpack_require__(125));

var _flow_interfaces = __webpack_require__(2);

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
  logger.log("[".concat(timestamp, "]"), '\n', req.url, '\n', req.qs);
  logger.log('-----');
  req.on('response', function (res) {
    var now = new Date().getTime();
    var elapsed = now - start;
    var timestampDone = new Date().toISOString();
    logger.log('>>>>>>');
    logger.log("[".concat(timestampDone, " / ").concat(elapsed, "]"), '\n', req.url, '\n', req.qs, '\n', res.text);
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

  var sc = superagentConstruct;

  if (endpoint.forceBuffered === true) {
    if (typeof Blob === 'undefined') {
      sc = sc.buffer().responseType('arraybuffer');
    } else {
      sc = sc.responseType('arraybuffer');
    }
  } else if (endpoint.forceBuffered === false) {
    sc = sc.buffer(false);
  }

  return sc.timeout(endpoint.timeout).end(function (err, resp) {
    var parsedResponse;
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

    if (endpoint.ignoreBody) {
      parsedResponse = {
        headers: resp.headers,
        redirects: resp.redirects,
        response: resp
      };
    } else {
      try {
        parsedResponse = JSON.parse(resp.text);
      } catch (e) {
        status.errorData = resp;
        status.error = true;
        return callback(status, null);
      }
    }

    if (parsedResponse.error && parsedResponse.error === 1 && parsedResponse.status && parsedResponse.message && parsedResponse.service) {
      status.errorData = parsedResponse;
      status.statusCode = parsedResponse.status;
      status.error = true;
      status.category = _this._detectErrorCategory(status);
      return callback(status, null);
    } else if (parsedResponse.error && parsedResponse.error.message) {
      status.errorData = parsedResponse.error;
    }

    return callback(status, parsedResponse);
  });
}

function postfile(_x, _x2, _x3) {
  return _postfile.apply(this, arguments);
}

function _postfile() {
  _postfile = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee(url, fields, fileInput) {
    var agent, result;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            agent = _superagent["default"].post(url);
            fields.forEach(function (_ref) {
              var key = _ref.key,
                  value = _ref.value;
              agent = agent.field(key, value);
            });
            agent.attach('file', fileInput, {
              contentType: 'application/octet-stream'
            });
            _context.next = 5;
            return agent;

          case 5:
            result = _context.sent;
            return _context.abrupt("return", result);

          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _postfile.apply(this, arguments);
}

function getfile(params, endpoint, callback) {
  var superagentConstruct = _superagent["default"].get(this.getStandardOrigin() + endpoint.url).set(endpoint.headers).query(params);

  return xdr.call(this, superagentConstruct, endpoint, callback);
}

function get(params, endpoint, callback) {
  var superagentConstruct = _superagent["default"].get(this.getStandardOrigin() + endpoint.url).set(endpoint.headers).query(params);

  return xdr.call(this, superagentConstruct, endpoint, callback);
}

function post(params, body, endpoint, callback) {
  var superagentConstruct = _superagent["default"].post(this.getStandardOrigin() + endpoint.url).query(params).set(endpoint.headers).send(body);

  return xdr.call(this, superagentConstruct, endpoint, callback);
}

function patch(params, body, endpoint, callback) {
  var superagentConstruct = _superagent["default"].patch(this.getStandardOrigin() + endpoint.url).query(params).set(endpoint.headers).send(body);

  return xdr.call(this, superagentConstruct, endpoint, callback);
}

function del(params, endpoint, callback) {
  var superagentConstruct = _superagent["default"]["delete"](this.getStandardOrigin() + endpoint.url).set(endpoint.headers).query(params);

  return xdr.call(this, superagentConstruct, endpoint, callback);
}

/***/ }),
/* 125 */
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

var Emitter = __webpack_require__(126);
var RequestBase = __webpack_require__(127);
var isObject = __webpack_require__(26);
var ResponseBase = __webpack_require__(128);
var Agent = __webpack_require__(130);

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
/* 126 */
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

  // Remove event specific arrays for event types that no
  // one is subscribed for to avoid memory leak.
  if (callbacks.length === 0) {
    delete this._callbacks['$' + event];
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

  var args = new Array(arguments.length - 1)
    , callbacks = this._callbacks['$' + event];

  for (var i = 1; i < arguments.length; i++) {
    args[i - 1] = arguments[i];
  }

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
/* 127 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Module of mixed-in functions shared between node and client code
 */
var isObject = __webpack_require__(26);

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
/* 128 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Module dependencies.
 */

var utils = __webpack_require__(129);

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
/* 129 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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
/* 130 */
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


/***/ }),
/* 131 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {

var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(__webpack_require__(11));

var _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(12));

var _classCallCheck2 = _interopRequireDefault(__webpack_require__(5));

var _createClass2 = _interopRequireDefault(__webpack_require__(6));

var _defineProperty2 = _interopRequireDefault(__webpack_require__(4));

var _isomorphicWebcrypto = _interopRequireDefault(__webpack_require__(133));

function concatArrayBuffer(ab1, ab2) {
  var tmp = new Uint8Array(ab1.byteLength + ab2.byteLength);
  tmp.set(new Uint8Array(ab1), 0);
  tmp.set(new Uint8Array(ab2), ab1.byteLength);
  return tmp.buffer;
}

var WebCryptography = function () {
  function WebCryptography() {
    (0, _classCallCheck2["default"])(this, WebCryptography);
  }

  (0, _createClass2["default"])(WebCryptography, [{
    key: "encrypt",
    value: function () {
      var _encrypt = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee(key, input) {
        var cKey;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.getKey(key);

              case 2:
                cKey = _context.sent;

                if (!(input instanceof ArrayBuffer)) {
                  _context.next = 7;
                  break;
                }

                return _context.abrupt("return", this.encryptArrayBuffer(cKey, input));

              case 7:
                if (!(typeof input === 'string')) {
                  _context.next = 11;
                  break;
                }

                return _context.abrupt("return", this.encryptString(cKey, input));

              case 11:
                throw new Error('Cannot encrypt this file. In browsers file encryption supports only string or ArrayBuffer');

              case 12:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function encrypt(_x, _x2) {
        return _encrypt.apply(this, arguments);
      }

      return encrypt;
    }()
  }, {
    key: "decrypt",
    value: function () {
      var _decrypt = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee2(key, input) {
        var cKey;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.getKey(key);

              case 2:
                cKey = _context2.sent;

                if (!(input instanceof ArrayBuffer)) {
                  _context2.next = 7;
                  break;
                }

                return _context2.abrupt("return", this.decryptArrayBuffer(cKey, input));

              case 7:
                if (!(typeof input === 'string')) {
                  _context2.next = 11;
                  break;
                }

                return _context2.abrupt("return", this.decryptString(cKey, input));

              case 11:
                throw new Error('Cannot decrypt this file. In browsers file decryption supports only string or ArrayBuffer');

              case 12:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function decrypt(_x3, _x4) {
        return _decrypt.apply(this, arguments);
      }

      return decrypt;
    }()
  }, {
    key: "encryptFile",
    value: function () {
      var _encryptFile = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee3(key, file, File) {
        var bKey, abPlaindata, abCipherdata;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.getKey(key);

              case 2:
                bKey = _context3.sent;
                _context3.next = 5;
                return file.toArrayBuffer();

              case 5:
                abPlaindata = _context3.sent;
                _context3.next = 8;
                return this.encryptArrayBuffer(bKey, abPlaindata);

              case 8:
                abCipherdata = _context3.sent;
                return _context3.abrupt("return", File.create({
                  name: file.name,
                  mimeType: 'application/octet-stream',
                  data: abCipherdata
                }));

              case 10:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function encryptFile(_x5, _x6, _x7) {
        return _encryptFile.apply(this, arguments);
      }

      return encryptFile;
    }()
  }, {
    key: "decryptFile",
    value: function () {
      var _decryptFile = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee4(key, file, File) {
        var bKey, abCipherdata, abPlaindata;
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.getKey(key);

              case 2:
                bKey = _context4.sent;
                _context4.next = 5;
                return file.toArrayBuffer();

              case 5:
                abCipherdata = _context4.sent;
                _context4.next = 8;
                return this.decryptArrayBuffer(bKey, abCipherdata);

              case 8:
                abPlaindata = _context4.sent;

                if (!(file.data instanceof ArrayBuffer)) {
                  _context4.next = 13;
                  break;
                }

                return _context4.abrupt("return", File.create({
                  name: file.name,
                  data: abPlaindata
                }));

              case 13:
                throw new Error('Cannot decrypt this file. In browser environment file decryption supports only ArrayBuffer.');

              case 14:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function decryptFile(_x8, _x9, _x10) {
        return _decryptFile.apply(this, arguments);
      }

      return decryptFile;
    }()
  }, {
    key: "getKey",
    value: function () {
      var _getKey = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee5(key) {
        var bKey, abHash, abKey;
        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                bKey = Buffer.from(key);
                _context5.next = 3;
                return _isomorphicWebcrypto["default"].subtle.digest('SHA-256', bKey.buffer);

              case 3:
                abHash = _context5.sent;
                abKey = Buffer.from(Buffer.from(abHash).toString('hex').slice(0, 32), 'utf8').buffer;
                return _context5.abrupt("return", _isomorphicWebcrypto["default"].subtle.importKey('raw', abKey, 'AES-CBC', true, ['encrypt', 'decrypt']));

              case 6:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }));

      function getKey(_x11) {
        return _getKey.apply(this, arguments);
      }

      return getKey;
    }()
  }, {
    key: "encryptArrayBuffer",
    value: function () {
      var _encryptArrayBuffer = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee6(key, plaintext) {
        var abIv;
        return _regenerator["default"].wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                abIv = _isomorphicWebcrypto["default"].getRandomValues(new Uint8Array(16));
                _context6.t0 = concatArrayBuffer;
                _context6.t1 = abIv.buffer;
                _context6.next = 5;
                return _isomorphicWebcrypto["default"].subtle.encrypt({
                  name: 'AES-CBC',
                  iv: abIv
                }, key, plaintext);

              case 5:
                _context6.t2 = _context6.sent;
                return _context6.abrupt("return", (0, _context6.t0)(_context6.t1, _context6.t2));

              case 7:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6);
      }));

      function encryptArrayBuffer(_x12, _x13) {
        return _encryptArrayBuffer.apply(this, arguments);
      }

      return encryptArrayBuffer;
    }()
  }, {
    key: "decryptArrayBuffer",
    value: function () {
      var _decryptArrayBuffer = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee7(key, ciphertext) {
        var abIv;
        return _regenerator["default"].wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                abIv = ciphertext.slice(0, 16);
                return _context7.abrupt("return", _isomorphicWebcrypto["default"].subtle.decrypt({
                  name: 'AES-CBC',
                  iv: abIv
                }, key, ciphertext.slice(16)));

              case 2:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7);
      }));

      function decryptArrayBuffer(_x14, _x15) {
        return _decryptArrayBuffer.apply(this, arguments);
      }

      return decryptArrayBuffer;
    }()
  }, {
    key: "encryptString",
    value: function () {
      var _encryptString = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee8(key, plaintext) {
        var abIv, abPlaintext, abPayload, ciphertext;
        return _regenerator["default"].wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                abIv = _isomorphicWebcrypto["default"].getRandomValues(new Uint8Array(16));
                abPlaintext = Buffer.from(plaintext).buffer;
                _context8.next = 4;
                return _isomorphicWebcrypto["default"].subtle.encrypt({
                  name: 'AES-CBC',
                  iv: abIv
                }, key, abPlaintext);

              case 4:
                abPayload = _context8.sent;
                ciphertext = concatArrayBuffer(abIv.buffer, abPayload);
                return _context8.abrupt("return", Buffer.from(ciphertext).toString('utf8'));

              case 7:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8);
      }));

      function encryptString(_x16, _x17) {
        return _encryptString.apply(this, arguments);
      }

      return encryptString;
    }()
  }, {
    key: "decryptString",
    value: function () {
      var _decryptString = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee9(key, ciphertext) {
        var abCiphertext, abIv, abPayload, abPlaintext;
        return _regenerator["default"].wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                abCiphertext = Buffer.from(ciphertext);
                abIv = abCiphertext.slice(0, 16);
                abPayload = abCiphertext.slice(16);
                _context9.next = 5;
                return _isomorphicWebcrypto["default"].subtle.decrypt({
                  name: 'AES-CBC',
                  iv: abIv
                }, key, abPayload);

              case 5:
                abPlaintext = _context9.sent;
                return _context9.abrupt("return", Buffer.from(abPlaintext).toString('utf8'));

              case 7:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9);
      }));

      function decryptString(_x18, _x19) {
        return _decryptString.apply(this, arguments);
      }

      return decryptString;
    }()
  }, {
    key: "algo",
    get: function get() {
      return 'aes-256-cbc';
    }
  }]);
  return WebCryptography;
}();

exports["default"] = WebCryptography;
(0, _defineProperty2["default"])(WebCryptography, "IV_LENGTH", 16);
module.exports = exports.default;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(21).Buffer))

/***/ }),
/* 132 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(__webpack_require__(11));

var _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(12));

var _classCallCheck2 = _interopRequireDefault(__webpack_require__(5));

var _createClass2 = _interopRequireDefault(__webpack_require__(6));

var _defineProperty2 = _interopRequireDefault(__webpack_require__(4));

var _ = __webpack_require__(25);

var _class, _temp;

var PubNubFile = (_temp = _class = function () {
  (0, _createClass2["default"])(PubNubFile, null, [{
    key: "create",
    value: function create(config) {
      return new this(config);
    }
  }]);

  function PubNubFile(config) {
    (0, _classCallCheck2["default"])(this, PubNubFile);
    (0, _defineProperty2["default"])(this, "data", void 0);
    (0, _defineProperty2["default"])(this, "name", void 0);
    (0, _defineProperty2["default"])(this, "mimeType", void 0);

    if (config instanceof File) {
      this.data = config;
      this.name = this.data.name;
      this.mimeType = this.data.type;
    } else if (config.data) {
      var contents = config.data;
      this.data = new File([contents], config.name, {
        type: config.mimeType
      });
      this.name = config.name;

      if (config.mimeType) {
        this.mimeType = config.mimeType;
      }
    }

    if (this.data === undefined) {
      throw new Error("Couldn't construct a file out of supplied options.");
    }

    if (this.name === undefined) {
      throw new Error("Couldn't guess filename out of the options. Please provide one.");
    }
  }

  (0, _createClass2["default"])(PubNubFile, [{
    key: "toBuffer",
    value: function () {
      var _toBuffer = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee() {
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                throw new Error('This feature is only supported in Node.js environments.');

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function toBuffer() {
        return _toBuffer.apply(this, arguments);
      }

      return toBuffer;
    }()
  }, {
    key: "toStream",
    value: function () {
      var _toStream = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee2() {
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                throw new Error('This feature is only supported in Node.js environments.');

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function toStream() {
        return _toStream.apply(this, arguments);
      }

      return toStream;
    }()
  }, {
    key: "toFileUri",
    value: function () {
      var _toFileUri = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee3() {
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                throw new Error('This feature is only supported in react native environments.');

              case 1:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      function toFileUri() {
        return _toFileUri.apply(this, arguments);
      }

      return toFileUri;
    }()
  }, {
    key: "toBlob",
    value: function () {
      var _toBlob = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee4() {
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                return _context4.abrupt("return", this.data);

              case 1:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function toBlob() {
        return _toBlob.apply(this, arguments);
      }

      return toBlob;
    }()
  }, {
    key: "toArrayBuffer",
    value: function () {
      var _toArrayBuffer = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee5() {
        var _this = this;

        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                return _context5.abrupt("return", new Promise(function (resolve, reject) {
                  var reader = new FileReader();
                  reader.addEventListener('load', function () {
                    if (reader.result instanceof ArrayBuffer) {
                      return resolve(reader.result);
                    }
                  });
                  reader.addEventListener('error', function () {
                    reject(reader.error);
                  });
                  reader.readAsArrayBuffer(_this.data);
                }));

              case 1:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }));

      function toArrayBuffer() {
        return _toArrayBuffer.apply(this, arguments);
      }

      return toArrayBuffer;
    }()
  }, {
    key: "toString",
    value: function () {
      var _toString = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee6() {
        var _this2 = this;

        return _regenerator["default"].wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                return _context6.abrupt("return", new Promise(function (resolve, reject) {
                  var reader = new FileReader();
                  reader.addEventListener('load', function () {
                    if (typeof reader.result === 'string') {
                      return resolve(reader.result);
                    }
                  });
                  reader.addEventListener('error', function () {
                    reject(reader.error);
                  });
                  reader.readAsBinaryString(_this2.data);
                }));

              case 1:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6);
      }));

      function toString() {
        return _toString.apply(this, arguments);
      }

      return toString;
    }()
  }, {
    key: "toFile",
    value: function () {
      var _toFile = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee7() {
        return _regenerator["default"].wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                return _context7.abrupt("return", this.data);

              case 1:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function toFile() {
        return _toFile.apply(this, arguments);
      }

      return toFile;
    }()
  }]);
  return PubNubFile;
}(), (0, _defineProperty2["default"])(_class, "supportsFile", typeof File !== 'undefined'), (0, _defineProperty2["default"])(_class, "supportsBlob", typeof Blob !== 'undefined'), (0, _defineProperty2["default"])(_class, "supportsArrayBuffer", typeof ArrayBuffer !== 'undefined'), (0, _defineProperty2["default"])(_class, "supportsBuffer", false), (0, _defineProperty2["default"])(_class, "supportsStream", false), (0, _defineProperty2["default"])(_class, "supportsString", true), (0, _defineProperty2["default"])(_class, "supportsEncryptFile", true), (0, _defineProperty2["default"])(_class, "supportsFileUri", false), _temp);
var _default = PubNubFile;
exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 133 */
/***/ (function(__webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./node_modules/isomorphic-webcrypto/src/webcrypto-shim.mjs
/**
 * @file Web Cryptography API shim
 * @author Artem S Vybornov <vybornov@gmail.com>
 * @license MIT
 */
(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], function () {
            return factory(global);
        });
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS-like environments that support module.exports
        module.exports = factory(global);
    } else {
        factory(global);
    }
}(typeof self !== 'undefined' ? self : undefined, function (global) {
    'use strict';

    if ( typeof Promise !== 'function' )
        throw "Promise support required";

    var _crypto = global.crypto || global.msCrypto;
    if ( !_crypto ) return;

    var _subtle = _crypto.subtle || _crypto.webkitSubtle;
    if ( !_subtle ) return;

    var _Crypto     = global.Crypto || _crypto.constructor || Object,
        _SubtleCrypto = global.SubtleCrypto || _subtle.constructor || Object,
        _CryptoKey  = global.CryptoKey || global.Key || Object;

    var isEdge = global.navigator.userAgent.indexOf('Edge/') > -1;
    var isIE    = !!global.msCrypto && !isEdge;
    var isWebkit = !_crypto.subtle && !!_crypto.webkitSubtle;
    if ( !isIE && !isWebkit ) return;

    function s2a ( s ) {
        return btoa(s).replace(/\=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
    }

    function a2s ( s ) {
        s += '===', s = s.slice( 0, -s.length % 4 );
        return atob( s.replace(/-/g, '+').replace(/_/g, '/') );
    }

    function s2b ( s ) {
        var b = new Uint8Array(s.length);
        for ( var i = 0; i < s.length; i++ ) b[i] = s.charCodeAt(i);
        return b;
    }

    function b2s ( b ) {
        if ( b instanceof ArrayBuffer ) b = new Uint8Array(b);
        return String.fromCharCode.apply( String, b );
    }

    function alg ( a ) {
        var r = { 'name': (a.name || a || '').toUpperCase().replace('V','v') };
        switch ( r.name ) {
            case 'SHA-1':
            case 'SHA-256':
            case 'SHA-384':
            case 'SHA-512':
                break;
            case 'AES-CBC':
            case 'AES-GCM':
            case 'AES-KW':
                if ( a.length ) r['length'] = a.length;
                break;
            case 'HMAC':
                if ( a.hash ) r['hash'] = alg(a.hash);
                if ( a.length ) r['length'] = a.length;
                break;
            case 'RSAES-PKCS1-v1_5':
                if ( a.publicExponent ) r['publicExponent'] = new Uint8Array(a.publicExponent);
                if ( a.modulusLength ) r['modulusLength'] = a.modulusLength;
                break;
            case 'RSASSA-PKCS1-v1_5':
            case 'RSA-OAEP':
                if ( a.hash ) r['hash'] = alg(a.hash);
                if ( a.publicExponent ) r['publicExponent'] = new Uint8Array(a.publicExponent);
                if ( a.modulusLength ) r['modulusLength'] = a.modulusLength;
                break;
            default:
                throw new SyntaxError("Bad algorithm name");
        }
        return r;
    };

    function jwkAlg ( a ) {
        return {
            'HMAC': {
                'SHA-1': 'HS1',
                'SHA-256': 'HS256',
                'SHA-384': 'HS384',
                'SHA-512': 'HS512',
            },
            'RSASSA-PKCS1-v1_5': {
                'SHA-1': 'RS1',
                'SHA-256': 'RS256',
                'SHA-384': 'RS384',
                'SHA-512': 'RS512',
            },
            'RSAES-PKCS1-v1_5': {
                '': 'RSA1_5',
            },
            'RSA-OAEP': {
                'SHA-1': 'RSA-OAEP',
                'SHA-256': 'RSA-OAEP-256',
            },
            'AES-KW': {
                '128': 'A128KW',
                '192': 'A192KW',
                '256': 'A256KW',
            },
            'AES-GCM': {
                '128': 'A128GCM',
                '192': 'A192GCM',
                '256': 'A256GCM',
            },
            'AES-CBC': {
                '128': 'A128CBC',
                '192': 'A192CBC',
                '256': 'A256CBC',
            },
        }[a.name][ ( a.hash || {} ).name || a.length || '' ];
    }

    function b2jwk ( k ) {
        if ( k instanceof ArrayBuffer || k instanceof Uint8Array ) k = JSON.parse( decodeURIComponent( escape( b2s(k) ) ) );
        var jwk = { 'kty': k.kty, 'alg': k.alg, 'ext': k.ext || k.extractable };
        switch ( jwk.kty ) {
            case 'oct':
                jwk.k = k.k;
            case 'RSA':
                [ 'n', 'e', 'd', 'p', 'q', 'dp', 'dq', 'qi', 'oth' ].forEach( function ( x ) { if ( x in k ) jwk[x] = k[x] } );
                break;
            default:
                throw new TypeError("Unsupported key type");
        }
        return jwk;
    }

    function jwk2b ( k ) {
        var jwk = b2jwk(k);
        if ( isIE ) jwk['extractable'] = jwk.ext, delete jwk.ext;
        return s2b( unescape( encodeURIComponent( JSON.stringify(jwk) ) ) ).buffer;
    }

    function pkcs2jwk ( k ) {
        var info = b2der(k), prv = false;
        if ( info.length > 2 ) prv = true, info.shift(); // remove version from PKCS#8 PrivateKeyInfo structure
        var jwk = { 'ext': true };
        switch ( info[0][0] ) {
            case '1.2.840.113549.1.1.1':
                var rsaComp = [ 'n', 'e', 'd', 'p', 'q', 'dp', 'dq', 'qi' ],
                    rsaKey  = b2der( info[1] );
                if ( prv ) rsaKey.shift(); // remove version from PKCS#1 RSAPrivateKey structure
                for ( var i = 0; i < rsaKey.length; i++ ) {
                    if ( !rsaKey[i][0] ) rsaKey[i] = rsaKey[i].subarray(1);
                    jwk[ rsaComp[i] ] = s2a( b2s( rsaKey[i] ) );
                }
                jwk['kty'] = 'RSA';
                break;
            default:
                throw new TypeError("Unsupported key type");
        }
        return jwk;
    }

    function jwk2pkcs ( k ) {
        var key, info = [ [ '', null ] ], prv = false;
        switch ( k.kty ) {
            case 'RSA':
                var rsaComp = [ 'n', 'e', 'd', 'p', 'q', 'dp', 'dq', 'qi' ],
                    rsaKey = [];
                for ( var i = 0; i < rsaComp.length; i++ ) {
                    if ( !( rsaComp[i] in k ) ) break;
                    var b = rsaKey[i] = s2b( a2s( k[ rsaComp[i] ] ) );
                    if ( b[0] & 0x80 ) rsaKey[i] = new Uint8Array(b.length + 1), rsaKey[i].set( b, 1 );
                }
                if ( rsaKey.length > 2 ) prv = true, rsaKey.unshift( new Uint8Array([0]) ); // add version to PKCS#1 RSAPrivateKey structure
                info[0][0] = '1.2.840.113549.1.1.1';
                key = rsaKey;
                break;
            default:
                throw new TypeError("Unsupported key type");
        }
        info.push( new Uint8Array( der2b(key) ).buffer );
        if ( !prv ) info[1] = { 'tag': 0x03, 'value': info[1] };
        else info.unshift( new Uint8Array([0]) ); // add version to PKCS#8 PrivateKeyInfo structure
        return new Uint8Array( der2b(info) ).buffer;
    }

    var oid2str = { 'KoZIhvcNAQEB': '1.2.840.113549.1.1.1' },
        str2oid = { '1.2.840.113549.1.1.1': 'KoZIhvcNAQEB' };

    function b2der ( buf, ctx ) {
        if ( buf instanceof ArrayBuffer ) buf = new Uint8Array(buf);
        if ( !ctx ) ctx = { pos: 0, end: buf.length };

        if ( ctx.end - ctx.pos < 2 || ctx.end > buf.length ) throw new RangeError("Malformed DER");

        var tag = buf[ctx.pos++],
            len = buf[ctx.pos++];

        if ( len >= 0x80 ) {
            len &= 0x7f;
            if ( ctx.end - ctx.pos < len ) throw new RangeError("Malformed DER");
            for ( var xlen = 0; len--; ) xlen <<= 8, xlen |= buf[ctx.pos++];
            len = xlen;
        }

        if ( ctx.end - ctx.pos < len ) throw new RangeError("Malformed DER");

        var rv;

        switch ( tag ) {
            case 0x02: // Universal Primitive INTEGER
                rv = buf.subarray( ctx.pos, ctx.pos += len );
                break;
            case 0x03: // Universal Primitive BIT STRING
                if ( buf[ctx.pos++] ) throw new Error( "Unsupported bit string" );
                len--;
            case 0x04: // Universal Primitive OCTET STRING
                rv = new Uint8Array( buf.subarray( ctx.pos, ctx.pos += len ) ).buffer;
                break;
            case 0x05: // Universal Primitive NULL
                rv = null;
                break;
            case 0x06: // Universal Primitive OBJECT IDENTIFIER
                var oid = btoa( b2s( buf.subarray( ctx.pos, ctx.pos += len ) ) );
                if ( !( oid in oid2str ) ) throw new Error( "Unsupported OBJECT ID " + oid );
                rv = oid2str[oid];
                break;
            case 0x30: // Universal Constructed SEQUENCE
                rv = [];
                for ( var end = ctx.pos + len; ctx.pos < end; ) rv.push( b2der( buf, ctx ) );
                break;
            default:
                throw new Error( "Unsupported DER tag 0x" + tag.toString(16) );
        }

        return rv;
    }

    function der2b ( val, buf ) {
        if ( !buf ) buf = [];

        var tag = 0, len = 0,
            pos = buf.length + 2;

        buf.push( 0, 0 ); // placeholder

        if ( val instanceof Uint8Array ) {  // Universal Primitive INTEGER
            tag = 0x02, len = val.length;
            for ( var i = 0; i < len; i++ ) buf.push( val[i] );
        }
        else if ( val instanceof ArrayBuffer ) { // Universal Primitive OCTET STRING
            tag = 0x04, len = val.byteLength, val = new Uint8Array(val);
            for ( var i = 0; i < len; i++ ) buf.push( val[i] );
        }
        else if ( val === null ) { // Universal Primitive NULL
            tag = 0x05, len = 0;
        }
        else if ( typeof val === 'string' && val in str2oid ) { // Universal Primitive OBJECT IDENTIFIER
            var oid = s2b( atob( str2oid[val] ) );
            tag = 0x06, len = oid.length;
            for ( var i = 0; i < len; i++ ) buf.push( oid[i] );
        }
        else if ( val instanceof Array ) { // Universal Constructed SEQUENCE
            for ( var i = 0; i < val.length; i++ ) der2b( val[i], buf );
            tag = 0x30, len = buf.length - pos;
        }
        else if ( typeof val === 'object' && val.tag === 0x03 && val.value instanceof ArrayBuffer ) { // Tag hint
            val = new Uint8Array(val.value), tag = 0x03, len = val.byteLength;
            buf.push(0); for ( var i = 0; i < len; i++ ) buf.push( val[i] );
            len++;
        }
        else {
            throw new Error( "Unsupported DER value " + val );
        }

        if ( len >= 0x80 ) {
            var xlen = len, len = 4;
            buf.splice( pos, 0, (xlen >> 24) & 0xff, (xlen >> 16) & 0xff, (xlen >> 8) & 0xff, xlen & 0xff );
            while ( len > 1 && !(xlen >> 24) ) xlen <<= 8, len--;
            if ( len < 4 ) buf.splice( pos, 4 - len );
            len |= 0x80;
        }

        buf.splice( pos - 2, 2, tag, len );

        return buf;
    }

    function CryptoKey ( key, alg, ext, use ) {
        Object.defineProperties( this, {
            _key: {
                value: key
            },
            type: {
                value: key.type,
                enumerable: true,
            },
            extractable: {
                value: (ext === undefined) ? key.extractable : ext,
                enumerable: true,
            },
            algorithm: {
                value: (alg === undefined) ? key.algorithm : alg,
                enumerable: true,
            },
            usages: {
                value: (use === undefined) ? key.usages : use,
                enumerable: true,
            },
        });
    }

    function isPubKeyUse ( u ) {
        return u === 'verify' || u === 'encrypt' || u === 'wrapKey';
    }

    function isPrvKeyUse ( u ) {
        return u === 'sign' || u === 'decrypt' || u === 'unwrapKey';
    }

    [ 'generateKey', 'importKey', 'unwrapKey' ]
        .forEach( function ( m ) {
            var _fn = _subtle[m];

            _subtle[m] = function ( a, b, c ) {
                var args = [].slice.call(arguments),
                    ka, kx, ku;

                switch ( m ) {
                    case 'generateKey':
                        ka = alg(a), kx = b, ku = c;
                        break;
                    case 'importKey':
                        ka = alg(c), kx = args[3], ku = args[4];
                        if ( a === 'jwk' ) {
                            b = b2jwk(b);
                            if ( !b.alg ) b.alg = jwkAlg(ka);
                            if ( !b.key_ops ) b.key_ops = ( b.kty !== 'oct' ) ? ( 'd' in b ) ? ku.filter(isPrvKeyUse) : ku.filter(isPubKeyUse) : ku.slice();
                            args[1] = jwk2b(b);
                        }
                        break;
                    case 'unwrapKey':
                        ka = args[4], kx = args[5], ku = args[6];
                        args[2] = c._key;
                        break;
                }

                if ( m === 'generateKey' && ka.name === 'HMAC' && ka.hash ) {
                    ka.length = ka.length || { 'SHA-1': 512, 'SHA-256': 512, 'SHA-384': 1024, 'SHA-512': 1024 }[ka.hash.name];
                    return _subtle.importKey( 'raw', _crypto.getRandomValues( new Uint8Array( (ka.length+7)>>3 ) ), ka, kx, ku );
                }

                if ( isWebkit && m === 'generateKey' && ka.name === 'RSASSA-PKCS1-v1_5' && ( !ka.modulusLength || ka.modulusLength >= 2048 ) ) {
                    a = alg(a), a.name = 'RSAES-PKCS1-v1_5', delete a.hash;
                    return _subtle.generateKey( a, true, [ 'encrypt', 'decrypt' ] )
                        .then( function ( k ) {
                            return Promise.all([
                                _subtle.exportKey( 'jwk', k.publicKey ),
                                _subtle.exportKey( 'jwk', k.privateKey ),
                            ]);
                        })
                        .then( function ( keys ) {
                            keys[0].alg = keys[1].alg = jwkAlg(ka);
                            keys[0].key_ops = ku.filter(isPubKeyUse), keys[1].key_ops = ku.filter(isPrvKeyUse);
                            return Promise.all([
                                _subtle.importKey( 'jwk', keys[0], ka, true, keys[0].key_ops ),
                                _subtle.importKey( 'jwk', keys[1], ka, kx, keys[1].key_ops ),
                            ]);
                        })
                        .then( function ( keys ) {
                            return {
                                publicKey: keys[0],
                                privateKey: keys[1],
                            };
                        });
                }

                if ( ( isWebkit || ( isIE && ( ka.hash || {} ).name === 'SHA-1' ) )
                        && m === 'importKey' && a === 'jwk' && ka.name === 'HMAC' && b.kty === 'oct' ) {
                    return _subtle.importKey( 'raw', s2b( a2s(b.k) ), c, args[3], args[4] );
                }

                if ( isWebkit && m === 'importKey' && ( a === 'spki' || a === 'pkcs8' ) ) {
                    return _subtle.importKey( 'jwk', pkcs2jwk(b), c, args[3], args[4] );
                }

                if ( isIE && m === 'unwrapKey' ) {
                    return _subtle.decrypt( args[3], c, b )
                        .then( function ( k ) {
                            return _subtle.importKey( a, k, args[4], args[5], args[6] );
                        });
                }

                var op;
                try {
                    op = _fn.apply( _subtle, args );
                }
                catch ( e ) {
                    return Promise.reject(e);
                }

                if ( isIE ) {
                    op = new Promise( function ( res, rej ) {
                        op.onabort =
                        op.onerror =    function ( e ) { rej(e)               };
                        op.oncomplete = function ( r ) { res(r.target.result) };
                    });
                }

                op = op.then( function ( k ) {
                    if ( ka.name === 'HMAC' ) {
                        if ( !ka.length ) ka.length = 8 * k.algorithm.length;
                    }
                    if ( ka.name.search('RSA') == 0 ) {
                        if ( !ka.modulusLength ) ka.modulusLength = (k.publicKey || k).algorithm.modulusLength;
                        if ( !ka.publicExponent ) ka.publicExponent = (k.publicKey || k).algorithm.publicExponent;
                    }
                    if ( k.publicKey && k.privateKey ) {
                        k = {
                            publicKey: new CryptoKey( k.publicKey, ka, kx, ku.filter(isPubKeyUse) ),
                            privateKey: new CryptoKey( k.privateKey, ka, kx, ku.filter(isPrvKeyUse) ),
                        };
                    }
                    else {
                        k = new CryptoKey( k, ka, kx, ku );
                    }
                    return k;
                });

                return op;
            }
        });

    [ 'exportKey', 'wrapKey' ]
        .forEach( function ( m ) {
            var _fn = _subtle[m];

            _subtle[m] = function ( a, b, c ) {
                var args = [].slice.call(arguments);

                switch ( m ) {
                    case 'exportKey':
                        args[1] = b._key;
                        break;
                    case 'wrapKey':
                        args[1] = b._key, args[2] = c._key;
                        break;
                }

                if ( ( isWebkit || ( isIE && ( b.algorithm.hash || {} ).name === 'SHA-1' ) )
                        && m === 'exportKey' && a === 'jwk' && b.algorithm.name === 'HMAC' ) {
                    args[0] = 'raw';
                }

                if ( isWebkit && m === 'exportKey' && ( a === 'spki' || a === 'pkcs8' ) ) {
                    args[0] = 'jwk';
                }

                if ( isIE && m === 'wrapKey' ) {
                    return _subtle.exportKey( a, b )
                        .then( function ( k ) {
                            if ( a === 'jwk' ) k = s2b( unescape( encodeURIComponent( JSON.stringify( b2jwk(k) ) ) ) );
                            return  _subtle.encrypt( args[3], c, k );
                        });
                }

                var op;
                try {
                    op = _fn.apply( _subtle, args );
                }
                catch ( e ) {
                    return Promise.reject(e);
                }

                if ( isIE ) {
                    op = new Promise( function ( res, rej ) {
                        op.onabort =
                        op.onerror =    function ( e ) { rej(e)               };
                        op.oncomplete = function ( r ) { res(r.target.result) };
                    });
                }

                if ( m === 'exportKey' && a === 'jwk' ) {
                    op = op.then( function ( k ) {
                        if ( ( isWebkit || ( isIE && ( b.algorithm.hash || {} ).name === 'SHA-1' ) )
                                && b.algorithm.name === 'HMAC') {
                            return { 'kty': 'oct', 'alg': jwkAlg(b.algorithm), 'key_ops': b.usages.slice(), 'ext': true, 'k': s2a( b2s(k) ) };
                        }
                        k = b2jwk(k);
                        if ( !k.alg ) k['alg'] = jwkAlg(b.algorithm);
                        if ( !k.key_ops ) k['key_ops'] = ( b.type === 'public' ) ? b.usages.filter(isPubKeyUse) : ( b.type === 'private' ) ? b.usages.filter(isPrvKeyUse) : b.usages.slice();
                        return k;
                    });
                }

                if ( isWebkit && m === 'exportKey' && ( a === 'spki' || a === 'pkcs8' ) ) {
                    op = op.then( function ( k ) {
                        k = jwk2pkcs( b2jwk(k) );
                        return k;
                    });
                }

                return op;
            }
        });

    [ 'encrypt', 'decrypt', 'sign', 'verify' ]
        .forEach( function ( m ) {
            var _fn = _subtle[m];

            _subtle[m] = function ( a, b, c, d ) {
                if ( isIE && ( !c.byteLength || ( d && !d.byteLength ) ) )
                    throw new Error("Empy input is not allowed");

                var args = [].slice.call(arguments),
                    ka = alg(a);

                if ( isIE && m === 'decrypt' && ka.name === 'AES-GCM' ) {
                    var tl = a.tagLength >> 3;
                    args[2] = (c.buffer || c).slice( 0, c.byteLength - tl ),
                    a.tag = (c.buffer || c).slice( c.byteLength - tl );
                }

                args[1] = b._key;

                var op;
                try {
                    op = _fn.apply( _subtle, args );
                }
                catch ( e ) {
                    return Promise.reject(e);
                }

                if ( isIE ) {
                    op = new Promise( function ( res, rej ) {
                        op.onabort =
                        op.onerror = function ( e ) {
                            rej(e);
                        };

                        op.oncomplete = function ( r ) {
                            var r = r.target.result;

                            if ( m === 'encrypt' && r instanceof AesGcmEncryptResult ) {
                                var c = r.ciphertext, t = r.tag;
                                r = new Uint8Array( c.byteLength + t.byteLength );
                                r.set( new Uint8Array(c), 0 );
                                r.set( new Uint8Array(t), c.byteLength );
                                r = r.buffer;
                            }

                            res(r);
                        };
                    });
                }

                return op;
            }
        });

    if ( isIE ) {
        var _digest = _subtle.digest;

        _subtle['digest'] = function ( a, b ) {
            if ( !b.byteLength )
                throw new Error("Empy input is not allowed");

            var op;
            try {
                op = _digest.call( _subtle, a, b );
            }
            catch ( e ) {
                return Promise.reject(e);
            }

            op = new Promise( function ( res, rej ) {
                op.onabort =
                op.onerror =    function ( e ) { rej(e)               };
                op.oncomplete = function ( r ) { res(r.target.result) };
            });

            return op;
        };

        global.crypto = Object.create( _crypto, {
            getRandomValues: { value: function ( a ) { return _crypto.getRandomValues(a) } },
            subtle:          { value: _subtle },
        });

        global.CryptoKey = CryptoKey;
    }

    if ( isWebkit ) {
        _crypto.subtle = _subtle;

        global.Crypto = _Crypto;
        global.SubtleCrypto = _SubtleCrypto;
        global.CryptoKey = CryptoKey;
    }
}));

 /* harmony default export */ var webcrypto_shim = ({}); // section modified by isomorphic-webcrypto build 

// CONCATENATED MODULE: ./node_modules/isomorphic-webcrypto/src/browser.mjs

/* harmony default export */ var browser = __webpack_exports__["default"] = (window.crypto);


/***/ })
/******/ ]);
});