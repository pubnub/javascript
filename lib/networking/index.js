'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _config = require('../core/components/config');

var _config2 = _interopRequireDefault(_config);

var _categories = require('../core/constants/categories');

var _categories2 = _interopRequireDefault(_categories);

var _flow_interfaces = require('../core/flow_interfaces');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(modules) {
    var _this = this;

    _classCallCheck(this, _class);

    this._modules = {};

    Object.keys(modules).forEach(function (key) {
      _this._modules[key] = modules[key].bind(_this);
    });
  }

  _createClass(_class, [{
    key: 'init',
    value: function init(config) {
      this._config = config;

      this._maxSubDomain = 20;
      this._currentSubDomain = Math.floor(Math.random() * this._maxSubDomain);
      this._providedFQDN = (this._config.secure ? 'https://' : 'http://') + this._config.origin;
      this._coreParams = {};

      this.shiftStandardOrigin();
    }
  }, {
    key: 'nextOrigin',
    value: function nextOrigin() {
      if (this._providedFQDN.indexOf('pubsub.') === -1) {
        return this._providedFQDN;
      }

      var newSubDomain = void 0;

      this._currentSubDomain = this._currentSubDomain + 1;

      if (this._currentSubDomain >= this._maxSubDomain) {
        this._currentSubDomain = 1;
      }

      newSubDomain = this._currentSubDomain.toString();

      return this._providedFQDN.replace('pubsub', 'ps' + newSubDomain);
    }
  }, {
    key: 'hasModule',
    value: function hasModule(name) {
      return name in this._modules;
    }
  }, {
    key: 'shiftStandardOrigin',
    value: function shiftStandardOrigin() {
      var failover = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      this._standardOrigin = this.nextOrigin(failover);

      return this._standardOrigin;
    }
  }, {
    key: 'getStandardOrigin',
    value: function getStandardOrigin() {
      return this._standardOrigin;
    }
  }, {
    key: 'POST',
    value: function POST(params, body, endpoint, callback) {
      return this._modules.post(params, body, endpoint, callback);
    }
  }, {
    key: 'GET',
    value: function GET(params, endpoint, callback) {
      return this._modules.get(params, endpoint, callback);
    }
  }, {
    key: 'DELETE',
    value: function DELETE(params, endpoint, callback) {
      return this._modules.del(params, endpoint, callback);
    }
  }, {
    key: '_detectErrorCategory',
    value: function _detectErrorCategory(err) {
      if (err.code === 'ENOTFOUND') return _categories2.default.PNNetworkIssuesCategory;
      if (err.code === 'ECONNREFUSED') return _categories2.default.PNNetworkIssuesCategory;
      if (err.code === 'ECONNRESET') return _categories2.default.PNNetworkIssuesCategory;
      if (err.code === 'EAI_AGAIN') return _categories2.default.PNNetworkIssuesCategory;

      if (err.status === 0 || err.hasOwnProperty('status') && typeof err.status === 'undefined') return _categories2.default.PNNetworkIssuesCategory;
      if (err.timeout) return _categories2.default.PNTimeoutCategory;

      if (err.code === 'ETIMEDOUT') return _categories2.default.PNNetworkIssuesCategory;

      if (err.response) {
        if (err.response.badRequest) return _categories2.default.PNBadRequestCategory;
        if (err.response.forbidden) return _categories2.default.PNAccessDeniedCategory;
      }

      return _categories2.default.PNUnknownCategory;
    }
  }]);

  return _class;
}();

exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=index.js.map
