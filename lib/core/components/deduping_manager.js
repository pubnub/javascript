"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _config = _interopRequireDefault(require("../components/config"));

var _flow_interfaces = require("../flow_interfaces");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var hashCode = function hashCode(payload) {
  var hash = 0;
  if (payload.length === 0) return hash;

  for (var i = 0; i < payload.length; i += 1) {
    var character = payload.charCodeAt(i);
    hash = (hash << 5) - hash + character;
    hash = hash & hash;
  }

  return hash;
};

var _default = function () {
  function _default(_ref) {
    var config = _ref.config;

    _classCallCheck(this, _default);

    _defineProperty(this, "_config", void 0);

    _defineProperty(this, "hashHistory", void 0);

    this.hashHistory = [];
    this._config = config;
  }

  _createClass(_default, [{
    key: "getKey",
    value: function getKey(message) {
      var hashedPayload = hashCode(JSON.stringify(message.payload)).toString();
      var timetoken = message.publishMetaData.publishTimetoken;
      return "".concat(timetoken, "-").concat(hashedPayload);
    }
  }, {
    key: "isDuplicate",
    value: function isDuplicate(message) {
      return this.hashHistory.includes(this.getKey(message));
    }
  }, {
    key: "addEntry",
    value: function addEntry(message) {
      if (this.hashHistory.length >= this._config.maximumCacheSize) {
        this.hashHistory.shift();
      }

      this.hashHistory.push(this.getKey(message));
    }
  }, {
    key: "clearHistory",
    value: function clearHistory() {
      this.hashHistory = [];
    }
  }]);

  return _default;
}();

exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=deduping_manager.js.map
