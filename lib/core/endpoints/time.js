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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(_ref) {
    var networking = _ref.networking;
    var config = _ref.config;
    var keychain = _ref.keychain;

    _classCallCheck(this, _class);

    this._networking = networking;
    this._config = config;
    this._keychain = keychain;
  }

  _createClass(_class, [{
    key: 'fetchTime',
    value: function fetchTime(callback) {
      var data = {
        uuid: this._keychain.getUUID(),
        auth: this._keychain.getAuthKey()
      };

      if (this._config.isInstanceIdEnabled()) {
        data.instanceid = this._keychain.getInstanceId();
      }

      var onSuccess = function onSuccess(response) {
        callback(response[0]);
      };

      var onFail = function onFail() {
        callback(0);
      };

      this._networking.fetchTime({
        data: this._networking.prepareParams(data),
        success: onSuccess,
        fail: onFail
      });
    }
  }]);

  return _class;
}();

exports.default = _class;