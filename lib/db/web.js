"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _default = {
  get: function get(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  set: function set(key, data) {
    try {
      return localStorage.setItem(key, data);
    } catch (e) {
      return null;
    }
  }
};
exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=web.js.map
