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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(_ref) {
    var networking = _ref.networking;
    var config = _ref.config;
    var keychain = _ref.keychain;
    var jsonp_cb = _ref.jsonp_cb;
    var error = _ref.error;

    _classCallCheck(this, _class);

    this._networking = networking;
    this._config = config;
    this._keychain = keychain;
    this._jsonp_cb = jsonp_cb;
    this._error = error;
  }

  _createClass(_class, [{
    key: 'whereNow',
    value: function whereNow(args, argumentCallback) {
      var callback = args.callback || argumentCallback;
      var err = args.error || function () {};
      var auth_key = args.auth_key || this._keychain.getAuthKey();
      var jsonp = this._jsonp_cb();
      var uuid = args.uuid || this._keychain.getUUID();
      var data = { auth: auth_key };

      // Make sure we have a Channel
      if (!callback) return this._error('Missing Callback');
      if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');

      if (jsonp !== 0) {
        data['callback'] = jsonp;
      }

      if (this._config.isInstanceIdEnabled()) {
        data['instanceid'] = this._keychain.getInstanceId();
      }

      this._networking.fetchWhereNow(uuid, {
        callback: jsonp,
        data: this._networking.prepareParams(data),
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
//# sourceMappingURL=presence.js.map
