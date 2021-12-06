"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _config = _interopRequireDefault(require("../core/components/config"));

var _categories = _interopRequireDefault(require("../core/constants/categories"));

var _flow_interfaces = require("../core/flow_interfaces");

var _default = function () {
  function _default(modules) {
    var _this = this;

    (0, _classCallCheck2["default"])(this, _default);
    (0, _defineProperty2["default"])(this, "_modules", void 0);
    (0, _defineProperty2["default"])(this, "_config", void 0);
    (0, _defineProperty2["default"])(this, "_currentSubDomain", void 0);
    (0, _defineProperty2["default"])(this, "_standardOrigin", void 0);
    (0, _defineProperty2["default"])(this, "_subscribeOrigin", void 0);
    (0, _defineProperty2["default"])(this, "_requestTimeout", void 0);
    (0, _defineProperty2["default"])(this, "_coreParams", void 0);
    this._modules = {};
    Object.keys(modules).forEach(function (key) {
      _this._modules[key] = modules[key].bind(_this);
    });
  }

  (0, _createClass2["default"])(_default, [{
    key: "init",
    value: function init(config) {
      this._config = config;

      if (Array.isArray(this._config.origin)) {
        this._currentSubDomain = Math.floor(Math.random() * this._config.origin.length);
      } else {
        this._currentSubDomain = 0;
      }

      this._coreParams = {};
      this.shiftStandardOrigin();
    }
  }, {
    key: "nextOrigin",
    value: function nextOrigin() {
      var protocol = this._config.secure ? 'https://' : 'http://';

      if (typeof this._config.origin === 'string') {
        return "".concat(protocol).concat(this._config.origin);
      }

      this._currentSubDomain += 1;

      if (this._currentSubDomain >= this._config.origin.length) {
        this._currentSubDomain = 0;
      }

      var origin = this._config.origin[this._currentSubDomain];
      return "".concat(protocol).concat(origin);
    }
  }, {
    key: "hasModule",
    value: function hasModule(name) {
      return name in this._modules;
    }
  }, {
    key: "shiftStandardOrigin",
    value: function shiftStandardOrigin() {
      this._standardOrigin = this.nextOrigin();
      return this._standardOrigin;
    }
  }, {
    key: "getStandardOrigin",
    value: function getStandardOrigin() {
      return this._standardOrigin;
    }
  }, {
    key: "POSTFILE",
    value: function POSTFILE(url, fields, file) {
      return this._modules.postfile(url, fields, file);
    }
  }, {
    key: "GETFILE",
    value: function GETFILE(params, endpoint, callback) {
      return this._modules.getfile(params, endpoint, callback);
    }
  }, {
    key: "POST",
    value: function POST(params, body, endpoint, callback) {
      return this._modules.post(params, body, endpoint, callback);
    }
  }, {
    key: "PATCH",
    value: function PATCH(params, body, endpoint, callback) {
      return this._modules.patch(params, body, endpoint, callback);
    }
  }, {
    key: "GET",
    value: function GET(params, endpoint, callback) {
      return this._modules.get(params, endpoint, callback);
    }
  }, {
    key: "DELETE",
    value: function DELETE(params, endpoint, callback) {
      return this._modules.del(params, endpoint, callback);
    }
  }, {
    key: "_detectErrorCategory",
    value: function _detectErrorCategory(err) {
      if (err.code === 'ENOTFOUND') {
        return _categories["default"].PNNetworkIssuesCategory;
      }

      if (err.code === 'ECONNREFUSED') {
        return _categories["default"].PNNetworkIssuesCategory;
      }

      if (err.code === 'ECONNRESET') {
        return _categories["default"].PNNetworkIssuesCategory;
      }

      if (err.code === 'EAI_AGAIN') {
        return _categories["default"].PNNetworkIssuesCategory;
      }

      if (err.status === 0 || err.hasOwnProperty('status') && typeof err.status === 'undefined') {
        return _categories["default"].PNNetworkIssuesCategory;
      }

      if (err.timeout) return _categories["default"].PNTimeoutCategory;

      if (err.code === 'ETIMEDOUT') {
        return _categories["default"].PNNetworkIssuesCategory;
      }

      if (err.response) {
        if (err.response.badRequest) {
          return _categories["default"].PNBadRequestCategory;
        }

        if (err.response.forbidden) {
          return _categories["default"].PNAccessDeniedCategory;
        }
      }

      return _categories["default"].PNUnknownCategory;
    }
  }]);
  return _default;
}();

exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=index.js.map
