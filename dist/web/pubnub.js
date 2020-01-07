/*! 4.27.3 / Consumer  */
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
/******/ 	return __webpack_require__(__webpack_require__.s = 11);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {};

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

module.exports = {
  signPamFromParams: signPamFromParams,
  endsWith: endsWith,
  createPromise: createPromise,
  encodeString: encodeString
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _uuid = _interopRequireDefault(__webpack_require__(5));

var _flow_interfaces = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var PRESENCE_TIMEOUT_MINIMUM = 20;
var PRESENCE_TIMEOUT_DEFAULT = 300;

var _default = function () {
  function _default(_ref) {
    var setup = _ref.setup,
        db = _ref.db;

    _classCallCheck(this, _default);

    _defineProperty(this, "_db", void 0);

    _defineProperty(this, "subscribeKey", void 0);

    _defineProperty(this, "publishKey", void 0);

    _defineProperty(this, "secretKey", void 0);

    _defineProperty(this, "cipherKey", void 0);

    _defineProperty(this, "authKey", void 0);

    _defineProperty(this, "UUID", void 0);

    _defineProperty(this, "proxy", void 0);

    _defineProperty(this, "instanceId", void 0);

    _defineProperty(this, "sdkName", void 0);

    _defineProperty(this, "sdkFamily", void 0);

    _defineProperty(this, "partnerId", void 0);

    _defineProperty(this, "filterExpression", void 0);

    _defineProperty(this, "suppressLeaveEvents", void 0);

    _defineProperty(this, "secure", void 0);

    _defineProperty(this, "origin", void 0);

    _defineProperty(this, "logVerbosity", void 0);

    _defineProperty(this, "useInstanceId", void 0);

    _defineProperty(this, "useRequestId", void 0);

    _defineProperty(this, "keepAlive", void 0);

    _defineProperty(this, "keepAliveSettings", void 0);

    _defineProperty(this, "autoNetworkDetection", void 0);

    _defineProperty(this, "announceSuccessfulHeartbeats", void 0);

    _defineProperty(this, "announceFailedHeartbeats", void 0);

    _defineProperty(this, "_presenceTimeout", void 0);

    _defineProperty(this, "_heartbeatInterval", void 0);

    _defineProperty(this, "_subscribeRequestTimeout", void 0);

    _defineProperty(this, "_transactionalRequestTimeout", void 0);

    _defineProperty(this, "_useSendBeacon", void 0);

    _defineProperty(this, "_PNSDKSuffix", void 0);

    _defineProperty(this, "requestMessageCountThreshold", void 0);

    _defineProperty(this, "restore", void 0);

    _defineProperty(this, "dedupeOnSubscribe", void 0);

    _defineProperty(this, "maximumCacheSize", void 0);

    _defineProperty(this, "customEncrypt", void 0);

    _defineProperty(this, "customDecrypt", void 0);

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

  _createClass(_default, [{
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
      return '4.27.3';
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
/* 4 */
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
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _lilUuid = _interopRequireDefault(__webpack_require__(13));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _config = _interopRequireDefault(__webpack_require__(3));

var _hmacSha = _interopRequireDefault(__webpack_require__(14));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = function () {
  function _default(_ref) {
    var config = _ref.config;

    _classCallCheck(this, _default);

    _defineProperty(this, "_config", void 0);

    _defineProperty(this, "_iv", void 0);

    _defineProperty(this, "_allowedKeyEncodings", void 0);

    _defineProperty(this, "_allowedKeyLengths", void 0);

    _defineProperty(this, "_allowedModes", void 0);

    _defineProperty(this, "_defaultOptions", void 0);

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

  _createClass(_default, [{
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

      var iv = this._getIV(options);

      var mode = this._getMode(options);

      var cipherKey = this._getPaddedKey(customCipherKey || this._config.cipherKey, options);

      var encryptedHexArray = _hmacSha["default"].AES.encrypt(data, cipherKey, {
        iv: iv,
        mode: mode
      }).ciphertext;

      var base64Encrypted = encryptedHexArray.toString(_hmacSha["default"].enc.Base64);
      return base64Encrypted || data;
    }
  }, {
    key: "pnDecrypt",
    value: function pnDecrypt(data, customCipherKey, options) {
      if (!customCipherKey && !this._config.cipherKey) return data;
      options = this._parseOptions(options);

      var iv = this._getIV(options);

      var mode = this._getMode(options);

      var cipherKey = this._getPaddedKey(customCipherKey || this._config.cipherKey, options);

      try {
        var ciphertext = _hmacSha["default"].enc.Base64.parse(data);

        var plainJSON = _hmacSha["default"].AES.decrypt({
          ciphertext: ciphertext
        }, cipherKey, {
          iv: iv,
          mode: mode
        }).toString(_hmacSha["default"].enc.Utf8);

        var plaintext = JSON.parse(plainJSON);
        return plaintext;
      } catch (e) {
        return null;
      }
    }
  }]);

  return _default;
}();

exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _flow_interfaces = __webpack_require__(0);

var _categories = _interopRequireDefault(__webpack_require__(4));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = function () {
  function _default() {
    _classCallCheck(this, _default);

    _defineProperty(this, "_listeners", void 0);

    this._listeners = [];
  }

  _createClass(_default, [{
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
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */



var base64 = __webpack_require__(70)
var ieee754 = __webpack_require__(71)
var isArray = __webpack_require__(72)

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

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(69)))

/***/ }),
/* 10 */
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
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _pubnubCommon = _interopRequireDefault(__webpack_require__(12));

var _networking = _interopRequireDefault(__webpack_require__(66));

var _web = _interopRequireDefault(__webpack_require__(67));

var _common = _interopRequireDefault(__webpack_require__(68));

var _webNode = __webpack_require__(74);

var _flow_interfaces = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function sendBeacon(url) {
  if (navigator && navigator.sendBeacon) {
    navigator.sendBeacon(url);
  } else {
    return false;
  }
}

var _default = function (_PubNubCore) {
  _inherits(_default, _PubNubCore);

  function _default(setup) {
    var _this;

    _classCallCheck(this, _default);

    var _setup$listenToBrowse = setup.listenToBrowserNetworkEvents,
        listenToBrowserNetworkEvents = _setup$listenToBrowse === void 0 ? true : _setup$listenToBrowse;
    setup.db = _web["default"];
    setup.cbor = new _common["default"]();
    setup.sdkFamily = 'Web';
    setup.networking = new _networking["default"]({
      del: _webNode.del,
      get: _webNode.get,
      post: _webNode.post,
      patch: _webNode.patch,
      sendBeacon: sendBeacon
    });
    _this = _possibleConstructorReturn(this, _getPrototypeOf(_default).call(this, setup));

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
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _config = _interopRequireDefault(__webpack_require__(3));

var _index = _interopRequireDefault(__webpack_require__(6));

var _subscription_manager = _interopRequireDefault(__webpack_require__(15));

var _listener_manager = _interopRequireDefault(__webpack_require__(7));

var _token_manager = _interopRequireDefault(__webpack_require__(18));

var _endpoint = _interopRequireDefault(__webpack_require__(19));

var addChannelsChannelGroupConfig = _interopRequireWildcard(__webpack_require__(20));

var removeChannelsChannelGroupConfig = _interopRequireWildcard(__webpack_require__(21));

var deleteChannelGroupConfig = _interopRequireWildcard(__webpack_require__(22));

var listChannelGroupsConfig = _interopRequireWildcard(__webpack_require__(23));

var listChannelsInChannelGroupConfig = _interopRequireWildcard(__webpack_require__(24));

var addPushChannelsConfig = _interopRequireWildcard(__webpack_require__(25));

var removePushChannelsConfig = _interopRequireWildcard(__webpack_require__(26));

var listPushChannelsConfig = _interopRequireWildcard(__webpack_require__(27));

var removeDevicePushConfig = _interopRequireWildcard(__webpack_require__(28));

var presenceLeaveEndpointConfig = _interopRequireWildcard(__webpack_require__(29));

var presenceWhereNowEndpointConfig = _interopRequireWildcard(__webpack_require__(30));

var presenceHeartbeatEndpointConfig = _interopRequireWildcard(__webpack_require__(31));

var presenceGetStateConfig = _interopRequireWildcard(__webpack_require__(32));

var presenceSetStateConfig = _interopRequireWildcard(__webpack_require__(33));

var presenceHereNowConfig = _interopRequireWildcard(__webpack_require__(34));

var addMessageActionEndpointConfig = _interopRequireWildcard(__webpack_require__(35));

var removeMessageActionEndpointConfig = _interopRequireWildcard(__webpack_require__(36));

var getMessageActionEndpointConfig = _interopRequireWildcard(__webpack_require__(37));

var createUserEndpointConfig = _interopRequireWildcard(__webpack_require__(38));

var updateUserEndpointConfig = _interopRequireWildcard(__webpack_require__(39));

var deleteUserEndpointConfig = _interopRequireWildcard(__webpack_require__(40));

var getUserEndpointConfig = _interopRequireWildcard(__webpack_require__(41));

var getUsersEndpointConfig = _interopRequireWildcard(__webpack_require__(42));

var createSpaceEndpointConfig = _interopRequireWildcard(__webpack_require__(43));

var updateSpaceEndpointConfig = _interopRequireWildcard(__webpack_require__(44));

var deleteSpaceEndpointConfig = _interopRequireWildcard(__webpack_require__(45));

var getSpacesEndpointConfig = _interopRequireWildcard(__webpack_require__(46));

var getSpaceEndpointConfig = _interopRequireWildcard(__webpack_require__(47));

var getMembersEndpointConfig = _interopRequireWildcard(__webpack_require__(48));

var addMembersEndpointConfig = _interopRequireWildcard(__webpack_require__(49));

var updateMembersEndpointConfig = _interopRequireWildcard(__webpack_require__(50));

var removeMembersEndpointConfig = _interopRequireWildcard(__webpack_require__(51));

var getMembershipsEndpointConfig = _interopRequireWildcard(__webpack_require__(52));

var updateMembershipsEndpointConfig = _interopRequireWildcard(__webpack_require__(53));

var joinSpacesEndpointConfig = _interopRequireWildcard(__webpack_require__(54));

var leaveSpacesEndpointConfig = _interopRequireWildcard(__webpack_require__(55));

var auditEndpointConfig = _interopRequireWildcard(__webpack_require__(56));

var grantEndpointConfig = _interopRequireWildcard(__webpack_require__(57));

var grantTokenEndpointConfig = _interopRequireWildcard(__webpack_require__(58));

var publishEndpointConfig = _interopRequireWildcard(__webpack_require__(59));

var signalEndpointConfig = _interopRequireWildcard(__webpack_require__(60));

var historyEndpointConfig = _interopRequireWildcard(__webpack_require__(61));

var deleteMessagesEndpointConfig = _interopRequireWildcard(__webpack_require__(62));

var messageCountsEndpointConfig = _interopRequireWildcard(__webpack_require__(63));

var fetchMessagesEndpointConfig = _interopRequireWildcard(__webpack_require__(64));

var timeEndpointConfig = _interopRequireWildcard(__webpack_require__(8));

var subscribeEndpointConfig = _interopRequireWildcard(__webpack_require__(65));

var _operations = _interopRequireDefault(__webpack_require__(1));

var _categories = _interopRequireDefault(__webpack_require__(4));

var _flow_interfaces = __webpack_require__(0);

var _uuid = _interopRequireDefault(__webpack_require__(5));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = function () {
  function _default(setup) {
    var _this = this;

    _classCallCheck(this, _default);

    _defineProperty(this, "_config", void 0);

    _defineProperty(this, "_listenerManager", void 0);

    _defineProperty(this, "_tokenManager", void 0);

    _defineProperty(this, "time", void 0);

    _defineProperty(this, "publish", void 0);

    _defineProperty(this, "fire", void 0);

    _defineProperty(this, "history", void 0);

    _defineProperty(this, "deleteMessages", void 0);

    _defineProperty(this, "messageCounts", void 0);

    _defineProperty(this, "fetchMessages", void 0);

    _defineProperty(this, "channelGroups", void 0);

    _defineProperty(this, "push", void 0);

    _defineProperty(this, "hereNow", void 0);

    _defineProperty(this, "whereNow", void 0);

    _defineProperty(this, "getState", void 0);

    _defineProperty(this, "setState", void 0);

    _defineProperty(this, "grant", void 0);

    _defineProperty(this, "grantToken", void 0);

    _defineProperty(this, "audit", void 0);

    _defineProperty(this, "subscribe", void 0);

    _defineProperty(this, "signal", void 0);

    _defineProperty(this, "presence", void 0);

    _defineProperty(this, "unsubscribe", void 0);

    _defineProperty(this, "unsubscribeAll", void 0);

    _defineProperty(this, "addMessageAction", void 0);

    _defineProperty(this, "removeMessageAction", void 0);

    _defineProperty(this, "getMessageActions", void 0);

    _defineProperty(this, "createUser", void 0);

    _defineProperty(this, "updateUser", void 0);

    _defineProperty(this, "deleteUser", void 0);

    _defineProperty(this, "getUser", void 0);

    _defineProperty(this, "getUsers", void 0);

    _defineProperty(this, "createSpace", void 0);

    _defineProperty(this, "updateSpace", void 0);

    _defineProperty(this, "deleteSpace", void 0);

    _defineProperty(this, "getSpaces", void 0);

    _defineProperty(this, "getSpace", void 0);

    _defineProperty(this, "getMembers", void 0);

    _defineProperty(this, "addMembers", void 0);

    _defineProperty(this, "updateMembers", void 0);

    _defineProperty(this, "removeMembers", void 0);

    _defineProperty(this, "getMemberships", void 0);

    _defineProperty(this, "joinSpaces", void 0);

    _defineProperty(this, "updateMemberships", void 0);

    _defineProperty(this, "leaveSpaces", void 0);

    _defineProperty(this, "disconnect", void 0);

    _defineProperty(this, "reconnect", void 0);

    _defineProperty(this, "destroy", void 0);

    _defineProperty(this, "stop", void 0);

    _defineProperty(this, "getSubscribedChannels", void 0);

    _defineProperty(this, "getSubscribedChannelGroups", void 0);

    _defineProperty(this, "addListener", void 0);

    _defineProperty(this, "removeListener", void 0);

    _defineProperty(this, "removeAllListeners", void 0);

    _defineProperty(this, "parseToken", void 0);

    _defineProperty(this, "setToken", void 0);

    _defineProperty(this, "setTokens", void 0);

    _defineProperty(this, "getToken", void 0);

    _defineProperty(this, "getTokens", void 0);

    _defineProperty(this, "clearTokens", void 0);

    _defineProperty(this, "getAuthKey", void 0);

    _defineProperty(this, "setAuthKey", void 0);

    _defineProperty(this, "setCipherKey", void 0);

    _defineProperty(this, "setUUID", void 0);

    _defineProperty(this, "getUUID", void 0);

    _defineProperty(this, "getFilterExpression", void 0);

    _defineProperty(this, "setFilterExpression", void 0);

    _defineProperty(this, "setHeartbeatInterval", void 0);

    _defineProperty(this, "setProxy", void 0);

    _defineProperty(this, "encrypt", void 0);

    _defineProperty(this, "decrypt", void 0);

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
    networking.init(config);
    var tokenManager = this._tokenManager = new _token_manager["default"](config, cbor);
    var modules = {
      config: config,
      networking: networking,
      crypto: crypto,
      tokenManager: tokenManager
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
      listenerManager: listenerManager
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
    this.createUser = _endpoint["default"].bind(this, modules, createUserEndpointConfig);
    this.updateUser = _endpoint["default"].bind(this, modules, updateUserEndpointConfig);
    this.deleteUser = _endpoint["default"].bind(this, modules, deleteUserEndpointConfig);
    this.getUser = _endpoint["default"].bind(this, modules, getUserEndpointConfig);
    this.getUsers = _endpoint["default"].bind(this, modules, getUsersEndpointConfig);
    this.createSpace = _endpoint["default"].bind(this, modules, createSpaceEndpointConfig);
    this.updateSpace = _endpoint["default"].bind(this, modules, updateSpaceEndpointConfig);
    this.deleteSpace = _endpoint["default"].bind(this, modules, deleteSpaceEndpointConfig);
    this.getSpaces = _endpoint["default"].bind(this, modules, getSpacesEndpointConfig);
    this.getSpace = _endpoint["default"].bind(this, modules, getSpaceEndpointConfig);
    this.addMembers = _endpoint["default"].bind(this, modules, addMembersEndpointConfig);
    this.updateMembers = _endpoint["default"].bind(this, modules, updateMembersEndpointConfig);
    this.removeMembers = _endpoint["default"].bind(this, modules, removeMembersEndpointConfig);
    this.getMembers = _endpoint["default"].bind(this, modules, getMembersEndpointConfig);
    this.getMemberships = _endpoint["default"].bind(this, modules, getMembershipsEndpointConfig);
    this.joinSpaces = _endpoint["default"].bind(this, modules, joinSpacesEndpointConfig);
    this.updateMemberships = _endpoint["default"].bind(this, modules, updateMembershipsEndpointConfig);
    this.leaveSpaces = _endpoint["default"].bind(this, modules, leaveSpacesEndpointConfig);
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

  _createClass(_default, [{
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
    key: "generateUUID",
    value: function generateUUID() {
      return _uuid["default"].createUUID();
    }
  }]);

  return _default;
}();

exports["default"] = _default;

_defineProperty(_default, "OPERATIONS", _operations["default"]);

_defineProperty(_default, "CATEGORIES", _categories["default"]);

module.exports = exports.default;

/***/ }),
/* 13 */
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
/* 14 */
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
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _cryptography = _interopRequireDefault(__webpack_require__(6));

var _config = _interopRequireDefault(__webpack_require__(3));

var _listener_manager = _interopRequireDefault(__webpack_require__(7));

var _reconnection_manager = _interopRequireDefault(__webpack_require__(16));

var _deduping_manager = _interopRequireDefault(__webpack_require__(17));

var _utils = _interopRequireDefault(__webpack_require__(2));

var _flow_interfaces = __webpack_require__(0);

var _categories = _interopRequireDefault(__webpack_require__(4));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = function () {
  function _default(_ref) {
    var subscribeEndpoint = _ref.subscribeEndpoint,
        leaveEndpoint = _ref.leaveEndpoint,
        heartbeatEndpoint = _ref.heartbeatEndpoint,
        setStateEndpoint = _ref.setStateEndpoint,
        timeEndpoint = _ref.timeEndpoint,
        config = _ref.config,
        crypto = _ref.crypto,
        listenerManager = _ref.listenerManager;

    _classCallCheck(this, _default);

    _defineProperty(this, "_crypto", void 0);

    _defineProperty(this, "_config", void 0);

    _defineProperty(this, "_listenerManager", void 0);

    _defineProperty(this, "_reconnectionManager", void 0);

    _defineProperty(this, "_leaveEndpoint", void 0);

    _defineProperty(this, "_heartbeatEndpoint", void 0);

    _defineProperty(this, "_setStateEndpoint", void 0);

    _defineProperty(this, "_subscribeEndpoint", void 0);

    _defineProperty(this, "_channels", void 0);

    _defineProperty(this, "_presenceChannels", void 0);

    _defineProperty(this, "_heartbeatChannels", void 0);

    _defineProperty(this, "_heartbeatChannelGroups", void 0);

    _defineProperty(this, "_channelGroups", void 0);

    _defineProperty(this, "_presenceChannelGroups", void 0);

    _defineProperty(this, "_currentTimetoken", void 0);

    _defineProperty(this, "_lastTimetoken", void 0);

    _defineProperty(this, "_storedTimetoken", void 0);

    _defineProperty(this, "_region", void 0);

    _defineProperty(this, "_subscribeCall", void 0);

    _defineProperty(this, "_heartbeatTimer", void 0);

    _defineProperty(this, "_subscriptionStatusAnnounced", void 0);

    _defineProperty(this, "_autoNetworkDetection", void 0);

    _defineProperty(this, "_isOnline", void 0);

    _defineProperty(this, "_pendingChannelSubscriptions", void 0);

    _defineProperty(this, "_pendingChannelGroupSubscriptions", void 0);

    _defineProperty(this, "_dedupingManager", void 0);

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
    this._reconnectionManager = new _reconnection_manager["default"]({
      timeEndpoint: timeEndpoint
    });
    this._dedupingManager = new _deduping_manager["default"]({
      config: config
    });
  }

  _createClass(_default, [{
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

      if (this._config.getHeartbeatInterval() === 0) {
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
        } else {
          var _announce4 = {};
          _announce4.channel = null;
          _announce4.subscription = null;
          _announce4.actualChannel = subscriptionMatch != null ? channel : null;
          _announce4.subscribedChannel = subscriptionMatch != null ? subscriptionMatch : channel;
          _announce4.channel = channel;
          _announce4.subscription = subscriptionMatch;
          _announce4.timetoken = publishMetaData.publishTimetoken;
          _announce4.publisher = message.issuingClientId;

          if (message.userMetadata) {
            _announce4.userMetadata = message.userMetadata;
          }

          if (_this7._config.cipherKey) {
            _announce4.message = _this7._crypto.decrypt(message.payload);
          } else {
            _announce4.message = message.payload;
          }

          _this7._listenerManager.announceMessage(_announce4);
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
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _time = _interopRequireDefault(__webpack_require__(8));

var _flow_interfaces = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = function () {
  function _default(_ref) {
    var timeEndpoint = _ref.timeEndpoint;

    _classCallCheck(this, _default);

    _defineProperty(this, "_reconnectionCallback", void 0);

    _defineProperty(this, "_timeEndpoint", void 0);

    _defineProperty(this, "_timeTimer", void 0);

    this._timeEndpoint = timeEndpoint;
  }

  _createClass(_default, [{
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
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _config = _interopRequireDefault(__webpack_require__(3));

var _flow_interfaces = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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

    _classCallCheck(this, _default);

    _defineProperty(this, "_config", void 0);

    _defineProperty(this, "hashHistory", void 0);

    this.hashHistory = [];
    this._config = config;
  }

  _createClass(_default, [{
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
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _config = _interopRequireDefault(__webpack_require__(3));

var _flow_interfaces = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = function () {
  function _default(config, cbor) {
    _classCallCheck(this, _default);

    _defineProperty(this, "_config", void 0);

    _defineProperty(this, "_cbor", void 0);

    _defineProperty(this, "_userTokens", void 0);

    _defineProperty(this, "_spaceTokens", void 0);

    _defineProperty(this, "_userToken", void 0);

    _defineProperty(this, "_spaceToken", void 0);

    this._config = config;
    this._cbor = cbor;

    this._initializeTokens();
  }

  _createClass(_default, [{
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

      if (tokens && tokens.length && _typeof(tokens) === 'object') {
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
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;

var _uuid = _interopRequireDefault(__webpack_require__(5));

var _flow_interfaces = __webpack_require__(0);

var _utils = _interopRequireDefault(__webpack_require__(2));

var _config = _interopRequireDefault(__webpack_require__(3));

var _operations = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var PubNubError = function (_Error) {
  _inherits(PubNubError, _Error);

  function PubNubError(message, status) {
    var _this;

    _classCallCheck(this, PubNubError);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(PubNubError).call(this, message));
    _this.name = _this.constructor.name;
    _this.status = status;
    _this.message = message;
    return _this;
  }

  return PubNubError;
}(_wrapNativeSuper(Error));

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
  } else {
    return 'GET';
  }
}

function signRequest(modules, url, outgoingParams, incomingParams, endpoint) {
  var config = modules.config,
      crypto = modules.crypto;
  var httpMethod = getHttpMethod(modules, endpoint, incomingParams);
  outgoingParams.timestamp = Math.floor(new Date().getTime() / 1000);
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
      config = modules.config;
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
    headers: endpoint.getRequestHeaders ? endpoint.getRequestHeaders() : {}
  };
  outgoingParams.uuid = config.UUID;
  outgoingParams.pnsdk = generatePNSDK(config);

  if (config.useInstanceId) {
    outgoingParams.instanceid = config.instanceId;
  }

  if (config.useRequestId) {
    outgoingParams.requestid = _uuid["default"].createUUID();
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

  if (getHttpMethod(modules, endpoint, incomingParams) === 'POST') {
    var payload = endpoint.postPayload(modules, incomingParams);
    callInstance = networking.POST(outgoingParams, payload, networkingParams, onResponse);
  } else if (getHttpMethod(modules, endpoint, incomingParams) === 'PATCH') {
    var _payload2 = endpoint.patchPayload(modules, incomingParams);

    callInstance = networking.PATCH(outgoingParams, _payload2, networkingParams, onResponse);
  } else if (getHttpMethod(modules, endpoint, incomingParams) === 'DELETE') {
    callInstance = networking.DELETE(outgoingParams, networkingParams, onResponse);
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

module.exports = exports.default;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(2));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(2));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(2));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(2));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function getOperation() {
  return _operations["default"].PNPushNotificationEnabledChannelsOperation;
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
      channels = _incomingParams$chann === void 0 ? [] : _incomingParams$chann;
  return {
    type: pushGateway,
    add: channels.join(',')
  };
}

function handleResponse() {
  return {};
}

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function getOperation() {
  return _operations["default"].PNPushNotificationEnabledChannelsOperation;
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
      channels = _incomingParams$chann === void 0 ? [] : _incomingParams$chann;
  return {
    type: pushGateway,
    remove: channels.join(',')
  };
}

function handleResponse() {
  return {};
}

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function getOperation() {
  return _operations["default"].PNPushNotificationEnabledChannelsOperation;
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
  var pushGateway = incomingParams.pushGateway;
  return {
    type: pushGateway
  };
}

function handleResponse(modules, serverResponse) {
  return {
    channels: serverResponse
  };
}

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function getOperation() {
  return _operations["default"].PNRemoveAllPushNotificationsOperation;
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
  var pushGateway = incomingParams.pushGateway;
  return {
    type: pushGateway
  };
}

function handleResponse() {
  return {};
}

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(2));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(2));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(2));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(2));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(2));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
      includeState = _incomingParams$inclu2 === void 0 ? false : _incomingParams$inclu2;
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
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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

function handleResponse(modules, usersResponse) {
  return usersResponse;
}

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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

function handleResponse(modules, spacesResponse) {
  return spacesResponse;
}

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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

  return params;
}

function handleResponse(modules, membersResponse) {
  return membersResponse;
}

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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

function handleResponse(modules, membershipsResponse) {
  return membershipsResponse;
}

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function getOperation() {
  return _operations["default"].PNAccessManagerGrant;
}

function validateParams(modules) {
  var config = modules.config;
  if (!config.subscribeKey) return 'Missing Subscribe Key';
  if (!config.publishKey) return 'Missing Publish Key';
  if (!config.secretKey) return 'Missing Secret Key';
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
      ttl = incomingParams.ttl,
      _incomingParams$read = incomingParams.read,
      read = _incomingParams$read === void 0 ? false : _incomingParams$read,
      _incomingParams$write = incomingParams.write,
      write = _incomingParams$write === void 0 ? false : _incomingParams$write,
      _incomingParams$manag = incomingParams.manage,
      manage = _incomingParams$manag === void 0 ? false : _incomingParams$manag,
      _incomingParams$authK = incomingParams.authKeys,
      authKeys = _incomingParams$authK === void 0 ? [] : _incomingParams$authK;
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
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(2));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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

  if (meta && _typeof(meta) === 'object') {
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
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(2));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(2));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(2));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(2));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

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
  return {
    channels: serverResponse.channels
  };
}

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(2));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
      includeMeta = _incomingParams$inclu3 === void 0 ? false : _incomingParams$inclu3;
  var outgoingParams = {};
  if (count) outgoingParams.max = count;
  if (start) outgoingParams.start = start;
  if (end) outgoingParams.end = end;
  if (stringifiedTimeToken) outgoingParams.string_message_token = 'true';
  if (includeMeta) outgoingParams.include_meta = 'true';
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
  return response;
}

/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _flow_interfaces = __webpack_require__(0);

var _operations = _interopRequireDefault(__webpack_require__(1));

var _utils = _interopRequireDefault(__webpack_require__(2));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _config = _interopRequireDefault(__webpack_require__(3));

var _categories = _interopRequireDefault(__webpack_require__(4));

var _flow_interfaces = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = function () {
  function _default(modules) {
    var _this = this;

    _classCallCheck(this, _default);

    _defineProperty(this, "_modules", void 0);

    _defineProperty(this, "_config", void 0);

    _defineProperty(this, "_maxSubDomain", void 0);

    _defineProperty(this, "_currentSubDomain", void 0);

    _defineProperty(this, "_standardOrigin", void 0);

    _defineProperty(this, "_subscribeOrigin", void 0);

    _defineProperty(this, "_providedFQDN", void 0);

    _defineProperty(this, "_requestTimeout", void 0);

    _defineProperty(this, "_coreParams", void 0);

    this._modules = {};
    Object.keys(modules).forEach(function (key) {
      _this._modules[key] = modules[key].bind(_this);
    });
  }

  _createClass(_default, [{
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
      this._currentSubDomain = this._currentSubDomain + 1;

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
/* 67 */
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
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _cborSync = _interopRequireDefault(__webpack_require__(73));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _default = function () {
  function _default() {
    _classCallCheck(this, _default);
  }

  _createClass(_default, [{
    key: "decodeToken",
    value: function decodeToken(tokenString) {
      var padding = '';

      if (tokenString.length % 4 === 3) {
        padding = '=';
      } else if (tokenString.length % 4 === 2) {
        padding = '==';
      }

      var cleaned = tokenString.replace('-', '+').replace('_', '/') + padding;

      var result = _cborSync["default"].decode(new Buffer.from(cleaned, 'base64'));

      if (_typeof(result) === 'object') {
        return result;
      }

      return undefined;
    }
  }]);

  return _default;
}();

exports["default"] = _default;
module.exports = exports.default;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(9).Buffer))

/***/ }),
/* 69 */
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
/* 70 */
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
/* 71 */
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
/* 72 */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};


/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer) {var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	if (true) {
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
})(this, function () {
	var CBOR = (function () {
		function BinaryHex(hex) {
			this.$hex = hex;
		}
		BinaryHex.prototype = {
			length: function () {
				return this.$hex.length/2;
			},
			toString: function (format) {
				if (!format || format === 'hex' || format === 16) return this.$hex;
				if (format === 'utf-8') {
					var encoded = '';
					for (var i = 0; i < this.$hex.length; i += 2) {
						encoded += '%' + this.$hex.substring(i, i + 2);
					}
					return decodeURIComponent(encoded);
				}
				if (format === 'latin') {
					var encoded = [];
					for (var i = 0; i < this.$hex.length; i += 2) {
						encoded.push(parseInt(this.$hex.substring(i, i + 2), 16));
					}
					return String.fromCharCode.apply(String, encoded);
				}
				throw new Error('Unrecognised format: ' + format);
			}
		};
		BinaryHex.fromLatinString = function (latinString) {
			var hex = '';
			for (var i = 0; i < latinString.length; i++) {
				var pair = latinString.charCodeAt(i).toString(16);
				if (pair.length === 1) pair = "0" + pair;
				hex += pair;
			}
			return new BinaryHex(hex);
		};
		BinaryHex.fromUtf8String = function (utf8String) {
			var encoded = encodeURIComponent(utf8String);
			var hex = '';
			for (var i = 0; i < encoded.length; i++) {
				if (encoded.charAt(i) === '%') {
					hex += encoded.substring(i + 1, i + 3);
					i += 2;
				} else {
					var hexPair = encoded.charCodeAt(i).toString(16);
					if (hexPair.length < 2) hexPair = "0" + hexPair;
					hex += hexPair;
				}
			}
			return new BinaryHex(hex);
		};

		var semanticEncoders = [];
		var semanticDecoders = {};
	
		var notImplemented = function (label) {
			return function () {
				throw new Error(label + ' not implemented');
			};
		};
	
		function Reader() {
		}
		Reader.prototype = {
			peekByte: notImplemented('peekByte'),
			readByte: notImplemented('readByte'),
			readChunk: notImplemented('readChunk'),
			readFloat16: function () {
				var half = this.readUint16();
				var exponent = (half&0x7fff) >> 10;
				var mantissa = half&0x3ff;
				var negative = half&0x8000;
				if (exponent === 0x1f) {
					if (mantissa === 0) {
						return negative ? -Infinity : Infinity;
					}
					return NaN;
				}
				var magnitude = exponent ? Math.pow(2, exponent - 25)*(1024 + mantissa) : Math.pow(2, -24)*mantissa;
				return negative ? -magnitude : magnitude;
			},
			readFloat32: function () {
				var intValue = this.readUint32();
				var exponent = (intValue&0x7fffffff) >> 23;
				var mantissa = intValue&0x7fffff;
				var negative = intValue&0x80000000;
				if (exponent === 0xff) {
					if (mantissa === 0) {
						return negative ? -Infinity : Infinity;
					}
					return NaN;
				}
				var magnitude = exponent ? Math.pow(2, exponent - 23 - 127)*(8388608 + mantissa) : Math.pow(2, -23 - 126)*mantissa;
				return negative ? -magnitude : magnitude;
			},
			readFloat64: function () {
				var int1 = this.readUint32(), int2 = this.readUint32();
				var exponent = (int1 >> 20)&0x7ff;
				var mantissa = (int1&0xfffff)*4294967296 + int2;
				var negative = int1&0x80000000;
				if (exponent === 0x7ff) {
					if (mantissa === 0) {
						return negative ? -Infinity : Infinity;
					}
					return NaN;
				}
				var magnitude = exponent ? Math.pow(2, exponent - 52 - 1023)*(4503599627370496 + mantissa) : Math.pow(2, -52 - 1022)*mantissa;
				return negative ? -magnitude : magnitude;
			},
			readUint16: function () {
				return this.readByte()*256 + this.readByte();
			},
			readUint32: function () {
				return this.readUint16()*65536 + this.readUint16();
			},
			readUint64: function () {
				return this.readUint32()*4294967296 + this.readUint32();
			}
		};
		function Writer() {
		}
		Writer.prototype = {
			writeByte: notImplemented('writeByte'),
			result: notImplemented('result'),
			writeFloat16: notImplemented('writeFloat16'),
			writeFloat32: notImplemented('writeFloat32'),
			writeFloat64: notImplemented('writeFloat64'),
			writeUint16: function (value) {
				this.writeByte((value >> 8)&0xff);
				this.writeByte(value&0xff);
			},
			writeUint32: function (value) {
				this.writeUint16((value>>16)&0xffff);
				this.writeUint16(value&0xffff);
			},
			writeUint64: function (value) {
				if (value >= 9007199254740992 || value <= -9007199254740992) {
					throw new Error('Cannot encode Uint64 of: ' + value + ' magnitude to big (floating point errors)');
				}
				this.writeUint32(Math.floor(value/4294967296));
				this.writeUint32(value%4294967296);
			},
			writeString: notImplemented('writeString'),
			canWriteBinary: function (chunk) {
				return false;
			},
			writeBinary: notImplemented('writeChunk')
		};

		function readHeaderRaw(reader) {
			var firstByte = reader.readByte();
			var majorType = firstByte >> 5, value = firstByte&0x1f;
			return {type: majorType, value: value};
		}
	
		function valueFromHeader(header, reader) {
			var value = header.value;
			if (value < 24) {
				return value;
			} else if (value == 24) {
				return reader.readByte();
			} else if (value == 25) {
				return reader.readUint16();
			} else if (value == 26) {
				return reader.readUint32();
			} else if (value == 27) {
				return reader.readUint64();
			} else if (value == 31) {
				// special value for non-terminating arrays/objects
				return null;
			}
			notImplemented('Additional info: ' + value)();
		}
	
		function writeHeaderRaw(type, value, writer) {
			writer.writeByte((type<<5)|value);
		}
	
		function writeHeader(type, value, writer) {
			var firstByte = type<<5;
			if (value < 24) {
				writer.writeByte(firstByte|value);
			} else if (value < 256) {
				writer.writeByte(firstByte|24);
				writer.writeByte(value);
			} else if (value < 65536) {
				writer.writeByte(firstByte|25);
				writer.writeUint16(value);
			} else if (value < 4294967296) {
				writer.writeByte(firstByte|26);
				writer.writeUint32(value);
			} else {
				writer.writeByte(firstByte|27);
				writer.writeUint64(value);
			}
		}
	
		var stopCode = new Error(); // Just a unique object, that won't compare strictly equal to anything else
	
		function decodeReader(reader) {
			var header = readHeaderRaw(reader);
			switch (header.type) {
				case 0:
					return valueFromHeader(header, reader);
				case 1:
					return -1 -valueFromHeader(header, reader);
				case 2:
					return reader.readChunk(valueFromHeader(header, reader));
				case 3:
					var buffer = reader.readChunk(valueFromHeader(header, reader));
					return buffer.toString('utf-8');
				case 4:
				case 5:
					var arrayLength = valueFromHeader(header, reader);
					var result = [];
					if (arrayLength !== null) {
						if (header.type === 5) {
							arrayLength *= 2;
						} 
						for (var i = 0; i < arrayLength; i++) {
							result[i] = decodeReader(reader);
						}
					} else {
						var item;
						while ((item = decodeReader(reader)) !== stopCode) {
							result.push(item);
						}
					}
					if (header.type === 5) {
						var objResult = {};
						for (var i = 0; i < result.length; i += 2) {
							objResult[result[i]] = result[i + 1];
						}
						return objResult;
					} else {
						return result;
					}
				case 6:
					var tag = valueFromHeader(header, reader);
					var decoder = semanticDecoders[tag];
					var result = decodeReader(reader);
					return decoder ? decoder(result) : result;
				case 7:
					if (header.value === 25) {
						return reader.readFloat16();
					} else if (header.value === 26) {
						return reader.readFloat32();
					} else if (header.value === 27) {
						return reader.readFloat64();
					}
					switch (valueFromHeader(header, reader)) {
						case 20:
							return false;
						case 21:
							return true;
						case 22:
							return null;
						case 23:
							return undefined;
						case null:
							return stopCode;
						default:
							throw new Error('Unknown fixed value: ' + header.value);
					}
				default:
					throw new Error('Unsupported header: ' + JSON.stringify(header));
			}
			throw new Error('not implemented yet');
		}
	
		function encodeWriter(data, writer) {
			for (var i = 0; i < semanticEncoders.length; i++) {
				var replacement = semanticEncoders[i].fn(data);
				if (replacement !== undefined) {
					writeHeader(6, semanticEncoders[i].tag, writer);
					return encodeWriter(replacement, writer);
				}
			}
		
			if (data && typeof data.toCBOR === 'function') {
				data = data.toCBOR();
			}
		
			if (data === false) {
				writeHeader(7, 20, writer);
			} else if (data === true) {
				writeHeader(7, 21, writer);
			} else if (data === null) {
				writeHeader(7, 22, writer);
			} else if (data === undefined) {
				writeHeader(7, 23, writer);
			} else if (typeof data === 'number') {
				if (Math.floor(data) === data && data < 9007199254740992 && data > -9007199254740992) {
					// Integer
					if (data < 0) {
						writeHeader(1, -1 - data, writer);
					} else {
						writeHeader(0, data, writer);
					}
				} else {
					writeHeaderRaw(7, 27, writer);
					writer.writeFloat64(data);
				}
			} else if (typeof data === 'string') {
				writer.writeString(data, function (length) {
					writeHeader(3, length, writer);
				});
			} else if (writer.canWriteBinary(data)) {
				writer.writeBinary(data, function (length) {
					writeHeader(2, length, writer);
				});
			} else if (typeof data === 'object') {
				if (api.config.useToJSON && typeof data.toJSON === 'function') {
			   		data = data.toJSON();
			   	}
				if (Array.isArray(data)) {
					writeHeader(4, data.length, writer);
					for (var i = 0; i < data.length; i++) {
						encodeWriter(data[i], writer);
					}
				} else {
					var keys = Object.keys(data);
					writeHeader(5, keys.length, writer);
					for (var i = 0; i < keys.length; i++) {
						encodeWriter(keys[i], writer);
						encodeWriter(data[keys[i]], writer);
					}
				}
			} else {
				throw new Error('CBOR encoding not supported: ' + data);
			}
		}
		
		var readerFunctions = [];
		var writerFunctions = [];
	
		var api = {
			config: {
				useToJSON: true
			},
			addWriter: function (format, writerFunction) {
				if (typeof format === 'string') {
					writerFunctions.push(function (f) {
						if (format === f) return writerFunction(f);
					});
				} else {
					writerFunctions.push(format);
				}
			},
			addReader: function (format, readerFunction) {
				if (typeof format === 'string') {
					readerFunctions.push(function (data, f) {
						if (format === f) return readerFunction(data, f);
					});
				} else {
					readerFunctions.push(format);
				}
			},
			encode: function (data, format) {
				for (var i = 0; i < writerFunctions.length; i++) {
					var func = writerFunctions[i];
					var writer = func(format);
					if (writer) {
						encodeWriter(data, writer);
						return writer.result();
					}
				}
				throw new Error('Unsupported output format: ' + format);
			},
			decode: function (data, format) {
				for (var i = 0; i < readerFunctions.length; i++) {
					var func = readerFunctions[i];
					var reader = func(data, format);
					if (reader) {
						return decodeReader(reader);
					}
				}
				throw new Error('Unsupported input format: ' + format);
			},
			addSemanticEncode: function (tag, fn) {
				if (typeof tag !== 'number' || tag%1 !== 0 || tag < 0) {
					throw new Error('Tag must be a positive integer');
				}
				semanticEncoders.push({tag: tag, fn: fn});
				return this;
			},
			addSemanticDecode: function (tag, fn) {
				if (typeof tag !== 'number' || tag%1 !== 0 || tag < 0) {
					throw new Error('Tag must be a positive integer');
				}
				semanticDecoders[tag] = fn;
				return this;
			},
			Reader: Reader,
			Writer: Writer
		};
		
		/** Node.js Buffers **/
		function BufferReader(buffer) {
			this.buffer = buffer;
			this.pos = 0;
		}
		BufferReader.prototype = Object.create(Reader.prototype);
		BufferReader.prototype.peekByte = function () {
			return this.buffer[this.pos];
		};
		BufferReader.prototype.readByte = function () {
			return this.buffer[this.pos++];
		};
		BufferReader.prototype.readUint16 = function () {
			var result = this.buffer.readUInt16BE(this.pos);
			this.pos += 2;
			return result;
		};
		BufferReader.prototype.readUint32 = function () {
			var result = this.buffer.readUInt32BE(this.pos);
			this.pos += 4;
			return result;
		};
		BufferReader.prototype.readFloat32 = function () {
			var result = this.buffer.readFloatBE(this.pos);
			this.pos += 4;
			return result;
		};
		BufferReader.prototype.readFloat64 = function () {
			var result = this.buffer.readDoubleBE(this.pos);
			this.pos += 8;
			return result;
		};
		BufferReader.prototype.readChunk = function (length) {
			var result = Buffer.alloc(length);
			this.buffer.copy(result, 0, this.pos, this.pos += length);
			return result;
		};
	
		function BufferWriter(stringFormat) {
			this.byteLength = 0;
			this.defaultBufferLength = 16384; // 16k
			this.latestBuffer = Buffer.alloc(this.defaultBufferLength);
			this.latestBufferOffset = 0;
			this.completeBuffers = [];
			this.stringFormat = stringFormat;
		}
		BufferWriter.prototype = Object.create(Writer.prototype);
		BufferWriter.prototype.writeByte = function (value) {
			this.latestBuffer[this.latestBufferOffset++] = value;
			if (this.latestBufferOffset >= this.latestBuffer.length) {
				this.completeBuffers.push(this.latestBuffer);
				this.latestBuffer = Buffer.alloc(this.defaultBufferLength);
				this.latestBufferOffset = 0;
			}
			this.byteLength++;
		}
		BufferWriter.prototype.writeFloat32 = function (value) {
			var buffer = Buffer.alloc(4);
			buffer.writeFloatBE(value, 0);
			this.writeBuffer(buffer);
		};
		BufferWriter.prototype.writeFloat64 = function (value) {
			var buffer = Buffer.alloc(8);
			buffer.writeDoubleBE(value, 0);
			this.writeBuffer(buffer);
		};
		BufferWriter.prototype.writeString = function (string, lengthFunc) {
			var buffer = Buffer.from(string, 'utf-8');
			lengthFunc(buffer.length);
			this.writeBuffer(buffer);
		};
		BufferWriter.prototype.canWriteBinary = function (data) {
			return data instanceof Buffer;
		};
		BufferWriter.prototype.writeBinary = function (buffer, lengthFunc) {
			lengthFunc(buffer.length);
			this.writeBuffer(buffer);
		};
		BufferWriter.prototype.writeBuffer = function (chunk) {
			if (!(chunk instanceof Buffer)) throw new TypeError('BufferWriter only accepts Buffers');
			if (!this.latestBufferOffset) {
				this.completeBuffers.push(chunk);
			} else if (this.latestBuffer.length - this.latestBufferOffset >= chunk.length) {
				chunk.copy(this.latestBuffer, this.latestBufferOffset);
				this.latestBufferOffset += chunk.length;
				if (this.latestBufferOffset >= this.latestBuffer.length) {
					this.completeBuffers.push(this.latestBuffer);
					this.latestBuffer = Buffer.alloc(this.defaultBufferLength);
					this.latestBufferOffset = 0;
				}
			} else {
				this.completeBuffers.push(this.latestBuffer.slice(0, this.latestBufferOffset));
				this.completeBuffers.push(chunk);
				this.latestBuffer = Buffer.alloc(this.defaultBufferLength);
				this.latestBufferOffset = 0;
			}
			this.byteLength += chunk.length;
		}
		BufferWriter.prototype.result = function () {
			// Copies them all into a single Buffer
			var result = Buffer.alloc(this.byteLength);
			var offset = 0;
			for (var i = 0; i < this.completeBuffers.length; i++) {
				var buffer = this.completeBuffers[i];
				buffer.copy(result, offset, 0, buffer.length);
				offset += buffer.length;
			}
			if (this.latestBufferOffset) {
				this.latestBuffer.copy(result, offset, 0, this.latestBufferOffset);
			}
			
			if (this.stringFormat) return result.toString(this.stringFormat);
			return result;
		}
		
		if (typeof Buffer === 'function') {
			api.addReader(function (data, format) {
				if (data instanceof Buffer) {
					return new BufferReader(data);
				}
				if (format === 'hex' || format === 'base64') {
					var buffer = Buffer.from(data, format);
					return new BufferReader(buffer);
				}
			});
			api.addWriter(function (format) {
				if (!format || format === 'buffer') {
					return new BufferWriter();
				} else if (format === 'hex' || format === 'base64') {
					return new BufferWriter(format);
				}
			});
		}
		
		/** Hex-encoding (and Latin1) for browser **/
		function HexReader(hex) {
			this.hex = hex;
			this.pos = 0;
		}
		HexReader.prototype = Object.create(Reader.prototype);
		HexReader.prototype.peekByte = function () {
			var pair = this.hex.substring(this.pos, 2);
			return parseInt(pair, 16);
		};
		HexReader.prototype.readByte = function () {
			var pair = this.hex.substring(this.pos, this.pos + 2);
			this.pos += 2;
			return parseInt(pair, 16);
		};
		HexReader.prototype.readChunk = function (length) {
			var hex = this.hex.substring(this.pos, this.pos + length*2);
			this.pos += length*2;
			if (typeof Buffer === 'function') return Buffer.from(hex, 'hex');
			return new BinaryHex(hex);
		};
	
		function HexWriter(finalFormat) {
			this.$hex = '';
			this.finalFormat = finalFormat || 'hex'
		}
		HexWriter.prototype = Object.create(Writer.prototype);
		HexWriter.prototype.writeByte = function (value) {
			if (value < 0 || value > 255) throw new Error('Byte value out of range: ' + value);
			var hex = value.toString(16);
			if (hex.length == 1) {
				hex = '0' + hex;
			}
			this.$hex += hex;
		}
		HexWriter.prototype.canWriteBinary = function (chunk) {
			return chunk instanceof BinaryHex || (typeof Buffer === 'function' && chunk instanceof Buffer);
		}
		HexWriter.prototype.writeBinary = function (chunk, lengthFunction) {
			if (chunk instanceof BinaryHex) {
				lengthFunction(chunk.length());
				this.$hex += chunk.$hex;
			} else if (typeof Buffer === 'function' && chunk instanceof Buffer) {
				lengthFunction(chunk.length);
				this.$hex += chunk.toString('hex');
			} else {
				throw new TypeError('HexWriter only accepts BinaryHex or Buffers');
			}
		}
		HexWriter.prototype.result = function () {
			if (this.finalFormat === 'buffer' && typeof Buffer === 'function') {
				return Buffer.from(this.$hex, 'hex');
			}
			return new BinaryHex(this.$hex).toString(this.finalFormat);
		}
		HexWriter.prototype.writeString = function (string, lengthFunction) {
			var buffer = BinaryHex.fromUtf8String(string);
			lengthFunction(buffer.length());
			this.$hex += buffer.$hex;
		}

		api.addReader(function (data, format) {
			if (data instanceof BinaryHex || data.$hex) {
				return new HexReader(data.$hex);
			}
			if (format === 'hex') {
				return new HexReader(data)
			}
		});
		api.addWriter(function (format) {
			if (format === 'hex') {
				return new HexWriter();
			}
		});

		return api;
	})();

	CBOR.addSemanticEncode(0, function (data) {
		if (data instanceof Date) {
			return data.toISOString();
		}
	}).addSemanticDecode(0, function (isoString) {
		return new Date(isoString);
	}).addSemanticDecode(1, function (isoString) {
		return new Date(isoString);
	});

	return CBOR;
});
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(9).Buffer))

/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.get = get;
exports.post = post;
exports.patch = patch;
exports.del = del;

var _superagent = _interopRequireDefault(__webpack_require__(75));

var _flow_interfaces = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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

  return superagentConstruct.timeout(endpoint.timeout).end(function (err, resp) {
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
    } else if (parsedResponse.error && parsedResponse.error.message) {
      status.errorData = parsedResponse.error;
    }

    return callback(status, parsedResponse);
  });
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
/* 75 */
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

var Emitter = __webpack_require__(76);
var RequestBase = __webpack_require__(77);
var isObject = __webpack_require__(10);
var ResponseBase = __webpack_require__(78);
var Agent = __webpack_require__(80);

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
/* 76 */
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
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Module of mixed-in functions shared between node and client code
 */
var isObject = __webpack_require__(10);

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
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Module dependencies.
 */

var utils = __webpack_require__(79);

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
/* 79 */
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
/* 80 */
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
/******/ ]);
});