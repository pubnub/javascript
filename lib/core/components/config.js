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

  /*
    how long the server will wait before declaring that the client is gone.
  */


  /*
    use SSL for http requests?
  */


  /*
    Unique identifier of this client, will be sent with all request to identify
    a unique device for presence and billing
  */


  /*
    if _useInstanceId is true, this instanceId will be added to all requests
  */


  /*
    secret key provided by Portal to perform Auth (PAM) API calls. Only
    use on server (node) and do not expose it to customers.
  */


  /*
    subsriber key provided by Portal to perform API calls
  */


  /*
    how long to wait for the server when making transactional requests
  */


  /*
    configuration to supress leave events; when a presence leave is performed
    this configuration will disallow the leave event from happening
  */


  /*
    if instanceId config is true, the SDK will pass the unique instance
    identifier to the server as instanceId=<UUID>
  */

  function _class(setup) {
    _classCallCheck(this, _class);

    this.setInstanceId(_uuid2.default.v4());
    this.setAuthKey(setup.authKey || '');
    this.setSecretKey(setup.secretKey || '');
    this.setSubscribeKey(setup.subscribeKey);
    this.setPublishKey(setup.publishKey);
    this.setCipherKey(setup.cipherKey);
    this.setRequestIdConfig(setup.useRequestId || false);
    this.setSupressLeaveEvents(setup.suppressLeaveEvents || false);
    this.setInstanceIdConfig(setup.useInstanceId || false);
    this.setSslConfig(setup.ssl || false);
    this.setOrigin(setup.origin || 'pubsub.pubnub.com');
    // set timeout to how long a transaction request will wait for the server (default 15 seconds)
    this.setTransactionTimeout(setup.transactionalRequestTimeout || 15 * 1000);
    // set timeout to how long a subscribe event loop will run (default 310 seconds)
    this.setSubscribeTimeout(setup.subscribeRequestTimeout || 310 * 1000);
    // set config on beacon (https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon) usage
    this.setSendBeaconConfig(setup.useSendBeacon || true);
    // how long the SDK will report the client to be alive before issuing a timeout
    this.setPresenceTimeout(setup.presenceTimeout || 300);
  }

  /*
    how often (in seconds) the client should announce its presence to server
  */


  /*
    Custom optional origin.
  */


  /*
    optionally avoid sending leave events for presence events.
  */


  /*
    if passed, all payloads will be encrypted using the cipher key and history
    fetches will be decrypted using this key.
  */


  /*
    auth key which will be passed on PAM secured endpoints
  */


  /*
    publish key provided by Portal to perform publish API calls
  */


  /*
    use send beacon API when unsubscribing.
    https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon
  */


  /*
    how long to wait for the server when running the subscribe loop
  */


  /*
    if requestId config is true, the SDK will pass a unique request identifier
    with each request as request_id=<UUID>
  */


  _createClass(_class, [{
    key: 'getSubscribeKey',
    value: function getSubscribeKey() {
      return this._subscribeKey;
    }
  }, {
    key: 'setSubscribeKey',
    value: function setSubscribeKey(val) {
      this._subscribeKey = val;return this;
    }
  }, {
    key: 'getAuthKey',
    value: function getAuthKey() {
      return this._authKey;
    }
  }, {
    key: 'setAuthKey',
    value: function setAuthKey(val) {
      this._authKey = val;return this;
    }
  }, {
    key: 'getPublishKey',
    value: function getPublishKey() {
      return this._publishKey;
    }
  }, {
    key: 'setPublishKey',
    value: function setPublishKey(val) {
      this._publishKey = val;return this;
    }
  }, {
    key: 'getSecretKey',
    value: function getSecretKey() {
      return this._secretKey;
    }
  }, {
    key: 'setSecretKey',
    value: function setSecretKey(val) {
      this._secretKey = val;return this;
    }
  }, {
    key: 'getCipherKey',
    value: function getCipherKey() {
      return this._cipherKey;
    }
  }, {
    key: 'setCipherKey',
    value: function setCipherKey(val) {
      this._cipherKey = val;return this;
    }
  }, {
    key: 'getUUID',
    value: function getUUID() {
      return this._UUID;
    }
  }, {
    key: 'setUUID',
    value: function setUUID(val) {
      this._UUID = val;return this;
    }
  }, {
    key: 'getInstanceId',
    value: function getInstanceId() {
      return this._instanceId;
    }
  }, {
    key: 'setInstanceId',
    value: function setInstanceId(val) {
      this._instanceId = val;return this;
    }
  }, {
    key: 'isInstanceIdEnabled',
    value: function isInstanceIdEnabled() {
      return this._useInstanceId;
    }
  }, {
    key: 'setInstanceIdConfig',
    value: function setInstanceIdConfig(val) {
      this._useInstanceId = val;return this;
    }
  }, {
    key: 'isRequestIdEnabled',
    value: function isRequestIdEnabled() {
      return this._useRequestId;
    }
  }, {
    key: 'setRequestIdConfig',
    value: function setRequestIdConfig(val) {
      this._useRequestId = val;return this;
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
    key: 'isSuppressingLeaveEvents',
    value: function isSuppressingLeaveEvents() {
      return this._suppressLeaveEvents;
    }
  }, {
    key: 'setSupressLeaveEvents',
    value: function setSupressLeaveEvents(val) {
      this._suppressLeaveEvents = val;return this;
    }
  }, {
    key: 'isSslEnabled',
    value: function isSslEnabled() {
      return this._sslEnabled;
    }
  }, {
    key: 'setSslConfig',
    value: function setSslConfig(val) {
      this._sslEnabled = val;return this;
    }
  }, {
    key: 'getOrigin',
    value: function getOrigin() {
      return this._customOrigin;
    }
  }, {
    key: 'setOrigin',
    value: function setOrigin(val) {
      this._customOrigin = val;return this;
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
    key: 'getPresenceTimeout',
    value: function getPresenceTimeout() {
      return this._presenceTimeout;
    }
  }, {
    key: 'setPresenceTimeout',
    value: function setPresenceTimeout(val) {
      this._presenceTimeout = val;
      this._presenceAnnounceInterval = this._presenceTimeout / 2 - 1;
      return this;
    }
  }, {
    key: 'getPresenceAnnounceInterval',
    value: function getPresenceAnnounceInterval() {
      return this._presenceAnnounceInterval;
    }
  }, {
    key: 'setPresenceAnnounceInterval',
    value: function setPresenceAnnounceInterval(val) {
      this._presenceAnnounceInterval = val;return this;
    }
  }]);

  return _class;
}();

exports.default = _class;