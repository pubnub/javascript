"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = function () {
  function _default(decode, base64ToBinary) {
    _classCallCheck(this, _default);

    _defineProperty(this, "_base64ToBinary", void 0);

    _defineProperty(this, "_cborReader", void 0);

    this._base64ToBinary = base64ToBinary;
    this._decode = decode;
  }

  _createClass(_default, [{
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

      if (_typeof(result) === 'object') {
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
