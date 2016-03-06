'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _networking = require('../components/networking');

var _networking2 = _interopRequireDefault(_networking);

var _config = require('../components/config');

var _config2 = _interopRequireDefault(_config);

var _keychain = require('../components/keychain');

var _keychain2 = _interopRequireDefault(_keychain);

var _responders = require('../presenters/responders');

var _responders2 = _interopRequireDefault(_responders);

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(_ref) {
    var networking = _ref.networking;
    var config = _ref.config;
    var keychain = _ref.keychain;
    var jsonp_cb = _ref.jsonp_cb;
    var error = _ref.error;
    var hmac_SHA256 = _ref.hmac_SHA256;

    _classCallCheck(this, _class);

    this._networking = networking;
    this._keychain = keychain;
    this._config = config;
    this._jsonp_cb = jsonp_cb;
    this._error = error;
    this._hmac_SHA256 = hmac_SHA256;
  }

  _createClass(_class, [{
    key: 'performGrant',
    value: function performGrant(args, argumentCallback) {
      var callback = args.callback || argumentCallback;
      var err = args.error || function () {};
      var channel = args.channel || args.channels;
      var channel_group = args.channel_group;
      var jsonp = this._jsonp_cb();
      var ttl = args.ttl;
      var r = args.read ? '1' : '0';
      var w = args.write ? '1' : '0';
      var m = args.manage ? '1' : '0';
      var auth_key = args.auth_key || args.auth_keys;

      if (!callback) return this._error('Missing Callback');
      if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');
      if (!this._keychain.getPublishKey()) return this._error('Missing Publish Key');
      if (!this._keychain.getSecretKey()) return this._error('Missing Secret Key');

      var timestamp = Math.floor(new Date().getTime() / 1000);
      var sign_input = this._keychain.getSubscribeKey() + '\n' + this._keychain.getPublishKey() + '\n' + 'grant' + '\n';

      var data = { w: w, r: r, timestamp: timestamp };

      if (args.manage) {
        data.m = m;
      }
      if (_utils2.default.isArray(channel)) {
        channel = channel.join(',');
      }
      if (_utils2.default.isArray(auth_key)) {
        auth_key = auth_key.join(',');
      }

      if (typeof channel !== 'undefined' && channel !== null && channel.length > 0) {
        data.channel = channel;
      }

      if (typeof channel_group !== 'undefined' && channel_group !== null && channel_group.length > 0) {
        data['channel-group'] = channel_group;
      }

      if (jsonp !== 0) {
        data.callback = jsonp;
      }
      if (ttl || ttl === 0) data.ttl = ttl;

      if (auth_key) data.auth = auth_key;

      data = this._networking.prepareParams(data);

      if (!auth_key) delete data.auth;

      sign_input += _utils2.default._get_pam_sign_input_from_params(data);

      var signature = this._hmac_SHA256(sign_input, this._keychain.getSecretKey());

      signature = signature.replace(/\+/g, '-');
      signature = signature.replace(/\//g, '_');

      data.signature = signature;

      this._networking.performGrant({
        callback: jsonp,
        data: data,
        success: function success(response) {
          _responders2.default.callback(response, callback, err);
        },
        fail: function fail(response) {
          _responders2.default.error(response, err);
        }
      });
    }
  }, {
    key: 'performAudit',
    value: function performAudit(args, argumentCallback) {
      var callback = args.callback || argumentCallback;
      var err = args.error || function () {};
      var channel = args.channel;
      var channel_group = args.channel_group;
      var auth_key = args.auth_key;
      var jsonp = this._jsonp_cb();

      // Make sure we have a Channel
      if (!callback) return this._error('Missing Callback');
      if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');
      if (!this._keychain.getPublishKey()) return this._error('Missing Publish Key');
      if (!this._keychain.getSecretKey()) return this._error('Missing Secret Key');

      var timestamp = Math.floor(new Date().getTime() / 1000);
      var sign_input = this._keychain.getSubscribeKey() + '\n' + this._keychain.getPublishKey() + '\n' + 'audit' + '\n';

      var data = { timestamp: timestamp };
      if (jsonp !== 0) {
        data.callback = jsonp;
      }

      if (typeof channel !== 'undefined' && channel !== null && channel.length > 0) {
        data.channel = channel;
      }

      if (typeof channel_group !== 'undefined' && channel_group !== null && channel_group.length > 0) {
        data['channel-group'] = channel_group;
      }

      if (auth_key) data.auth = auth_key;

      data = this._networking.prepareParams(data);

      if (!auth_key) delete data.auth;

      sign_input += _utils2.default._get_pam_sign_input_from_params(data);

      var signature = this._hmac_SHA256(sign_input, this._keychain.getSecretKey());

      signature = signature.replace(/\+/g, '-');
      signature = signature.replace(/\//g, '_');

      data.signature = signature;
      this._networking.performAudit({
        callback: jsonp,
        data: data,
        success: function success(response) {
          _responders2.default.callback(response, callback, err);
        },
        fail: function fail(response) {
          _responders2.default.error(response, err);
        }
      });
    }
  }]);

  return _class;
}();

exports.default = _class;
//# sourceMappingURL=access.js.map
