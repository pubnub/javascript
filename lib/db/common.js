"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _default = function () {
  function _default() {
    (0, _classCallCheck2["default"])(this, _default);
    (0, _defineProperty2["default"])(this, "storage", void 0);
    this.storage = {};
  }

  (0, _createClass2["default"])(_default, [{
    key: "get",
    value: function get(key) {
      return this.storage[key];
    }
  }, {
    key: "set",
    value: function set(key, value) {
      this.storage[key] = value;
    }
  }]);
  return _default;
}();

exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=common.js.map
