'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _keychain = require('./keychain.js');

var _keychain2 = _interopRequireDefault(_keychain);

var _responders = require('../presenters/responders');

var _responders2 = _interopRequireDefault(_responders);

var _config = require('./config.js');

var _config2 = _interopRequireDefault(_config);

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(_ref) {
    var config = _ref.config;
    var keychain = _ref.keychain;
    var encrypt = _ref.encrypt;
    var sendBeacon = _ref.sendBeacon;
    var ssl = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
    var origin = arguments.length <= 2 || arguments[2] === undefined ? 'pubsub.pubnub.com' : arguments[2];

    _classCallCheck(this, _class);

    this._config = config;
    this._keychain = keychain;
    this._encrypt = encrypt;
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
      if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');
      if (!this._keychain.getPublishKey()) return this._error('Missing Publish Key');
      if (!this._keychain.getSecretKey()) return this._error('Missing Secret Key');

      var sign_input = this._keychain.getSubscribeKey() + '\n' + this._keychain.getPublishKey() + '\n' + 'grant' + '\n';

      var url = [this.getStandardOrigin(), 'v1', 'auth', 'grant', 'sub-key', this._keychain.getSubscribeKey()];

      data = this._networking.prepareParams(data);

      if (!auth_key) delete data.auth;

      sign_input += _utils2.default._get_pam_sign_input_from_params(data);

      var signature = this._hmac_SHA256(sign_input, this._keychain.getSecretKey());

      signature = signature.replace(/\+/g, '-');
      signature = signature.replace(/\//g, '_');

      data.signature = signature;

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
    key: 'performAudit',
    value: function performAudit(authKey, data, callback) {
      var auth_key = args.auth_key;
      if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');
      if (!this._keychain.getPublishKey()) return this._error('Missing Publish Key');
      if (!this._keychain.getSecretKey()) return this._error('Missing Secret Key');

      var sign_input = this._keychain.getSubscribeKey() + '\n' + this._keychain.getPublishKey() + '\n' + 'audit' + '\n';

      if (auth_key) data.auth = auth_key;

      data = this._networking.prepareParams(data);

      if (!auth_key) delete data.auth;

      sign_input += _utils2.default._get_pam_sign_input_from_params(data);

      var signature = this._hmac_SHA256(sign_input, this._keychain.getSecretKey());

      signature = signature.replace(/\+/g, '-');
      signature = signature.replace(/\//g, '_');

      data.signature = signature;

      var url = [this.getStandardOrigin(), 'v1', 'auth', 'audit', 'sub-key', this._keychain.getSubscribeKey()];

      this._xdr({ data: data, success: success, fail: fail, url: url });
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

      if (this._sendBeacon) {
        if (this._sendBeacon(_utils2.default.buildURL(url, data))) {
          callback(null, { status: 200, action: 'leave', message: 'OK', service: 'Presence' });
        }
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

      var encryptedMessage = this._encrypt(msg, this._keychain.getCipherKey());
      encryptedMessage = JSON.stringify(encryptedMessage);

      var url = [this.getStandardOrigin(), 'publish', this._keychain.getPublishKey(), this._keychain.getSubscribeKey(), 0, _utils2.default.encode(channel), 0, _utils2.default.encode(msg)];

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
    value: function performSubscribe(channels, timetoken, incomingData, callback) {
      if (!this._keychain.getSubscribeKey()) {
        return callback(this._r.validationError('Missing Subscribe Key'));
      }

      var url = [this.getSubscribeOrigin(), 'subscribe', this._keychain.getSubscribeKey(), _utils2.default.encode(channels), 0, timetoken];

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

      var superagentConstruct = _superagent2.default.post(url.join('/')).timeout(timeout || this._config.transactionalRequestTimeout).query(data);
      return this._abstractedXDR(superagentConstruct, callback);
    }
  }, {
    key: '_xdr',
    value: function _xdr(_ref3) {
      var data = _ref3.data;
      var url = _ref3.url;
      var timeout = _ref3.timeout;
      var callback = _ref3.callback;

      console.log('timeout', timeout);

      var superagentConstruct = _superagent2.default.get(url.join('/')).timeout(timeout || this._config.transactionalRequestTimeout).query(data);
      return this._abstractedXDR(superagentConstruct, callback);
    }
  }, {
    key: '_abstractedXDR',
    value: function _abstractedXDR(superagentConstruct, callback) {
      return superagentConstruct.type('json').end(function (err, resp) {
        if (err) return callback(err, null);

        if ((typeof resp === 'undefined' ? 'undefined' : _typeof(resp)) === 'object' && resp.error) {
          callback(resp.error, null);
          return;
        }

        callback(null, JSON.parse(resp.text));
      });
    }
  }]);

  return _class;
}();

exports.default = _class;