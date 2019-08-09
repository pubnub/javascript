"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _lilUuid = _interopRequireDefault(require("lil-uuid"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
