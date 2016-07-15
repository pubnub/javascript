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

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

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
      if (!endpointConfig) {
        return false;
      }
      return true;
    }
  }, {
    key: 'createBaseParams',
    value: function createBaseParams(endpointConfig) {
      var _this = this;

      var data = {
        uuid: this._config.UUID
      };

      Object.keys(this._config.baseParams).forEach(function (key) {
        var value = _this._config.baseParams[key];
        if (!(key in data)) data[key] = value;
      });

      if (this._config.useInstanceId) {
        data.instanceid = this._config.instanceId;
      }

      if (this._config.useRequestId) {
        data.requestid = _uuid2.default.v4();
      }

      if (endpointConfig.params && endpointConfig.params.authKey && this._config.authKey) {
        data.auth = this._config.authKey;
      }

      return data;
    }
  }, {
    key: 'createValidationError',
    value: function createValidationError(message) {
      return this._createError({ message: message }, 'validationError');
    }
  }, {
    key: '_createError',
    value: function _createError(errorPayload, type) {
      errorPayload.type = type;
      return errorPayload;
    }
  }, {
    key: 'log',
    value: function log() {
      for (var _len = arguments.length, params = Array(_len), _key = 0; _key < _len; _key++) {
        params[_key] = arguments[_key];
      }

      console.log.apply(console, params);
    }
  }]);

  return _class;
}();

exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=base.js.map
