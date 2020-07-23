"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _default = function () {
  function _default(decode, base64ToBinary) {
    (0, _classCallCheck2["default"])(this, _default);
    (0, _defineProperty2["default"])(this, "_base64ToBinary", void 0);
    (0, _defineProperty2["default"])(this, "_cborReader", void 0);
    this._base64ToBinary = base64ToBinary;
    this._decode = decode;
  }

  (0, _createClass2["default"])(_default, [{
    key: "decodeToken",
    value: function decodeToken(tokenString) {
      var padding = '';

      if (tokenString.length % 4 === 3) {
        padding = '=';
      } else if (tokenString.length % 4 === 2) {
        padding = '==';
      }

      var cleaned = tokenString.replace(/-/gi, '+').replace(/_/gi, '/') + padding;

      var result = this._decode(this._base64ToBinary(cleaned));

      if ((0, _typeof2["default"])(result) === 'object') {
        return result;
      }

      return undefined;
    }
  }]);
  return _default;
}();

exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=common.js.map
