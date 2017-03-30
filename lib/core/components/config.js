'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _flow_interfaces = require('../flow_interfaces');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(_ref) {
    var setup = _ref.setup,
        db = _ref.db;

    _classCallCheck(this, _class);

    this._db = db;

    this.instanceId = 'pn-' + _uuid2.default.v4();
    this.secretKey = setup.secretKey || setup.secret_key;
    this.subscribeKey = setup.subscribeKey || setup.subscribe_key;
    this.publishKey = setup.publishKey || setup.publish_key;
    this.sdkFamily = setup.sdkFamily;
    this.partnerId = setup.partnerId;
    this.setAuthKey(setup.authKey);
    this.setCipherKey(setup.cipherKey);

    this.setFilterExpression(setup.filterExpression);

    this.origin = setup.origin || 'pubsub.pubnub.com';
    this.secure = setup.ssl || false;
    this.restore = setup.restore || false;
    this.proxy = setup.proxy;
    this.keepAlive = setup.keepAlive;
    this.keepAliveSettings = setup.keepAliveSettings;

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

    if (setup.heartbeatInterval) {
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
      return '4.7.0';
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

      return 'pn-' + _uuid2.default.v4();
    }
  }]);

  return _class;
}();

exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=config.js.map
