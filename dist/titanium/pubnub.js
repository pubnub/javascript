/*! 4.26.1 / Consumer  */
exports["PubNub"] =
/******/ (function(modules) { // webpackBootstrap
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
/******/ 	return __webpack_require__(__webpack_require__.s = 9);
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

    _defineProperty(this, "requestMessageCountThreshold", void 0);

    _defineProperty(this, "restore", void 0);

    _defineProperty(this, "dedupeOnSubscribe", void 0);

    _defineProperty(this, "maximumCacheSize", void 0);

    _defineProperty(this, "customEncrypt", void 0);

    _defineProperty(this, "customDecrypt", void 0);

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
    this.setPresenceTimeout(setup.presenceTimeout || PRESENCE_TIMEOUT_DEFAULT);

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
      return '4.26.1';
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

var _lilUuid = _interopRequireDefault(__webpack_require__(11));

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

var _hmacSha = _interopRequireDefault(__webpack_require__(12));

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


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _pubnubCommon = _interopRequireDefault(__webpack_require__(10));

var _networking = _interopRequireDefault(__webpack_require__(61));

var _common = _interopRequireDefault(__webpack_require__(62));

var _common2 = _interopRequireDefault(__webpack_require__(63));

var _titanium = __webpack_require__(65);

var _flow_interfaces = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var PubNub = function (_PubNubCore) {
  _inherits(PubNub, _PubNubCore);

  function PubNub(setup) {
    _classCallCheck(this, PubNub);

    setup.db = new _common["default"]();
    setup.cbor = new _common2["default"]();
    setup.sdkFamily = 'TitaniumSDK';
    setup.networking = new _networking["default"]({
      del: _titanium.del,
      get: _titanium.get,
      post: _titanium.post,
      patch: _titanium.patch
    });
    return _possibleConstructorReturn(this, _getPrototypeOf(PubNub).call(this, setup));
  }

  return PubNub;
}(_pubnubCommon["default"]);

exports["default"] = PubNub;
module.exports = exports.default;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _config = _interopRequireDefault(__webpack_require__(3));

var _index = _interopRequireDefault(__webpack_require__(6));

var _subscription_manager = _interopRequireDefault(__webpack_require__(13));

var _listener_manager = _interopRequireDefault(__webpack_require__(7));

var _token_manager = _interopRequireDefault(__webpack_require__(16));

var _endpoint = _interopRequireDefault(__webpack_require__(17));

var addChannelsChannelGroupConfig = _interopRequireWildcard(__webpack_require__(18));

var removeChannelsChannelGroupConfig = _interopRequireWildcard(__webpack_require__(19));

var deleteChannelGroupConfig = _interopRequireWildcard(__webpack_require__(20));

var listChannelGroupsConfig = _interopRequireWildcard(__webpack_require__(21));

var listChannelsInChannelGroupConfig = _interopRequireWildcard(__webpack_require__(22));

var addPushChannelsConfig = _interopRequireWildcard(__webpack_require__(23));

var removePushChannelsConfig = _interopRequireWildcard(__webpack_require__(24));

var listPushChannelsConfig = _interopRequireWildcard(__webpack_require__(25));

var removeDevicePushConfig = _interopRequireWildcard(__webpack_require__(26));

var presenceLeaveEndpointConfig = _interopRequireWildcard(__webpack_require__(27));

var presenceWhereNowEndpointConfig = _interopRequireWildcard(__webpack_require__(28));

var presenceHeartbeatEndpointConfig = _interopRequireWildcard(__webpack_require__(29));

var presenceGetStateConfig = _interopRequireWildcard(__webpack_require__(30));

var presenceSetStateConfig = _interopRequireWildcard(__webpack_require__(31));

var presenceHereNowConfig = _interopRequireWildcard(__webpack_require__(32));

var createUserEndpointConfig = _interopRequireWildcard(__webpack_require__(33));

var updateUserEndpointConfig = _interopRequireWildcard(__webpack_require__(34));

var deleteUserEndpointConfig = _interopRequireWildcard(__webpack_require__(35));

var getUserEndpointConfig = _interopRequireWildcard(__webpack_require__(36));

var getUsersEndpointConfig = _interopRequireWildcard(__webpack_require__(37));

var createSpaceEndpointConfig = _interopRequireWildcard(__webpack_require__(38));

var updateSpaceEndpointConfig = _interopRequireWildcard(__webpack_require__(39));

var deleteSpaceEndpointConfig = _interopRequireWildcard(__webpack_require__(40));

var getSpacesEndpointConfig = _interopRequireWildcard(__webpack_require__(41));

var getSpaceEndpointConfig = _interopRequireWildcard(__webpack_require__(42));

var getMembersEndpointConfig = _interopRequireWildcard(__webpack_require__(43));

var addMembersEndpointConfig = _interopRequireWildcard(__webpack_require__(44));

var updateMembersEndpointConfig = _interopRequireWildcard(__webpack_require__(45));

var removeMembersEndpointConfig = _interopRequireWildcard(__webpack_require__(46));

var getMembershipsEndpointConfig = _interopRequireWildcard(__webpack_require__(47));

var updateMembershipsEndpointConfig = _interopRequireWildcard(__webpack_require__(48));

var joinSpacesEndpointConfig = _interopRequireWildcard(__webpack_require__(49));

var leaveSpacesEndpointConfig = _interopRequireWildcard(__webpack_require__(50));

var auditEndpointConfig = _interopRequireWildcard(__webpack_require__(51));

var grantEndpointConfig = _interopRequireWildcard(__webpack_require__(52));

var grantTokenEndpointConfig = _interopRequireWildcard(__webpack_require__(53));

var publishEndpointConfig = _interopRequireWildcard(__webpack_require__(54));

var signalEndpointConfig = _interopRequireWildcard(__webpack_require__(55));

var historyEndpointConfig = _interopRequireWildcard(__webpack_require__(56));

var deleteMessagesEndpointConfig = _interopRequireWildcard(__webpack_require__(57));

var messageCountsEndpointConfig = _interopRequireWildcard(__webpack_require__(58));

var fetchMessagesEndpointConfig = _interopRequireWildcard(__webpack_require__(59));

var timeEndpointConfig = _interopRequireWildcard(__webpack_require__(8));

var subscribeEndpointConfig = _interopRequireWildcard(__webpack_require__(60));

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
/* 11 */
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
/* 12 */
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
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _cryptography = _interopRequireDefault(__webpack_require__(6));

var _config = _interopRequireDefault(__webpack_require__(3));

var _listener_manager = _interopRequireDefault(__webpack_require__(7));

var _reconnection_manager = _interopRequireDefault(__webpack_require__(14));

var _deduping_manager = _interopRequireDefault(__webpack_require__(15));

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
        } else {
          var _announce3 = {};
          _announce3.channel = null;
          _announce3.subscription = null;
          _announce3.actualChannel = subscriptionMatch != null ? channel : null;
          _announce3.subscribedChannel = subscriptionMatch != null ? subscriptionMatch : channel;
          _announce3.channel = channel;
          _announce3.subscription = subscriptionMatch;
          _announce3.timetoken = publishMetaData.publishTimetoken;
          _announce3.publisher = message.issuingClientId;

          if (message.userMetadata) {
            _announce3.userMetadata = message.userMetadata;
          }

          if (_this7._config.cipherKey) {
            _announce3.message = _this7._crypto.decrypt(message.payload);
          } else {
            _announce3.message = message.payload;
          }

          _this7._listenerManager.announceMessage(_announce3);
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
/* 14 */
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
/* 15 */
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
/* 16 */
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
/* 17 */
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
    timeout: endpoint.getRequestTimeout(modules)
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
/* 18 */
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
/* 19 */
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
/* 20 */
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
/* 22 */
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
/* 29 */
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
/* 31 */
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
/* 33 */
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
/* 34 */
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
/* 35 */
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
/* 36 */
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
/* 43 */
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
/* 44 */
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
/* 45 */
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
/* 46 */
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
/* 48 */
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
/* 51 */
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
/* 53 */
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
/* 54 */
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
/* 55 */
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
      stringifiedTimeToken = _incomingParams$strin === void 0 ? false : _incomingParams$strin;
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

  if (Array.isArray(serverResponse[0])) {
    serverResponse[0].forEach(function (serverHistoryItem) {
      var item = {
        timetoken: serverHistoryItem.timetoken,
        entry: __processMessage(modules, serverHistoryItem.message)
      };
      response.messages.push(item);
    });
  }

  return response;
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
/* 58 */
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
/* 59 */
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
  var channels = incomingParams.channels;
  var config = modules.config;
  if (!channels || channels.length === 0) return 'Missing channels';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function getURL(modules, incomingParams) {
  var _incomingParams$chann = incomingParams.channels,
      channels = _incomingParams$chann === void 0 ? [] : _incomingParams$chann;
  var config = modules.config;
  var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
  return "/v3/history/sub-key/".concat(config.subscribeKey, "/channel/").concat(_utils["default"].encodeString(stringifiedChannels));
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
      stringifiedTimeToken = _incomingParams$strin === void 0 ? false : _incomingParams$strin;
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
/* 61 */
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
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = function () {
  function _default() {
    _classCallCheck(this, _default);

    _defineProperty(this, "storage", void 0);

    this.storage = {};
  }

  _createClass(_default, [{
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

  return _default;
}();

exports["default"] = _default;
module.exports = exports.default;

/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _cborSync = _interopRequireDefault(__webpack_require__(64));

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

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
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

/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.get = get;
exports.post = post;
exports.patch = patch;
exports.del = del;

var _flow_interfaces = __webpack_require__(0);

var _utils = __webpack_require__(66);

function log(url, qs, res) {
  var _pickLogger = function _pickLogger() {
    if (Ti && Ti.API && Ti.API.log) return Ti.API;
    return console;
  };

  var start = new Date().getTime();
  var timestamp = new Date().toISOString();

  var logger = _pickLogger();

  logger.log('<<<<<');
  logger.log("[".concat(timestamp, "]"), '\n', url, '\n', qs);
  logger.log('-----');
  var now = new Date().getTime();
  var elapsed = now - start;
  var timestampDone = new Date().toISOString();
  logger.log('>>>>>>');
  logger.log("[".concat(timestampDone, " / ").concat(elapsed, "]"), '\n', url, '\n', qs, '\n', res);
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

function patch(params, body, endpoint, callback) {
  var xhr = getHttpClient();
  var url = this.getStandardOrigin() + endpoint.url;
  return xdr.call(this, xhr, 'PATCH', url, params, JSON.parse(body), endpoint, callback);
}

function del(params, endpoint, callback) {
  var xhr = getHttpClient();
  var url = this.getStandardOrigin() + endpoint.url;
  return xdr.call(this, xhr, 'DELETE', url, params, {}, endpoint, callback);
}

/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.encodedKeyValuePair = encodedKeyValuePair;
exports.buildUrl = buildUrl;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function encodedKeyValuePair(pairs, key, value) {
  if (value != null) {
    if (Array.isArray(value)) {
      value.forEach(function (item) {
        encodedKeyValuePair(pairs, key, item);
      });
    } else if (_typeof(value) === 'object') {
      Object.keys(value).forEach(function (subkey) {
        encodedKeyValuePair(pairs, "".concat(key, "[").concat(subkey, "]"), value[subkey]);
      });
    } else {
      pairs.push("".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(value)));
    }
  } else if (value === null) {
    pairs.push(encodeURIComponent("".concat(encodeURIComponent(key))));
  }
}

function buildUrl(url, params) {
  var pairs = [];
  Object.keys(params).forEach(function (key) {
    encodedKeyValuePair(pairs, key, params[key]);
  });
  return "".concat(url, "?").concat(pairs.join('&'));
}

/***/ })
/******/ ]);module.exports = exports.PubNub;