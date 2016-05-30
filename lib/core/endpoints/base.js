'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _networking = require('../components/networking');

var _networking2 = _interopRequireDefault(_networking);

var _config = require('../components/config');

var _config2 = _interopRequireDefault(_config);

var _flow_interfaces = require('../flow_interfaces');

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(_ref) {
    var config = _ref.config;

    _classCallCheck(this, _class);

    this._config = config;
  }

  _createClass(_class, [{
    key: 'validateEndpointConfig',
    value: function validateEndpointConfig(endpointConfig) {
      return true;
    }
  }, {
    key: 'createBaseParams',
    value: function createBaseParams(endpointConfig) {
      var data = {};

      _utils2.default.each(this._config.baseParams, function (key, value) {
        if (!(key in data)) data[key] = value;
      });

      if (this._config.isInstanceIdEnabled()) {
        data.instanceid = this._config.getInstanceId();
      }

      if (endpointConfig.params.authKey && this._config.authKey) {
        data.auth = this._config.authKey;
      }

      if (endpointConfig.params.uuid && this._config.UUID) {
        data.uuid = this._config.UUID;
      }

      return data;
    }
  }]);

  return _class;
}();

exports.default = _class;
module.exports = exports['default'];