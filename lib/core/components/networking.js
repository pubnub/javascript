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
  function _class(config, keychain) {
    var ssl = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
    var origin = arguments.length <= 3 || arguments[3] === undefined ? 'pubsub.pubnub.com' : arguments[3];

    _classCallCheck(this, _class);

    this._config = config;
    this._keychain = keychain;
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
  }, {
    key: 'addBeaconDispatcher',
    value: function addBeaconDispatcher(sendBeacon) {
      this._sendBeacon = sendBeacon;
      return this;
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
    value: function provisionDeviceForPush(deviceId, data) {
      var url = [this.getStandardOrigin(), 'v1', 'push', 'sub-key', this._keychain.getSubscribeKey(), 'devices', deviceId];

      data.uuid = this._keychain.getUUID();
      data.auth = this._keychain.getAuthKey();

      return this._xdr({ data: data, url: url });
    }
  }, {
    key: 'performGrant',
    value: function performGrant(_ref) {
      var data = _ref.data;
      var success = _ref.success;
      var fail = _ref.fail;

      var url = [this.getStandardOrigin(), 'v1', 'auth', 'grant', 'sub-key', this._keychain.getSubscribeKey()];

      this._xdr({ data: data, success: success, fail: fail, url: url });
    }
  }, {
    key: 'performHeartbeat',
    value: function performHeartbeat(channels, _ref2) {
      var data = _ref2.data;
      var success = _ref2.success;
      var fail = _ref2.fail;

      var url = [this.getStandardOrigin(), 'v2', 'presence', 'sub-key', this._keychain.getSubscribeKey(), 'channel', channels, 'heartbeat'];

      this._xdr({ data: data, success: success, fail: fail, url: url });
    }
  }, {
    key: 'performState',
    value: function performState(state, channel, uuid, _ref3) {
      var data = _ref3.data;
      var success = _ref3.success;
      var fail = _ref3.fail;

      var url = [this.getStandardOrigin(), 'v2', 'presence', 'sub-key', this._keychain.getSubscribeKey(), 'channel', channel];

      if (state) {
        url.push('uuid', uuid, 'data');
      } else {
        url.push('uuid', _utils2.default.encode(uuid));
      }

      this._xdr({ data: data, success: success, fail: fail, url: url });
    }
  }, {
    key: 'performAudit',
    value: function performAudit(_ref4) {
      var data = _ref4.data;
      var success = _ref4.success;
      var fail = _ref4.fail;

      var url = [this.getStandardOrigin(), 'v1', 'auth', 'audit', 'sub-key', this._keychain.getSubscribeKey()];

      this._xdr({ data: data, success: success, fail: fail, url: url });
    }
  }, {
    key: 'performChannelLeave',
    value: function performChannelLeave(channel, _ref5) {
      var data = _ref5.data;
      var success = _ref5.success;
      var fail = _ref5.fail;

      var origin = this.nextOrigin(false);
      var url = [origin, 'v2', 'presence', 'sub_key', this._keychain.getSubscribeKey(), 'channel', _utils2.default.encode(channel), 'leave'];

      if (this._sendBeacon) {
        if (this._sendBeacon(_utils2.default.buildURL(url, data))) {
          success({ status: 200, action: 'leave', message: 'OK', service: 'Presence' });
        }
      } else {
        this._xdr({ data: data, success: success, fail: fail, url: url });
      }
    }
  }, {
    key: 'performChannelGroupLeave',
    value: function performChannelGroupLeave(_ref6) {
      var data = _ref6.data;
      var success = _ref6.success;
      var fail = _ref6.fail;

      var origin = this.nextOrigin(false);
      var url = [origin, 'v2', 'presence', 'sub_key', this._keychain.getSubscribeKey(), 'channel', _utils2.default.encode(','), 'leave'];

      if (typeof this._sendBeacon !== 'undefined') {
        if (this._sendBeacon(_utils2.default.buildURL(url, data))) {
          success({ status: 200, action: 'leave', message: 'OK', service: 'Presence' });
        }
      } else {
        this._xdr({ data: data, success: success, fail: fail, url: url });
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
    value: function fetchWhereNow(uuid, _ref7) {
      var data = _ref7.data;
      var success = _ref7.success;
      var fail = _ref7.fail;

      var url = [this.getStandardOrigin(), 'v2', 'presence', 'sub_key', this._keychain.getSubscribeKey(), 'uuid', _utils2.default.encode(uuid)];

      this._xdr({ data: data, success: success, fail: fail, url: url });
    }
  }, {
    key: 'fetchHereNow',
    value: function fetchHereNow(channel, channelGroup, _ref8) {
      var data = _ref8.data;
      var success = _ref8.success;
      var fail = _ref8.fail;

      var url = [this.getStandardOrigin(), 'v2', 'presence', 'sub_key', this._keychain.getSubscribeKey()];

      if (channel) {
        url.push('channel');
        url.push(_utils2.default.encode(channel));
      }

      if (channelGroup && !channel) {
        url.push('channel');
        url.push(',');
      }

      this._xdr({ data: data, success: success, fail: fail, url: url });
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
    key: 'getOrigin',
    value: function getOrigin() {
      return this._providedFQDN;
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
    value: function _postXDR(_ref9) {
      var data = _ref9.data;
      var url = _ref9.url;
      var callback = _ref9.callback;

      var superagentConstruct = _superagent2.default.post(url.join('/')).query(data);
      this._abstractedXDR(superagentConstruct, callback);
    }
  }, {
    key: '_xdr',
    value: function _xdr(_ref10) {
      var data = _ref10.data;
      var url = _ref10.url;
      var callback = _ref10.callback;

      var superagentConstruct = _superagent2.default.get(url.join('/')).query(data);
      this._abstractedXDR(superagentConstruct, callback);
    }
  }, {
    key: '_abstractedXDR',
    value: function _abstractedXDR(superagentConstruct, callback) {
      superagentConstruct.type('json').end(function (err, resp) {
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