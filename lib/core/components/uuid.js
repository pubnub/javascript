"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _lilUuid = _interopRequireDefault(require("lil-uuid"));

var _default = {
  createUUID: function createUUID() {
    if (_lilUuid["default"].uuid) {
      return _lilUuid["default"].uuid();
    } else {
      return (0, _lilUuid["default"])();
    }
  }
};
exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=uuid.js.map
