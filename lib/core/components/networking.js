'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _keychain = require('./keychain.js');

var _keychain2 = _interopRequireDefault(_keychain);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var utils = require('../utils');

var _class = function () {
  /* items that must be passed with each request. */

  function _class(xdr, keychain) {
    var ssl = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
    var origin = arguments.length <= 3 || arguments[3] === undefined ? 'pubsub.pubnub.com' : arguments[3];

    _classCallCheck(this, _class);

    this._xdr = xdr;
    this._keychain = keychain;

    this._maxSubDomain = 20;
    this._currentSubDomain = Math.floor(Math.random() * this._maxSubDomain);

    this._providedFQDN = (ssl ? 'https://' : 'http://') + origin;
    this._coreParams = {};

    // create initial origins
    this.shiftStandardOrigin(false);
    this.shiftSubscribeOrigin(false);
  }

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
      utils.each(this._coreParams, function (key, value) {
        if (!(key in data)) data[key] = value;
      });
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
        newSubDomain = utils.generateUUID().split('-')[0];
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
    value: function fetchHistory(channel, _ref) {
      var data = _ref.data;
      var success = _ref.success;
      var fail = _ref.fail;

      var url = [this.getStandardOrigin(), 'v2', 'history', 'sub-key', this._keychain.getSubscribeKey(), 'channel', utils.encode(channel)];

      this._xdr({ data: data, success: success, fail: fail, url: url });
    }
  }, {
    key: 'performChannelGroupOperation',
    value: function performChannelGroupOperation(channelGroup, mode, _ref2) {
      var data = _ref2.data;
      var success = _ref2.success;
      var fail = _ref2.fail;

      var url = [this.getStandardOrigin(), 'v1', 'channel-registration', 'sub-key', this._keychain.getSubscribeKey(), 'channel-group'];

      if (channelGroup && channelGroup !== '*') {
        url.push(channelGroup);
      }

      if (mode === 'remove') {
        url.push('remove');
      }

      this._xdr({ data: data, success: success, fail: fail, url: url });
    }
  }, {
    key: 'provisionDeviceForPush',
    value: function provisionDeviceForPush(deviceId, _ref3) {
      var data = _ref3.data;
      var success = _ref3.success;
      var fail = _ref3.fail;

      var url = [this.getStandardOrigin(), 'v1', 'push', 'sub-key', this._keychain.getSubscribeKey(), 'devices', deviceId];

      this._xdr({ data: data, success: success, fail: fail, url: url });
    }
  }, {
    key: 'performGrant',
    value: function performGrant(_ref4) {
      var data = _ref4.data;
      var success = _ref4.success;
      var fail = _ref4.fail;

      var url = [this.getStandardOrigin(), 'v1', 'auth', 'grant', 'sub-key', this._keychain.getSubscribeKey()];

      this._xdr({ data: data, success: success, fail: fail, url: url });
    }
  }, {
    key: 'performHeartbeat',
    value: function performHeartbeat(channels, _ref5) {
      var data = _ref5.data;
      var success = _ref5.success;
      var fail = _ref5.fail;

      var url = [this.getStandardOrigin(), 'v2', 'presence', 'sub-key', this._keychain.getSubscribeKey(), 'channel', channels, 'heartbeat'];

      this._xdr({ data: data, success: success, fail: fail, url: url });
    }
  }, {
    key: 'performState',
    value: function performState(state, channel, uuid, _ref6) {
      var data = _ref6.data;
      var success = _ref6.success;
      var fail = _ref6.fail;

      var url = [this.getStandardOrigin(), 'v2', 'presence', 'sub-key', this._keychain.getSubscribeKey(), 'channel', channel];

      if (state) {
        url.push('uuid', uuid, 'data');
      } else {
        url.push('uuid', utils.encode(uuid));
      }

      this._xdr({ data: data, success: success, fail: fail, url: url });
    }
  }, {
    key: 'performAudit',
    value: function performAudit(_ref7) {
      var data = _ref7.data;
      var success = _ref7.success;
      var fail = _ref7.fail;

      var url = [this.getStandardOrigin(), 'v1', 'auth', 'audit', 'sub-key', this._keychain.getSubscribeKey()];

      this._xdr({ data: data, success: success, fail: fail, url: url });
    }
  }, {
    key: 'fetchReplay',
    value: function fetchReplay(source, destination, _ref8) {
      var data = _ref8.data;
      var success = _ref8.success;
      var fail = _ref8.fail;

      var url = [this.getStandardOrigin(), 'v1', 'replay', this._keychain.getPublishKey(), this._keychain.getSubscribeKey(), source, destination];

      this._xdr({ data: data, success: success, fail: fail, url: url });
    }
  }, {
    key: 'fetchTime',
    value: function fetchTime(_ref9) {
      var data = _ref9.data;
      var success = _ref9.success;
      var fail = _ref9.fail;

      var url = [this.getStandardOrigin(), 'time', 0];

      this._xdr({ data: data, success: success, fail: fail, url: url });
    }
  }, {
    key: 'fetchWhereNow',
    value: function fetchWhereNow(uuid, _ref10) {
      var data = _ref10.data;
      var success = _ref10.success;
      var fail = _ref10.fail;

      var url = [this.getStandardOrigin(), 'v2', 'presence', 'sub_key', this._keychain.getSubscribeKey(), 'uuid', utils.encode(uuid)];

      this._xdr({ data: data, success: success, fail: fail, url: url });
    }
  }, {
    key: 'fetchHereNow',
    value: function fetchHereNow(channel, channel_group, _ref11) {
      var data = _ref11.data;
      var success = _ref11.success;
      var fail = _ref11.fail;

      var url = [this.getStandardOrigin(), 'v2', 'presence', 'sub_key', this._keychain.getSubscribeKey()];

      if (channel) {
        url.push('channel');
        url.push(utils.encode(channel));
      }

      if (channel_group && !channel) {
        url.push('channel');
        url.push(',');
      }

      this._xdr({ data: data, success: success, fail: fail, url: url });
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
  }]);

  return _class;
}();

exports.default = _class;