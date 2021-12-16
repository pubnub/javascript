"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _uuid = _interopRequireDefault(require("./uuid"));

var _flow_interfaces = require("../flow_interfaces");

var PRESENCE_TIMEOUT_MINIMUM = 20;
var PRESENCE_TIMEOUT_DEFAULT = 300;

var makeDefaultOrigins = function makeDefaultOrigins() {
  return Array.from({
    length: 20
  }, function (_, i) {
    return "ps".concat(i + 1, ".pndsn.com");
  });
};

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

    if (typeof setup.origin !== 'string' && !Array.isArray(setup.origin) && setup.origin !== undefined) {
      throw new Error('Origin must be either undefined, a string or a list of strings.');
    }

    this.origin = setup.origin || makeDefaultOrigins();
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
    this.useRandomIVs = (_setup$useRandomIVs = setup.useRandomIVs) !== null && _setup$useRandomIVs !== void 0 ? _setup$useRandomIVs : true;

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
      return '4.37.0';
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
//# sourceMappingURL=config.js.map
