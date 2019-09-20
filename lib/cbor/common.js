"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _cborSync = _interopRequireDefault(require("cbor-sync"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _default = function () {
  function _default() {
    _classCallCheck(this, _default);
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

      var cleaned = tokenString.replace('-', '+').replace('_', '/') + padding;

      var result = _cborSync["default"].decode(new Buffer.from(cleaned, 'base64'));

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
