'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _networking = require('../components/networking');

var _networking2 = _interopRequireDefault(_networking);

var _keychain = require('../components/keychain');

var _keychain2 = _interopRequireDefault(_keychain);

var _config = require('../components/config');

var _config2 = _interopRequireDefault(_config);

var _responders = require('../presenters/responders');

var _responders2 = _interopRequireDefault(_responders);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(_ref) {
    var networking = _ref.networking;
    var keychain = _ref.keychain;
    var jsonp_cb = _ref.jsonp_cb;
    var error = _ref.error;
    var config = _ref.config;

    _classCallCheck(this, _class);

    this._networking = networking;
    this._keychain = keychain;
    this._jsonp_cb = jsonp_cb;
    this._error = error;
    this._config = config;
  }

  _createClass(_class, [{
    key: 'provisionDevice',
    value: function provisionDevice(args) {
      var op = args.op;
      var gw_type = args.gw_type;
      var device_id = args.device_id;
      var channel = args.channel;


      var callback = args.callback || function () {};
      var auth_key = args.auth_key || this._keychain.getAuthKey();
      var err = args.error || function () {};
      var jsonp = this._jsonp_cb();

      if (!device_id) return this._error('Missing Device ID (device_id)');
      if (!gw_type) return this._error('Missing GW Type (gw_type: gcm or apns)');
      if (!op) return this._error('Missing GW Operation (op: add or remove)');
      if (!channel) return this._error('Missing gw destination Channel (channel)');
      if (!this._keychain.getPublishKey()) return this._error('Missing Publish Key');
      if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');

      var params = { uuid: this._keychain.getUUID(), auth: auth_key, type: gw_type };

      if (op === 'add') {
        params.add = channel;
      } else if (op === 'remove') {
        params.remove = channel;
      }

      if (this._config.isInstanceIdEnabled()) {
        params.instanceid = this._keychain.getInstanceId();
      }

      this._networking.provisionDeviceForPush(device_id, {
        callback: jsonp,
        data: params,
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
//# sourceMappingURL=push.js.map
